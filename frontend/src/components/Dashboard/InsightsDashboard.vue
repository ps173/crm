<template>
  <div class="flex flex-col h-full overflow-hidden">
    <LayoutHeader>
      <template #left-header>
        <ViewBreadcrumbs routeName="Dashboard" />
      </template>
      <template #right-header>
        <IslandActions :actions="actions" />
      </template>
    </LayoutHeader>

    <div class="flex-1 min-h-0">
      <ErrorMessage v-if="error" class="p-5" :message="error" />
      <Island
        v-else
        name="insights.dashboard"
        :dashboard="dashboard"
        @actions="actions = $event"
        @error="error = $event.message"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Island from '@framework/ui/island/Island.vue'
import IslandActions from '@/components/IslandActions.vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import ViewBreadcrumbs from '@/components/ViewBreadcrumbs.vue'
import type { IslandAction } from '@/utils/islandActions'
import { ErrorMessage } from 'frappe-ui'
import { ref } from 'vue'

defineProps<{ dashboard: string }>()

const error = ref('')
const actions = ref<IslandAction[]>([])
</script>
