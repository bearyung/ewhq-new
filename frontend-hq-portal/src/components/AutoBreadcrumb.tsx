import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { BreadcrumbWithDropdown } from './BreadcrumbWithDropdown'
import { buildBreadcrumbTrail, getRouteChildren } from '../config/routeConfig'

/**
 * Automatic breadcrumb component that generates breadcrumbs based on current route
 *
 * Usage:
 * Simply include <AutoBreadcrumb /> in any page component and it will automatically
 * show the correct breadcrumb trail based on the current path.
 *
 * The breadcrumb structure is defined in src/config/routeConfig.ts
 *
 * Features:
 * - Automatically generates breadcrumb trail from current path
 * - Shows dropdown menu for sibling pages in the same section
 * - Highlights current page in the dropdown
 * - No props needed - completely automatic
 *
 * Example:
 * ```tsx
 * export function MyPage() {
 *   return (
 *     <Box>
 *       <AutoBreadcrumb />
 *       <Container>
 *         ... your page content ...
 *       </Container>
 *     </Box>
 *   )
 * }
 * ```
 */
export function AutoBreadcrumb() {
  const location = useLocation()

  const breadcrumbItems = useMemo(() => {
    const trail = buildBreadcrumbTrail(location.pathname)

    if (trail.length === 0) {
      return []
    }

    // Build breadcrumb items from trail
    const items = trail.map((route, index) => {
      const isLast = index === trail.length - 1

      // For the last item, check if its parent has siblings to show dropdown
      if (isLast && index > 0) {
        const parent = trail[index - 1]
        const siblings = getRouteChildren(parent.path)

        if (siblings.length > 1) {
          // Show dropdown with all siblings for the last item only
          return {
            label: route.label,
            path: route.path,
            isDropdown: true,
            dropdownItems: siblings.map(sibling => ({
              label: sibling.label,
              path: sibling.path,
            })),
          }
        }
      }

      // Regular breadcrumb item with path (clickable)
      return {
        label: route.label,
        path: route.path,
      }
    })

    return items
  }, [location.pathname])

  if (breadcrumbItems.length === 0) {
    return null
  }

  return <BreadcrumbWithDropdown items={breadcrumbItems} />
}
