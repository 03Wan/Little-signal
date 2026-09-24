import type { SignalType } from '../../types'
import type { SignalOption } from '../../utils/signals'

type QuickSignalWheelProperties = {
  open: WechatMiniprogram.Component.FullProperty<BooleanConstructor>
  activeType: WechatMiniprogram.Component.FullProperty<StringConstructor> & { value?: SignalType | '' }
  signals: WechatMiniprogram.Component.FullProperty<ArrayConstructor> & { value?: SignalOption[] }
}

Component<{}, QuickSignalWheelProperties, WechatMiniprogram.Component.MethodOption>({
  properties: {
    open: { type: Boolean, value: false },
    activeType: { type: String, value: '' },
    signals: { type: Array, value: [] }
  }
})
