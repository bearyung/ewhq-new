# Menu Items Page UX Plan

## Goals
- Help ops users navigate hundreds of items by category without losing context.
- Provide enough form real estate for ItemMaster details without modal fatigue.
- Reuse brand-scoped data (categories, button styles, tax settings) from existing APIs.

## Layout Overview
1. **Category Rail (left panel, ~280px fixed width)**
   - Search box + `All items` quick filter.
   - Tree list grouped by parent category with badge counts for items.
   - Hover tooltip shows category code and last modified timestamp.
   - Selection persists while navigating items/creating new ones.

2. **Item Workspace (center panel, fluid width)**
   - Toolbar with search, sort (Display index ⇄ Name), filter toggles (Enabled, Hidden, Promo).
   - `Add item` button aligned right; uses selected category as default.
   - Results grid: compact table by default, switchable to card view for image-heavy collections.
   - Inline indicators: price shown if available, tags for `Promo`, `Manual Price`, `Modifier`.
   - Keyboard navigation (↑/↓) jumps between rows; Enter opens editor in detail drawer.

3. **Detail Drawer (right panel, 520–640px)**
   - Persistent side sheet instead of modal to keep category/list visible.
   - Tabbed sections: `Basics`, `Display`, `Availability`, `Advanced`.
   - Each tab subdivides fields into digestible groups with helper copy.
   - Sticky footer with `Save`, `Save & duplicate`, `Cancel` actions; warn on unsaved exit.
   - Preview card updates live (item name, image, badges).

## Form Strategy
- Prefill defaults from selected category (CategoryId, ButtonStyle). Allow override.
- Collapse less-used booleans into accordions (e.g., Promo/Points settings) to prevent overwhelm.
- Inputs use two-column grid on desktop; stack on small screens.
- Provide contextual validation messaging (e.g., duplicate item code warning).
- Autosave draft hook prepared but disabled until API ready.

## Navigation & State
- React Router route `/menu/items` loads brand-scoped query params: `category`, `status`, `view`.
- State synced to URL for shareable deep links.
- TanStack Query caches category + item pages; invalidates on save/delete.

## Accessibility & Performance
- Drawer focus trapping and `aria-labelledby` from section headers.
- Virtualized list (TanStack Virtual) when item count > 200 for smooth scroll.
- Skeleton loaders for initial fetch to avoid layout jank.

## Future Enhancements
- Bulk edit mode (select multiple rows → update flags).
- Inline image upload pipeline (ties into media service once ready).
- Link to price editor once ItemPrice API exposed.
- Surface per-shop pricing + availability toggles directly in drawer (in progress, powered by new POS endpoints).
