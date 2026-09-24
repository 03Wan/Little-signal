import type { MoodType } from '../../types'

type MoodBadgePropertyOption = {
  type: WechatMiniprogram.Component.FullProperty<StringConstructor>
  label: WechatMiniprogram.Component.FullProperty<StringConstructor>
  compact: WechatMiniprogram.Component.FullProperty<BooleanConstructor>
}

Component<{}, MoodBadgePropertyOption, WechatMiniprogram.Component.MethodOption>({
  properties: {
    type: { type: String, value: 'okay' },
    label: { type: String, value: '' },
    compact: { type: Boolean, value: false }
  }
})

export type { MoodType }
