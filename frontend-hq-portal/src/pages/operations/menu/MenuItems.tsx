import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Drawer,
  Flex,
  Grid,
  Group,
  Loader,
  NumberInput,
  Pagination,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconArrowsSort,
  IconAdjustments,
  IconCheck,
  IconChevronRight,
  IconPencil,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AutoBreadcrumb } from '../../../components/AutoBreadcrumb';
import { ScrollingHeader } from '../../../components/ScrollingHeader';
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
import type { ItemCategory } from '../../../types/itemCategory';

interface CategoryNode extends ItemCategory {
  children: CategoryNode[];
}

const PAGE_SIZE = 25;
const PANEL_BORDER_COLOR = '#E3E8EE';
const PAGE_CONTENT_OFFSET = 96; // Breadcrumb (48) + compact header (48)

const buildCategoryTree = (categories: ItemCategory[]): CategoryNode[] => {
  const map = new Map<number, CategoryNode>();
  const roots: CategoryNode[] = [];

  categories.forEach((cat) => {
    map.set(cat.categoryId, { ...cat, children: [] });
  });

  categories.forEach((cat) => {
    const node = map.get(cat.categoryId);
    if (!node) return;

    const parentId = cat.parentCategoryId;
    if (parentId !== null && parentId !== undefined && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortFn = (a: CategoryNode, b: CategoryNode) => {
    if (a.displayIndex !== b.displayIndex) return a.displayIndex - b.displayIndex;
    return a.categoryName.localeCompare(b.categoryName);
  };

  const sortTree = (nodes: CategoryNode[]) => {
    nodes.sort(sortFn);
    nodes.forEach((node) => sortTree(node.children));
  };

  sortTree(roots);
  return roots;
};

const createBasePayload = (categoryId: number, departmentId: number): MenuItemUpsertPayload => ({
  itemCode: '',
  itemName: '',
  itemNameAlt: '',
  itemNameAlt2: '',
  itemNameAlt3: '',
  itemNameAlt4: '',
  itemPosName: '',
  itemPosNameAlt: '',
  itemPublicDisplayName: '',
  itemPublicDisplayNameAlt: '',
  itemPublicPrintedName: '',
  itemPublicPrintedNameAlt: '',
  remark: '',
  remarkAlt: '',
  imageFileName: '',
  imageFileName2: '',
  tableOrderingImageFileName: '',
  categoryId,
  departmentId,
  subDepartmentId: null,
  displayIndex: 0,
  enabled: true,
  isItemShow: true,
  isPriceShow: true,
  hasModifier: false,
  autoRedirectToModifier: false,
  isModifier: false,
  modifierGroupHeaderId: null,
  buttonStyleId: null,
  isManualPrice: false,
  isManualName: false,
  isPromoItem: false,
  isModifierConcatToParent: false,
  isFollowSet: false,
  isFollowSetDynamic: false,
  isFollowSetStandard: false,
  isNonDiscountItem: false,
  isNonServiceChargeItem: false,
  isStandaloneAndSetItem: null,
  isGroupRightItem: false,
  isPrintLabel: false,
  isPrintLabelTakeaway: false,
  isPriceInPercentage: false,
  isPointPaidItem: null,
  isNoPointEarnItem: null,
  isNonTaxableItem: null,
  isItemShowInKitchenChecklist: null,
  isSoldoutAutoLock: null,
  isPrepaidRechargeItem: null,
  isAutoLinkWithRawMaterial: null,
  isDinein: true,
  isTakeaway: true,
  isDelivery: true,
  isKitchenPrintInRedColor: null,
  isManualPriceGroup: null,
  isExcludeLabelCount: null,
  servingSize: null,
  systemRemark: '',
  isNonSalesItem: null,
  productionSeconds: null,
  parentItemId: null,
  isComboRequired: null,
});

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

const coerceString = (value?: string | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const normalizePayload = (payload: MenuItemUpsertPayload): MenuItemUpsertPayload => ({
  ...payload,
  itemName: coerceString(payload.itemName) ?? null,
  itemNameAlt: coerceString(payload.itemNameAlt) ?? null,
  itemNameAlt2: coerceString(payload.itemNameAlt2) ?? null,
  itemNameAlt3: coerceString(payload.itemNameAlt3) ?? null,
  itemNameAlt4: coerceString(payload.itemNameAlt4) ?? null,
  itemPosName: coerceString(payload.itemPosName) ?? null,
  itemPosNameAlt: coerceString(payload.itemPosNameAlt) ?? null,
  itemPublicDisplayName: coerceString(payload.itemPublicDisplayName) ?? null,
  itemPublicDisplayNameAlt: coerceString(payload.itemPublicDisplayNameAlt) ?? null,
  itemPublicPrintedName: coerceString(payload.itemPublicPrintedName) ?? null,
  itemPublicPrintedNameAlt: coerceString(payload.itemPublicPrintedNameAlt) ?? null,
  remark: coerceString(payload.remark) ?? null,
  remarkAlt: coerceString(payload.remarkAlt) ?? null,
  imageFileName: coerceString(payload.imageFileName) ?? null,
  imageFileName2: coerceString(payload.imageFileName2) ?? null,
  tableOrderingImageFileName: coerceString(payload.tableOrderingImageFileName) ?? null,
  systemRemark: coerceString(payload.systemRemark) ?? null,
});

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const MenuItemsPage: FC = () => {
  const { selectedBrand } = useBrands();
  const brandId = selectedBrand ? parseInt(selectedBrand, 10) : null;
  const navigate = useNavigate();
  const isDesktopLayout = useMediaQuery('(min-width: 62em)');

  const [lookups, setLookups] = useState<MenuItemLookups | null>(null);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [filtersReady, setFiltersReady] = useState(false);
  const [itemsResponse, setItemsResponse] = useState<MenuItemListResponse | null>(null);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [modifierFilter, setModifierFilter] = useState<'all' | 'with' | 'without'>('all');
  const [promoFilter, setPromoFilter] = useState<'all' | 'promo' | 'nonpromo'>('all');
  const [sortBy, setSortBy] = useState<'displayIndex' | 'name' | 'modified'>('displayIndex');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

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
        setSelectedCategoryId((current) => {
          if (current && data.categories.some((cat) => cat.categoryId === current)) {
            return current;
          }
          return data.categories[0]?.categoryId ?? null;
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
          hasModifier:
            modifierFilter === 'with' ? true : modifierFilter === 'without' ? false : undefined,
          isPromoItem:
            promoFilter === 'promo' ? true : promoFilter === 'nonpromo' ? false : undefined,
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
  }, [brandId, filtersReady, selectedCategoryId, debouncedSearch, includeDisabled, modifierFilter, promoFilter, sortBy, sortDirection, page]);

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

  const totalItems = itemsResponse?.totalItems ?? 0;
  const totalPages = itemsResponse?.totalPages ?? 1;

  const getCategoryLabel = (categoryId?: number | null) => {
    if (categoryId === null || categoryId === undefined || !lookups) return '—';
    const match = lookups.categories.find((cat) => cat.categoryId === categoryId);
    return match ? match.categoryName : '—';
  };

  const getDepartmentName = (departmentId?: number) => {
    if (departmentId === null || departmentId === undefined || !lookups) return '—';
    return lookups.departments.find((dep) => dep.departmentId === departmentId)?.departmentName ?? '—';
  };

  const handleCreate = () => {
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
  };

  const handleEdit = async (item: MenuItemSummary) => {
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
      setDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

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

      setDrawerOpen(false);
      setFormData(null);
      setEditingItemId(null);
      setSelectedDetail(null);
      setPriceEdits({});
      setAvailabilityEdits({});
      // Refresh list
      const response = await menuItemService.getMenuItems(brandId, {
        categoryId: selectedCategoryId ?? undefined,
        search: debouncedSearch || undefined,
        includeDisabled,
        hasModifier:
          modifierFilter === 'with' ? true : modifierFilter === 'without' ? false : undefined,
        isPromoItem:
          promoFilter === 'promo' ? true : promoFilter === 'nonpromo' ? false : undefined,
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
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleCategoryExpansion(node.categoryId);
                    }}
                  >
                    {isExpanded ? <IconChevronRight size={16} style={{ transform: 'rotate(90deg)' }} /> : <IconChevronRight size={16} />}
                  </ActionIcon>
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

  const renderTags = (item: MenuItemSummary) => (
    <Group gap="xs" style={{ flexWrap: 'wrap' }}>
      <Badge variant="light" color={item.enabled ? 'green' : 'gray'} size="sm">
        {item.enabled ? 'Enabled' : 'Disabled'}
      </Badge>
      <Badge variant="light" color={item.isItemShow ? 'blue' : 'gray'} size="sm">
        {item.isItemShow ? 'Visible' : 'Hidden'}
      </Badge>
      {item.hasModifier && (
        <Badge variant="light" color="violet" size="sm">
          Modifiers
        </Badge>
      )}
      {item.isPromoItem && (
        <Badge variant="light" color="orange" size="sm">
          Promo
        </Badge>
      )}
      {item.isManualPrice && (
        <Badge variant="light" color="red" size="sm">
          Manual price
        </Badge>
      )}
    </Group>
  );

  const itemRows = (itemsResponse?.items ?? []).map((item) => (
    <Table.Tr key={item.itemId}>
      <Table.Td style={{ overflow: 'hidden' }}>
        <Stack gap={2}>
          <Text fw={600} truncate="end">{item.itemName || item.itemCode}</Text>
          <Text size="xs" c="dimmed" truncate="end">
            Code: {item.itemCode}
          </Text>
          {item.itemPublicDisplayName && (
            <Text size="xs" c="dimmed" truncate="end">
              Public: {item.itemPublicDisplayName}
            </Text>
          )}
        </Stack>
      </Table.Td>
      <Table.Td style={{ overflow: 'hidden' }}>
        <Text truncate="end">{getCategoryLabel(item.categoryId)}</Text>
      </Table.Td>
      <Table.Td style={{ overflow: 'hidden' }}>
        <Text truncate="end">{getDepartmentName(item.departmentId)}</Text>
      </Table.Td>
      <Table.Td style={{ overflow: 'hidden' }}>
        {renderTags(item)}
      </Table.Td>
      <Table.Td style={{ overflow: 'hidden' }}>
        <Text size="sm" truncate="end">{formatDateTime(item.modifiedDate)}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          {item.hasModifier && (
            <Tooltip label="Manage modifiers" withArrow>
              <ActionIcon
                variant="subtle"
                color="violet"
                onClick={() => navigate(`/menus/modifiers?itemId=${item.itemId}`)}
              >
                <IconAdjustments size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          <ActionIcon variant="subtle" color="indigo" onClick={() => handleEdit(item)}>
            <IconPencil size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

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

      <Box style={{ flexShrink: 0, backgroundColor: 'white' }}>
        <ScrollingHeader
          title="Menu Items"
          subtitle="Browse, filter, and edit items across your menu"
          actions={
            <Group>
              <Button leftSection={<IconPlus size={16} />} onClick={handleCreate} disabled={!brandId}>
                New item
              </Button>
            </Group>
          }
          spacing="compact"
          forceCompact
          compactShadow={false}
        />
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
                <Stack
                  gap="sm"
                  style={
                    isDesktopLayout
                      ? {
                          flex: 1,
                          overflow: 'hidden',
                          minHeight: 0,
                        }
                      : undefined
                  }
                >
                  <Group justify="space-between">
                    <Text fw={600}>Categories</Text>
                    <Badge variant="light" color="gray">
                      {(itemsResponse?.categoryCounts ?? []).reduce((acc, entry) => acc + entry.itemCount, 0)} items
                    </Badge>
                  </Group>
                  <TextInput
                    placeholder="Search categories"
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                  />
                  <Button
                    variant={selectedCategoryId === null ? 'filled' : 'subtle'}
                    color={selectedCategoryId === null ? 'indigo' : 'gray'}
                    leftSection={<IconSparkles size={16} />}
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setPage(1);
                    }}
                  >
                    All items
                  </Button>
                  <Divider label="Browse" labelPosition="center" />
                  <ScrollArea
                    type="auto"
                    offsetScrollbars
                    style={
                      isDesktopLayout
                        ? {
                            flex: 1,
                            minHeight: 0,
                          }
                        : undefined
                    }
                  >
                    {lookupsLoading ? (
                      <CenterLoader message="Loading categories" />
                    ) : filteredCategories.length > 0 ? (
                      <Stack gap="sm">{renderCategoryNodes(filteredCategories)}</Stack>
                    ) : (
                      <Stack gap="xs" align="center" py="md">
                        <IconSparkles size={20} color="var(--mantine-color-gray-6)" />
                        <Text size="sm" c="dimmed" ta="center">
                          No categories match your search.
                        </Text>
                      </Stack>
                    )}
                  </ScrollArea>
                </Stack>
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
                    ? { flex: 1, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }
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
                  <Stack gap="md">
                    <Group align="flex-end" justify="space-between">
                      <TextInput
                        label="Search"
                        placeholder="Search by name or code"
                        value={search}
                        onChange={(event) => {
                          setSearch(event.currentTarget.value);
                          setPage(1);
                        }}
                        leftSection={<IconSearch size={16} />}
                        w="60%"
                      />
                      <Switch
                        label="Include disabled"
                        checked={includeDisabled}
                        onChange={(event) => {
                          setIncludeDisabled(event.currentTarget.checked);
                          setPage(1);
                        }}
                      />
                    </Group>

                    <Group grow>
                      <SegmentedControl
                        value={modifierFilter}
                        onChange={(value) => {
                          const next = value as 'all' | 'with' | 'without';
                          setModifierFilter(next);
                          setPage(1);
                        }}
                        data={[
                          { label: 'All modifiers', value: 'all' },
                          { label: 'With modifiers', value: 'with' },
                          { label: 'Without modifiers', value: 'without' },
                        ]}
                      />
                      <SegmentedControl
                        value={promoFilter}
                        onChange={(value) => {
                          const next = value as 'all' | 'promo' | 'nonpromo';
                          setPromoFilter(next);
                          setPage(1);
                        }}
                        data={[
                          { label: 'All items', value: 'all' },
                          { label: 'Promo only', value: 'promo' },
                          { label: 'Non promo', value: 'nonpromo' },
                        ]}
                      />
                    </Group>

                    <Group>
                      <Select
                        label="Sort by"
                        value={sortBy}
                        onChange={(value) => {
                          if (!value) return;
                          setSortBy(value as typeof sortBy);
                          setPage(1);
                        }}
                        data={[
                          { label: 'Display order', value: 'displayIndex' },
                          { label: 'Name', value: 'name' },
                          { label: 'Last updated', value: 'modified' },
                        ]}
                        w={220}
                      />
                      <Button
                        variant="light"
                        leftSection={<IconArrowsSort size={16} />}
                        onClick={() => {
                          setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                          setPage(1);
                        }}
                      >
                        {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                      </Button>
                    </Group>
                  </Stack>
                </Paper>

                <Paper
                  shadow="none"
                  p="md"
                  style={{
                    flexShrink: 0,
                    borderBottom: `1px solid ${PANEL_BORDER_COLOR}`,
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Text size="sm" c="dimmed">
                      Showing page {page} of {totalPages} • {totalItems} items
                    </Text>
                    <Pagination
                      value={page}
                      onChange={setPage}
                      total={totalPages}
                      disabled={itemsLoading || totalPages <= 1}
                    />
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
                      <Button variant="light" onClick={() => setPage((prev) => prev)}>
                        Retry
                      </Button>
                    </Stack>
                  ) : (
                    <ScrollArea
                      type="auto"
                      style={
                        isDesktopLayout
                          ? {
                              flex: 1,
                              minHeight: 0,
                            }
                          : undefined
                      }
                    >
                      <Table highlightOnHover withColumnBorders style={{ tableLayout: 'fixed', minWidth: '100%' }}>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ width: '25%' }}>Item</Table.Th>
                            <Table.Th style={{ width: '15%' }}>Category</Table.Th>
                            <Table.Th style={{ width: '12%' }}>Department</Table.Th>
                            <Table.Th style={{ width: '25%' }}>Flags</Table.Th>
                            <Table.Th style={{ width: '15%' }}>Last updated</Table.Th>
                            <Table.Th style={{ width: '8%' }}></Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {itemRows.length > 0 ? (
                            itemRows
                          ) : (
                            <Table.Tr>
                              <Table.Td colSpan={6}>
                                <Stack align="center" gap="xs" py="lg">
                                  <IconSparkles size={24} color="var(--mantine-color-gray-6)" />
                                  <Text fw={600}>No items found</Text>
                                  <Text size="sm" c="dimmed" ta="center">
                                    Adjust filters or add a new item to this category.
                                  </Text>
                                </Stack>
                              </Table.Td>
                            </Table.Tr>
                          )}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                  )}
                  </Paper>
                </Box>
              </Stack>
              </Box>
            </Flex>
      </Box>

      <Drawer
        opened={drawerOpen}
        onClose={() => {
          if (!saving) {
            setDrawerOpen(false);
            setFormData(null);
            setEditingItemId(null);
            setSelectedDetail(null);
            setPriceEdits({});
            setAvailabilityEdits({});
            setDetailLoading(false);
          }
        }}
        position="right"
        size="lg"
        title={drawerMode === 'create' ? 'Create menu item' : 'Edit menu item'}
        overlayProps={{ opacity: 0.15 }}
      >
        {detailLoading ? (
          <CenterLoader message="Loading item" />
        ) : formData ? (
          <Stack gap="lg">
            <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)}>
              <Tabs.List>
                <Tabs.Tab value="basics" leftSection={<IconChevronRight size={14} />}>Basics</Tabs.Tab>
                <Tabs.Tab value="display" leftSection={<IconChevronRight size={14} />}>Display</Tabs.Tab>
                <Tabs.Tab value="availability" leftSection={<IconChevronRight size={14} />}>Availability</Tabs.Tab>
                <Tabs.Tab value="advanced" leftSection={<IconChevronRight size={14} />}>Advanced</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="basics" mt="md">
                <Stack gap="md">
                  <Group grow align="flex-start">
                    <TextInput
                      label="Item code"
                      required
                      value={formData.itemCode}
                      onChange={(event) => updateForm('itemCode', event.currentTarget.value)}
                    />
                    <NumberInput
                      label="Display order"
                      value={formData.displayIndex}
                      onChange={(value) => updateForm('displayIndex', Number(value) || 0)}
                      min={0}
                    />
                  </Group>
                  <TextInput
                    label="Item name"
                    value={formData.itemName ?? ''}
                    onChange={(event) => updateForm('itemName', event.currentTarget.value)}
                  />
                  <Group grow>
                    <Select
                      label="Category"
                      data={(lookups?.categories ?? []).map((cat) => ({
                        value: String(cat.categoryId),
                        label: cat.categoryName,
                      }))}
                      value={String(formData.categoryId)}
                      onChange={(value) => {
                        if (value) updateForm('categoryId', parseInt(value, 10));
                      }}
                    />
                    <Select
                      label="Department"
                      data={(lookups?.departments ?? []).map((dep) => ({
                        value: String(dep.departmentId),
                        label: dep.departmentName,
                      }))}
                      value={String(formData.departmentId)}
                      onChange={(value) => {
                        if (value) updateForm('departmentId', parseInt(value, 10));
                      }}
                    />
                  </Group>
                  <Group>
                    <Checkbox
                      label="Enabled"
                      checked={formData.enabled}
                      onChange={(event) => updateForm('enabled', event.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Show item"
                      checked={formData.isItemShow}
                      onChange={(event) => updateForm('isItemShow', event.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Show price"
                      checked={formData.isPriceShow}
                      onChange={(event) => updateForm('isPriceShow', event.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Promo item"
                      checked={formData.isPromoItem}
                      onChange={(event) => updateForm('isPromoItem', event.currentTarget.checked)}
                    />
                  </Group>
                  <Divider label="Modifiers" labelPosition="center" />
                  <Group align="flex-end" grow>
                    <Switch
                      label="Has modifiers"
                      checked={formData.hasModifier}
                      onChange={(event) => {
                        const value = event.currentTarget.checked;
                        updateForm('hasModifier', value);
                        if (!value) {
                          updateForm('modifierGroupHeaderId', null);
                          updateForm('autoRedirectToModifier', false);
                        }
                      }}
                    />
                    <Switch
                      label="Auto open modifier screen"
                      checked={formData.autoRedirectToModifier}
                      onChange={(event) => updateForm('autoRedirectToModifier', event.currentTarget.checked)}
                      disabled={!formData.hasModifier}
                    />
                  </Group>
                  <Select
                    label="Modifier group"
                    placeholder="No group linked"
                    data={(lookups?.modifierGroups ?? []).map((group) => ({
                      value: String(group.groupHeaderId),
                      label: group.groupBatchName,
                    }))}
                    value={formData.modifierGroupHeaderId ? String(formData.modifierGroupHeaderId) : null}
                    onChange={(value) =>
                      updateForm('modifierGroupHeaderId', value ? parseInt(value, 10) : null)
                    }
                    disabled={!formData.hasModifier}
                  />
                  <Select
                    label="Button style"
                    placeholder="Default"
                    data={(lookups?.buttonStyles ?? []).map((style) => ({
                      value: String(style.buttonStyleId),
                      label: style.styleName,
                    }))}
                    value={formData.buttonStyleId ? String(formData.buttonStyleId) : null}
                    onChange={(value) => updateForm('buttonStyleId', value ? parseInt(value, 10) : null)}
                  />
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="display" mt="md">
                <Stack gap="md">
                  <TextInput
                    label="POS display name"
                    value={formData.itemPosName ?? ''}
                    onChange={(event) => updateForm('itemPosName', event.currentTarget.value)}
                  />
                  <TextInput
                    label="Public display name"
                    value={formData.itemPublicDisplayName ?? ''}
                    onChange={(event) => updateForm('itemPublicDisplayName', event.currentTarget.value)}
                  />
                  <TextInput
                    label="POS display name (alt)"
                    value={formData.itemPosNameAlt ?? ''}
                    onChange={(event) => updateForm('itemPosNameAlt', event.currentTarget.value)}
                  />
                  <TextInput
                    label="Public display name (alt)"
                    value={formData.itemPublicDisplayNameAlt ?? ''}
                    onChange={(event) => updateForm('itemPublicDisplayNameAlt', event.currentTarget.value)}
                  />
                  <TextInput
                    label="POS printed name"
                    value={formData.itemPublicPrintedName ?? ''}
                    onChange={(event) => updateForm('itemPublicPrintedName', event.currentTarget.value)}
                  />
                  <TextInput
                    label="Staff note"
                    value={formData.remark ?? ''}
                    onChange={(event) => updateForm('remark', event.currentTarget.value)}
                  />
                  <TextInput
                    label="Image file"
                    value={formData.imageFileName ?? ''}
                    onChange={(event) => updateForm('imageFileName', event.currentTarget.value)}
                  />
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="availability" mt="md">
                <Stack gap="md">
                  <Group>
                    <Checkbox
                      label="Dine-in"
                      checked={formData.isDinein}
                      onChange={(event) => updateForm('isDinein', event.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Takeaway"
                      checked={formData.isTakeaway}
                      onChange={(event) => updateForm('isTakeaway', event.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Delivery"
                      checked={formData.isDelivery}
                      onChange={(event) => updateForm('isDelivery', event.currentTarget.checked)}
                    />
                  </Group>
                  <Group grow>
                    <NumberInput
                      label="Serving size"
                      value={formData.servingSize ?? undefined}
                      onChange={(value) => updateForm('servingSize', value === '' ? null : Number(value))}
                      min={0}
                      step={0.1}
                    />
                    <NumberInput
                      label="Production seconds"
                      value={formData.productionSeconds ?? undefined}
                      onChange={(value) => updateForm('productionSeconds', value === '' ? null : Number(value))}
                      min={0}
                    />
                  </Group>
                  <Switch
                    label="Show in kitchen checklist"
                    checked={Boolean(formData.isItemShowInKitchenChecklist)}
                    onChange={(event) => updateForm('isItemShowInKitchenChecklist', event.currentTarget.checked)}
                  />
                  <Divider label="Shop overrides" labelPosition="center" />
                  {drawerMode === 'create' ? (
                    <Alert variant="light" color="blue">
                      Pricing and shop availability overrides will be available once the item has been created.
                    </Alert>
                  ) : detailLoading ? (
                    <CenterLoader message="Loading shop data" />
                  ) : selectedDetail ? (
                    <Stack gap="lg">
                      <Stack gap="sm">
                        <Text fw={600}>Pricing by shop</Text>
                        <ScrollArea type="auto" h={220} offsetScrollbars>
                          <Table horizontalSpacing="md" verticalSpacing="sm">
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th>Shop</Table.Th>
                                <Table.Th>Price</Table.Th>
                                <Table.Th>Enabled</Table.Th>
                                <Table.Th>Last updated</Table.Th>
                                <Table.Th align="right">Actions</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {selectedDetail.prices.length === 0 ? (
                                <Table.Tr>
                                  <Table.Td colSpan={5}>
                                    <Text size="sm" c="dimmed">
                                      No shop pricing data is available.
                                    </Text>
                                  </Table.Td>
                                </Table.Tr>
                              ) : (
                                selectedDetail.prices.map((price) => {
                                  const state = priceEdits[price.shopId] ?? {
                                    price: price.price ?? null,
                                    enabled: price.enabled,
                                  };

                                  return (
                                    <Table.Tr key={`price-${price.shopId}`}>
                                      <Table.Td>
                                        <Text fw={500}>{price.shopName}</Text>
                                      </Table.Td>
                                      <Table.Td style={{ width: 140 }}>
                                        <NumberInput
                                          value={state.price ?? undefined}
                                          min={0}
                                          step={0.1}
                                          onChange={(value) => {
                                            if (value === '' || value === null) {
                                              updatePriceEdit(price.shopId, { price: null });
                                              return;
                                            }

                                            const numeric = typeof value === 'number' ? value : Number(value);
                                            if (!Number.isFinite(numeric)) {
                                              updatePriceEdit(price.shopId, { price: null });
                                              return;
                                            }
                                            const normalised = Math.round(Number(numeric) * 100) / 100;
                                            updatePriceEdit(price.shopId, {
                                              price: normalised,
                                            });
                                          }}
                                        />
                                      </Table.Td>
                                      <Table.Td style={{ width: 120 }}>
                                        <Switch
                                          checked={state.enabled}
                                          onChange={(event) =>
                                            updatePriceEdit(price.shopId, {
                                              enabled: event.currentTarget.checked,
                                            })
                                          }
                                        />
                                      </Table.Td>
                                      <Table.Td style={{ width: 180 }}>
                                        {price.modifiedDate ? (
                                          <Tooltip
                                            label={`Updated by ${price.modifiedBy ?? 'unknown user'}`}
                                            withArrow
                                          >
                                            <Text size="xs">{formatDateTime(price.modifiedDate)}</Text>
                                          </Tooltip>
                                        ) : (
                                          <Text size="xs" c="dimmed">
                                            —
                                          </Text>
                                        )}
                                      </Table.Td>
                                      <Table.Td align="right" style={{ width: 120 }}>
                                        <Button
                                          size="xs"
                                          variant="light"
                                          loading={priceSavingShopId === price.shopId}
                                          leftSection={priceSavingShopId === price.shopId ? undefined : <IconCheck size={14} />}
                                          onClick={() => handleSavePrice(price.shopId)}
                                        >
                                          Save
                                        </Button>
                                      </Table.Td>
                                    </Table.Tr>
                                  );
                                })
                              )}
                            </Table.Tbody>
                          </Table>
                        </ScrollArea>
                      </Stack>

                      <Stack gap="sm">
                        <Text fw={600}>Availability by shop</Text>
                        <ScrollArea type="auto" h={220} offsetScrollbars>
                          <Table horizontalSpacing="md" verticalSpacing="sm">
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th>Shop</Table.Th>
                                <Table.Th>Enabled</Table.Th>
                                <Table.Th>Out of stock</Table.Th>
                                <Table.Th>Limited item</Table.Th>
                                <Table.Th>Last updated</Table.Th>
                                <Table.Th align="right">Actions</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {selectedDetail.shopAvailability.length === 0 ? (
                                <Table.Tr>
                                  <Table.Td colSpan={6}>
                                    <Text size="sm" c="dimmed">
                                      No shop availability records found.
                                    </Text>
                                  </Table.Td>
                                </Table.Tr>
                              ) : (
                                selectedDetail.shopAvailability.map((record) => {
                                  const state = availabilityEdits[record.shopId] ?? {
                                    enabled: record.enabled ?? false,
                                    isOutOfStock: record.isOutOfStock ?? false,
                                    isLimitedItem: record.isLimitedItem ?? false,
                                  };

                                  return (
                                    <Table.Tr key={`availability-${record.shopId}`}>
                                      <Table.Td>
                                        <Text fw={500}>{record.shopName}</Text>
                                      </Table.Td>
                                      <Table.Td style={{ width: 140 }}>
                                        <Switch
                                          checked={Boolean(state.enabled)}
                                          onChange={(event) =>
                                            updateAvailabilityEdit(record.shopId, {
                                              enabled: event.currentTarget.checked,
                                            })
                                          }
                                        />
                                      </Table.Td>
                                      <Table.Td style={{ width: 160 }}>
                                        <Switch
                                          checked={Boolean(state.isOutOfStock)}
                                          onChange={(event) =>
                                            updateAvailabilityEdit(record.shopId, {
                                              isOutOfStock: event.currentTarget.checked,
                                            })
                                          }
                                          color="red"
                                        />
                                      </Table.Td>
                                      <Table.Td style={{ width: 160 }}>
                                        <Switch
                                          checked={Boolean(state.isLimitedItem)}
                                          onChange={(event) =>
                                            updateAvailabilityEdit(record.shopId, {
                                              isLimitedItem: event.currentTarget.checked,
                                            })
                                          }
                                          color="orange"
                                        />
                                      </Table.Td>
                                      <Table.Td style={{ width: 180 }}>
                                        {record.lastUpdated ? (
                                          <Tooltip
                                            label={`Updated by ${record.updatedBy ?? 'unknown user'}`}
                                            withArrow
                                          >
                                            <Text size="xs">{formatDateTime(record.lastUpdated)}</Text>
                                          </Tooltip>
                                        ) : (
                                          <Text size="xs" c="dimmed">
                                            —
                                          </Text>
                                        )}
                                      </Table.Td>
                                      <Table.Td align="right" style={{ width: 120 }}>
                                        <Button
                                          size="xs"
                                          variant="light"
                                          loading={availabilitySavingShopId === record.shopId}
                                          leftSection={availabilitySavingShopId === record.shopId ? undefined : <IconCheck size={14} />}
                                          onClick={() => handleSaveAvailability(record.shopId)}
                                        >
                                          Save
                                        </Button>
                                      </Table.Td>
                                    </Table.Tr>
                                  );
                                })
                              )}
                            </Table.Tbody>
                          </Table>
                        </ScrollArea>
                      </Stack>
                    </Stack>
                  ) : (
                    <Alert variant="light" color="blue">
                      Select a menu item to view shop-specific overrides.
                    </Alert>
                  )}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="advanced" mt="md">
                <Stack gap="md">
                  <Group>
                    <Checkbox
                      label="Manual price"
                      checked={formData.isManualPrice}
                      onChange={(event) => updateForm('isManualPrice', event.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Manual name"
                      checked={formData.isManualName}
                      onChange={(event) => updateForm('isManualName', event.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Non discountable"
                      checked={formData.isNonDiscountItem}
                      onChange={(event) => updateForm('isNonDiscountItem', event.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Non service charge"
                      checked={formData.isNonServiceChargeItem}
                      onChange={(event) => updateForm('isNonServiceChargeItem', event.currentTarget.checked)}
                    />
                  </Group>
                  <Group>
                    <Checkbox
                      label="Allow points payment"
                      checked={Boolean(formData.isPointPaidItem)}
                      onChange={(event) => updateForm('isPointPaidItem', event.currentTarget.checked)}
                    />
                    <Checkbox
                      label="No point earning"
                      checked={Boolean(formData.isNoPointEarnItem)}
                      onChange={(event) => updateForm('isNoPointEarnItem', event.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Non taxable"
                      checked={Boolean(formData.isNonTaxableItem)}
                      onChange={(event) => updateForm('isNonTaxableItem', event.currentTarget.checked)}
                    />
                  </Group>
                  <Checkbox
                    label="Combo required"
                    checked={Boolean(formData.isComboRequired)}
                    onChange={(event) => updateForm('isComboRequired', event.currentTarget.checked)}
                  />
                  <TextInput
                    label="System remark"
                    value={formData.systemRemark ?? ''}
                    onChange={(event) => updateForm('systemRemark', event.currentTarget.value)}
                  />
                </Stack>
              </Tabs.Panel>
            </Tabs>

            <Divider />
            <Group justify="space-between">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconX size={16} />}
                onClick={() => {
                  setDrawerOpen(false);
                  setFormData(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                leftSection={saving ? <Loader size="xs" /> : <IconCheck size={16} />}
                onClick={handleSubmit}
                disabled={saving}
              >
                Save changes
              </Button>
            </Group>
          </Stack>
        ) : (
          <CenterLoader message="Loading item" />
        )}
      </Drawer>
    </Box>
  );
};

function CenterLoader({ message }: { message?: string }) {
  return (
    <Stack align="center" justify="center" py="lg" gap="xs">
      <Loader color="indigo" />
      {message && (
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      )}
    </Stack>
  );
}

export default MenuItemsPage;
