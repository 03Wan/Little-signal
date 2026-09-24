import type { AppTabKey } from '../types'

interface CustomTabBarData {
  selectedKey: AppTabKey
  hidden: boolean
}

Component<CustomTabBarData, {}, WechatMiniprogram.Component.MethodOption>({
  data: {
    selectedKey: 'signal',
    hidden: false
  },
  lifetimes: {
    attached() {
      const pages = getCurrentPages()
      const currentRoute = pages[pages.length - 1]?.route ?? ''
      const selectedKey: AppTabKey = currentRoute === 'pages/history/index'
        ? 'footprints'
        : currentRoute === 'pages/us/index'
          ? 'us'
          : 'signal'

      this.setData({ selectedKey })
    }
  },
  methods: {
    handleChange(event: WechatMiniprogram.CustomEvent<{ key: AppTabKey }>) {
      const { key } = event.detail
      const tabRoutes: Record<AppTabKey, string> = {
        signal: '/pages/home/index',
        footprints: '/pages/history/index',
        us: '/pages/us/index'
      }

      this.setData({ selectedKey: key })
      wx.switchTab({ url: tabRoutes[key] })
    }
  }
})
