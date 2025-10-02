/**
 * Site-wide route configuration for automatic breadcrumb generation
 *
 * Structure:
 * - Each route can have a label and optional children
 * - Children can be nested to any depth
 * - AutoBreadcrumb component uses this config to generate breadcrumbs based on current path
 *
 * To add a new page:
 * 1. Add the route to the appropriate section in this config
 * 2. Use <AutoBreadcrumb /> in your page component
 * 3. That's it! Breadcrumbs automatically work for all related pages
 */

export interface RouteItem {
  path: string
  label: string
  children?: RouteItem[]
}

export const ROUTE_CONFIG: RouteItem[] = [
  {
    path: '/',
    label: 'Dashboard',
  },
  {
    path: '/menus',
    label: 'Menu Management',
    children: [
      {
        path: '/menus/categories',
        label: 'Categories',
      },
      {
        path: '/menus/virtual-categories',
        label: 'Virtual Categories',
      },
      {
        path: '/menus/items',
        label: 'Menu Items',
      },
      {
        path: '/menus/modifiers',
        label: 'Modifiers',
      },
      {
        path: '/menus/promotions',
        label: 'Promotions',
      },
      {
        path: '/menus/discounts',
        label: 'Discounts',
      },
      {
        path: '/operations/menu/button-styles',
        label: 'Button Styles',
      },
    ],
  },
  {
    path: '/organization-management',
    label: 'Organization Management',
  },
  // Add more sections here as your app grows
  // Example:
  // {
  //   path: '/reports',
  //   label: 'Reports',
  //   children: [
  //     { path: '/reports/sales', label: 'Sales Reports' },
  //     { path: '/reports/inventory', label: 'Inventory Reports' },
  //   ],
  // },
]

/**
 * Helper function to find all routes in a section (for dropdown menus)
 */
export function getRouteChildren(parentPath: string): RouteItem[] {
  const findParent = (routes: RouteItem[]): RouteItem | undefined => {
    for (const route of routes) {
      if (route.path === parentPath) return route
      if (route.children) {
        const found = findParent(route.children)
        if (found) return found
      }
    }
    return undefined
  }

  const parent = findParent(ROUTE_CONFIG)
  return parent?.children || []
}

/**
 * Helper function to build breadcrumb trail from current path
 */
export function buildBreadcrumbTrail(currentPath: string): RouteItem[] {
  const trail: RouteItem[] = []

  const findPath = (routes: RouteItem[], path: string): boolean => {
    for (const route of routes) {
      if (route.path === path || path.startsWith(route.path + '/')) {
        trail.push(route)

        if (route.path === path) {
          return true
        }

        if (route.children && findPath(route.children, path)) {
          return true
        }

        // If we have children but path doesn't match any child exactly,
        // check if current path starts with any child path
        if (route.children) {
          const matchingChild = route.children.find(child =>
            path === child.path || path.startsWith(child.path + '/')
          )
          if (matchingChild && matchingChild.path !== route.path) {
            trail.push(matchingChild)
            return true
          }
        }

        trail.pop()
      }
    }
    return false
  }

  findPath(ROUTE_CONFIG, currentPath)
  return trail
}
