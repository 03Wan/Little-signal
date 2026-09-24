const CUSTOM_HEADER_HEIGHT = 44

/** Align a custom page header with WeChat's top-right menu button. */
export function getNavigationTopPadding(): number {
  const statusBarHeight = wx.getSystemInfoSync().statusBarHeight || 0
  try {
    const menuButton = wx.getMenuButtonBoundingClientRect()
    if (menuButton.top > 0 && menuButton.height > 0) {
      return Math.max(statusBarHeight, Math.round(menuButton.top + (menuButton.height - CUSTOM_HEADER_HEIGHT) / 2))
    }
  } catch {
    // The simulator may not expose menu-button geometry during page initialization.
  }
  return statusBarHeight + 4
}

/** Keep a header action clear of WeChat's built-in menu capsule. */
export function getNavigationActionInset(): number {
  try {
    const menuButton = wx.getMenuButtonBoundingClientRect()
    const windowWidth = wx.getSystemInfoSync().windowWidth
    if (menuButton.left > 0 && windowWidth > menuButton.left) {
      const pageGutter = windowWidth <= 375 ? 16 : 20
      return Math.max(0, Math.round(windowWidth - pageGutter - menuButton.left + 8))
    }
  } catch {
    // Fall back to a menu-sized gap when geometry is unavailable.
  }
  return 72
}
