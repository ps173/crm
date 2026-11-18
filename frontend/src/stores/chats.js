import { RECENT_CHATS_LIMIT, isChatListStale, withTitle } from '@/utils/chat'
import { createResource } from 'frappe-ui'
import { defineStore } from 'pinia'

export const chatsStore = defineStore('crm-chats', () => {
  // The open chat's island knows its title before list_sessions does.
  const reported = { session: null, title: null }

  const recentChats = createResource({
    url: 'frappe.flow.api.list_sessions',
    method: 'GET',
    params: { limit: RECENT_CHATS_LIMIT },
    cache: 'crm-recent-chats',
    initialData: [],
    transform: (chats) => withTitle(chats, reported.session, reported.title),
  })

  function reportTitle(session, title) {
    Object.assign(reported, { session, title })
    recentChats.setData((chats) => chats || [])
    if (isChatListStale(recentChats.data, session)) recentChats.reload()
  }

  return { recentChats, reportTitle }
})
