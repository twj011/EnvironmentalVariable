# 应用图标说明

## 图标要求

为了打包成 EXE，你需要在 `assets` 文件夹中放置以下图标文件：

### 主图标
- **文件名**: `icon.ico`
- **格式**: ICO 格式（Windows 图标）
- **尺寸**: 建议包含多个尺寸（16x16, 32x32, 48x48, 256x256）
- **设计建议**:
  - 使用环境变量相关的图标（如齿轮、设置、变量符号）
  - 使用现代化的配色（蓝色、绿色渐变）
  - 简洁明了，易于识别

### 可选图标
- **文件名**: `icon.png`
- **格式**: PNG 格式（用于应用内显示）
- **尺寸**: 512x512 或更大
- **用途**: 关于对话框、启动画面等

## 如何创建图标

### 方法 1: 在线工具
1. 访问 https://www.icoconverter.com/
2. 上传你的 PNG 图片
3. 选择多个尺寸（16, 32, 48, 256）
4. 下载生成的 .ico 文件
5. 重命名为 `icon.ico` 并放入 `assets` 文件夹

### 方法 2: 使用 Pillow（Python）
```python
from PIL import Image

# 创建或加载图片
img = Image.open('your_image.png')

# 保存为 ICO 格式，包含多个尺寸
img.save('assets/icon.ico', format='ICO', sizes=[(16,16), (32,32), (48,48), (256,256)])
```

### 方法 3: 使用现有图标
你可以从以下网站下载免费图标：
- https://www.flaticon.com/
- https://icons8.com/
- https://www.iconfinder.com/

搜索关键词：
- "environment variable"
- "settings"
- "configuration"
- "system settings"

## 临时方案

如果暂时没有图标，程序会使用默认的 PyQt6 图标。但为了更专业的外观，建议添加自定义图标。

## 当前状态

📁 `assets/` 文件夹已创建
⏳ 等待添加 `icon.ico` 文件
