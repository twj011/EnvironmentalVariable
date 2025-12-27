# 快速开始指南

## 🚀 当前状态

**前端**: ✅ 编译成功
**后端**: ⚠️ 需要修复链接器（Visual Studio Build Tools）

## 📋 已实现的功能

### ✅ 完全可用
1. **搜索过滤** - 实时搜索环境变量
2. **智能 PATH 分析** - 彩色标记（蓝/绿/红）
3. **软件识别** - 8 种常见软件自动识别
4. **优化建议** - 智能分析并生成建议
5. **一键应用优化** - 点击"✅ 应用"按钮自动优化

### 🔧 修复链接器问题

Windows 系统的 `link.exe` 与 MSVC 的 `link.exe` 冲突。

**解决方案**：

1. 安装 Visual Studio Build Tools
2. 或者临时修复：
```bash
# 检查 PATH 中的 link.exe
where link.exe

# 确保 MSVC 的 link.exe 在前面
# 通常在: C:\Program Files\Microsoft Visual Studio\...\VC\Tools\MSVC\...\bin\Hostx64\x64\link.exe
```

## 🎯 测试步骤（修复后）

### 1. 启动开发模式
```bash
npm run tauri:dev
```

### 2. 测试搜索功能
- 在变量列表顶部输入关键词
- 查看实时过滤结果
- 显示匹配数量

### 3. 测试 PATH 编辑器
- 点击"🛣️ PATH 编辑"
- 查看彩色标记：
  - 🔵 蓝色 = 变量引用（%JAVA_HOME%）
  - 🟢 绿色 = 有效路径
  - 🔴 红色 = 无效路径

### 4. 测试智能优化
- 点击"✨ 智能优化"按钮
- 查看优化建议
- 点击"✅ 应用"按钮应用建议
- 验证：
  - 新变量已创建（如 JAVA_HOME）
  - PATH 已更新（使用变量引用）

## 📝 功能演示

### 优化前
```
PATH=D:\Program Files\Java\jdk-17\bin;C:\Python311;C:\Python311\Scripts
```

### 点击"智能优化"后
```
建议 1: 检测到 JAVA 安装路径
  创建变量: JAVA_HOME = D:\Program Files\Java\jdk-17
  替换: D:\Program Files\Java\jdk-17\bin → %JAVA_HOME%\bin
  [✅ 应用]

建议 2: 检测到 PYTHON 安装路径
  创建变量: PYTHON_HOME = C:\Python311
  替换: C:\Python311 → %PYTHON_HOME%
  [✅ 应用]
```

### 应用优化后
```
JAVA_HOME=D:\Program Files\Java\jdk-17
PYTHON_HOME=C:\Python311
PATH=%JAVA_HOME%\bin;%PYTHON_HOME%;%PYTHON_HOME%\Scripts
```

## 🎨 UI 特性

### 搜索框
- 位置：变量列表顶部
- 功能：实时过滤变量名称和值
- 显示：匹配数量（如"用户变量 (5)"）

### PATH 编辑器
- 彩色边框标记路径状态
- 状态标签（❌ 路径不存在 / 🔵 变量引用）
- "✨ 智能优化"按钮

### 优化建议卡片
- 显示建议描述
- 显示需要创建的变量
- 显示路径替换前后对比
- "✅ 应用"按钮

## 🔍 支持的软件识别

| 软件 | 变量名 | 识别模式 |
|------|--------|---------|
| Java | JAVA_HOME | `*\java\jdk*`, `*\java*\bin` |
| Python | PYTHON_HOME | `*\Python3*` |
| Node.js | NODE_HOME | `*\nodejs` |
| Maven | MAVEN_HOME | `*\maven*` |
| Git | GIT_HOME | `*\Git\cmd` |
| MATLAB | MATLAB_HOME | `*\MATLAB\R*` |
| Gradle | GRADLE_HOME | `*\gradle*` |
| CUDA | CUDA_HOME | `*\CUDA\v*` |

## 📊 代码统计

- **Rust 后端**: 240+ 行
- **React 前端**: 310+ 行
- **文档**: 1000+ 行
- **总计**: 1550+ 行

## 🚧 待实现功能

1. **拖拽排序** - PATH 条目拖拽重排
2. **备份恢复** - 本地 JSON 备份
3. **WebDAV 同步** - 云端备份

## 📚 相关文档

- [readme.markdown](../readme.markdown) - 完整功能说明
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - 实现状态
- [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) - 完成总结
- [CLAUDE.md](../CLAUDE.md) - 开发指南

## 💡 提示

- 修改系统变量需要管理员权限
- 修改后立即生效，无需重启
- 建议先测试用户变量，再测试系统变量
- 可以随时点击"✨ 智能优化"查看新建议
