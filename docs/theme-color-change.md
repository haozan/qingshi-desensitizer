# 主题色修改记录

## 修改日期
2024年

## 原主题色
- **颜色**: 专业蓝色 (Professional Blue)
- **十六进制**: #0073e6
- **HSL**: 210° 100% 45%

## 新主题色
- **颜色**: 深绿色 (Deep Green)
- **十六进制**: #1D6E47
- **HSL**: 151° 58% 27%

---

## 修改的文件

### 1. `app/assets/stylesheets/application.css`

#### 亮色模式（Light Mode）
```css
:root {
  /* Primary Colors */
  --color-primary: 151 58% 27%;         /* Deep professional green #1D6E47 */
  --color-primary-light: 151 58% 42%;   /* Light green */
  --color-primary-dark: 151 58% 20%;    /* Dark green */

  /* Secondary Colors */
  --color-secondary: 171 48% 35%;       /* Complementary teal */
  --color-secondary-light: 171 48% 55%; /* Light teal */
  --color-secondary-dark: 171 48% 25%;  /* Dark teal */
}
```

#### 深色模式（Dark Mode）
```css
.dark {
  /* Primary Colors */
  --color-primary: 151 58% 50%;         /* Bright green for visibility */
  --color-primary-light: 151 58% 65%;   /* Light green */
  --color-primary-dark: 151 58% 40%;    /* Dark green */

  /* Secondary Colors */
  --color-secondary: 171 48% 55%;       /* Bright teal */
  --color-secondary-light: 171 48% 70%; /* Light teal */
  --color-secondary-dark: 171 48% 45%;  /* Dark teal */
}
```

### 2. `app/views/layouts/application.html.erb`
```html
<meta name="theme-color" content="#1D6E47">
```

### 3. `app/views/pwa/manifest.json.erb`
```json
"theme_color": "#1D6E47"
```

---

## 颜色对比

| 元素 | 原颜色 (蓝色) | 新颜色 (绿色) |
|------|-------------|-------------|
| 主色调 | #0073e6 | #1D6E47 |
| 亮色模式主色 | HSL(210, 100%, 45%) | HSL(151, 58%, 27%) |
| 深色模式主色 | HSL(210, 100%, 65%) | HSL(151, 58%, 50%) |
| 次要色 | 紫色系 (270°) | 青绿色系 (171°) |

---

## 设计理念

### 为什么选择深绿色？
1. **专业性**: 深绿色传达稳重、可靠、专业的品牌形象
2. **安全感**: 绿色在心理学上代表安全、保密、信任
3. **视觉舒适**: 绿色对眼睛友好，长时间使用不易疲劳
4. **品牌区分**: 与常见的蓝色系应用形成差异化

### 配色方案
- **主色**: 深绿色 #1D6E47（专业、稳重）
- **辅色**: 青绿色/Teal（补色，增加层次感）
- **对比**: 深色模式下提升亮度至50%，确保可读性

---

## 影响范围

### 全局影响
✅ 所有按钮的主色调
✅ 链接颜色
✅ 标题和重点文字
✅ 边框和分割线（带主色调的部分）
✅ 卡片和面板的强调色
✅ 图标和徽章
✅ 进度条和加载动画
✅ PWA 应用图标颜色（浏览器地址栏、任务栏）

### 页面影响
- 首页 (home/index.html.erb)
- 脱敏工具页 (text_processors/index.html.erb)
- PWA 安装横幅
- 所有使用 `text-primary`、`bg-primary`、`border-primary` 的元素

---

## 验证清单

✅ CSS 编译成功 (`npm run build:css`)
✅ 亮色模式主色调生效
✅ 深色模式主色调生效
✅ PWA manifest 主题色更新
✅ HTML meta 主题色更新
✅ 按钮、链接、标题等元素颜色正确
✅ 对比度符合 WCAG AA 标准（深色模式 4.5:1）

---

## 回滚方法

如需回滚到原蓝色主题，执行以下操作：

### 1. 恢复 CSS 变量
```css
/* Light Mode */
--color-primary: 210 100% 45%;
--color-primary-light: 210 100% 60%;
--color-primary-dark: 210 100% 35%;

--color-secondary: 270 50% 50%;
--color-secondary-light: 270 50% 70%;
--color-secondary-dark: 270 50% 35%;

/* Dark Mode */
--color-primary: 210 100% 65%;
--color-primary-light: 210 100% 75%;
--color-primary-dark: 210 100% 55%;

--color-secondary: 270 50% 65%;
--color-secondary-light: 270 50% 80%;
--color-secondary-dark: 270 50% 50%;
```

### 2. 恢复 Meta 标签
```html
<meta name="theme-color" content="#0073e6">
```

### 3. 恢复 Manifest
```json
"theme_color": "#0073e6"
```

### 4. 重新构建 CSS
```bash
npm run build:css
```

---

## 技术说明

### HSL 色彩空间
使用 HSL（色相、饱和度、亮度）而不是 RGB 或十六进制的优点：
- 易于调整亮度（深色模式只需修改 L 值）
- 易于创建同色系变体（调整 S 和 L）
- 更直观的颜色关系

### 色相值对比
- **蓝色**: 210° (原主题)
- **绿色**: 151° (新主题)
- **青绿色**: 171° (新辅助色，介于绿色和青色之间)

### 深色模式优化
- 主色亮度从 27% 提升到 50%，确保足够对比度
- 辅助色亮度从 35% 提升到 55%
- 所有文字与背景对比度 ≥ 4.5:1 (WCAG AA)

---

## 后续建议

### 可选优化
1. **Logo/图标更新**: 考虑更新应用图标以匹配新的绿色主题
2. **插图配色**: 如有插图或图表，调整配色与新主题协调
3. **A/B 测试**: 收集用户反馈，评估新颜色的接受度
4. **品牌指南**: 更新品牌色彩指南文档

### 配色建议
如需更多色彩变化，可参考：
- **明亮绿**: HSL(151, 58%, 42%) - 用于悬停状态
- **深绿**: HSL(151, 58%, 20%) - 用于按下状态
- **淡绿背景**: HSL(151, 58%, 95%) - 用于淡色背景

---

*文档生成时间: 2024年*
