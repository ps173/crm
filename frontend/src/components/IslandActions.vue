<template>
  <Button
    v-if="actions.length"
    :label="actions[0].label"
    :iconLeft="spriteIcon(actions[0].icon)"
    :href="actions[0].href"
    @click="actions[0].onClick?.()"
  />
  <Dropdown v-if="actions.length > 1" :options="moreActions" align="end">
    <Button icon="lucide-more-horizontal" />
  </Dropdown>
</template>

<script setup lang="ts">
import { menuOptions, type IslandAction } from '@/utils/islandActions'
import { spriteIcon } from '@/utils/spriteIcon'
import { Button, Dropdown } from 'frappe-ui'
import { computed } from 'vue'

const props = defineProps<{ actions: IslandAction[] }>()

const moreActions = computed(() => menuOptions(props.actions.slice(1)))
</script>
