import { Controller } from "@hotwired/stimulus"

// Text highlighting controller for selecting and marking sensitive text
export default class extends Controller<HTMLElement> {
  static targets = ["content", "counter"]

  declare readonly contentTarget: HTMLTextAreaElement
  declare readonly counterTarget: HTMLElement
  declare readonly hasCounterTarget: boolean

  private selectedText: string = ''

  connect(): void {
    console.log("TextHighlight connected")
    this.contentTarget.addEventListener('mouseup', this.handleSelection.bind(this))
  }

  disconnect(): void {
    this.contentTarget.removeEventListener('mouseup', this.handleSelection.bind(this))
  }

  // Handle text selection in textarea
  handleSelection(): void {
    // For textarea, use selectionStart/selectionEnd instead of window.getSelection()
    const textarea = this.contentTarget
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    if (start === end) return // No selection
    
    const selectedText = textarea.value.substring(start, end).trim()
    if (selectedText.length === 0) return

    this.selectedText = selectedText
    
    // Dispatch custom event with selected text
    const event = new CustomEvent('text-selected', {
      detail: { text: selectedText },
      bubbles: true
    })
    this.element.dispatchEvent(event)

    // Update counter if exists
    if (this.hasCounterTarget) {
      const count = this.countOccurrences(textarea.value, selectedText)
      this.counterTarget.textContent = `找到 ${count} 处`
      this.counterTarget.classList.remove('hidden')
    }
  }

  // Count occurrences of text in content
  countOccurrences(content: string, searchText: string): number {
    if (!content || !searchText) return 0
    const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    return (content.match(regex) || []).length
  }

  // Clear selection
  clear(): void {
    this.selectedText = ''
    if (this.hasCounterTarget) {
      this.counterTarget.classList.add('hidden')
    }
  }
}
