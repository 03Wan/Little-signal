import type { MockUser } from '../../types'

const mockUsers: readonly [MockUser, MockUser] = [
  { id: 'mock-user-a', name: '王波', role: 'A' },
  { id: 'mock-user-b', name: '姚闻月', role: 'B' }
]

let activeUserIndex = 0

export function getMockCurrentUser(): MockUser {
  return { ...mockUsers[activeUserIndex] }
}

export function getMockUser(userId: string): MockUser | null {
  const user = mockUsers.find((item) => item.id === userId)
  return user ? { ...user } : null
}

export function switchMockUser(): MockUser {
  activeUserIndex = activeUserIndex === 0 ? 1 : 0
  return getMockCurrentUser()
}

export function getMockPartner(userId: string): MockUser {
  const partner = mockUsers.find((user) => user.id !== userId) ?? mockUsers[0]
  return { ...partner }
}
