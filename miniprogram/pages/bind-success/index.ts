import { getCurrentMockUser, isDevelopmentEnvironment, switchCurrentMockUser } from '../../services/signal-service'
import { getRelationship, getRelationshipUserNames } from '../../services/relationship-service'
import type { MockUser, Relationship } from '../../types'

interface BindSuccessData {
  relationship: Relationship | null
  userAName: string
  userBName: string
  isDevelopment: boolean
  currentUser: MockUser
}

interface BindSuccessMethods {
  loadRelationship(relationshipId?: string): Promise<void>
  switchMockUser(): void
  goToHome(): void
}

Page<BindSuccessData, BindSuccessMethods>({
  data: {
    relationship: null,
    userAName: '',
    userBName: '',
    isDevelopment: false,
    currentUser: getCurrentMockUser()
  },
  onLoad(query: { relationshipId?: string }) {
    this.setData({ isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
    void this.loadRelationship(query.relationshipId)
  },
  onShow() {
    this.setData({ isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
  },
  async loadRelationship(relationshipId) {
    const relationship = relationshipId ? await getRelationship(relationshipId) : null
    if (!relationship) return
    const names = getRelationshipUserNames(relationship)
    this.setData({ relationship, ...names })
  },
  switchMockUser() {
    if (!this.data.isDevelopment) return
    this.setData({ currentUser: switchCurrentMockUser() })
  },
  goToHome() {
    wx.switchTab({ url: '/pages/home/index' })
  }
})
