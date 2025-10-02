import { BreadcrumbWithDropdown } from './BreadcrumbWithDropdown'

// Centralized menu items configuration
// Add new menu pages here to automatically update all breadcrumbs
export const MENU_BREADCRUMB_ITEMS = [
  { label: 'Categories', path: '/menus/categories' },
  { label: 'Virtual Categories', path: '/menus/virtual-categories' },
  { label: 'Menu Items', path: '/menus/items' },
  { label: 'Modifiers', path: '/menus/modifiers' },
  { label: 'Promotions', path: '/menus/promotions' },
  { label: 'Discounts', path: '/menus/discounts' },
  { label: 'Button Styles', path: '/operations/menu/button-styles' },
]

/**
 * Reusable breadcrumb component for all menu-related pages
 * Automatically includes Dashboard -> Menu Management -> [Current Page with dropdown]
 */
export function MenuBreadcrumb() {
  return (
    <BreadcrumbWithDropdown
      items={[
        { label: 'Dashboard', path: '/' },
        { label: 'Menu Management', path: '/menus' },
        {
          label: 'Menu Pages',
          isDropdown: true,
          dropdownItems: MENU_BREADCRUMB_ITEMS,
        },
      ]}
    />
  )
}
