# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern Windows environment variable manager built with Rust Tauri backend and React frontend. Provides visual management of user/system environment variables with intelligent PATH editing capabilities.

**Tech Stack:**
- Backend: Rust + Tauri 2 + winreg + windows-rs
- Frontend: React 19 + TypeScript 5 + Vite 7

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run tauri:dev

# Build production executable
npm run tauri:build

# Frontend only (for UI development)
npm run dev

# Type check and build frontend
npm run build
```

Build artifacts: `src-tauri/target/release/env-manager.exe`

## Architecture

### Frontend-Backend Communication
React UI invokes Tauri commands via `@tauri-apps/api/core`. All commands defined in [src-tauri/src/main.rs](src-tauri/src/main.rs):

**Available Tauri Commands:**
- `get_user_variables()` - Read HKCU\Environment
- `get_system_variables()` - Read HKLM\...\Environment
- `set_user_variable(name, value)` - Write user env var
- `set_system_variable(name, value)` - Write system env var (requires admin)
- `delete_user_variable(name)` - Delete user env var
- `delete_system_variable(name)` - Delete system env var (requires admin)

After mutations, backend broadcasts `WM_SETTINGCHANGE` so Windows picks up changes without restart.

### Directory Structure
```
src/                 # React frontend (App.tsx, main.tsx, styles.css)
src-tauri/           # Rust backend + Tauri config
  src/main.rs        # All Tauri commands + Windows registry access
  Cargo.toml         # Rust dependencies
  tauri.conf.json    # App config (window size, bundle settings)
dist/                # Vite build output (consumed by Tauri)
_python-old/         # Deprecated Python/Flet implementation (ignore)
```

### Frontend State Management
[src/App.tsx](src/App.tsx) manages all state with React hooks:
- `userVars` / `systemVars` - Environment variable maps
- `view` - Current view ('variables' | 'path' | 'backup' | 'optimizer')
- `editModal` - Modal state for create/edit operations

### Windows Registry Access
Backend uses `winreg` crate to access:
- User vars: `HKEY_CURRENT_USER\Environment`
- System vars: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment`

System variable operations require administrator privileges.

## Migration Context

Project migrated from Python (Flet) to Rust Tauri + React. Legacy Python code in `_python-old/` for reference only. All new features target Rust/Tauri stack.

**Planned Features (not yet implemented):**
- Smart PATH optimization (detect common software paths, suggest optimizations)
- Backup/restore with WebDAV sync
- PATH editor enhancements (drag-drop reordering, add/remove paths)

## Platform Requirements

- Windows 10/11 only (uses Windows registry APIs)
- Node.js 18+
- Rust 1.70+ with Visual Studio Build Tools for linking
