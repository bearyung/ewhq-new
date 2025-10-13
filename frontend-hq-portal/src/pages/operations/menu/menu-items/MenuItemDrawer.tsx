import type { FC } from 'react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Divider,
  Drawer,
  Group,
  Loader,
  NumberInput,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconAdjustments, IconCheck, IconChevronRight, IconX } from '@tabler/icons-react';
import { CenterLoader } from './CenterLoader';
import { formatDateTime } from './menuItemsUtils';
import type {
  MenuItemDetail,
  MenuItemLookups,
  MenuItemUpsertPayload,
} from '../../../../types/menuItem';

type PriceEditState = Record<number, { price: number | null; enabled: boolean }>;
type AvailabilityEditState = Record<
  number,
  { enabled: boolean | null; isOutOfStock: boolean | null; isLimitedItem: boolean | null }
>;

interface MenuItemDrawerProps {
  opened: boolean;
  title: string;
  saving: boolean;
  detailLoading: boolean;
  formData: MenuItemUpsertPayload | null;
  lookups: MenuItemLookups | null;
  activeTab: string;
  onTabChange: (value: string) => void;
  onClose: () => void;
  onCancel: () => void;
  drawerMode: 'create' | 'edit';
  updateForm: <K extends keyof MenuItemUpsertPayload>(key: K, value: MenuItemUpsertPayload[K]) => void;
  selectedDetail: MenuItemDetail | null;
  priceEdits: PriceEditState;
  availabilityEdits: AvailabilityEditState;
  updatePriceEdit: (shopId: number, changes: Partial<{ price: number | null; enabled: boolean }>) => void;
  updateAvailabilityEdit: (
    shopId: number,
    changes: Partial<{ enabled: boolean | null; isOutOfStock: boolean | null; isLimitedItem: boolean | null }>,
  ) => void;
  handleSavePrice: (shopId: number) => void;
  handleSaveAvailability: (shopId: number) => void;
  priceSavingShopId: number | null;
  availabilitySavingShopId: number | null;
  onSubmit: () => void;
  onManageModifiers?: () => void;
}

export const MenuItemDrawer: FC<MenuItemDrawerProps> = ({
  opened,
  title,
  saving,
  detailLoading,
  formData,
  lookups,
  activeTab,
  onTabChange,
  onClose,
  onCancel,
  drawerMode,
  updateForm,
  selectedDetail,
  priceEdits,
  availabilityEdits,
  updatePriceEdit,
  updateAvailabilityEdit,
  handleSavePrice,
  handleSaveAvailability,
  priceSavingShopId,
  availabilitySavingShopId,
  onSubmit,
  onManageModifiers,
}) => {
  const canManageModifiers = drawerMode === 'edit' && Boolean(onManageModifiers);

  return (
    <Drawer opened={opened} onClose={onClose} position="right" size="lg" title={title} overlayProps={{ opacity: 0.15 }}>
    {detailLoading ? (
      <CenterLoader message="Loading item" />
    ) : formData ? (
      <Stack gap="lg">
        <Tabs value={activeTab} onChange={(value) => value && onTabChange(value)}>
          <Tabs.List>
            <Tabs.Tab value="basics" leftSection={<IconChevronRight size={14} />}>
              Basics
            </Tabs.Tab>
            <Tabs.Tab value="display" leftSection={<IconChevronRight size={14} />}>
              Display
            </Tabs.Tab>
            <Tabs.Tab value="availability" leftSection={<IconChevronRight size={14} />}>
              Availability
            </Tabs.Tab>
            <Tabs.Tab value="advanced" leftSection={<IconChevronRight size={14} />}>
              Advanced
            </Tabs.Tab>
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
              </Group>
              <Group>
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
              <Stack gap="xs">
                <Group justify="space-between" align="center" gap="sm">
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Text fw={600} size="sm">
                      Linked modifier groups
                    </Text>
                    <Text size="xs" c="dimmed">
                      Manage linked groups in the dedicated modifiers workspace.
                    </Text>
                  </Stack>
                  {canManageModifiers ? (
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconAdjustments size={14} />}
                      onClick={onManageModifiers}
                    >
                      Manage modifiers
                    </Button>
                  ) : (
                    <Tooltip label="Save the item before linking modifiers" withArrow>
                      <Button size="xs" variant="light" leftSection={<IconAdjustments size={14} />} disabled>
                        Manage modifiers
                      </Button>
                    </Tooltip>
                  )}
                </Group>
                <Group gap="sm" align="center">
                  <Badge color={formData.hasModifier ? 'indigo' : 'gray'} variant="light">
                    {formData.hasModifier ? 'Modifiers linked' : 'No modifiers linked'}
                  </Badge>
                  <Tooltip label="Automatically open the modifier screen after the item is added" withArrow>
                    <Switch
                      label="Auto open modifier screen"
                      checked={formData.autoRedirectToModifier}
                      onChange={(event) => updateForm('autoRedirectToModifier', event.currentTarget.checked)}
                      disabled={!formData.hasModifier}
                    />
                  </Tooltip>
                </Group>
              </Stack>
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
                                        updatePriceEdit(price.shopId, { price: normalised });
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
                                      <Tooltip label={`Updated by ${price.modifiedBy ?? 'unknown user'}`} withArrow>
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
                                      leftSection={
                                        priceSavingShopId === price.shopId ? undefined : <IconCheck size={14} />
                                      }
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
                                      <Tooltip label={`Updated by ${record.updatedBy ?? 'unknown user'}`} withArrow>
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
                                      leftSection={
                                        availabilitySavingShopId === record.shopId ? undefined : (
                                          <IconCheck size={14} />
                                        )
                                      }
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
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            leftSection={saving ? <Loader size="xs" /> : <IconCheck size={16} />}
            onClick={onSubmit}
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
  );
};
