# OG (Open Graph) 标签使用指南

## 概述

本项目已经集成了 Open Graph (OG) 和 Twitter Card 标签，让你的网站在社交媒体（Facebook、Twitter、LinkedIn 等）上分享时有更美观的展示效果。

## 功能特性

### 自动生成的标签

在 `application.html.erb` 中，系统会自动为每个页面生成以下 meta 标签：

- **og:title** - 页面标题（如果有自定义标题则为 "标题 | 网站名"，否则为网站名）
- **og:description** - 页面描述（默认为 "让敏感信息安全无忧 - 网站名"）
- **og:image** - OG 图片（位于 `app/assets/images/og-image.png`）
- **og:url** - 当前页面 URL
- **og:type** - 固定为 "website"
- **og:site_name** - 网站名称
- **twitter:card** - Twitter 卡片类型（summary_large_image）
- **twitter:title** - Twitter 标题
- **twitter:description** - Twitter 描述
- **twitter:image** - Twitter 图片

## 如何使用

### 1. 基本使用（无需额外设置）

所有页面都会自动包含 OG 标签，无需额外配置。

### 2. 自定义页面标题

在视图文件中使用 `content_for` 设置自定义标题：

```erb
<% content_for :title, "产品特性" %>

<!-- 页面内容 -->
```

这将生成 OG 标签：`og:title="产品特性 | 青狮脱敏大师"`

### 3. 自定义页面描述

在视图文件中使用 `content_for` 设置自定义描述：

```erb
<% content_for :title, "产品特性" %>
<% content_for :og_description, "我们的脱敏工具提供专业级别的数据保护，支持多种脱敏算法。" %>

<!-- 页面内容 -->
```

这将生成 OG 标签：`og:description="我们的脱敏工具提供专业级别的数据保护，支持多种脱敏算法。"`

## 更换 OG 图片

如果需要更换 OG 图片（推荐尺寸：1200x630 像素）：

1. 准备新的图片文件
2. 替换 `app/assets/images/og-image.png`
3. 重启项目（`bin/dev`）

## 测试 OG 标签

### 方法 1：查看 HTML 源码

```bash
curl http://localhost:3000/ | grep -E 'og:|twitter:'
```

### 方法 2：使用在线工具

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## 技术实现

### Helper 方法

位置：`app/helpers/application_helper.rb`

```ruby
def og_meta_tags
  og_image_url = asset_url('og-image.png')
  site_name = Rails.application.config.x.appname
  description = "让敏感信息安全无忧 - #{site_name}"
  
  [
    tag.meta(property: 'og:title', content: content_for?(:title) ? "#{yield(:title)} | #{site_name}" : site_name),
    tag.meta(property: 'og:description', content: content_for?(:og_description) ? yield(:og_description) : description),
    # ... 其他标签
  ].join.html_safe
end
```

### Layout 集成

位置：`app/views/layouts/application.html.erb`

```erb
<%= og_meta_tags %>
```

## 最佳实践

1. **图片尺寸**：使用 1200x630 像素的图片以获得最佳显示效果
2. **图片格式**：推荐使用 PNG 或 JPG 格式
3. **描述长度**：建议保持在 150-300 字符之间
4. **标题长度**：建议保持在 60 字符以内

## 示例效果

当用户在社交媒体上分享你的网站链接时，会看到：

- **标题**：页面标题 | 青狮脱敏大师
- **描述**：让敏感信息安全无忧 - 青狮脱敏大师（或自定义描述）
- **图片**：你上传的 OG 图片
- **链接**：当前页面 URL

## 故障排查

### 图片不显示

1. 确认图片文件存在于 `app/assets/images/og-image.png`
2. 重启项目以重新加载资源
3. 检查图片大小是否合理（建议 < 8MB）

### 社交媒体缓存

社交媒体平台会缓存 OG 数据。如果修改后没有更新：

- Facebook：使用 [Sharing Debugger](https://developers.facebook.com/tools/debug/) 刷新缓存
- Twitter：使用 [Card Validator](https://cards-dev.twitter.com/validator) 刷新缓存
