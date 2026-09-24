import { endRelationship, getCurrentActiveRelationship, getCurrentRelationshipUser, getRelationshipPartner, updateRelationshipName } from '../../services/relationship-service'
import type { Relationship } from '../../types'
import { getNavigationTopPadding } from '../../utils/navigation'

interface RelationshipSettingsPageData {
  pageTopPadding: number
  partnerName: string
  establishedDate: string
  relationshipName: string
  relationshipNameDraft: string
  relationshipId: string
  sheetOpen: boolean
  nameSheetOpen: boolean
  savingName: boolean
  submitting: boolean
}

interface RelationshipSettingsPageMethods {
  onShow(): void
  handleBack(): void
  openEndSheet(): void
  closeEndSheet(): void
  openNameSheet(): void
  closeNameSheet(): void
  handleNameInput(event: { detail: { value: string } }): void
  saveRelationshipName(): Promise<void>
  keepMyRecords(): void
  deleteBothRecords(): void
  finishEnding(shouldDeleteRecords: boolean): Promise<void>
  applyRelationship(relationship: Relationship): void
}

function formatEstablishedDate(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}.${month}.${day}`
}

Page<RelationshipSettingsPageData, RelationshipSettingsPageMethods>({
  data: {
    pageTopPadding: getNavigationTopPadding(),
    partnerName: '',
    establishedDate: '',
    relationshipName: '我们',
    relationshipNameDraft: '',
    relationshipId: '',
    sheetOpen: false,
    nameSheetOpen: false,
    savingName: false,
    submitting: false
  },
  onShow() {
    void getCurrentActiveRelationship().then((relationship) => {
      if (!relationship) {
        wx.redirectTo({ url: '/pages/unbound/index' })
        return
      }
      this.applyRelationship(relationship)
    }).catch(() => {
      wx.showToast({ title: '关系信息暂时无法读取', icon: 'none' })
    })
  },
  applyRelationship(relationship) {
    const currentUser = getCurrentRelationshipUser()
    const partnerId = relationship.userAId === currentUser.id ? relationship.userBId : relationship.userAId
    const partner = getRelationshipPartner(partnerId)
    this.setData({
      partnerName: partner.name,
      establishedDate: formatEstablishedDate(relationship.anniversaryDate ?? relationship.createdAt),
      relationshipName: relationship.name?.trim() || '我们',
      relationshipId: relationship.id
    })
  },
  handleBack() { wx.navigateBack() },
  openEndSheet() { this.setData({ sheetOpen: true }) },
  closeEndSheet() { if (!this.data.submitting) this.setData({ sheetOpen: false }) },
  openNameSheet() { this.setData({ relationshipNameDraft: this.data.relationshipName, nameSheetOpen: true }) },
  closeNameSheet() { if (!this.data.savingName) this.setData({ nameSheetOpen: false }) },
  handleNameInput(event) { this.setData({ relationshipNameDraft: event.detail.value }) },
  async saveRelationshipName() {
    const name = this.data.relationshipNameDraft.trim()
    if (!name) {
      wx.showToast({ title: '关系名称不能为空', icon: 'none' })
      return
    }
    if (name.length > 12) {
      wx.showToast({ title: '关系名称最多 12 个字符', icon: 'none' })
      return
    }
    if (!this.data.relationshipId || this.data.savingName) return
    this.setData({ savingName: true })
    try {
      const relationship = await updateRelationshipName(this.data.relationshipId, name)
      this.setData({ relationshipName: relationship.name ?? '我们', nameSheetOpen: false, savingName: false })
      wx.showToast({ title: '关系名称已更新', icon: 'none' })
    } catch (error) {
      this.setData({ savingName: false })
      wx.showToast({ title: error instanceof Error ? error.message : '名称暂时无法保存', icon: 'none' })
    }
  },
  keepMyRecords() { void this.finishEnding(false) },
  deleteBothRecords() { void this.finishEnding(true) },
  async finishEnding(shouldDeleteRecords) {
    if (this.data.submitting) return
    if (!this.data.relationshipId) {
      this.setData({ sheetOpen: false })
      wx.showToast({ title: '没有找到有效的关系连接', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try {
      await endRelationship(this.data.relationshipId, shouldDeleteRecords)
      wx.redirectTo({ url: '/pages/unbound/index' })
    } catch {
      this.setData({ submitting: false, sheetOpen: false })
      wx.showToast({ title: '暂时无法解除连接，请稍后再试', icon: 'none' })
    }
  }
})
