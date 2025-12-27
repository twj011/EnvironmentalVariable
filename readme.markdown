# 环境变量管理器

一个现代化的 Windows 环境变量管理工具，提供智能 PATH 优化、备份恢复和 WebDAV 同步功能。

## 为什么比 IDE 编辑器更好？

传统 IDE（如 VS Code、IntelliJ IDEA）的环境变量编辑功能通常隐藏在深层设置中，功能单一。本工具提供：

| 功能 | IDE 编辑器 | 本工具 |
|------|-----------|--------|
| **可视化 PATH 编辑** | 简单文本框 | 🎯 彩色列表：蓝色=变量引用，绿色=有效路径，红色=无效路径 |
| **智能优化建议** | ❌ 无 | ✅ 自动检测可优化路径，建议提取公共前缀 |
| **软件自动识别** | ❌ 无 | ✅ 识别 10+ 常见软件（Java、Python、Node.js、Git 等） |
| **拖拽排序** | ❌ 无 | ✅ 直接拖拽调整 PATH 优先级 |
| **实时验证** | ❌ 无 | ✅ 即时检查路径是否存在 |
| **备份恢复** | ❌ 无 | ✅ 本地备份 + WebDAV 云同步 |
| **变量引用追踪** | ❌ 无 | ✅ 高亮显示 %JAVA_HOME% 等引用 |
| **冲突检测** | ❌ 无 | ✅ 识别重复和问题条目 |
| **访问便捷性** | 需要多层菜单导航 | 🚀 独立应用，一键启动 |

## 功能特性

### 核心功能

#### 已实现 ✅
- ✅ **可视化管理** - 分别查看和编辑用户变量与系统变量
- ✅ **搜索过滤** - 实时搜索环境变量名称和值
- ✅ **智能 PATH 编辑器** - 彩色标记（蓝/绿/红）显示路径状态
- ✅ **路径验证** - 自动检测路径是否存在
- ✅ **软件识别** - 自动识别 8 种常见软件（Java, Python, Node.js, Maven, Git, MATLAB, Gradle, CUDA）
- ✅ **智能优化建议** - 分析 PATH 并提供优化建议
- ✅ **实时生效** - 修改后无需重启系统（通过 WM_SETTINGCHANGE 广播）
- ✅ **CRUD 操作** - 创建、读取、更新、删除环境变量

#### 开发中 🚧
- 🚧 **拖拽排序** - PATH 条目拖拽重排
- 🚧 **一键应用优化** - 自动应用优化建议
- 🚧 **备份与恢复** - 本地 JSON 备份
- 🚧 **WebDAV 同步** - 云端备份同步

### 智能功能详解

#### 🎯 智能 PATH 编辑器
不同于 IDE 的简单文本框，本工具提供：
- **彩色可视化**：
  - 🔵 蓝色 = 变量引用（如 `%JAVA_HOME%\bin`）
  - 🟢 绿色 = 有效路径（文件夹存在）
  - 🔴 红色 = 无效路径（文件夹不存在）
- **拖拽排序**：直接拖动条目调整 PATH 优先级
- **一键添加/删除**：无需手动编辑分号分隔的长字符串
- **实时验证**：输入路径时即时检查有效性

#### 🤖 智能优化引擎
自动分析 PATH 并提供优化建议：

**场景 1：软件自动识别**
```
检测到：D:\Project\program\java\jdk-17\bin
建议：创建 JAVA_HOME=D:\Project\program\java\jdk-17
      替换为：%JAVA_HOME%\bin
优势：更新 JDK 版本时只需修改一个变量
```

**场景 2：公共前缀提取**
```
检测到：
  D:\Project\program\java\jdk-17\bin
  D:\Project\program\java\maven\bin
  D:\Project\program\java\gradle\bin
建议：创建 JAVA_ROOT=D:\Project\program\java
      简化为：%JAVA_ROOT%\jdk-17\bin 等
优势：统一管理 Java 相关工具，路径更清晰
```

**场景 3：重复路径检测**
```
检测到：C:\Python311 出现 2 次
建议：删除重复条目
优势：避免 PATH 冗余，提升查找效率
```

#### 🔍 支持的软件识别（10+ 种）
- **开发语言**：Java (JDK/JRE)、Python、Node.js、Go、Ruby
- **构建工具**：Maven、Gradle、npm、yarn
- **版本控制**：Git、SVN
- **IDE/编辑器**：VS Code、IntelliJ IDEA
- **科学计算**：MATLAB、Anaconda
- **GPU 计算**：CUDA Toolkit

### 典型使用流程

```
1. 启动应用 → 自动加载所有环境变量
   ↓
2. 点击 "PATH 编辑器" → 查看彩色可视化列表
   - 蓝色条目：使用了变量引用（如 %JAVA_HOME%\bin）
   - 绿色条目：路径有效
   - 红色条目：路径不存在（需要清理）
   ↓
3. 点击 "智能优化" → 获取优化建议
   - 自动识别：检测到 Java、Python、Node.js 安装路径
   - 公共前缀：发现 3 个路径共享 D:\Project\program
   - 重复检测：发现 C:\Python311 重复 2 次
   ↓
4. 一键应用建议 → PATH 变得更清晰、更易维护
   - 创建 JAVA_HOME、PYTHON_HOME 等变量
   - 替换绝对路径为变量引用
   - 删除重复和无效条目
   ↓
5. 创建备份 → 保存到本地或云端
   - 本地：./backups/env_backup_20250127.json
   - 云端：WebDAV 同步到坚果云/NextCloud
```

### 实际优化案例

**优化前（混乱的 PATH）：**
```
PATH=D:\Project\program\java\jdk-17\bin;D:\Project\program\java\maven\bin;C:\Python311;C:\Python311\Scripts;C:\Python311;D:\nodejs;D:\nodejs\node_modules
```
❌ 问题：
- 绝对路径难以维护
- C:\Python311 重复出现
- 路径层级深，不易理解

**优化后（清晰的 PATH）：**
```
JAVA_HOME=D:\Project\program\java\jdk-17
MAVEN_HOME=D:\Project\program\java\maven
PYTHON_HOME=C:\Python311
NODE_HOME=D:\nodejs

PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PYTHON_HOME%;%PYTHON_HOME%\Scripts;%NODE_HOME%
```
✅ 优势：
- 使用变量引用，更新软件版本只需改一处
- 删除重复条目，PATH 更简洁
- 路径语义清晰，一目了然
- 其他程序可复用 JAVA_HOME 等变量

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

| 类别 | 软件 | 识别模式 |
|------|------|---------|
| **开发语言** | Java (JDK/JRE) | `*\java\jdk*`, `*\java*\bin` |
| | Python | `*\Python3*`, `*\python*` |
| | Node.js | `*\nodejs`, `*\node*` |
| | Go | `*\go\bin` |
| | Ruby | `*\Ruby*\bin` |
| **构建工具** | Maven | `*\apache-maven*`, `*\maven*` |
| | Gradle | `*\gradle*` |
| **版本控制** | Git | `*\Git\cmd`, `*\git*` |
| **IDE/编辑器** | VS Code | `*\Microsoft VS Code*` |
| **科学计算** | MATLAB | `*\MATLAB\R*` |
| | Anaconda | `*\Anaconda*`, `*\anaconda*` |
| **GPU 计算** | CUDA | `*\CUDA\v*` |

识别后自动建议创建对应的 `*_HOME` 变量，使环境配置更规范。

## 注意事项

⚠️ **重要提示**
- 修改环境变量前建议先创建备份
- 修改系统变量需要管理员权限（右键以管理员身份运行）
- 删除关键系统变量可能导致程序无法运行
- WebDAV 密码以明文存储在内存中，请注意安全

## 与 IDE 编辑器的对比

### VS Code 环境变量编辑
- **访问路径**：设置 → 搜索 "terminal.integrated.env" → 手动编辑 JSON
- **功能**：仅支持文本编辑，无验证、无优化建议
- **局限**：只影响 VS Code 终端，不影响系统全局

### IntelliJ IDEA 环境变量编辑
- **访问路径**：Run → Edit Configurations → Environment Variables
- **功能**：简单的键值对编辑器
- **局限**：仅针对运行配置，无 PATH 可视化

### 本工具的优势
✅ **独立应用**：无需打开 IDE，一键启动
✅ **全局管理**：直接修改 Windows 注册表，影响所有程序
✅ **智能分析**：自动识别软件、检测问题、提供优化建议
✅ **可视化**：彩色 PATH 编辑器，拖拽排序
✅ **安全保障**：备份恢复、云端同步
✅ **实时生效**：修改后立即广播系统消息

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！