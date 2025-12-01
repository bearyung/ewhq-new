import { useState, useEffect, useMemo } from 'react';
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
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconDeviceFloppy,
  IconDragDrop,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragEndEvent, DropAnimation } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import smartCategoryService from '../../../../services/smartCategoryService';
import menuItemService from '../../../../services/menuItemService';
import { useBrands } from '../../../../contexts/BrandContext';
import type { SmartCategoryItemAssignment, SmartCategoryItemAssignmentEntry } from '../../../../types/smartCategory';
import type { MenuItemSummary } from '../../../../types/menuItem';

interface ItemsTabProps {
  smartCategoryId: number;
  initialItems: SmartCategoryItemAssignment[];
  onReload: () => void;
}

const FALLBACK_ITEM_MODIFIER = 'Unknown';

export const SmartCategoryItemsTab: FC<ItemsTabProps> = ({ smartCategoryId, initialItems, onReload }) => {
  const { selectedBrand } = useBrands();
  const brandId = selectedBrand ? parseInt(selectedBrand, 10) : null;

  // Local state for items to handle reordering optimistically
  const [items, setItems] = useState<SmartCategoryItemAssignment[]>(initialItems);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when initialItems changes (e.g. after reload)
  useEffect(() => {
    setItems(initialItems.slice().sort((a, b) => a.displayIndex - b.displayIndex));
    setIsDirty(false);
  }, [initialItems]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeId, setActiveId] = useState<number | null>(null);

  const handleDragStart = (event: { active: { id: number | string } }) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.itemId === Number(active.id));
        const newIndex = currentItems.findIndex((item) => item.itemId === Number(over?.id));
        
        const newOrder = arrayMove(currentItems, oldIndex, newIndex);
        // Re-index immediately for UI consistency, but real save happens on "Save Order"
        const reIndexed = newOrder.map((item, index) => ({
            ...item,
            displayIndex: index + 1
        }));
        return reIndexed;
      });
      setIsDirty(true);
    }

    setActiveId(null);
  };

  const handleSaveOrder = async () => {
    if (!brandId) return;
    setIsSaving(true);

    try {
      const payload: SmartCategoryItemAssignmentEntry[] = items.map((item, index) => ({
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
      onReload(); // Reload to get fresh data
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

  const handleRemoveItem = async (itemId: number) => {
      if (!brandId) return;
      // Optimistic remove from UI or wait for confirm?
      // Standard: Confirm then save.
      // Here we can just remove from the list and require a "Save" or do it immediately.
      // Let's do immediate save for "Remove" to be consistent with "Add".
      
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
  };

  // Add Items Modal State
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <Flex direction="column" gap="sm" style={{ flex: 1, minHeight: 0 }}>
      <Group justify="space-between">
        <Group gap="sm">
          <Button leftSection={<IconPlus size={16} />} variant="light" onClick={openAddModal} disabled={isSaving}>
            Add items
          </Button>
          {isDirty && (
             <Button 
                leftSection={<IconDeviceFloppy size={16} />} 
                color="indigo" 
                onClick={handleSaveOrder} 
                loading={isSaving}
             >
                Save Order
             </Button>
          )}
        </Group>
        <Tooltip label="Refresh items">
          <ActionIcon variant="subtle" onClick={onReload} disabled={isSaving}>
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Divider />
      
      {items.length === 0 ? (
        <Center style={{ flex: 1 }}>
          <Stack gap="xs" align="center">
            <Text fw={600}>No items assigned yet</Text>
            <Text size="sm" c="dimmed">
              Use the "Add items" button to include menu items in this smart category.
            </Text>
          </Stack>
        </Center>
      ) : (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                <SortableContext 
                    items={items.map(i => i.itemId)}
                    strategy={verticalListSortingStrategy}
                >
                    <Stack component="ul" gap="xs" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {items.map((item) => (
                        <SortableItem 
                            key={item.itemId} 
                            item={item} 
                            onRemove={() => handleRemoveItem(item.itemId)}
                        />
                    ))}
                    </Stack>
                </SortableContext>
            </ScrollArea>
            <DragOverlay dropAnimation={dropAnimation}>
                {activeId ? (
                    <ItemRow item={items.find(i => i.itemId === activeId)!} isOverlay />
                ) : null}
            </DragOverlay>
        </DndContext>
      )}

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
    </Flex>
  );
};

interface SortableItemProps {
    item: SmartCategoryItemAssignment;
    onRemove: () => void;
}

const SortableItem: FC<SortableItemProps> = ({ item, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.itemId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative' as const,
    };

    return (
        <Box ref={setNodeRef} style={style} {...attributes}>
            <ItemRow item={item} dragHandleProps={listeners} onRemove={onRemove} />
        </Box>
    );
};

interface ItemRowProps {
    item: SmartCategoryItemAssignment;
    dragHandleProps?: any;
    onRemove?: () => void;
    isOverlay?: boolean;
}

const ItemRow: FC<ItemRowProps> = ({ item, dragHandleProps, onRemove, isOverlay }) => {
    const modifiedByRaw = item.modifiedBy ? item.modifiedBy.trim() : '';
    const modifiedByDisplay = modifiedByRaw || FALLBACK_ITEM_MODIFIER;
    const modifiedAtDisplay = item.modifiedDate ? new Date(item.modifiedDate).toLocaleString() : '—';

    return (
        <Box
            component="li"
            px="md"
            py="sm"
            style={{
                borderRadius: 10,
                border: '1px solid var(--mantine-color-gray-3)',
                backgroundColor: isOverlay ? 'var(--mantine-color-white)' : 'var(--mantine-color-gray-0)',
                boxShadow: isOverlay ? '0px 4px 12px rgba(0,0,0,0.1)' : 'none',
                cursor: isOverlay ? 'grabbing' : 'default',
            }}
        >
            <Group justify="space-between" align="center">
                <Group gap="sm" style={{ flex: 1 }}>
                    <ActionIcon 
                        variant="subtle" 
                        color="gray" 
                        style={{ cursor: 'grab' }}
                        {...dragHandleProps}
                    >
                        <IconDragDrop size={18} />
                    </ActionIcon>
                    <Stack gap={4}>
                        <Group gap="xs" align="center">
                            <Badge size="sm" variant="light" color="indigo">
                                #{item.displayIndex}
                            </Badge>
                            <Text fw={600} size="sm">
                                {item.itemName || 'Untitled item'}
                            </Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                            Code: {item.itemCode}
                        </Text>
                    </Stack>
                </Group>
                
                <Group gap="md">
                    <Stack gap={4} align="flex-end" visibleFrom="xs">
                        <Badge color={item.enabled ? 'teal' : 'gray'} variant="light">
                            {item.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Text size="xs" c="dimmed">
                            {modifiedByDisplay} · {modifiedAtDisplay}
                        </Text>
                    </Stack>
                    {!isOverlay && onRemove && (
                        <ActionIcon 
                            color="red" 
                            variant="subtle" 
                            onClick={onRemove}
                            aria-label="Remove item"
                        >
                            <IconTrash size={18} />
                        </ActionIcon>
                    )}
                </Group>
            </Group>
        </Box>
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
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [submitting, setSubmitting] = useState(false);

    // Load items when modal opens
    useEffect(() => {
        if (opened && brandId) {
            loadItems();
            setSelectedIds(new Set()); // Reset selection on open
            setSearch('');
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
            const response = await menuItemService.getMenuItems(brandId, { 
                pageSize: 1000, // Attempt to get many
                includeDisabled: true 
            });
            setItems(response.items);
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
        // Filter out already assigned items? Or show them disabled?
        // User requirement: "Select from existing items"
        // Usually better to hide already assigned ones to avoid confusion, or show disabled.
        return filtered.filter(i => !existingItemIds.has(i.itemId));
    }, [items, search, existingItemIds]);

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

    return (
        <Modal opened={opened} onClose={onClose} title="Add items to smart category" size="lg">
            <Stack gap="md" style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
                <TextInput
                    placeholder="Search by name or code..."
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                />
                
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
