import { afterEach, describe, expect, it, vi } from 'vitest'
import { menuOptions } from '@/utils/islandActions'

afterEach(() => vi.restoreAllMocks())

describe('menuOptions', () => {
  it('runs an onClick action in the island', () => {
    const onClick = vi.fn()
    const [option] = menuOptions([{ label: 'Share', onClick }])

    option.onClick()

    expect(option.label).toBe('Share')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('opens an href action in its own tab', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const [option] = menuOptions([{ label: 'Open in Insights', href: '/x' }])

    option.onClick()

    expect(open).toHaveBeenCalledWith('/x', '_blank', 'noopener')
  })

  it('draws a lucide icon name from the sprite', () => {
    const [withIcon, withoutIcon] = menuOptions([
      { label: 'Delete', icon: 'lucide-trash-2', onClick: () => {} },
      { label: 'Rename', onClick: () => {} },
    ])

    expect(withIcon.icon).toBeTypeOf('function')
    expect(withoutIcon.icon).toBeUndefined()
  })
})
