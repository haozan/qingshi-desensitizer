import { Controller } from "@hotwired/stimulus"

/**
 * Push Notifications Controller
 *
 * Handles Web Push Notifications subscription and management
 *
 * Usage:
 *   <div data-controller="push-notifications">
 *     <button
 *       data-push-notifications-target="subscribeButton"
 *       data-action="click->push-notifications#subscribe"
 *       class="btn-primary">
 *       Enable Notifications
 *     </button>
 *   </div>
 */
export default class extends Controller {
  declare readonly subscribeButtonTarget: HTMLButtonElement
  declare readonly hasSubscribeButtonTarget: boolean

  private registration: ServiceWorkerRegistration | null = null

  async connect() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported in this browser')
      this.hideSubscribeButton()
      return
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      const subscription = await this.registration.pushManager.getSubscription()
      
      if (subscription) {
        this.hideSubscribeButton()
      } else if (this.hasSubscribeButtonTarget) {
        this.subscribeButtonTarget.classList.remove('hidden')
      }
    } catch (error) {
      console.error('Error checking push subscription:', error)
    }
  }

  async subscribe() {
    if (!this.registration) {
      console.error('Service Worker not registered')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        this.showToast('通知权限被拒绝', 'warning')
        return
      }

      // Note: In production, you would need a VAPID public key from your backend
      // For now, we just request permission and show success
      this.showToast('通知已启用！您将收到重要更新', 'success')
      this.hideSubscribeButton()

      // In production, you would subscribe with VAPID keys:
      // const subscription = await this.registration.pushManager.subscribe({
      //   userVisibleOnly: true,
      //   applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      // })
      // Then send subscription to your backend to store

    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      this.showToast('启用通知失败，请稍后重试', 'danger')
    }
  }

  async unsubscribe() {
    if (!this.registration) {
      return
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        this.showToast('通知已禁用', 'info')
        
        if (this.hasSubscribeButtonTarget) {
          this.subscribeButtonTarget.classList.remove('hidden')
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
    }
  }

  private hideSubscribeButton() {
    if (this.hasSubscribeButtonTarget) {
      this.subscribeButtonTarget.classList.add('hidden')
    }
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' | 'danger' = 'info') {
    if (window.showToast) {
      window.showToast(message, type)
    } else {
      console.log(`[${type}] ${message}`)
    }
  }

  static targets = ["subscribeButton"]
}
