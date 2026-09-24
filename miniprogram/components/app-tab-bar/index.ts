import type { AppTabKey } from '../../types'

type AppTabBarPropertyOption = {
  selectedKey: WechatMiniprogram.Component.FullProperty<StringConstructor>
}

Component<{}, AppTabBarPropertyOption, WechatMiniprogram.Component.MethodOption>({
  properties: {
    selectedKey: { type: String, value: 'signal' }
  },
  methods: {
    handleTabTap(event: WechatMiniprogram.TouchEvent) {
      const key = event.currentTarget.dataset.key as AppTabKey
      this.triggerEvent('change', { key })
    }
  }
})
