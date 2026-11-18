import {
  chatKey,
  chatRoute,
  chatRows,
  flowPath,
  isChatListStale,
  warmOnce,
  withTitle,
} from '@/utils/chat'

describe('flowPath', () => {
  it('opens a new chat when the route names no session', () => {
    expect(flowPath(undefined)).toBe('/')
    expect(flowPath('')).toBe('/')
  })

  it('opens the session the route names', () => {
    expect(flowPath('abc 1')).toBe('/s/abc%201')
  })
})

describe('chatRoute', () => {
  it('follows Flow to a session', () => {
    expect(chatRoute('/s/abc', undefined)).toEqual({
      name: 'Chat',
      params: { session: 'abc' },
    })
    expect(chatRoute('/s/b', 'a')).toEqual({
      name: 'Chat',
      params: { session: 'b' },
    })
  })

  it('follows Flow to a new chat', () => {
    expect(chatRoute('/', 'abc')).toEqual({ name: 'Chat' })
  })

  it('stays put when the route already shows that chat', () => {
    expect(chatRoute('/s/abc', 'abc')).toBeNull()
    expect(chatRoute('/', undefined)).toBeNull()
    expect(chatRoute('/', '')).toBeNull()
  })

  it('reads the session back as the route gave it', () => {
    expect(chatRoute(flowPath('abc 1'), 'abc 1')).toBeNull()
    expect(chatRoute('/s/abc%201?tab=x', undefined)).toEqual({
      name: 'Chat',
      params: { session: 'abc 1' },
    })
  })

  it('ignores the other Flow pages', () => {
    expect(chatRoute('/agent/sales', 'abc')).toBeNull()
    expect(chatRoute('/s/abc/extra', 'x')).toBeNull()
  })
})

describe('warmOnce', () => {
  it('resolves the assets once and preloads what they resolve to', async () => {
    const resolve = vi.fn(async () => ({ js: '/chat.js', css: '/chat.css' }))
    const preload = vi.fn()
    const warm = warmOnce(resolve, preload)

    await Promise.all([warm(), warm()])
    await warm()

    expect(resolve).toHaveBeenCalledTimes(1)
    expect(preload).toHaveBeenCalledTimes(1)
    expect(preload).toHaveBeenCalledWith({ js: '/chat.js', css: '/chat.css' })
  })

  it('tries again after a failed resolve', async () => {
    const resolve = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ js: '/chat.js' })
    const preload = vi.fn()
    const warm = warmOnce(resolve, preload)

    await warm()
    expect(preload).not.toHaveBeenCalled()

    await warm()
    expect(preload).toHaveBeenCalledWith({ js: '/chat.js' })
  })
})

describe('chatRows', () => {
  const chats = [
    { name: 'a1', title: 'Stalled deals' },
    { name: 'b2', title: '' },
    { name: 'c3', title: null },
  ]

  it('starts with New chat, which opens a fresh chat', () => {
    const [first] = chatRows([])
    expect(first).toMatchObject({
      label: 'New chat',
      key: chatKey(undefined),
      to: { name: 'Chat' },
    })
  })

  it('opens each chat under its own key', () => {
    const row = chatRows(chats)[1]
    expect(row).toMatchObject({
      label: 'Stalled deals',
      key: chatKey('a1'),
      to: { name: 'Chat', params: { session: 'a1' } },
    })
    expect(row.key).not.toBe(chatKey(undefined))
  })

  it('names untitled chats', () => {
    const labels = chatRows(chats).map((row) => row.label)
    expect(labels).toEqual([
      'New chat',
      'Stalled deals',
      'Untitled chat',
      'Untitled chat',
    ])
  })

  it('shows at most five chats', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ name: `s${i}` }))
    expect(chatRows(many)).toHaveLength(6)
  })
})

describe('isChatListStale', () => {
  const chats = [{ name: 'a1', title: 'Stalled deals' }]

  it('is fresh on a new chat', () => {
    expect(isChatListStale(chats, undefined)).toBe(false)
  })

  it('is stale when the open chat is missing from the list', () => {
    expect(isChatListStale(chats, 'z9')).toBe(true)
    expect(isChatListStale([], 'a1')).toBe(true)
  })

  it('is fresh when the open chat is listed, whatever its title', () => {
    expect(isChatListStale(chats, 'a1')).toBe(false)
    expect(isChatListStale([{ name: 'b2', title: '' }], 'b2')).toBe(false)
  })
})

describe('withTitle', () => {
  const chats = [
    { name: 'a1', title: 'Stalled deals' },
    { name: 'b2', title: '' },
  ]

  it('gives the open chat the title its island reported', () => {
    expect(withTitle(chats, 'b2', 'CRM Lead Count Query')).toEqual([
      { name: 'a1', title: 'Stalled deals' },
      { name: 'b2', title: 'CRM Lead Count Query' },
    ])
  })

  it('keeps the other rows and their order', () => {
    const patched = withTitle(chats, 'b2', 'New')
    expect(patched[0]).toBe(chats[0])
    expect(patched.map((c) => c.name)).toEqual(['a1', 'b2'])
  })

  it('does not change the list it was given', () => {
    withTitle(chats, 'b2', 'New')
    expect(chats[1].title).toBe('')
  })

  it('leaves the list alone when there is nothing to patch', () => {
    expect(withTitle(chats, 'z9', 'New')).toBe(chats)
    expect(withTitle(chats, undefined, 'New')).toBe(chats)
    expect(withTitle(chats, 'a1', null)).toBe(chats)
    expect(withTitle(chats, 'a1', 'Stalled deals')).toBe(chats)
  })
})
