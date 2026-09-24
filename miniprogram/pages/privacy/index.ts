import { getNavigationTopPadding } from '../../utils/navigation'

interface PrivacyPageMethods {
  handleBack(): void
}

Page<{ pageTopPadding: number }, PrivacyPageMethods>({
  data: { pageTopPadding: getNavigationTopPadding() },
  handleBack() { wx.navigateBack() }
})
