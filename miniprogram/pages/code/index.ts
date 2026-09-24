import { deleteCustomSignal, listCustomSignals, MAX_ENABLED_CUSTOM_SIGNALS, setCustomSignalEnabled } from '../../services/custom-signal-service'
import { getCurrentMockPartner, getCurrentMockUser } from '../../services/signal-service'
import type { CustomSignal } from '../../types'
interface CustomSignalListItem extends CustomSignal { creatorName: string }
interface CustomSignalListData { items: CustomSignalListItem[]; enabledCount: number; maxEnabled: number; loading: boolean; hasRelationship: boolean; deleteSheetOpen: boolean; deleteTargetId: string }
interface CustomSignalListMethods {
  onShow(): void; loadSignals(): Promise<void>; goBack(): void; openCreate(): void
  editSignal(event: WechatMiniprogram.TouchEvent): void; toggleSignal(event: WechatMiniprogram.TouchEvent): Promise<void>
  askDelete(event: WechatMiniprogram.TouchEvent): void; closeDeleteSheet(): void; confirmDelete(): Promise<void>
}
Page<CustomSignalListData, CustomSignalListMethods>({
  data: { items: [], enabledCount: 0, maxEnabled: MAX_ENABLED_CUSTOM_SIGNALS, loading: true, hasRelationship: true, deleteSheetOpen: false, deleteTargetId: '' },
  onShow() { void this.loadSignals() },
  goBack() { wx.navigateBack() },
  async loadSignals() {
    this.setData({ loading: true, hasRelationship: true })
    try {
      const items = await listCustomSignals(), current = getCurrentMockUser(), partner = getCurrentMockPartner()
      this.setData({ items: items.map((item) => ({ ...item, creatorName: item.createdBy === current.id ? current.name : partner.name })), enabledCount: items.filter((item) => item.enabled).length, loading: false })
    } catch (error) {
      this.setData({ items: [], enabledCount: 0, loading: false, hasRelationship: false })
      if (error instanceof Error && error.message !== '请先建立关系连接') wx.showToast({ title: error.message, icon: 'none' })
    }
  },
  openCreate() { if (this.data.enabledCount < this.data.maxEnabled) wx.navigateTo({ url: '/pages/code/create' }) },
  editSignal(event) { wx.navigateTo({ url: `/pages/code/create?id=${encodeURIComponent(event.currentTarget.dataset.id as string)}` }) },
  async toggleSignal(event) {
    const id = event.currentTarget.dataset.id as string, enabled = event.currentTarget.dataset.enabled !== 'true'
    try { await setCustomSignalEnabled(id, enabled); await this.loadSignals() }
    catch (error) { wx.showToast({ title: error instanceof Error ? error.message : '操作失败', icon: 'none' }) }
  },
  askDelete(event) { this.setData({ deleteTargetId: event.currentTarget.dataset.id as string, deleteSheetOpen: true }) },
  closeDeleteSheet() { this.setData({ deleteTargetId: '', deleteSheetOpen: false }) },
  async confirmDelete() {
    const id = this.data.deleteTargetId
    if (!id) return
    try { await deleteCustomSignal(id); this.closeDeleteSheet(); await this.loadSignals() }
    catch (error) { this.closeDeleteSheet(); wx.showToast({ title: error instanceof Error ? error.message : '删除失败', icon: 'none' }) }
  }
})
