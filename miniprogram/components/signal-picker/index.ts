import type { SignalType } from '../../types'
import type { SignalOption } from '../../utils/signals'
import { getNavigationTopPadding } from '../../utils/navigation'

type SignalPickerData = { stageTop: number }

type SignalPickerProperties = {
  open: WechatMiniprogram.Component.FullProperty<BooleanConstructor>
  noReply: WechatMiniprogram.Component.FullProperty<BooleanConstructor>
  signals: WechatMiniprogram.Component.FullProperty<ArrayConstructor> & { value?: SignalOption[] }
}

type SignalPickerMethods = {
  handleClose(): void
  stopPropagation(): void
  handleSelect(event: WechatMiniprogram.TouchEvent): void
  handleMoment(): void
  handleNoReplyChange(): void
}

Component<SignalPickerData, SignalPickerProperties, SignalPickerMethods>({
  data: { stageTop: getNavigationTopPadding() + 36 },
  properties: {
    open: { type: Boolean, value: false },
    noReply: { type: Boolean, value: false },
    signals: { type: Array, value: [] }
  },
  methods: {
    handleClose() {
      this.triggerEvent('close')
    },
    stopPropagation() {},
    handleSelect(event) {
      const type = event.currentTarget.dataset.type as SignalType
      const customSignalId = event.currentTarget.dataset.customsignalid as string | undefined
      this.triggerEvent('select', { type, customSignalId })
    },
    handleMoment() {
      this.triggerEvent('moment')
    },
    handleNoReplyChange() {
      this.triggerEvent('noreplychange', { value: !this.data.noReply })
    }
  }
})
