import type { ItemCategory } from '../../../../types/itemCategory';
import type { MenuItemUpsertPayload } from '../../../../types/menuItem';

export interface CategoryNode extends ItemCategory {
  children: CategoryNode[];
}

export const PAGE_SIZE = 200;
export const PANEL_BORDER_COLOR = '#E3E8EE';

export const buildCategoryTree = (categories: ItemCategory[]): CategoryNode[] => {
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

const coerceString = (value?: string | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export const createBasePayload = (categoryId: number, departmentId: number): MenuItemUpsertPayload => ({
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

export const normalizePayload = (payload: MenuItemUpsertPayload): MenuItemUpsertPayload => ({
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

export const formatDateTime = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};
