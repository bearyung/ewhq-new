import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FC } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  Divider,
  Flex,
  Group,
  Loader,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconArrowsSort,
} from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';

import smartCategoryService from '../../../../services/smartCategoryService';
import menuItemService from '../../../../services/menuItemService';
import { useBrands } from '../../../../contexts/BrandContext';
import type { SmartCategoryItemAssignment, SmartCategoryItemAssignmentEntry } from '../../../../types/smartCategory';
import type { MenuItemSummary } from '../../../../types/menuItem';
import type { ItemCategory } from '../../../../types/itemCategory';
import { SmartCategoryItemsReorderModal } from './SmartCategoryItemsReorderModal';
import { DataTable } from '../../../../components/DataTable';

interface ItemsTabProps {
  smartCategoryId: number;
  categoryName: string;
  initialItems: SmartCategoryItemAssignment[];
  onReload: () => void;
}

export const SmartCategoryItemsTab: FC<ItemsTabProps> = ({ smartCategoryId, categoryName, initialItems, onReload }) => {
  const { selectedBrand } = useBrands();
  const brandId = selectedBrand ? parseInt(selectedBrand, 10) : null;

  const [items, setItems] = useState<SmartCategoryItemAssignment[]>(initialItems);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setItems(initialItems.slice().sort((a, b) => a.displayIndex - b.displayIndex));
  }, [initialItems]);

  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
  const [reorderModalOpened, { open: openReorderModal, close: closeReorderModal }] = useDisclosure(false);

  const handleSaveOrder = async (orderedItems: SmartCategoryItemAssignment[]) => {
    if (!brandId) return;
    setIsSaving(true);

    try {
      const payload: SmartCategoryItemAssignmentEntry[] = orderedItems.map((item, index) => ({
        itemId: item.itemId,
        displayIndex: index + 1,
        enabled: item.enabled,
      }));

      await smartCategoryService.upsertItems(brandId, smartCategoryId, { items: payload });
      
      notifications.show({
        color: 'green',
        title: 'Order saved',
        message: 'Item order has been updated.',
      });
      closeReorderModal();
      onReload();
    } catch (error) {
      console.error(error);
      notifications.show({
        color: 'red',
        title: 'Save failed',
        message: 'Could not save item order.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveItem = useCallback(async (itemId: number) => {
      if (!brandId) return;
      
      const confirm = window.confirm('Are you sure you want to remove this item from the smart category?');
      if (!confirm) return;

      setIsSaving(true);
      try {
          const remainingItems = items.filter(i => i.itemId !== itemId);
          const payload: SmartCategoryItemAssignmentEntry[] = remainingItems.map((item, index) => ({
              itemId: item.itemId,
              displayIndex: index + 1,
              enabled: item.enabled,
          }));

          await smartCategoryService.upsertItems(brandId, smartCategoryId, { items: payload });
          notifications.show({ color: 'green', message: 'Item removed.' });
          onReload();
      } catch(error) {
          console.error(error);
          notifications.show({ color: 'red', title: 'Error', message: 'Could not remove item.' });
      } finally {
          setIsSaving(false);
      }
  }, [brandId, items, smartCategoryId, onReload]);

  const columns = useMemo<ColumnDef<SmartCategoryItemAssignment>[]>(
    () => [
      {
        accessorKey: 'displayIndex',
        header: 'Display Index',
        size: 120,
        cell: ({ row }) => <Text size="sm">{row.original.displayIndex}</Text>,
      },
      {
        accessorKey: 'itemCode',
        header: 'Code',
        size: 100,
        cell: ({ row }) => (
          <Text size="sm" fw={500}>
            {row.original.itemCode}
          </Text>
        ),
      },
      {
        accessorKey: 'itemName',
        header: 'Item Name',
        size: 250,
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text size="sm" fw={600} truncate>
              {row.original.itemName || 'Untitled Item'}
            </Text>
            {row.original.itemNameAlt && (
              <Text size="xs" c="dimmed" truncate>
                {row.original.itemNameAlt}
              </Text>
            )}
          </Stack>
        ),
      },
      {
        accessorKey: 'enabled',
        header: 'Enabled',
        size: 100,
        cell: ({ row }) => (
          <Badge variant="light" color={row.original.enabled ? 'green' : 'gray'} size="sm">
            {row.original.enabled ? 'Yes' : 'No'}
          </Badge>
        ),
      },
      {
        accessorKey: 'modifiedDate',
        header: 'Last Updated',
        size: 200,
        cell: ({ row }) => {
            const date = row.original.modifiedDate ? new Date(row.original.modifiedDate).toLocaleString() : '—';
            const by = row.original.modifiedBy || 'Unknown';
            return (
                <Stack gap={0}>
                    <Text size="sm">{date}</Text>
                    <Text size="xs" c="dimmed">by {by}</Text>
                </Stack>
            );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 80,
        enableSorting: false,
        cell: ({ row }) => (
          <Group justify="flex-end">
            <Tooltip label="Remove item">
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => handleRemoveItem(row.original.itemId)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      },
    ],
    [handleRemoveItem]
  );

  return (
    <Flex direction="column" gap="sm" style={{ flex: 1, minHeight: 0 }}>
      <Group justify="space-between">
        <Group gap="sm">
          <Button leftSection={<IconPlus size={16} />} variant="light" onClick={openAddModal} disabled={isSaving}>
            Add items
          </Button>
          <Button 
            leftSection={<IconArrowsSort size={16} />} 
            variant="light" 
            onClick={openReorderModal} 
            disabled={isSaving || items.length === 0}
          >
            Reorder items
          </Button>
        </Group>
        <Tooltip label="Refresh items">
          <ActionIcon variant="subtle" onClick={onReload} disabled={isSaving}>
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Divider />
      
      <Box style={{ flex: 1, minHeight: 0 }}>
        <DataTable
            data={items}
            columns={columns}
            emptyMessage="No items assigned to this category."
            enableSearch
            searchPlaceholder="Search assigned items..."
            manualPagination={false} // Client-side pagination
            pageSize={100} // Show many items by default since we have them all
        />
      </Box>

      <AddItemsModal 
        opened={addModalOpened} 
        onClose={closeAddModal} 
        existingItemIds={new Set(items.map(i => i.itemId))}
        smartCategoryId={smartCategoryId}
        currentItems={items}
        onSuccess={() => {
            closeAddModal();
            onReload();
        }}
      />

      <SmartCategoryItemsReorderModal
        opened={reorderModalOpened}
        onClose={closeReorderModal}
        categoryName={categoryName}
        items={items}
        loading={false}
        saving={isSaving}
        onSave={handleSaveOrder}
      />
    </Flex>
  );
};

interface AddItemsModalProps {
    opened: boolean;
    onClose: () => void;
    existingItemIds: Set<number>;
    smartCategoryId: number;
    currentItems: SmartCategoryItemAssignment[];
    onSuccess: () => void;
}

const AddItemsModal: FC<AddItemsModalProps> = ({ 
    opened, 
    onClose, 
    existingItemIds, 
    smartCategoryId,
    currentItems,
    onSuccess 
}) => {
    const { selectedBrand } = useBrands();
    const brandId = selectedBrand ? parseInt(selectedBrand, 10) : null;

    const [search, setSearch] = useState('');
    const [items, setItems] = useState<MenuItemSummary[]>([]);
    const [categories, setCategories] = useState<ItemCategory[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [submitting, setSubmitting] = useState(false);

    // Load items when modal opens
    useEffect(() => {
        if (opened && brandId) {
            loadItems();
            setSelectedIds(new Set()); // Reset selection on open
            setSearch('');
            setCategoryFilter(null);
        }
    }, [opened, brandId]);

    const loadItems = async () => {
        if (!brandId) return;
        setLoading(true);
        try {
            // Fetch all items (pagination might be needed for huge menus, but starting with 200 limit or searching)
            // The existing endpoint supports search. For now, let's fetch a reasonable batch or default.
            // Since we want "Add Items" to potentially show everything, we might need a "Load More" or search-driven.
            // For now, let's fetch page 1 with a large size to see what we get.
            const [itemsResponse, lookupsResponse] = await Promise.all([
              menuItemService.getMenuItems(brandId, { 
                  pageSize: 1000, // Attempt to get many
                  includeDisabled: true 
              }),
              menuItemService.getLookups(brandId)
            ]);
            
            setItems(itemsResponse.items);
            setCategories(lookupsResponse.categories);
        } catch (error) {
            console.error(error);
            notifications.show({ color: 'red', message: 'Failed to load menu items.' });
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = useMemo(() => {
        let filtered = items;
        if (search) {
            const term = search.toLowerCase();
            filtered = filtered.filter(i => 
                (i.itemName || '').toLowerCase().includes(term) ||
                (i.itemCode || '').toLowerCase().includes(term)
            );
        }
        if (categoryFilter) {
            filtered = filtered.filter(i => String(i.categoryId) === categoryFilter);
        }
        // Filter out already assigned items? Or show them disabled?
        // User requirement: "Select from existing items"
        // Usually better to hide already assigned ones to avoid confusion, or show disabled.
        return filtered.filter(i => !existingItemIds.has(i.itemId));
    }, [items, search, categoryFilter, existingItemIds]);

    const handleToggle = (itemId: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) next.delete(itemId);
            else next.add(itemId);
            return next;
        });
    };

    const handleSubmit = async () => {
        if (!brandId) return;
        setSubmitting(true);
        try {
            const newItems = items.filter(i => selectedIds.has(i.itemId));
            
            // Calculate new indices starting after the last existing item
            const maxIndex = currentItems.length > 0 
                ? Math.max(...currentItems.map(i => i.displayIndex)) 
                : 0;

            const newAssignments: SmartCategoryItemAssignmentEntry[] = newItems.map((item, index) => ({
                itemId: item.itemId,
                displayIndex: maxIndex + index + 1,
                enabled: true // Default to enabled
            }));

            // Merge with existing items
            const existingAssignments: SmartCategoryItemAssignmentEntry[] = currentItems.map(i => ({
                itemId: i.itemId,
                displayIndex: i.displayIndex,
                enabled: i.enabled
            }));

            const payload = [...existingAssignments, ...newAssignments];

            await smartCategoryService.upsertItems(brandId, smartCategoryId, { items: payload });
            
            notifications.show({ color: 'green', message: `${newItems.length} items added.` });
            onSuccess();
        } catch (error) {
            console.error(error);
            notifications.show({ color: 'red', message: 'Failed to add items.' });
        } finally {
            setSubmitting(false);
        }
    };

    const categoryOptions = useMemo(() => 
        categories.map(c => ({ value: String(c.categoryId), label: c.categoryName })),
        [categories]
    );

    return (
        <Modal opened={opened} onClose={onClose} title="Add items to smart category" size="lg">
            <Stack gap="md" style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
                <Group grow>
                  <TextInput
                      placeholder="Search by name or code..."
                      leftSection={<IconSearch size={16} />}
                      value={search}
                      onChange={(e) => setSearch(e.currentTarget.value)}
                  />
                  <Select
                    placeholder="Filter by category"
                    data={categoryOptions}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    searchable
                    clearable
                  />
                </Group>
                
                <Box style={{ flex: 1, minHeight: 0, border: '1px solid var(--mantine-color-gray-3)', borderRadius: 4 }}>
                    {loading ? (
                        <Center h="100%"><Loader /></Center>
                    ) : (
                        <ScrollArea h="100%">
                            <Stack gap={0}>
                                {filteredItems.length === 0 ? (
                                    <Center p="xl">
                                        <Text c="dimmed">No matching items found.</Text>
                                    </Center>
                                ) : (
                                    filteredItems.map(item => (
                                        <Box 
                                            key={item.itemId} 
                                            p="sm"
                                            style={{ 
                                                borderBottom: '1px solid var(--mantine-color-gray-2)',
                                                cursor: 'pointer',
                                                backgroundColor: selectedIds.has(item.itemId) ? 'var(--mantine-color-blue-0)' : undefined
                                            }}
                                            onClick={() => handleToggle(item.itemId)}
                                        >
                                            <Group>
                                                <Checkbox 
                                                    checked={selectedIds.has(item.itemId)} 
                                                    readOnly
                                                    style={{ pointerEvents: 'none' }} 
                                                />
                                                <Stack gap={2}>
                                                    <Text size="sm" fw={500}>{item.itemName}</Text>
                                                    <Text size="xs" c="dimmed">{item.itemCode}</Text>
                                                </Stack>
                                            </Group>
                                        </Box>
                                    ))
                                )}
                            </Stack>
                        </ScrollArea>
                    )}
                </Box>

                <Group justify="space-between">
                    <Text size="sm" c="dimmed">{selectedIds.size} items selected</Text>
                    <Group>
                        <Button variant="default" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={submitting} disabled={selectedIds.size === 0}>
                            Add Selected
                        </Button>
                    </Group>
                </Group>
            </Stack>
        </Modal>
    );
};