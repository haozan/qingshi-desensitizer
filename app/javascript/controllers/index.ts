import { Application } from "@hotwired/stimulus"

import ThemeController from "./theme_controller"
import DropdownController from "./dropdown_controller"
import SdkIntegrationController from "./sdk_integration_controller"
import ClipboardController from "./clipboard_controller"
import TomSelectController from "./tom_select_controller"
import FlatpickrController from "./flatpickr_controller"
import SystemMonitorController from "./system_monitor_controller"
import FlashController from "./flash_controller"
import TextHighlightController from "./text_highlight_controller"
import DesensitizationManagerController from "./desensitization_manager_controller"
import NavbarScrollController from "./navbar_scroll_controller"
import PwaInstallController from "./pwa_install_controller"
import PushNotificationsController from "./push_notifications_controller"

const application = Application.start()

application.register("theme", ThemeController)
application.register("dropdown", DropdownController)
application.register("sdk-integration", SdkIntegrationController)
application.register("clipboard", ClipboardController)
application.register("tom-select", TomSelectController)
application.register("flatpickr", FlatpickrController)
application.register("system-monitor", SystemMonitorController)
application.register("flash", FlashController)
application.register("text-highlight", TextHighlightController)
application.register("desensitization-manager", DesensitizationManagerController)
application.register("navbar-scroll", NavbarScrollController)
application.register("pwa-install", PwaInstallController)
application.register("push-notifications", PushNotificationsController)

window.Stimulus = application
