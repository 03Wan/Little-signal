import type { SignalIconName } from '../../types'

type TypedStringProperty<Value extends string> = WechatMiniprogram.Component.FullProperty<StringConstructor> & {
  value?: Value
}

type SignalIconProperties = {
  name: TypedStringProperty<SignalIconName>
  size: WechatMiniprogram.Component.FullProperty<NumberConstructor>
  label: WechatMiniprogram.Component.FullProperty<StringConstructor>
}

Component<{}, SignalIconProperties, WechatMiniprogram.Component.MethodOption>({
  properties: {
    name: { type: String, value: 'signal' },
    size: { type: Number, value: 20 },
    label: { type: String, value: '' }
  }
})
