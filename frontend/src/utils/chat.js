import { preloadIsland } from '@framework/ui/island/host'
import { call } from 'frappe-ui'
import LucideMessagesSquare from '~icons/lucide/messages-square'
import LucideSquarePen from '~icons/lucide/square-pen'

export const CHAT_ISLAND = 'frappe.flow.chat'
export const RECENT_CHATS_LIMIT = 5

const SESSION_PATH = /^\/s\/([^/?#]+)(?:[?#]|$)/
const NEW_CHAT_PATH = /^\/(?:[?#]|$)/

export function flowPath(session) {
  return session ? `/s/${encodeURIComponent(session)}` : '/'
}

// The CRM route for a path Flow moved to, or null when the route already shows it or
// Flow is on a page CRM does not map, such as /agent/<name>.
export function chatRoute(path, session) {
  const opened = path.match(SESSION_PATH)?.[1]
  if (opened) {
    const id = decodeURIComponent(opened)
    return id === session ? null : { name: 'Chat', params: { session: id } }
  }
  return NEW_CHAT_PATH.test(path) && session ? { name: 'Chat' } : null
}

// A failed resolve is forgotten, so the next hover or focus tries again.
export function warmOnce(resolve, preload) {
  let warming = null
  return () =>
    (warming ??= Promise.resolve()
      .then(resolve)
      .then(preload, () => (warming = null)))
}

// Downloads the chat island before the Chat page mounts it; the mount reuses both files.
export const warmChatIsland = warmOnce(
  () => call('frappe.utils.island.get_island_assets', { name: CHAT_ISLAND }),
  preloadIsland,
)

// Prefixed so a chat's id cannot match a route or saved view name in the sidebar.
export function chatKey(session) {
  return session ? `chat:${session}` : 'Chat'
}

export function chatRows(chats) {
  const newChat = {
    label: __('New chat'),
    icon: LucideSquarePen,
    key: chatKey(),
    to: { name: 'Chat' },
    warm: warmChatIsland,
  }
  return [
    newChat,
    ...chats.slice(0, RECENT_CHATS_LIMIT).map((chat) => ({
      label: chat.title || __('Untitled chat'),
      icon: LucideMessagesSquare,
      key: chatKey(chat.name),
      to: { name: 'Chat', params: { session: chat.name } },
      warm: warmChatIsland,
    })),
  ]
}

export function isChatListStale(chats, session) {
  return Boolean(session) && !chats.some((c) => c.name === session)
}

// A null title means the chat has not loaded yet, not that it lost its title.
export function withTitle(chats, session, title) {
  const i = chats.findIndex((c) => c.name === session)
  if (i === -1 || title == null || chats[i].title === title) return chats
  return chats.map((c, j) => (j === i ? { ...c, title } : c))
}
