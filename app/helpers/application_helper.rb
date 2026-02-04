module ApplicationHelper
  # Define your helper methods here
  
  def og_meta_tags
    og_image_url = asset_url('og-image.png')
    site_name = Rails.application.config.x.appname
    description = "让敏感信息安全无忧 - #{site_name}"
    
    [
      tag.meta(property: 'og:title', content: content_for?(:title) ? "#{yield(:title)} | #{site_name}" : site_name),
      tag.meta(property: 'og:description', content: content_for?(:og_description) ? yield(:og_description) : description),
      tag.meta(property: 'og:image', content: og_image_url),
      tag.meta(property: 'og:url', content: request.url),
      tag.meta(property: 'og:type', content: 'website'),
      tag.meta(property: 'og:site_name', content: site_name),
      tag.meta(name: 'twitter:card', content: 'summary_large_image'),
      tag.meta(name: 'twitter:title', content: content_for?(:title) ? "#{yield(:title)} | #{site_name}" : site_name),
      tag.meta(name: 'twitter:description', content: content_for?(:og_description) ? yield(:og_description) : description),
      tag.meta(name: 'twitter:image', content: og_image_url)
    ].join.html_safe
  end
end
