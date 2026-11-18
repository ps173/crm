import { getNavigationItems, navigationItems } from '@/utils/navigation'

const routesOf = (items) => items.map((item) => item.route)

describe('navigationItems', () => {
  afterEach(() => {
    delete window.is_flow_available
  })

  it('uses unique route names', () => {
    const routes = routesOf(navigationItems)
    expect(new Set(routes).size).toBe(routes.length)
  })

  it('omits desktop-only destinations on mobile', () => {
    window.is_flow_available = true
    const mobileRoutes = routesOf(getNavigationItems({ mobile: true }))
    expect(mobileRoutes).not.toContain('Home')
    expect(mobileRoutes).not.toContain('Dashboard')
    expect(mobileRoutes).not.toContain('Calendar')
    expect(mobileRoutes).toContain('Leads')
  })

  it('ends with Call Logs; chats live in their own section', () => {
    window.is_flow_available = true
    expect(routesOf(getNavigationItems()).at(-1)).toBe('Call Logs')
  })
})
