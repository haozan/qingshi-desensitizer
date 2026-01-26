import { Controller } from "@hotwired/stimulus"

// Text highlighting controller for selecting and marking sensitive text
export default class extends Controller<HTMLElement> {
  static targets = ["content", "counter", "navigationPanel"]

  declare readonly contentTarget: HTMLTextAreaElement
  declare readonly counterTarget: HTMLElement
  declare readonly navigationPanelTarget: HTMLElement
  declare readonly hasCounterTarget: boolean
  declare readonly hasNavigationPanelTarget: boolean

  private selectedText: string = ''
  private matches: number[] = [] // Store start positions of all matches
  private currentMatchIndex: number = -1

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
    
    // No selection - hide navigation panel
    if (start === end) {
      this.clear()
      return
    }
    
    const selectedText = textarea.value.substring(start, end).trim()
    if (selectedText.length === 0) {
      this.clear()
      return
    }

    this.selectedText = selectedText
    
    // Find all matches
    this.findAllMatches()
    
    // Dispatch custom event with selected text
    const event = new CustomEvent('text-selected', {
      detail: { text: selectedText },
      bubbles: true
    })
    this.element.dispatchEvent(event)

    // Update counter and show navigation
    this.updateCounter()
    if (this.hasNavigationPanelTarget) {
      this.navigationPanelTarget.classList.remove('hidden')
    }
  }

  // Find all matches and store their positions
  findAllMatches(): void {
    this.matches = []
    this.currentMatchIndex = -1
    
    if (!this.selectedText) return
    
    const content = this.contentTarget.value
    const searchText = this.selectedText
    const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escapedText, 'g')
    
    let match
    while ((match = regex.exec(content)) !== null) {
      this.matches.push(match.index)
    }
    
    // Find which match is currently selected
    const currentPos = this.contentTarget.selectionStart
    for (let i = 0; i < this.matches.length; i++) {
      if (this.matches[i] === currentPos) {
        this.currentMatchIndex = i
        break
      }
    }
    
    // If no exact match found, find the closest one after current position
    if (this.currentMatchIndex === -1) {
      for (let i = 0; i < this.matches.length; i++) {
        if (this.matches[i] >= currentPos) {
          this.currentMatchIndex = i
          break
        }
      }
      // If still not found, use the first match
      if (this.currentMatchIndex === -1 && this.matches.length > 0) {
        this.currentMatchIndex = 0
      }
    }
  }

  // Navigate to next match
  findNext(): void {
    if (this.matches.length === 0) return
    
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length
    this.selectMatch()
  }

  // Navigate to previous match
  findPrevious(): void {
    if (this.matches.length === 0) return
    
    this.currentMatchIndex = (this.currentMatchIndex - 1 + this.matches.length) % this.matches.length
    this.selectMatch()
  }

  // Select the match at current index
  selectMatch(): void {
    if (this.currentMatchIndex < 0 || this.currentMatchIndex >= this.matches.length) return
    
    const start = this.matches[this.currentMatchIndex]
    const end = start + this.selectedText.length
    
    this.contentTarget.setSelectionRange(start, end)
    this.contentTarget.focus()
    
    // Scroll to selection
    this.scrollToSelection()
    
    // Update counter
    this.updateCounter()
  }

  // Scroll textarea to show the current selection
  scrollToSelection(): void {
    const textarea = this.contentTarget
    const text = textarea.value
    const start = textarea.selectionStart
    
    // Calculate line number
    const beforeText = text.substring(0, start)
    const lineNumber = beforeText.split('\n').length
    
    // Estimate line height (approximate)
    const lineHeight = 21 // 1.5 * 14px (text-sm)
    const scrollPosition = (lineNumber - 1) * lineHeight
    
    // Scroll to position (with some offset to center it)
    textarea.scrollTop = Math.max(0, scrollPosition - textarea.clientHeight / 2)
  }

  // Update counter display
  updateCounter(): void {
    if (!this.hasCounterTarget) return
    
    const current = this.currentMatchIndex + 1
    const total = this.matches.length
    this.counterTarget.textContent = `${current}/${total}`
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
    this.matches = []
    this.currentMatchIndex = -1
    
    if (this.hasNavigationPanelTarget) {
      this.navigationPanelTarget.classList.add('hidden')
    }
  }
}
