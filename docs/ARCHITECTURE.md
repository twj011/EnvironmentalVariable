# EnvironmentalVariable Architecture

## Current Tech Stack
- **Frontend**: React 19 + Vite 7 + TypeScript 5
- **Desktop Shell**: Tauri 2 (Rust backend, WebView2 renderer)
- **System APIs**: Windows registry access via `winreg` and Win32 broadcasts (Tauri commands)

## Directory Layout
```
.
├── src/                # React frontend source
├── src-tauri/          # Rust backend + Tauri config
├── dist/               # Vite build output consumed by Tauri
├── _python-old/        # Deprecated Python implementation (ignored)
└── docs/               # Project documentation
```

## Runtime Flow
1. React UI invokes Tauri commands via `@tauri-apps/api`.
2. Rust commands (in `src-tauri/src/main.rs`) access Windows registry to list/set/delete env vars.
3. After mutation, backend broadcasts `WM_SETTINGCHANGE` so OS picks up new values.
4. Vite builds static assets; Tauri bundles them into desktop executable.

## Build & Packaging
- `npm run dev` — Vite dev server + `tauri dev` hot reload.
- `npm run build` — TypeScript type-check + production bundle.
- `npm run tauri:build` — Full desktop package (uses `src-tauri/tauri.conf.json`).

Artifacts:
- Backend binary: `src-tauri/target/release/env-manager.exe`
- Installer/bundle (platform-specific) emitted per Tauri config.

## Migration Notes
- Python UI + PyInstaller flow moved to `_python-old/` and ignored by git.
- All new features should target the Rust + Tauri stack.
- Legacy docs kept for reference but no longer maintained.
