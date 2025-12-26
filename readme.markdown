# 环境变量管理器

一个现代化的 Windows 环境变量管理工具，提供智能 PATH 优化、备份恢复和 WebDAV 同步功能。

## 功能特性

### 核心功能
- ✅ **可视化管理** - 分别查看和编辑用户变量与系统变量
- ✅ **智能 PATH 编辑器** - 列表视图，支持拖拽排序
- ✅ **智能路径优化** - 自动检测可提取的公共路径（≥3层）
- ✅ **软件识别** - 自动识别常见软件（Java, Python, Node.js, MATLAB, Git 等）
- ✅ **备份与恢复** - 本地 JSON 备份
- ✅ **WebDAV 同步** - 云端备份同步
- ✅ **实时生效** - 修改后无需重启系统
- ✅ **搜索过滤** - 快速查找变量

### 智能优化示例

**优化前：**
```
PATH=D:\Project\program\java\jdk-17\bin;D:\Project\program\java\maven\bin;C:\Python311;C:\Python311\Scripts
```

**优化后：**
```
JAVA_HOME=D:\Project\program\java\jdk-17
MAVEN_HOME=D:\Project\program\java\maven
PYTHON_HOME=C:\Python311

PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PYTHON_HOME%;%PYTHON_HOME%\Scripts
```

## 安装（Rust + Tauri）

### 依赖要求
- Node.js 18+
- Rust toolchain（MSVC 目标）
- Windows 操作系统

### 安装步骤

1. 克隆仓库
```bash
git clone <repository-url>
cd EnvironmentalVariable
```

2. 安装 npm 依赖
```bash
npm install
```

3. 开发模式（热更新）
```bash
npm run tauri:dev
```

4. 打包发布
```bash
npm run tauri:build
```

> 旧版 Python 客户端已移入 `_python-old/`，如需参考请查看该目录。

### 主要操作

#### 1. 查看和编辑变量
- 切换"用户变量"和"系统变量"标签页
- 使用搜索框快速查找变量
- 双击或点击"编辑变量"修改值

#### 2. 编辑 PATH
- 点击"编辑 PATH"按钮
- 在列表中拖拽条目调整优先级
- 添加或删除路径条目
- 变量引用（如 `%JAVA_HOME%`）会以蓝色高亮显示

#### 3. 智能优化 PATH
- 点击"优化 PATH"按钮
- 查看优化建议
- 系统会自动检测：
  - 3 层以上的深层路径
  - 常见软件安装路径
  - 可提取的公共前缀

#### 4. 备份管理
- 点击"备份管理"按钮
- **创建备份**：自动保存到 `./backups/` 目录
- **WebDAV 配置**：
  - 输入服务器地址（如 `https://dav.example.com`）
  - 输入用户名和密码
  - 点击"连接 WebDAV"
- **上传备份**：选择本地备份上传到云端
- **下载备份**：从云端下载备份到本地

## 项目结构

```
EnvironmentalVariable/
├── src/                      # React + Vite 前端
├── src-tauri/                # Rust 后端（Tauri 命令、配置）
├── dist/                     # Vite 构建输出
├── docs/                     # 文档
├── _python-old/              # 已废弃的 Python 版本
└── package.json              # 前端依赖配置
```

## 技术实现

### 核心技术
- **React + Vite + TypeScript**：构建现代桌面 UI
- **Tauri 2**：WebView2 容器 + Rust 命令
- **Rust `winreg` + Win32 API**：读取/写入注册表并广播 `WM_SETTINGCHANGE`

### 工作原理

1. React UI 通过 `@tauri-apps/api` 调用 Rust 命令。
2. Rust 命令使用 `winreg` 访问注册表，进行读取/写入/删除。
3. 修改后通过 Win32 API 广播 `WM_SETTINGCHANGE`，新启动进程即可获取最新值。
4. 旧版 Python 的备份/分析逻辑暂存 `_python-old/` 目录，作为历史参考。

## 常见问题

### Q: 修改后需要重启系统吗？
A: 不需要。程序会自动广播系统消息，新启动的程序会立即读取新的环境变量。已运行的程序需要重启才能生效。

### Q: 为什么无法修改系统变量？
A: 修改系统变量需要管理员权限。请右键以管理员身份运行程序。

### Q: 支持哪些 WebDAV 服务？
A: 支持所有标准 WebDAV 协议的服务，如：
- 坚果云
- NextCloud
- ownCloud
- Synology NAS
- 其他支持 WebDAV 的云存储

### Q: 备份文件存储在哪里？
A: 本地备份默认存储在 `./backups/` 目录，文件名格式为 `env_backup_YYYYMMDD_HHMMSS.json`

## 支持的软件检测

程序可以自动识别以下软件的安装路径：
- Java (JDK/JRE)
- Python
- Node.js
- MATLAB
- Git
- Maven
- Gradle
- Visual Studio Code
- Anaconda
- CUDA

## 注意事项

⚠️ **重要提示**
- 修改环境变量前建议先创建备份
- 修改系统变量需要管理员权限
- 删除关键系统变量可能导致程序无法运行
- WebDAV 密码以明文存储在内存中，请注意安全

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！