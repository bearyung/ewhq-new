import type { ItemCategory } from './itemCategory';
import type { ButtonStyle } from './buttonStyle';
import type { Department } from './department';
import type { ModifierGroupHeader } from './modifierGroup';

export interface MenuItemSummary {
  itemId: number;
  accountId: number;
  categoryId: number;
  departmentId: number;
  itemCode: string;
  itemName?: string;
  itemNameAlt?: string;
  enabled: boolean;
  isItemShow: boolean;
  isPriceShow: boolean;
  hasModifier: boolean;
  isModifier: boolean;
  isPromoItem: boolean;
  isManualPrice: boolean;
  isManualName: boolean;
  displayIndex: number;
  itemPublicDisplayName?: string;
  imageFileName?: string;
  modifiedDate?: string;
}

export interface MenuItemDetail extends MenuItemSummary {
  modifierGroupHeaderId?: number | null;
  autoRedirectToModifier: boolean;
  buttonStyleId?: number | null;
  itemPosName?: string;
  itemPosNameAlt?: string;
  itemNameAlt2?: string;
  itemNameAlt3?: string;
  itemNameAlt4?: string;
  remark?: string;
  remarkAlt?: string;
  itemPublicDisplayNameAlt?: string;
  itemPublicPrintedName?: string;
  itemPublicPrintedNameAlt?: string;
  imageFileName2?: string;
  tableOrderingImageFileName?: string;
  isStandaloneAndSetItem?: boolean | null;
  isFollowSet: boolean;
  isFollowSetDynamic: boolean;
  isFollowSetStandard: boolean;
  isModifierConcatToParent: boolean;
  isNonDiscountItem: boolean;
  isNonServiceChargeItem: boolean;
  isGroupRightItem: boolean;
  isPrintLabel: boolean;
  isPrintLabelTakeaway: boolean;
  isPriceInPercentage: boolean;
  isPointPaidItem?: boolean | null;
  isNoPointEarnItem?: boolean | null;
  isNonTaxableItem?: boolean | null;
  isItemShowInKitchenChecklist?: boolean | null;
  isSoldoutAutoLock?: boolean | null;
  isPrepaidRechargeItem?: boolean | null;
  isAutoLinkWithRawMaterial?: boolean | null;
  isDinein: boolean;
  isTakeaway: boolean;
  isDelivery: boolean;
  isKitchenPrintInRedColor?: boolean | null;
  isManualPriceGroup?: boolean | null;
  subDepartmentId?: number | null;
  isExcludeLabelCount?: boolean | null;
  servingSize?: number | null;
  systemRemark?: string;
  isNonSalesItem?: boolean | null;
  productionSeconds?: number | null;
  parentItemId?: number | null;
  isComboRequired?: boolean | null;
  createdDate?: string;
  createdBy?: string;
  modifiedBy?: string;
}

export interface MenuItemUpsertPayload {
  itemCode: string;
  itemName?: string | null;
  itemNameAlt?: string | null;
  itemNameAlt2?: string | null;
  itemNameAlt3?: string | null;
  itemNameAlt4?: string | null;
  itemPosName?: string | null;
  itemPosNameAlt?: string | null;
  itemPublicDisplayName?: string | null;
  itemPublicDisplayNameAlt?: string | null;
  itemPublicPrintedName?: string | null;
  itemPublicPrintedNameAlt?: string | null;
  remark?: string | null;
  remarkAlt?: string | null;
  imageFileName?: string | null;
  imageFileName2?: string | null;
  tableOrderingImageFileName?: string | null;
  categoryId: number;
  departmentId: number;
  subDepartmentId?: number | null;
  displayIndex: number;
  enabled: boolean;
  isItemShow: boolean;
  isPriceShow: boolean;
  hasModifier: boolean;
  autoRedirectToModifier: boolean;
  isModifier: boolean;
  modifierGroupHeaderId?: number | null;
  buttonStyleId?: number | null;
  isManualPrice: boolean;
  isManualName: boolean;
  isPromoItem: boolean;
  isModifierConcatToParent: boolean;
  isFollowSet: boolean;
  isFollowSetDynamic: boolean;
  isFollowSetStandard: boolean;
  isNonDiscountItem: boolean;
  isNonServiceChargeItem: boolean;
  isStandaloneAndSetItem?: boolean | null;
  isGroupRightItem: boolean;
  isPrintLabel: boolean;
  isPrintLabelTakeaway: boolean;
  isPriceInPercentage: boolean;
  isPointPaidItem?: boolean | null;
  isNoPointEarnItem?: boolean | null;
  isNonTaxableItem?: boolean | null;
  isItemShowInKitchenChecklist?: boolean | null;
  isSoldoutAutoLock?: boolean | null;
  isPrepaidRechargeItem?: boolean | null;
  isAutoLinkWithRawMaterial?: boolean | null;
  isDinein: boolean;
  isTakeaway: boolean;
  isDelivery: boolean;
  isKitchenPrintInRedColor?: boolean | null;
  isManualPriceGroup?: boolean | null;
  isExcludeLabelCount?: boolean | null;
  servingSize?: number | null;
  systemRemark?: string | null;
  isNonSalesItem?: boolean | null;
  productionSeconds?: number | null;
  parentItemId?: number | null;
  isComboRequired?: boolean | null;
}

export interface MenuItemListQuery {
  categoryId?: number;
  search?: string;
  includeDisabled?: boolean;
  hasModifier?: boolean;
  isPromoItem?: boolean;
  sortBy?: 'displayIndex' | 'name' | 'modified';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface CategoryItemCount {
  categoryId: number;
  itemCount: number;
}

export interface MenuItemListResponse {
  items: MenuItemSummary[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categoryCounts: CategoryItemCount[];
}

export interface MenuItemLookups {
  categories: ItemCategory[];
  buttonStyles: ButtonStyle[];
  departments: Department[];
  modifierGroups: ModifierGroupHeader[];
}
