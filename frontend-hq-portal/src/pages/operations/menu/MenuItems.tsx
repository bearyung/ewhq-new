import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  Group,
  Paper,
  Popover,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconAdjustments,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconColumns,
  IconPencil,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconSortAscending,
  IconSortDescending,
  IconEye,
  IconEyeOff,
  IconList,
  IconX,
} from '@tabler/icons-react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import type { ColumnDef, ColumnSizingState, VisibilityState } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AutoBreadcrumb } from '../../../components/AutoBreadcrumb';
import { useBrands } from '../../../contexts/BrandContext';
import menuItemService from '../../../services/menuItemService';
import type {
  MenuItemListResponse,
  MenuItemSummary,
  MenuItemLookups,
  MenuItemUpsertPayload,
  MenuItemDetail,
  CategoryItemCount,
} from '../../../types/menuItem';
import { CenterLoader } from './menu-items/CenterLoader';
import { MenuItemDrawer } from './menu-items/MenuItemDrawer';
import { MenuItemsCategorySidebar } from './menu-items/MenuItemsCategorySidebar';
import { VirtualTableRow } from './menu-items/VirtualTableRow';
import { ManageItemRelationshipsModal } from './menu-items/ManageItemRelationshipsModal';
import {
  PAGE_SIZE,
  PANEL_BORDER_COLOR,
  buildCategoryTree,
  createBasePayload,
  formatDateTime,
  normalizePayload,
  type CategoryNode,
} from './menu-items/menuItemsUtils';

const mapDetailToPayload = (detail: MenuItemDetail): MenuItemUpsertPayload => ({
  itemCode: detail.itemCode,
  itemName: detail.itemName ?? '',
  itemNameAlt: detail.itemNameAlt ?? '',
  itemNameAlt2: detail.itemNameAlt2 ?? '',
  itemNameAlt3: detail.itemNameAlt3 ?? '',
  itemNameAlt4: detail.itemNameAlt4 ?? '',
  itemPosName: detail.itemPosName ?? '',
  itemPosNameAlt: detail.itemPosNameAlt ?? '',
  itemPublicDisplayName: detail.itemPublicDisplayName ?? '',
  itemPublicDisplayNameAlt: detail.itemPublicDisplayNameAlt ?? '',
  itemPublicPrintedName: detail.itemPublicPrintedName ?? '',
  itemPublicPrintedNameAlt: detail.itemPublicPrintedNameAlt ?? '',
  remark: detail.remark ?? '',
  remarkAlt: detail.remarkAlt ?? '',
  imageFileName: detail.imageFileName ?? '',
  imageFileName2: detail.imageFileName2 ?? '',
  tableOrderingImageFileName: detail.tableOrderingImageFileName ?? '',
  categoryId: detail.categoryId,
  departmentId: detail.departmentId,
  subDepartmentId: detail.subDepartmentId ?? null,
  displayIndex: detail.displayIndex,
  enabled: detail.enabled,
  isItemShow: detail.isItemShow,
  isPriceShow: detail.isPriceShow,
  hasModifier: detail.hasModifier,
  autoRedirectToModifier: detail.autoRedirectToModifier,
  isModifier: detail.isModifier,
  modifierGroupHeaderId: detail.modifierGroupHeaderId ?? null,
  buttonStyleId: detail.buttonStyleId ?? null,
  isManualPrice: detail.isManualPrice,
  isManualName: detail.isManualName,
  isPromoItem: detail.isPromoItem,
  isModifierConcatToParent: detail.isModifierConcatToParent,
  isFollowSet: detail.isFollowSet,
  isFollowSetDynamic: detail.isFollowSetDynamic,
  isFollowSetStandard: detail.isFollowSetStandard,
  isNonDiscountItem: detail.isNonDiscountItem,
  isNonServiceChargeItem: detail.isNonServiceChargeItem,
  isStandaloneAndSetItem: detail.isStandaloneAndSetItem ?? null,
  isGroupRightItem: detail.isGroupRightItem,
  isPrintLabel: detail.isPrintLabel,
  isPrintLabelTakeaway: detail.isPrintLabelTakeaway,
  isPriceInPercentage: detail.isPriceInPercentage,
  isPointPaidItem: detail.isPointPaidItem ?? null,
  isNoPointEarnItem: detail.isNoPointEarnItem ?? null,
  isNonTaxableItem: detail.isNonTaxableItem ?? null,
  isItemShowInKitchenChecklist: detail.isItemShowInKitchenChecklist ?? null,
  isSoldoutAutoLock: detail.isSoldoutAutoLock ?? null,
  isPrepaidRechargeItem: detail.isPrepaidRechargeItem ?? null,
  isAutoLinkWithRawMaterial: detail.isAutoLinkWithRawMaterial ?? null,
  isDinein: detail.isDinein,
  isTakeaway: detail.isTakeaway,
  isDelivery: detail.isDelivery,
  isKitchenPrintInRedColor: detail.isKitchenPrintInRedColor ?? null,
  isManualPriceGroup: detail.isManualPriceGroup ?? null,
  isExcludeLabelCount: detail.isExcludeLabelCount ?? null,
  servingSize: detail.servingSize ?? null,
  systemRemark: detail.systemRemark ?? '',
  isNonSalesItem: detail.isNonSalesItem ?? null,
  productionSeconds: detail.productionSeconds ?? null,
  parentItemId: detail.parentItemId ?? null,
  isComboRequired: detail.isComboRequired ?? null,
});


const MenuItemsPage: FC = () => {
  const { selectedBrand } = useBrands();
  const brandId = selectedBrand ? parseInt(selectedBrand, 10) : null;
  const isDesktopLayout = useMediaQuery('(min-width: 62em)');

  const [lookups, setLookups] = useState<MenuItemLookups | null>(null);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [filtersReady, setFiltersReady] = useState(false);
  const [itemsResponse, setItemsResponse] = useState<MenuItemListResponse | null>(null);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showActionShadow, setShowActionShadow] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 800);
  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [sortBy, setSortBy] = useState<'displayIndex' | 'name' | 'modified'>('displayIndex');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [searchPopoverOpened, setSearchPopoverOpened] = useState(false);
  const isSearchActive = searchPopoverOpened || Boolean(search);
  const [sortPopoverOpened, setSortPopoverOpened] = useState(false);
  const [columnMenuOpened, setColumnMenuOpened] = useState(false);
  const [columnSearch, setColumnSearch] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [hoveredResizeColumnId, setHoveredResizeColumnId] = useState<string | null>(null);
  const [modifierModalItem, setModifierModalItem] = useState<MenuItemSummary | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<MenuItemDetail | null>(null);
  const [priceEdits, setPriceEdits] = useState<Record<number, { price: number | null; enabled: boolean }>>({});
  const [availabilityEdits, setAvailabilityEdits] = useState<Record<number, { enabled: boolean | null; isOutOfStock: boolean | null; isLimitedItem: boolean | null }>>({});
  const [formData, setFormData] = useState<MenuItemUpsertPayload | null>(null);
  const [activeTab, setActiveTab] = useState<string>('basics');
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [priceSavingShopId, setPriceSavingShopId] = useState<number | null>(null);
  const [availabilitySavingShopId, setAvailabilitySavingShopId] = useState<number | null>(null);

  // Table virtualization setup
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resizeCursorRestoreRef = useRef<string | null>(null);

  const totalItems = itemsResponse?.totalItems ?? 0;
  const totalPages = useMemo(() => {
    if (!itemsResponse) {
      return 1;
    }

    const expectedPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const backendPages = Math.max(1, itemsResponse.totalPages);

    return Math.min(backendPages, expectedPages);
  }, [itemsResponse, totalItems]);

  const goToPreviousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const handlePageSelect = useCallback(
    (value: string | null) => {
      if (!value) return;
      const nextPage = Number(value);
      if (Number.isNaN(nextPage)) return;
      setPage(nextPage);
    },
    [setPage],
  );

  const handleRetry = useCallback(() => {
    if (itemsLoading) return;
    setReloadToken((token) => token + 1);
  }, [itemsLoading]);

  const handleOpenModifiers = useCallback((item: MenuItemSummary) => {
    setModifierModalItem(item);
  }, []);

  const handleCloseModifiers = useCallback(() => {
    setModifierModalItem(null);
  }, []);

  const handleModifiersSaved = useCallback(
    (itemId: number, hasModifier: boolean) => {
      setItemsResponse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((entry) => (entry.itemId === itemId ? { ...entry, hasModifier } : entry)),
        };
      });

      setSelectedDetail((prev) => (prev && prev.itemId === itemId ? { ...prev, hasModifier } : prev));
      setFormData((prev) => (prev && editingItemId === itemId ? { ...prev, hasModifier } : prev));
      setReloadToken((token) => token + 1);
    },
    [editingItemId, setItemsResponse, setSelectedDetail, setFormData, setReloadToken],
  );

  useEffect(() => {
    if (searchPopoverOpened) {
      window.requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [searchPopoverOpened]);

  useEffect(() => {
    if (!columnMenuOpened) {
      setColumnSearch('');
    }
  }, [columnMenuOpened]);


  useEffect(() => {
    setPage((prev) => {
      if (prev > totalPages) {
        return totalPages;
      }
      return prev;
    });
  }, [totalPages]);

  const setBodyResizeCursor = useCallback((active: boolean) => {
    const bodyStyle = document.body.style;
    if (active) {
      if (resizeCursorRestoreRef.current === null) {
        resizeCursorRestoreRef.current = bodyStyle.cursor || '';
      }
      bodyStyle.cursor = 'col-resize';
    } else {
      if (resizeCursorRestoreRef.current !== null) {
        bodyStyle.cursor = resizeCursorRestoreRef.current;
        resizeCursorRestoreRef.current = null;
      } else {
        bodyStyle.cursor = '';
      }
    }
  }, []);

  useEffect(() => () => {
    setBodyResizeCursor(false);
    setHoveredResizeColumnId(null);
  }, [setBodyResizeCursor]);

  const getCategoryLabel = useCallback((categoryId?: number | null) => {
    if (categoryId === null || categoryId === undefined || !lookups) return '—';
    const match = lookups.categories.find((cat) => cat.categoryId === categoryId);
    return match ? match.categoryName : '—';
  }, [lookups]);

  const getDepartmentName = useCallback((departmentId?: number) => {
    if (departmentId === null || departmentId === undefined || !lookups) return '—';
    return lookups.departments.find((dep) => dep.departmentId === departmentId)?.departmentName ?? '—';
  }, [lookups]);

  const resetDrawerState = useCallback(() => {
    setDrawerOpen(false);
    setFormData(null);
    setEditingItemId(null);
    setSelectedDetail(null);
    setPriceEdits({});
    setAvailabilityEdits({});
    setDetailLoading(false);
    setActiveTab('basics');
  }, []);

  const handleDrawerClose = useCallback(() => {
    if (saving) return;
    resetDrawerState();
  }, [resetDrawerState, saving]);

  const handleCreate = useCallback(() => {
    if (!lookups || lookups.categories.length === 0 || lookups.departments.length === 0) {
      notifications.show({
        title: 'Missing data',
        message: 'Please configure categories and departments before creating items.',
        color: 'orange',
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    const defaultCategoryId = selectedCategoryId ?? lookups.categories[0].categoryId;
    const defaultDepartmentId = lookups.departments[0].departmentId;

    setFormData(createBasePayload(defaultCategoryId, defaultDepartmentId));
    setDrawerMode('create');
    setEditingItemId(null);
    setSelectedDetail(null);
    setPriceEdits({});
    setAvailabilityEdits({});
    setActiveTab('basics');
    setDrawerOpen(true);
  }, [lookups, selectedCategoryId]);

  const handleEdit = useCallback(async (item: MenuItemSummary) => {
    if (!brandId) return;
    setDrawerMode('edit');
    setDrawerOpen(true);
    setActiveTab('basics');
    setFormData(null);
    setEditingItemId(item.itemId);
    setSelectedDetail(null);
    setPriceEdits({});
    setAvailabilityEdits({});
    setDetailLoading(true);
    try {
      const detail = await menuItemService.getMenuItem(brandId, item.itemId);
      setSelectedDetail(detail);
      setFormData(mapDetailToPayload(detail));
    } catch (error) {
      console.error('Failed to load item detail', error);
      notifications.show({
        title: 'Error',
        message: 'Unable to load item details',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
      resetDrawerState();
    } finally {
      setDetailLoading(false);
    }
  }, [brandId, resetDrawerState]);

  const columns = useMemo<ColumnDef<MenuItemSummary>[]>(() => [
    {
      accessorKey: 'itemCode',
      header: 'Code',
      size: 100,
      enableHiding: false,
      cell: ({ row }) => (
        <Text size="sm" fw={500} truncate="end">{row.original.itemCode}</Text>
      ),
    },
    {
      accessorKey: 'itemName',
      header: 'Item Name',
      size: 180,
      enableHiding: false,
      cell: ({ row }) => (
        <Text size="sm" truncate="end">{row.original.itemName || '—'}</Text>
      ),
    },
    {
      accessorKey: 'categoryId',
      header: 'Category',
      size: 140,
      cell: ({ row }) => (
        <Text size="sm" truncate="end">{getCategoryLabel(row.original.categoryId)}</Text>
      ),
    },
    {
      accessorKey: 'departmentId',
      header: 'Department',
      size: 110,
      cell: ({ row }) => (
        <Text size="sm" truncate="end">{getDepartmentName(row.original.departmentId)}</Text>
      ),
    },
    {
      accessorKey: 'enabled',
      header: 'Enabled',
      size: 80,
      cell: ({ row }) => (
        <Badge variant="light" color={row.original.enabled ? 'green' : 'gray'} size="sm">
          {row.original.enabled ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      accessorKey: 'isItemShow',
      header: 'Visible',
      size: 80,
      cell: ({ row }) => (
        <Badge variant="light" color={row.original.isItemShow ? 'blue' : 'gray'} size="sm">
          {row.original.isItemShow ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      accessorKey: 'hasModifier',
      header: 'Modifiers',
      size: 85,
      cell: ({ row }) => row.original.hasModifier ? (
        <Badge variant="light" color="violet" size="sm">Yes</Badge>
      ) : (
        <Text size="sm" c="dimmed">—</Text>
      ),
    },
    {
      accessorKey: 'isPromoItem',
      header: 'Promo',
      size: 70,
      cell: ({ row }) => row.original.isPromoItem ? (
        <Badge variant="light" color="orange" size="sm">Yes</Badge>
      ) : (
        <Text size="sm" c="dimmed">—</Text>
      ),
    },
    {
      accessorKey: 'isManualPrice',
      header: 'Manual',
      size: 75,
      cell: ({ row }) => row.original.isManualPrice ? (
        <Badge variant="light" color="red" size="sm">Yes</Badge>
      ) : (
        <Text size="sm" c="dimmed">—</Text>
      ),
    },
    {
      accessorKey: 'modifiedDate',
      header: 'Last updated',
      size: 140,
      cell: ({ row }) => (
        <Text size="sm" truncate="end">{formatDateTime(row.original.modifiedDate)}</Text>
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 100,
      enableHiding: false,
      enableResizing: false,
      cell: ({ row }) => (
        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <Tooltip label="Manage modifiers" withArrow>
            <ActionIcon
              variant="subtle"
              color={row.original.hasModifier ? 'violet' : 'gray'}
              size="sm"
              onClick={() => handleOpenModifiers(row.original)}
            >
              <IconAdjustments size={16} />
            </ActionIcon>
          </Tooltip>
          <ActionIcon variant="subtle" color="indigo" size="sm" onClick={() => handleEdit(row.original)}>
            <IconPencil size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ], [getCategoryLabel, getDepartmentName, handleEdit, handleOpenModifiers]);

  const table = useReactTable({
    data: itemsResponse?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    columnResizeMode: 'onChange',
    state: {
      columnVisibility,
      columnSizing,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
  });

  const pageOptions = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, index) => ({
        value: String(index + 1),
        label: `Page ${index + 1}`,
      })),
    [totalPages],
  );

  const toggleableColumns = useMemo(
    () => table.getAllLeafColumns().filter((column) => column.getCanHide()),
    [table],
  );

  const filteredToggleColumns = useMemo(() => {
    const searchTerm = columnSearch.trim().toLowerCase();
    if (!searchTerm) {
      return toggleableColumns;
    }

    return toggleableColumns.filter((column) => {
      const header = column.columnDef.header;
      const label = typeof header === 'string' ? header : column.id;
      return label.toLowerCase().includes(searchTerm);
    });
  }, [toggleableColumns, columnSearch]);

  const allToggleColumnsSelected = toggleableColumns.length > 0
    && toggleableColumns.every((column) => column.getIsVisible());
  const anyToggleColumnsSelected = toggleableColumns.some((column) => column.getIsVisible());

  const handleToggleAllColumns = useCallback(
    (visible: boolean) => {
      toggleableColumns.forEach((column) => column.toggleVisibility(visible));
    },
    [toggleableColumns],
  );

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  // Calculate total width from all columns for fixed layout
  const totalTableWidth = table.getVisibleLeafColumns().reduce((sum, col) => sum + col.getSize(), 0);

  const updateActionShadow = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container) {
      setShowActionShadow(false);
      return;
    }

    const { scrollWidth, clientWidth, scrollLeft } = container;
    const hasHorizontalScroll = scrollWidth - clientWidth > 1;
    if (!hasHorizontalScroll) {
      setShowActionShadow(false);
      return;
    }

    const isAtRightEdge = scrollLeft + clientWidth >= scrollWidth - 1;
    setShowActionShadow(!isAtRightEdge);
  }, []);

  useEffect(() => {
    if (!brandId) {
      setLookups(null);
      setFiltersReady(false);
      return;
    }

    let active = true;

    const loadLookups = async () => {
      setLookupsLoading(true);
      try {
        const data = await menuItemService.getLookups(brandId);
        if (!active) return;
        setLookups(data);
        const defaultCategoryId = (() => {
          const roots = buildCategoryTree(data.categories);
          if (roots.length > 0) {
            return roots[0].categoryId;
          }
          return data.categories[0]?.categoryId ?? null;
        })();

        setSelectedCategoryId((current) => {
          if (current && data.categories.some((cat) => cat.categoryId === current)) {
            return current;
          }
          return defaultCategoryId;
        });
        setPage(1);
        setFiltersReady(true);
      } catch (error) {
        if (!active) return;
        console.error('Failed to load menu item lookups', error);
        notifications.show({
          title: 'Error',
          message: 'Unable to load supporting data for menu items',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
        setFiltersReady(true);
      } finally {
        if (active) {
          setLookupsLoading(false);
        }
      }
    };

    loadLookups();

    return () => {
      active = false;
      setFiltersReady(false);
    };
  }, [brandId]);

  useEffect(() => {
    if (!selectedDetail) {
      setPriceEdits({});
      setAvailabilityEdits({});
      return;
    }

    const initialPrices = Object.fromEntries(
      (selectedDetail.prices ?? []).map((price) => [
        price.shopId,
        {
          price: price.price ?? null,
          enabled: price.enabled,
        },
      ]),
    );

    const initialAvailability = Object.fromEntries(
      (selectedDetail.shopAvailability ?? []).map((record) => [
        record.shopId,
        {
          enabled: record.enabled ?? false,
          isOutOfStock: record.isOutOfStock ?? false,
          isLimitedItem: record.isLimitedItem ?? false,
        },
      ]),
    );

    setPriceEdits(initialPrices);
    setAvailabilityEdits(initialAvailability);
  }, [selectedDetail]);

  useEffect(() => {
    if (!brandId || !filtersReady) return;

    const loadItems = async () => {
      setItemsLoading(true);
      setFetchError(null);
      try {
        const response = await menuItemService.getMenuItems(brandId, {
          categoryId: selectedCategoryId ?? undefined,
          search: debouncedSearch || undefined,
          includeDisabled,
          sortBy,
          sortDirection,
          page,
          pageSize: PAGE_SIZE,
        });
        setItemsResponse(response);
      } catch (error) {
        console.error('Failed to load menu items', error);
        setFetchError('Unable to fetch menu items. Please try again.');
      } finally {
        setItemsLoading(false);
      }
    };

    loadItems();
  }, [brandId, filtersReady, selectedCategoryId, debouncedSearch, includeDisabled, sortBy, sortDirection, page, reloadToken]);

  const categoryTree = useMemo(() => buildCategoryTree(lookups?.categories ?? []), [lookups?.categories]);

  const parentMap = useMemo(() => {
    const map = new Map<number, number | null>();
    (lookups?.categories ?? []).forEach((category) => {
      map.set(category.categoryId, category.parentCategoryId ?? null);
    });
    return map;
  }, [lookups?.categories]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categoryTree;

    const term = categorySearch.trim().toLowerCase();

    const filterRecursive = (nodes: CategoryNode[]): CategoryNode[] =>
      nodes
        .map((node) => ({
          ...node,
          children: filterRecursive(node.children),
        }))
        .filter((node) =>
          node.categoryName.toLowerCase().includes(term) || node.children.length > 0,
        );

    return filterRecursive(categoryTree);
  }, [categoryTree, categorySearch]);

  useEffect(() => {
    if (!categoryTree.length) {
      setExpandedCategories(new Set());
      return;
    }

    // Ensure top-level categories are expanded by default for quick scanning
    setExpandedCategories((prev) => {
      if (prev.size > 0) {
        return prev;
      }
      return new Set(categoryTree.map((node) => node.categoryId));
    });
  }, [categoryTree]);

  useEffect(() => {
    if (selectedCategoryId == null) {
      return;
    }

    const path = new Set<number>();
    let current = parentMap.get(selectedCategoryId) ?? null;
    while (current !== null && current !== undefined) {
      path.add(current);
      current = parentMap.get(current) ?? null;
    }

    if (path.size === 0) {
      return;
    }

    setExpandedCategories((prev) => {
      const merged = new Set(prev);
      path.forEach((id) => merged.add(id));
      return merged;
    });
  }, [selectedCategoryId, parentMap]);

  const categoryCounts = useMemo(() => {
    const map = new Map<number, number>();
    itemsResponse?.categoryCounts.forEach((entry: CategoryItemCount) => {
      map.set(entry.categoryId, entry.itemCount);
    });
    return map;
  }, [itemsResponse?.categoryCounts]);

  const totalCategoryItems = useMemo(
    () => (itemsResponse?.categoryCounts ?? []).reduce((acc, entry) => acc + entry.itemCount, 0),
    [itemsResponse?.categoryCounts],
  );

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => updateActionShadow();

    container.addEventListener('scroll', handleScroll);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateActionShadow());
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', handleScroll);
    }

    updateActionShadow();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleScroll);
      }
    };
  }, [updateActionShadow]);

  useEffect(() => {
    updateActionShadow();
  }, [updateActionShadow, rows.length, totalTableWidth, isDesktopLayout]);

  const updatePriceEdit = (shopId: number, changes: Partial<{ price: number | null; enabled: boolean }>) => {
    setPriceEdits((prev) => {
      const previous = prev[shopId] ?? { price: null, enabled: false };
      return {
        ...prev,
        [shopId]: {
          price: Object.prototype.hasOwnProperty.call(changes, 'price') ? changes.price ?? null : previous.price,
          enabled: changes.enabled ?? previous.enabled,
        },
      };
    });
  };

  const updateAvailabilityEdit = (
    shopId: number,
    changes: Partial<{ enabled: boolean | null; isOutOfStock: boolean | null; isLimitedItem: boolean | null }>,
  ) => {
    setAvailabilityEdits((prev) => {
      const previous = prev[shopId] ?? { enabled: false, isOutOfStock: false, isLimitedItem: false };
      return {
        ...prev,
        [shopId]: {
          enabled: Object.prototype.hasOwnProperty.call(changes, 'enabled') ? changes.enabled ?? false : previous.enabled,
          isOutOfStock: Object.prototype.hasOwnProperty.call(changes, 'isOutOfStock')
            ? changes.isOutOfStock ?? false
            : previous.isOutOfStock,
          isLimitedItem: Object.prototype.hasOwnProperty.call(changes, 'isLimitedItem')
            ? changes.isLimitedItem ?? false
            : previous.isLimitedItem,
        },
      };
    });
  };

  const handleSavePrice = async (shopId: number) => {
    if (!brandId || !selectedDetail) return;
    const edit = priceEdits[shopId];
    if (!edit || edit.price === null || Number.isNaN(edit.price)) {
      notifications.show({
        title: 'Validation error',
        message: 'Please provide a valid price before saving.',
        color: 'orange',
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    setPriceSavingShopId(shopId);
    try {
      const updated = await menuItemService.updateMenuItemPrice(brandId, selectedDetail.itemId, shopId, {
        price: edit.price,
        enabled: edit.enabled,
      });

      setSelectedDetail((prev) =>
        prev
          ? {
              ...prev,
              prices: prev.prices.map((price) => (price.shopId === shopId ? updated : price)),
            }
          : prev,
      );

      notifications.show({
        title: 'Pricing updated',
        message: `Price saved for ${updated.shopName}.`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Failed to update price', error);
      notifications.show({
        title: 'Save failed',
        message: 'Unable to update price. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setPriceSavingShopId(null);
    }
  };

  const handleSaveAvailability = async (shopId: number) => {
    if (!brandId || !selectedDetail) return;
    const edit = availabilityEdits[shopId];
    if (!edit) return;

    setAvailabilitySavingShopId(shopId);
    try {
      const updated = await menuItemService.updateMenuItemAvailability(brandId, selectedDetail.itemId, shopId, {
        enabled: edit.enabled,
        isOutOfStock: edit.isOutOfStock,
        isLimitedItem: edit.isLimitedItem,
      });

      setSelectedDetail((prev) =>
        prev
          ? {
              ...prev,
              shopAvailability: prev.shopAvailability.map((record) =>
                record.shopId === shopId ? updated : record,
              ),
            }
          : prev,
      );

      notifications.show({
        title: 'Availability updated',
        message: `Availability saved for ${updated.shopName}.`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error('Failed to update availability', error);
      notifications.show({
        title: 'Save failed',
        message: 'Unable to update availability. Please try again.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setAvailabilitySavingShopId(null);
    }
  };

  const updateForm = <K extends keyof MenuItemUpsertPayload>(key: K, value: MenuItemUpsertPayload[K]) => {
    setFormData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async () => {
    if (!formData || !brandId) return;

    if (!formData.itemCode.trim()) {
      notifications.show({
        title: 'Validation error',
        message: 'Item code is required.',
        color: 'orange',
        icon: <IconAlertCircle size={16} />,
      });
      setActiveTab('basics');
      return;
    }

    setSaving(true);
    try {
      const payload = normalizePayload(formData);
      if (drawerMode === 'create') {
        await menuItemService.createMenuItem(brandId, payload);
        notifications.show({
          title: 'Item created',
          message: 'The menu item has been created successfully.',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
        setPage(1);
      } else if (drawerMode === 'edit' && editingItemId) {
        await menuItemService.updateMenuItem(brandId, editingItemId, payload);
        notifications.show({
          title: 'Item updated',
          message: 'Changes have been saved.',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }

      resetDrawerState();
      // Refresh list
      const response = await menuItemService.getMenuItems(brandId, {
        categoryId: selectedCategoryId ?? undefined,
        search: debouncedSearch || undefined,
        includeDisabled,
        sortBy,
        sortDirection,
        page,
        pageSize: PAGE_SIZE,
      });
      setItemsResponse(response);
    } catch (error) {
      console.error('Failed to save menu item', error);
      notifications.show({
        title: 'Save failed',
        message: 'Unable to save changes. Please check the form and try again.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  const renderCategoryNodes = (nodes: CategoryNode[], depth = 0): React.ReactNode =>
    nodes.map((node) => {
      const isSelected = node.categoryId === selectedCategoryId;
      const count = categoryCounts.get(node.categoryId) ?? 0;
      const hasChildren = node.children.length > 0;
      const forceExpanded = Boolean(categorySearch.trim());
      const isExpanded = forceExpanded || expandedCategories.has(node.categoryId);
      const displayChildren = hasChildren && isExpanded;

      const labelColor = isSelected ? 'var(--mantine-color-indigo-7)' : 'var(--mantine-color-gray-7)';
      const backgroundColor = isSelected ? 'var(--mantine-color-indigo-0)' : 'transparent';

      return (
        <Stack key={node.categoryId} gap={4}>
          <UnstyledButton
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              backgroundColor,
              transition: 'background-color 120ms ease',
              width: '100%',
            }}
            onClick={() => handleCategorySelect(node.categoryId)}
          >
            <Flex align="center" justify="space-between" pl={depth * 16} gap="sm">
              <Group gap={6} align="center">
                {hasChildren ? (
                  <Box
                    w={28}
                    h={28}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      borderRadius: 4,
                      transition: 'background-color 150ms ease',
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleCategoryExpansion(node.categoryId);
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)';
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {isExpanded ? <IconChevronRight size={16} style={{ transform: 'rotate(90deg)' }} /> : <IconChevronRight size={16} />}
                  </Box>
                ) : (
                  <Box w={28} />
                )}
                <Text size="sm" fw={isSelected ? 600 : 500} c={labelColor} style={{ maxWidth: 160 }} truncate>
                  {node.categoryName || '(Untitled category)'}
                </Text>
              </Group>
              <Badge size="sm" variant={isSelected ? 'filled' : 'outline'} color={isSelected ? 'indigo' : 'gray'}>
                {count}
              </Badge>
            </Flex>
          </UnstyledButton>
          {displayChildren && <Stack gap={4}>{renderCategoryNodes(node.children, depth + 1)}</Stack>}
        </Stack>
      );
    });

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          flexShrink: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #E3E8EE',
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container
          size="xl"
          px="xl"
          style={{
            marginInline: 0,
            flex: 1,
          }}
        >
          <AutoBreadcrumb />
        </Container>
      </Box>

      <Box
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
            {!brandId && (
              <Paper withBorder p="lg" mb="xl">
                <Group gap="sm">
                  <IconAlertCircle size={20} color="var(--mantine-color-red-6)" />
                  <Stack gap={4}>
                  <Text fw={600}>Select a brand to manage menu items</Text>
                  <Text size="sm" c="dimmed">
                    Choose a brand from the header selector to load menu data.
                  </Text>
                </Stack>
              </Group>
            </Paper>
            )}

            <Flex
              direction={isDesktopLayout ? 'row' : 'column'}
              gap={0}
              style={{
                ...(isDesktopLayout
                  ? {
                      flex: 1,
                      minHeight: 0,
                      overflow: 'hidden',
                    }
                  : {}),
                paddingInline: isDesktopLayout ? 0 : 'var(--mantine-spacing-md)',
              }}
            >
              <Box
                style={{
                  ...(isDesktopLayout
                    ? {
                        width: 320,
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                      }
                    : { paddingBottom: 'var(--mantine-spacing-lg)' }),
                }}
              >
                <Paper
                  shadow="none"
                  p="md"
                  style={{
                    borderRight: isDesktopLayout ? `1px solid ${PANEL_BORDER_COLOR}` : 'none',
                    ...(isDesktopLayout
                      ? {
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          minHeight: 0,
                        }
                      : {}),
                  }}
                >
                  <MenuItemsCategorySidebar
                    isDesktopLayout={isDesktopLayout}
                    categorySearch={categorySearch}
                    onCategorySearchChange={(value) => setCategorySearch(value)}
                    selectedCategoryId={selectedCategoryId}
                    totalCategoryItems={totalCategoryItems}
                    lookupsLoading={lookupsLoading}
                    filteredCategories={filteredCategories}
                    renderCategoryNodes={renderCategoryNodes}
                    onAllItems={() => {
                      setSelectedCategoryId(null);
                      setPage(1);
                    }}
                  />
                </Paper>
              </Box>

              <Box
                style={{
                  ...(isDesktopLayout
                    ? {
                        flex: 1,
                        minWidth: 0,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                      }
                    : {}),
                }}
              >
              <Stack
                gap={0}
                style={
                  isDesktopLayout
                    ? { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }
                    : { gap: 'var(--mantine-spacing-md)' }
                }
              >
                <Paper
                  shadow="none"
                  p="md"
                  style={{
                    flexShrink: 0,
                    borderBottom: `1px solid ${PANEL_BORDER_COLOR}`,
                  }}
                >
                  <Group justify="space-between" align="center" gap="md" wrap="wrap">
                    <Group gap="xs" wrap="wrap">
                      <Popover
                        opened={searchPopoverOpened}
                        onChange={setSearchPopoverOpened}
                        withinPortal={false}
                        position="bottom-start"
                        shadow="md"
                        trapFocus={false}
                      >
                        <Popover.Target>
                          <Tooltip label="Search" withArrow>
                            <ActionIcon
                              variant={isSearchActive ? 'filled' : 'light'}
                              color={isSearchActive ? 'indigo' : 'gray'}
                              size="lg"
                              aria-label="Search menu items"
                              onClick={() => setSearchPopoverOpened((prev) => !prev)}
                            >
                              <IconSearch size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Popover.Target>
                        <Popover.Dropdown>
                          <TextInput
                            ref={searchInputRef}
                            placeholder="Search by name or code"
                            value={search}
                            onChange={(event) => {
                              setSearch(event.currentTarget.value);
                              setPage(1);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Escape') {
                                setSearchPopoverOpened(false);
                              }
                            }}
                            rightSection={
                              search ? (
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  size="sm"
                                  aria-label="Clear search"
                                  onClick={() => {
                                    setSearch('');
                                    setPage(1);
                                  }}
                                >
                                  <IconX size={14} />
                                </ActionIcon>
                              ) : undefined
                            }
                          />
                        </Popover.Dropdown>
                      </Popover>
                      <Tooltip label={includeDisabled ? 'Showing all items' : 'Showing enabled only'} withArrow>
                        <ActionIcon
                          variant={includeDisabled ? 'filled' : 'light'}
                          color={includeDisabled ? 'indigo' : 'gray'}
                          size="lg"
                          onClick={() => {
                            setIncludeDisabled((prev) => !prev);
                            setPage(1);
                          }}
                        >
                          {includeDisabled ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                        </ActionIcon>
                      </Tooltip>
                      <Popover
                        opened={sortPopoverOpened}
                        onChange={setSortPopoverOpened}
                        withinPortal={false}
                        position="bottom-start"
                        shadow="md"
                        trapFocus={false}
                      >
                        <Popover.Target>
                          <Tooltip label="Sort by" withArrow>
                            <ActionIcon
                              variant={sortPopoverOpened ? 'filled' : 'light'}
                              color={sortPopoverOpened ? 'indigo' : 'gray'}
                              size="lg"
                              aria-label="Sort options"
                              onClick={() => setSortPopoverOpened((prev) => !prev)}
                            >
                              <IconList size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Popover.Target>
                        <Popover.Dropdown p="xs" w={200}>
                          <Stack gap="xs">
                            <Text size="xs" fw={600} c="dimmed">
                              Sort by
                            </Text>
                            <Select
                              data={[
                                { label: 'Display order', value: 'displayIndex' },
                                { label: 'Name', value: 'name' },
                                { label: 'Last updated', value: 'modified' },
                              ]}
                              value={sortBy}
                              onChange={(value) => {
                                if (!value) return;
                                setSortBy(value as typeof sortBy);
                                setPage(1);
                                setSortPopoverOpened(false);
                              }}
                            />
                          </Stack>
                        </Popover.Dropdown>
                      </Popover>
                      <Popover
                        opened={columnMenuOpened}
                        onChange={setColumnMenuOpened}
                        withinPortal={false}
                        position="bottom-start"
                        shadow="md"
                        trapFocus={false}
                      >
                        <Popover.Target>
                          <Tooltip label="Toggle columns" withArrow>
                            <ActionIcon
                              variant={columnMenuOpened ? 'filled' : 'light'}
                              color={columnMenuOpened ? 'indigo' : 'gray'}
                              size="lg"
                              aria-label="Toggle columns"
                              onClick={() => setColumnMenuOpened((prev) => !prev)}
                            >
                              <IconColumns size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Popover.Target>
                        <Popover.Dropdown p="sm" style={{ minWidth: 240 }}>
                          <Stack gap="xs">
                            <Group justify="space-between" align="center">
                              <Text size="sm" fw={600}>
                                Columns
                              </Text>
                              <Button
                                variant="subtle"
                                color="gray"
                                size="xs"
                                onClick={() => handleToggleAllColumns(false)}
                                disabled={!anyToggleColumnsSelected}
                              >
                                Deselect all
                              </Button>
                            </Group>
                            <TextInput
                              placeholder="Search..."
                              value={columnSearch}
                              onChange={(event) => setColumnSearch(event.currentTarget.value)}
                              size="xs"
                              leftSection={<IconSearch size={14} />}
                            />
                            <Divider />
                            <ScrollArea.Autosize mah={220} type="auto">
                              <Stack gap={4}>
                                {filteredToggleColumns.length === 0 ? (
                                  <Text size="xs" c="dimmed">
                                    No matching columns
                                  </Text>
                                ) : (
                                  filteredToggleColumns.map((column) => {
                                    const header = column.columnDef.header;
                                    const label = typeof header === 'string' ? header : column.id;
                                    return (
                                      <Checkbox
                                        key={column.id}
                                        label={label}
                                        checked={column.getIsVisible()}
                                        onChange={(event) => column.toggleVisibility(event.currentTarget.checked)}
                                      />
                                    );
                                  })
                                )}
                              </Stack>
                            </ScrollArea.Autosize>
                            <Divider />
                            <Group justify="space-between">
                              <Button
                                variant="light"
                                size="xs"
                                onClick={() => handleToggleAllColumns(true)}
                                disabled={toggleableColumns.length === 0 || allToggleColumnsSelected}
                              >
                                Select all
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                color="gray"
                                onClick={() => setColumnMenuOpened(false)}
                              >
                                Close
                              </Button>
                            </Group>
                          </Stack>
                        </Popover.Dropdown>
                      </Popover>
                      <Tooltip label={sortDirection === 'asc' ? 'Ascending' : 'Descending'} withArrow>
                        <ActionIcon
                          variant="light"
                          color="indigo"
                          size="lg"
                          onClick={() => {
                            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                            setPage(1);
                          }}
                        >
                          {sortDirection === 'asc' ? (
                            <IconSortAscending size={18} />
                          ) : (
                            <IconSortDescending size={18} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                      <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={handleCreate}
                        disabled={!brandId}
                        size="sm"
                      >
                        New item
                      </Button>
                    </Group>
                    <Group gap="sm" align="center">
                      <Text size="xs" c="dimmed">
                        {totalItems} rows
                      </Text>
                      <Group gap="xs" align="center">
                        <ActionIcon
                          variant="subtle"
                          size="lg"
                          aria-label="Previous page"
                          onClick={goToPreviousPage}
                          disabled={itemsLoading || page <= 1}
                        >
                          <IconChevronLeft size={16} />
                        </ActionIcon>
                        <Select
                          value={String(page)}
                          onChange={handlePageSelect}
                          data={pageOptions}
                          w={120}
                          disabled={itemsLoading || totalPages <= 1}
                        />
                        <ActionIcon
                          variant="subtle"
                          size="lg"
                          aria-label="Next page"
                          onClick={goToNextPage}
                          disabled={itemsLoading || page >= totalPages}
                        >
                          <IconChevronRight size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Group>
                </Paper>

                <Box
                  style={
                    isDesktopLayout
                      ? {
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          minHeight: 0,
                        }
                      : {}
                  }
                >
                  <Paper
                    shadow="none"
                    style={
                      isDesktopLayout
                        ? {
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            minHeight: 0,
                          }
                        : {}
                    }
                  >
                  {itemsLoading ? (
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...(isDesktopLayout
                          ? { flex: 1, minHeight: 0 }
                          : { padding: 'var(--mantine-spacing-xl) 0' }),
                      }}
                    >
                      <CenterLoader message="Loading menu items" />
                    </Box>
                  ) : fetchError ? (
                    <Stack
                      align="center"
                      justify="center"
                      p="xl"
                      gap="sm"
                      style={isDesktopLayout ? { flex: 1, minHeight: 0 } : undefined}
                    >
                      <IconAlertCircle size={24} color="var(--mantine-color-red-6)" />
                      <Text fw={600}>{fetchError}</Text>
                      <Button variant="light" onClick={handleRetry} disabled={itemsLoading}>
                        Retry
                      </Button>
                    </Stack>
                  ) : rows.length === 0 ? (
                    <Stack
                      align="center"
                      justify="center"
                      p="xl"
                      gap="sm"
                      style={isDesktopLayout ? { flex: 1, minHeight: 0 } : undefined}
                    >
                      <IconSparkles size={24} color="var(--mantine-color-gray-6)" />
                      <Text fw={600}>No items found</Text>
                      <Text size="sm" c="dimmed" ta="center">
                        Adjust filters or add a new item to this category.
                      </Text>
                    </Stack>
                  ) : (
                    <Box
                      ref={tableContainerRef}
                      style={{
                        overflow: 'auto',
                        position: 'relative',
                        isolation: 'isolate',
                        WebkitOverflowScrolling: 'touch',
                        ...(isDesktopLayout
                          ? {
                              flex: 1,
                              minHeight: 0,
                            }
                          : { maxHeight: 600 }),
                      }}
                    >
                      <div style={{
                        position: 'sticky',
                        top: 0,
                        left: 0,
                        zIndex: 10,
                        backgroundColor: 'white',
                        borderBottom: '1px solid #dee2e6',
                        transform: 'translateZ(0)',
                        WebkitTransform: 'translateZ(0)',
                        willChange: 'transform',
                        width: totalTableWidth,
                      }}>
                        <Table highlightOnHover withColumnBorders style={{
                          tableLayout: 'fixed',
                          width: totalTableWidth,
                        }}>
                            <Table.Thead>
                              {table.getHeaderGroups().map((headerGroup) => (
                                <Table.Tr key={headerGroup.id}>
                                  {headerGroup.headers.map((header) => (
                                    <Table.Th
                                      key={header.id}
                                      style={{
                                        backgroundColor: 'white',
                                        borderBottom: '1px solid #dee2e6',
                                        width: header.column.getSize(),
                                        minWidth: header.column.getSize(),
                                        maxWidth: header.column.getSize(),
                                        position: header.id === 'actions' ? 'sticky' : 'relative',
                                        ...(header.id === 'actions' ? {
                                          right: 0,
                                          backgroundColor: 'white',
                                          boxShadow: showActionShadow ? 'inset 3px 0 6px -4px rgba(15, 23, 42, 0.2)' : 'none',
                                          zIndex: 1,
                                          borderBottom: '1px solid #dee2e6',
                                          transition: 'box-shadow 120ms ease',
                                        } : {}),
                                      }}
                                    >
                                      {header.isPlaceholder ? null : (
                                        <Flex align="center" justify={header.column.id === 'actions' ? 'flex-end' : 'flex-start'} gap="xs">
                                          {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                          )}
                                        </Flex>
                                      )}
                                      {header.column.getCanResize() && header.id !== 'actions' && (
                                        <Box
                                          onMouseDown={header.getResizeHandler()}
                                          onTouchStart={header.getResizeHandler()}
                                          onMouseEnter={() => {
                                            setHoveredResizeColumnId(header.id);
                                            setBodyResizeCursor(true);
                                          }}
                                          onMouseLeave={() => {
                                            setBodyResizeCursor(false);
                                            setHoveredResizeColumnId((current) => (current === header.id ? null : current));
                                          }}
                                          style={{
                                            position: 'absolute',
                                            top: -6,
                                            right: -8,
                                            height: 'calc(100% + 12px)',
                                            width: 20,
                                            cursor: 'col-resize',
                                            userSelect: 'none',
                                            touchAction: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 6,
                                            transition: 'background-color 120ms ease',
                                            backgroundColor:
                                              header.column.getIsResizing() || hoveredResizeColumnId === header.id
                                                ? 'var(--mantine-color-indigo-0)'
                                                : 'transparent',
                                          }}
                                        >
                                          <Box
                                            style={{
                                              width: 2,
                                              height: '100%',
                                              borderRadius: 1,
                                              backgroundColor:
                                                header.column.getIsResizing() || hoveredResizeColumnId === header.id
                                                  ? 'var(--mantine-color-indigo-5)'
                                                  : 'transparent',
                                            }}
                                          />
                                        </Box>
                                      )}
                                    </Table.Th>
                                  ))}
                                </Table.Tr>
                              ))}
                            </Table.Thead>
                          </Table>
                        </div>

                        <div style={{
                          position: 'relative',
                          height: `${rowVirtualizer.getTotalSize()}px`,
                        }}>
                          <Table highlightOnHover withColumnBorders style={{
                            tableLayout: 'fixed',
                            width: totalTableWidth,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                          }}>
                            <Table.Tbody>
                              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const row = rows[virtualRow.index];
                                return (
                                  <VirtualTableRow<MenuItemSummary>
                                    key={row.id}
                                    row={row}
                                    virtualRow={virtualRow}
                                    totalTableWidth={totalTableWidth}
                                    showActionShadow={showActionShadow}
                                  />
                                );
                              })}
                            </Table.Tbody>
                          </Table>
                        </div>
                    </Box>
                  )}
                  </Paper>
                </Box>
              </Stack>
              </Box>
            </Flex>
      </Box>

      <MenuItemDrawer
        opened={drawerOpen}
        title={drawerMode === 'create' ? 'Create menu item' : 'Edit menu item'}
        saving={saving}
        detailLoading={detailLoading}
        formData={formData}
        lookups={lookups}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={handleDrawerClose}
        onCancel={handleDrawerClose}
        drawerMode={drawerMode}
        updateForm={updateForm}
        selectedDetail={selectedDetail}
        priceEdits={priceEdits}
        availabilityEdits={availabilityEdits}
        updatePriceEdit={updatePriceEdit}
        updateAvailabilityEdit={updateAvailabilityEdit}
        handleSavePrice={handleSavePrice}
        handleSaveAvailability={handleSaveAvailability}
        priceSavingShopId={priceSavingShopId}
      availabilitySavingShopId={availabilitySavingShopId}
      onSubmit={handleSubmit}
      onManageModifiers={
        drawerMode === 'edit' && selectedDetail ? () => handleOpenModifiers(selectedDetail) : undefined
      }
    />
    <ManageItemRelationshipsModal
      opened={Boolean(modifierModalItem)}
      onClose={handleCloseModifiers}
      brandId={brandId}
      item={modifierModalItem}
      modifierGroups={lookups?.modifierGroups ?? null}
      onSaved={(hasModifier) => {
        if (modifierModalItem) {
          handleModifiersSaved(modifierModalItem.itemId, hasModifier);
        }
      }}
    />
  </Box>
);
};

export default MenuItemsPage;
