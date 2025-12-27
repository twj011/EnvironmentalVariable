// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use winreg::enums::*;
use winreg::RegKey;

#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::{SendMessageTimeoutW, HWND_BROADCAST, SMTO_ABORTIFHUNG, WM_SETTINGCHANGE};

#[derive(Debug, Serialize, Deserialize)]
struct PathEntry {
    path: String,
    valid: bool,
    has_variable: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct OptimizationSuggestion {
    suggestion_type: String,
    var_name: String,
    var_value: String,
    old_path: String,
    new_path: String,
    description: String,
}

// 解析 PATH 字符串
fn parse_path(path_string: &str) -> Vec<String> {
    path_string.split(';')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect()
}

// 检查路径是否存在
fn is_path_valid(path: &str) -> bool {
    let expanded = expand_env_vars(path);
    Path::new(&expanded).exists()
}

// 简单的环境变量展开
fn expand_env_vars(path: &str) -> String {
    let mut result = path.to_string();
    if path.contains('%') {
        for (key, value) in std::env::vars() {
            let pattern = format!("%{}%", key);
            result = result.replace(&pattern, &value);
        }
    }
    result
}

// 检测软件类型
fn detect_software(path: &str) -> Option<(&'static str, String)> {
    let patterns = [
        ("JAVA_HOME", vec![r"java[\\/]jdk", r"java.*[\\/]bin"]),
        ("PYTHON_HOME", vec![r"Python3\d+", r"python"]),
        ("NODE_HOME", vec![r"nodejs", r"node"]),
        ("MAVEN_HOME", vec![r"apache-maven", r"maven"]),
        ("GIT_HOME", vec![r"Git[\\/]cmd", r"git"]),
        ("MATLAB_HOME", vec![r"MATLAB[\\/]R\d+"]),
        ("GRADLE_HOME", vec![r"gradle"]),
        ("CUDA_HOME", vec![r"CUDA[\\/]v\d+"]),
    ];

    for (var_name, patterns_list) in patterns.iter() {
        for pattern in patterns_list {
            if path.to_lowercase().contains(&pattern.to_lowercase().replace(r"[\\/]", "\\").replace(r"\d+", "")) {
                let parts: Vec<&str> = path.split(&['\\', '/'][..]).collect();
                if parts.len() >= 2 {
                    let base = parts[..parts.len()-1].join("\\");
                    return Some((var_name, base));
                }
            }
        }
    }
    None
}

// 分析 PATH 并返回条目信息
#[tauri::command]
fn analyze_path(path_string: String) -> Result<Vec<PathEntry>, String> {
    let paths = parse_path(&path_string);
    let entries = paths.into_iter().map(|p| PathEntry {
        valid: is_path_valid(&p),
        has_variable: p.contains('%'),
        path: p,
    }).collect();
    Ok(entries)
}

// 生成优化建议
#[tauri::command]
fn suggest_optimizations(path_string: String, existing_vars: HashMap<String, String>) -> Result<Vec<OptimizationSuggestion>, String> {
    let paths = parse_path(&path_string);
    let mut suggestions = Vec::new();

    for path in paths.iter() {
        if path.contains('%') {
            continue;
        }

        if let Some((var_name, base_path)) = detect_software(path) {
            if !existing_vars.contains_key(var_name) {
                let parts: Vec<&str> = path.split(&['\\', '/'][..]).collect();
                if let Some(suffix) = parts.last() {
                    suggestions.push(OptimizationSuggestion {
                        suggestion_type: "software".to_string(),
                        var_name: var_name.to_string(),
                        var_value: base_path.clone(),
                        old_path: path.clone(),
                        new_path: format!("%{}%\\{}", var_name, suffix),
                        description: format!("检测到 {} 安装路径", var_name.replace("_HOME", "")),
                    });
                }
            }
        }
    }

    Ok(suggestions)
}

// 获取用户环境变量
#[tauri::command]
fn get_user_variables() -> Result<HashMap<String, String>, String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let env = hkcu.open_subkey("Environment")
        .map_err(|e| format!("Failed to open user environment: {}", e))?;

    let mut vars = HashMap::new();
    for (name, value) in env.enum_values().filter_map(|x| x.ok()) {
        let val = value.to_string();
        vars.insert(name, val);
    }
    Ok(vars)
}

// 获取系统环境变量
#[tauri::command]
fn get_system_variables() -> Result<HashMap<String, String>, String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let env = hklm.open_subkey(r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment")
        .map_err(|e| format!("Failed to open system environment: {}", e))?;

    let mut vars = HashMap::new();
    for (name, value) in env.enum_values().filter_map(|x| x.ok()) {
        let val = value.to_string();
        vars.insert(name, val);
    }
    Ok(vars)
}

// 设置用户环境变量
#[tauri::command]
fn set_user_variable(name: String, value: String) -> Result<(), String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let env = hkcu.open_subkey_with_flags("Environment", KEY_WRITE)
        .map_err(|e| format!("Failed to open user environment: {}", e))?;

    env.set_value(&name, &value)
        .map_err(|e| format!("Failed to set variable: {}", e))?;

    broadcast_env_change();
    Ok(())
}

// 设置系统环境变量
#[tauri::command]
fn set_system_variable(name: String, value: String) -> Result<(), String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let env = hklm.open_subkey_with_flags(r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment", KEY_WRITE)
        .map_err(|e| format!("Failed to open system environment (需要管理员权限): {}", e))?;

    env.set_value(&name, &value)
        .map_err(|e| format!("Failed to set variable: {}", e))?;

    broadcast_env_change();
    Ok(())
}

// 删除用户环境变量
#[tauri::command]
fn delete_user_variable(name: String) -> Result<(), String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let env = hkcu.open_subkey_with_flags("Environment", KEY_WRITE)
        .map_err(|e| format!("Failed to open user environment: {}", e))?;

    env.delete_value(&name)
        .map_err(|e| format!("Failed to delete variable: {}", e))?;

    broadcast_env_change();
    Ok(())
}

// 删除系统环境变量
#[tauri::command]
fn delete_system_variable(name: String) -> Result<(), String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let env = hklm.open_subkey_with_flags(r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment", KEY_WRITE)
        .map_err(|e| format!("Failed to open system environment (需要管理员权限): {}", e))?;

    env.delete_value(&name)
        .map_err(|e| format!("Failed to delete variable: {}", e))?;

    broadcast_env_change();
    Ok(())
}

// 广播环境变量更改
#[cfg(windows)]
fn broadcast_env_change() {
    unsafe {
        let env_str: Vec<u16> = "Environment\0".encode_utf16().collect();
        let _ = SendMessageTimeoutW(
            HWND_BROADCAST,
            WM_SETTINGCHANGE,
            windows::Win32::Foundation::WPARAM(0),
            windows::Win32::Foundation::LPARAM(env_str.as_ptr() as isize),
            SMTO_ABORTIFHUNG,
            5000,
            None,
        );
    }
}

#[cfg(not(windows))]
fn broadcast_env_change() {}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_user_variables,
            get_system_variables,
            set_user_variable,
            set_system_variable,
            delete_user_variable,
            delete_system_variable,
            analyze_path,
            suggest_optimizations,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
