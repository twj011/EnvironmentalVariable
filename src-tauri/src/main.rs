// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use winreg::enums::*;
use winreg::RegKey;

#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::{SendMessageTimeoutW, HWND_BROADCAST, SMTO_ABORTIFHUNG, WM_SETTINGCHANGE};

#[derive(Debug, Serialize, Deserialize)]
struct EnvVariable {
    name: String,
    value: String,
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
