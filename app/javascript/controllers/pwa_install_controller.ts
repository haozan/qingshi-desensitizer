import { Controller } from "@hotwired/stimulus"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

// Global storage for deferredPrompt to persist across controller lifecycle
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null

/**
 * PWA Install Controller
 *
 * Handles Progressive Web App installation prompt
 *
 * Usage:
 *   <div data-controller="pwa-install">
 *     <button
 *       data-pwa-install-target="installButton"
 *       data-action="click->pwa-install#install"
 *       class="hidden">
 *       Install App
 *     </button>
 *   </div>
 */
export default class extends Controller {
  declare readonly installButtonTarget: HTMLButtonElement
  declare readonly hasInstallButtonTarget: boolean

  connect() {
    window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this))
    window.addEventListener('appinstalled', this.handleAppInstalled.bind(this))

    // Always show install button unless already in standalone mode
    if (!this.isStandalone() && this.hasInstallButtonTarget) {
      this.installButtonTarget.classList.remove('hidden')
    }
  }

  disconnect() {
    window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this))
    window.removeEventListener('appinstalled', this.handleAppInstalled.bind(this))
  }

  private handleBeforeInstallPrompt(e: Event) {
    e.preventDefault()
    globalDeferredPrompt = e as BeforeInstallPromptEvent

    if (this.hasInstallButtonTarget) {
      this.installButtonTarget.classList.remove('hidden')
    }
  }

  private handleAppInstalled() {
    globalDeferredPrompt = null
    this.hideInstallButton()
  }

  async install(event: Event) {
    event.preventDefault()
    event.stopPropagation()
    
    if (!globalDeferredPrompt) {
      // If no prompt available, show native alert with install instructions
      const message = '📱 安装说明\n\n请按以下步骤安装：\n\n' +
        '• Chrome/Edge： 点击地址栏右侧的安装图标\n' +
        '• Safari (iOS)： 点击分享按钮 → "添加到主屏幕"\n' +
        '• Firefox： 浏览器菜单 → "安装此站点"\n\n' +
        '安装后可离线使用，体验更佳！'
      
      // eslint-disable-next-line no-alert
      window.alert(message)
      return
    }

    try {
      await globalDeferredPrompt.prompt()
      const { outcome } = await globalDeferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('PWA installation accepted')
        // Only clear and hide if user accepted
        globalDeferredPrompt = null
        this.hideInstallButton()
      } else {
        console.log('PWA installation dismissed')
        // Keep globalDeferredPrompt so user can try again
      }
    } catch (error) {
      console.error('PWA install error:', error)
    }
  }

  private isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }

  private hideInstallButton() {
    if (this.hasInstallButtonTarget) {
      this.installButtonTarget.classList.add('hidden')
    }
  }

  static targets = ["installButton"]
}
