import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="navbar-scroll"
export default class extends Controller {
  private lastScrollY: number = 0

  connect() {
    this.handleScroll = this.handleScroll.bind(this)
    window.addEventListener('scroll', this.handleScroll)
    this.lastScrollY = window.scrollY
  }

  disconnect() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    const currentScrollY = window.scrollY
    
    if (currentScrollY > 50) {
      this.element.classList.add('scrolled')
    } else {
      this.element.classList.remove('scrolled')
    }
    
    this.lastScrollY = currentScrollY
  }
}
