import { Controller } from "@hotwired/stimulus"

// Interface for mapping rule
interface MappingRule {
  original_text: string
  desensitized_label: string
  id?: string
}

// Desensitization manager - handles rules and text processing using localStorage
export default class extends Controller<HTMLElement> {
  static targets = [
    "originalText", "desensitizedText", "selectedText", "labelInput", 
    "rulesContainer", "addButton", "desensitizeButton", "restoreButton",
    "copyButton", "exportButton", "importInput", "originalCounter", "desensitizedCounter", "rulesCount"
  ]

  declare readonly originalTextTarget: HTMLTextAreaElement
  declare readonly desensitizedTextTarget: HTMLTextAreaElement
  declare readonly selectedTextTarget: HTMLElement
  declare readonly labelInputTarget: HTMLInputElement
  declare readonly rulesContainerTarget: HTMLElement
  declare readonly addButtonTarget: HTMLButtonElement
  declare readonly desensitizeButtonTarget: HTMLButtonElement
  declare readonly restoreButtonTarget: HTMLButtonElement
  declare readonly copyButtonTarget: HTMLButtonElement
  declare readonly exportButtonTarget: HTMLButtonElement
  declare readonly importInputTarget: HTMLInputElement
  declare readonly hasOriginalCounterTarget: boolean
  declare readonly originalCounterTarget: HTMLElement
  declare readonly hasDesensitizedCounterTarget: boolean
  declare readonly desensitizedCounterTarget: HTMLElement
  declare readonly hasRulesCountTarget: boolean
  declare readonly rulesCountTarget: HTMLElement

  private mappingRules: MappingRule[] = []
  private readonly STORAGE_KEY = 'desensitization_mappings'

  connect(): void {
    console.log("DesensitizationManager connected")
    this.loadMappings()
    this.renderRules()
    this.updateRulesCount()
  }

  // Handle text selection event from text-highlight controller
  handleTextSelected(event: CustomEvent): void {
    const selectedText = event.detail.text
    this.selectedTextTarget.textContent = selectedText
    this.selectedTextTarget.classList.remove('hidden')
  }

  // Add new mapping rule
  addRule(): void {
    const originalText = this.selectedTextTarget.textContent?.trim()
    const label = this.labelInputTarget.value.trim()

    if (!originalText || !label) {
      this.showToast('请选择文本并输入脱敏标签', 'warning')
      return
    }

    // Validate label format
    if (!this.isValidLabel(label)) {
      this.showToast('标签必须使用中文方括号格式，如【机构A】', 'danger')
      return
    }

    // Check for duplicates
    if (this.mappingRules.some(r => r.original_text === originalText)) {
      this.showToast('该文本已添加脱敏规则', 'warning')
      return
    }

    // Add rule
    const rule: MappingRule = {
      original_text: originalText,
      desensitized_label: label,
      id: this.generateId()
    }
    this.mappingRules.push(rule)
    this.saveMappings()
    this.renderRules()

    // Clear inputs
    this.labelInputTarget.value = ''
    this.selectedTextTarget.classList.add('hidden')
    
    this.showToast('脱敏规则已添加', 'success')
    this.updateCounters()
  }

  // Remove rule by id
  removeRule(event: Event): void {
    const target = event.currentTarget as HTMLElement
    const id = target.dataset.ruleId
    
    this.mappingRules = this.mappingRules.filter(r => r.id !== id)
    this.saveMappings()
    this.renderRules()
    this.updateCounters()
  }

  // Clear all rules
  clearRules(): void {
    if (this.mappingRules.length === 0) return
    
    this.mappingRules = []
    this.saveMappings()
    this.renderRules()
    this.updateCounters()
    this.showToast('已清空所有规则', 'info')
  }

  // Desensitize text
  desensitize(): void {
    if (this.mappingRules.length === 0) {
      this.showToast('请先添加脱敏规则', 'warning')
      return
    }

    const originalText = this.originalTextTarget.value.trim()
    if (!originalText) {
      this.showToast('请输入需要脱敏的文本', 'warning')
      return
    }

    let result = originalText
    
    // Sort by length desc to handle overlapping matches
    const sorted = [...this.mappingRules].sort((a, b) => 
      b.original_text.length - a.original_text.length
    )
    
    sorted.forEach(rule => {
      const regex = new RegExp(this.escapeRegex(rule.original_text), 'g')
      result = result.replace(regex, rule.desensitized_label)
    })

    this.desensitizedTextTarget.value = result
    this.showToast('脱敏完成', 'success')
    this.updateCounters()
  }

  // Restore desensitized text
  restore(): void {
    if (this.mappingRules.length === 0) {
      this.showToast('没有可用的脱敏映射记录', 'warning')
      return
    }

    const desensitizedText = this.desensitizedTextTarget.value.trim()
    if (!desensitizedText) {
      this.showToast('请输入需要还原的文本', 'warning')
      return
    }

    let result = desensitizedText
    
    // Sort by label length desc
    const sorted = [...this.mappingRules].sort((a, b) => 
      b.desensitized_label.length - a.desensitized_label.length
    )
    
    sorted.forEach(rule => {
      const regex = new RegExp(this.escapeRegex(rule.desensitized_label), 'g')
      result = result.replace(regex, rule.original_text)
    })

    this.originalTextTarget.value = result
    this.showToast('还原完成', 'success')
    this.updateCounters()
  }

  // Copy desensitized text to clipboard
  copyDesensitized(): void {
    const text = this.desensitizedTextTarget.value
    if (!text) {
      this.showToast('没有可复制的内容', 'warning')
      return
    }

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('已复制到剪贴板', 'success')
    }).catch(() => {
      this.showToast('复制失败', 'danger')
    })
  }

  // Export desensitized text to markdown file
  exportToMarkdown(): void {
    const text = this.desensitizedTextTarget.value.trim()
    if (!text) {
      this.showToast('没有可导出的内容', 'warning')
      return
    }

    // Create markdown content with metadata
    const timestamp = new Date().toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    /* eslint-disable indent */
    const markdownContent = `# 脱敏文本

> 导出时间: ${timestamp}  
> 工具: 脱敏大师  
> 规则数量: ${this.mappingRules.length} 个

---

## 文本内容

${text}

---

## 脱敏规则

${this.mappingRules.length > 0 ? this.mappingRules.map((rule, index) => 
  `${index + 1}. **${this.escapeMarkdown(rule.original_text)}** → \`${this.escapeMarkdown(rule.desensitized_label)}\``
).join('\n') : '无规则'}

---

*本文件由 [脱敏大师](https://qinglion.ai) 生成*
`
    /* eslint-enable indent */

    // Create blob and download
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    // Generate filename with timestamp
    const filename = `脱敏文本_${new Date().getTime()}.md`
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
    
    this.showToast('导出成功', 'success')
  }

  // Export rules to JSON file
  exportRules(): void {
    if (this.mappingRules.length === 0) {
      this.showToast('没有可导出的规则', 'warning')
      return
    }

    // Create export data with metadata
    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      tool: '脱敏大师',
      rulesCount: this.mappingRules.length,
      rules: this.mappingRules.map(rule => ({
        original_text: rule.original_text,
        desensitized_label: rule.desensitized_label
      }))
    }

    // Create blob and download
    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    // Generate filename with timestamp
    const filename = `脱敏规则_${new Date().getTime()}.json`
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
    
    this.showToast(`已导出 ${this.mappingRules.length} 条规则`, 'success')
  }

  // Trigger file input for import
  triggerImportRules(): void {
    this.importInputTarget.click()
  }

  // Import rules from JSON file
  importRules(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.json')) {
      this.showToast('请选择 JSON 文件', 'danger')
      input.value = ''
      return
    }

    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        
        // Validate data structure
        if (!data.rules || !Array.isArray(data.rules)) {
          this.showToast('文件格式错误：缺少 rules 数组', 'danger')
          return
        }

        // Validate each rule
        const validRules: MappingRule[] = []
        let invalidCount = 0
        
        data.rules.forEach((rule: any) => {
          if (rule.original_text && rule.desensitized_label) {
            // Validate label format
            if (this.isValidLabel(rule.desensitized_label)) {
              validRules.push({
                original_text: rule.original_text,
                desensitized_label: rule.desensitized_label,
                id: this.generateId()
              })
            } else {
              invalidCount++
            }
          } else {
            invalidCount++
          }
        })

        if (validRules.length === 0) {
          this.showToast('没有有效的规则可导入', 'danger')
          return
        }

        // Merge with existing rules (avoid duplicates)
        const existingTexts = new Set(this.mappingRules.map(r => r.original_text))
        let addedCount = 0
        
        validRules.forEach(rule => {
          if (!existingTexts.has(rule.original_text)) {
            this.mappingRules.push(rule)
            addedCount++
          }
        })

        // Save and update UI
        this.saveMappings()
        this.renderRules()
        this.updateCounters()
        
        // Show result
        let message = `成功导入 ${addedCount} 条规则`
        if (invalidCount > 0) {
          message += `，${invalidCount} 条无效`
        }
        if (addedCount < validRules.length) {
          message += `，${validRules.length - addedCount} 条重复`
        }
        
        this.showToast(message, 'success')
        
      } catch (error) {
        console.error('Import error:', error)
        this.showToast('文件解析失败，请检查文件格式', 'danger')
      } finally {
        // Reset file input
        input.value = ''
      }
    }

    reader.onerror = () => {
      this.showToast('文件读取失败', 'danger')
      input.value = ''
    }

    reader.readAsText(file)
  }

  // Private methods
  private renderRules(): void {
    if (this.mappingRules.length === 0) {
      this.rulesContainerTarget.innerHTML = `
        <div class="text-center py-8 text-muted">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" 
               stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293
                     l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p>暂无脱敏规则，请先选择文本并添加</p>
        </div>
      `
      return
    }

    const html = this.mappingRules.map(rule => `
      <div class="mapping-rule">
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-xs font-medium text-muted">原文</span>
            <span class="text-sm text-primary truncate">
              ${this.escapeHtml(rule.original_text)}
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-medium text-muted">标签</span>
            <span class="text-sm text-secondary font-mono">
              ${this.escapeHtml(rule.desensitized_label)}
            </span>
          </div>
        </div>
        <button 
          type="button"
          data-rule-id="${rule.id}"
          data-action="click->desensitization-manager#removeRule"
          class="flex-shrink-0 p-2 text-danger hover:bg-danger/10 rounded transition-colors"
          title="删除规则">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858
                     L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    `).join('')

    this.rulesContainerTarget.innerHTML = html
  }

  private loadMappings(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.mappingRules = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load mappings:', error)
    }
  }

  private saveMappings(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.mappingRules))
      this.updateRulesCount()
    } catch (error) {
      console.error('Failed to save mappings:', error)
    }
  }

  private updateRulesCount(): void {
    if (this.hasRulesCountTarget) {
      this.rulesCountTarget.textContent = this.mappingRules.length.toString()
    }
  }

  private isValidLabel(label: string): boolean {
    return /^【.+】$/.test(label)
  }

  private generateId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  private escapeMarkdown(text: string): string {
    // Escape markdown special characters
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/`/g, '\\`')
  }

  private updateCounters(): void {
    if (this.hasOriginalCounterTarget) {
      const count = this.originalTextTarget.value.length
      this.originalCounterTarget.textContent = `${count} 字符`
    }
    if (this.hasDesensitizedCounterTarget) {
      const count = this.desensitizedTextTarget.value.length
      this.desensitizedCounterTarget.textContent = `${count} 字符`
    }
  }

  private showToast(message: string, type: 'success' | 'warning' | 'danger' | 'info'): void {
    // Use the global toast function if available
    if (typeof window.showToast === 'function') {
      window.showToast(message, type)
    } else {
      // Fallback to console
      console.log(`[${type}] ${message}`)
    }
  }
}
