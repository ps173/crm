<template>
  <div class="chat-page flex h-full flex-col overflow-hidden">
    <LayoutHeader>
      <template #left-header>
        <Breadcrumbs :items="breadcrumbs" />
      </template>
      <template #right-header>
        <IslandActions :actions="actions" />
      </template>
    </LayoutHeader>

    <div class="min-h-0 flex-1">
      <ErrorMessage v-if="error" class="p-5" :message="error" />
      <Island
        v-else
        class="bg-surface-gray-1"
        :name="CHAT_ISLAND"
        embedded
        :path="flowPath(session)"
        :asked="session"
        @navigate="onNavigate"
        @title="onTitle"
        @actions="actions = $event"
        @error="error = $event.message"
      />
    </div>
  </div>
</template>

<script setup>
import Island from '@framework/ui/island/Island.vue'
import IslandActions from '@/components/IslandActions.vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import { chatsStore } from '@/stores/chats'
import { getSettings } from '@/stores/settings'
import { CHAT_ISLAND, chatRoute, flowPath } from '@/utils/chat'
import { Breadcrumbs, ErrorMessage, usePageMeta } from 'frappe-ui'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { brand } = getSettings()
const { recentChats, reportTitle } = chatsStore()

const title = ref(null)
const actions = ref([])
const error = ref('')

const session = computed(() => route.params.session || undefined)

const breadcrumbs = computed(() =>
  [
    { label: __('Chat'), route: { name: 'Chat' } },
    title.value && { label: title.value },
  ].filter(Boolean),
)

function onNavigate(path) {
  // a chat created after the user left must not pull them back
  if (route.name !== 'Chat') return
  const to = chatRoute(path, session.value)
  if (!to) return
  router.replace(to)
  // a chat was started or deleted
  recentChats.reload()
}

function onTitle(value) {
  title.value = value
  reportTitle(session.value, value)
}

usePageMeta(() => ({ title: title.value || __('Chat'), icon: brand.favicon }))
</script>

<style scoped>
/* Mounts once per visit: chats switch inside the page, so only an arrival fades. */
.chat-page {
  animation: chat-page-in 180ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .chat-page {
    animation: none;
  }
}

@keyframes chat-page-in {
  from {
    opacity: 0;
  }
}
</style>
