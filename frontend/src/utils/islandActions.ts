import { spriteIcon } from '@/utils/spriteIcon'

export type IslandAction = { label: string; icon?: string } & (
  | { onClick: () => void; href?: never }
  | { href: string; onClick?: never }
)

// A menu option's `route` is a router destination, so an `href` action, which
// leaves CRM, opens its own tab.
export function menuOptions(actions: IslandAction[]) {
  return actions.map((action) => ({
    label: action.label,
    icon: spriteIcon(action.icon),
    onClick: () =>
      action.href
        ? window.open(action.href, '_blank', 'noopener')
        : action.onClick?.(),
  }))
}
