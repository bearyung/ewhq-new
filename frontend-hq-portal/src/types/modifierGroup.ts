export interface ModifierGroupHeader {
  groupHeaderId: number;
  accountId: number;
  groupBatchName: string;
  groupBatchNameAlt?: string;
  enabled: boolean;
  isFollowSet: boolean;
}

export interface ModifierGroupPreviewItem {
  itemId: number;
  itemCode: string;
  itemName?: string | null;
  enabled: boolean;
  displayIndex: number;
}

export interface ModifierGroupPreview {
  groupHeaderId: number;
  groupBatchName: string;
  items: ModifierGroupPreviewItem[];
}
