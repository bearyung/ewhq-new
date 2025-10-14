import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAdjustments,
  IconAlertCircle,
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconCopy,
  IconGripVertical,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import type { MenuItemSummary } from '../../../../types/menuItem';
import type { ModifierGroupHeader } from '../../../../types/modifierGroup';
import menuItemService from '../../../../services/menuItemService';
import { CenterLoader } from './CenterLoader';
import type { ItemModifierMappings, UpdateItemModifierMappingsPayload } from '../../../../types/menuItem';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ManageItemModifiersModalProps {
  opened: boolean;
  onClose: () => void;
  brandId: number | null;
  item: MenuItemSummary | null;
  modifierGroups: ModifierGroupHeader[] | null;
  onSaved: (hasModifier: boolean) => void;
}

type ModifierContextKey = 'inStore' | 'online';

const CONTEXTS: Array<{
  key: ModifierContextKey;
  label: string;
  description: string;
  emptyMessage: string;
}> = [
  {
    key: 'inStore',
    label: 'In-store POS',
    description: 'Shown on traditional POS terminals and kitchen displays.',
    emptyMessage: 'No POS modifier groups are linked to this item.',
  },
  {
    key: 'online',
    label: 'Online ordering',
    description: 'Used for kiosk, QR ordering, and mobile experiences.',
    emptyMessage: 'No online modifier groups are linked to this item.',
  },
];

interface ModifierState {
  inStore: number[];
  online: number[];
}

const defaultState: ModifierState = {
  inStore: [],
  online: [],
};

const buildSortableId = (context: ModifierContextKey, id: number): string => `${context}:${id}`;

const parseSortableId = (value: UniqueIdentifier): { context: ModifierContextKey | null; id: number | null } => {
  const [context, id] = String(value).split(':');
  if ((context === 'inStore' || context === 'online') && id) {
    const numericId = Number(id);
    if (!Number.isNaN(numericId)) {
      return { context, id: numericId };
    }
  }
  return { context: null, id: null };
};

interface SortableSelectedEntryProps {
  context: ModifierContextKey;
  entryId: number;
  index: number;
  total: number;
  saving: boolean;
  group: ModifierGroupHeader | undefined;
  onMove: (context: ModifierContextKey, index: number, direction: number) => void;
  onRemove: (context: ModifierContextKey, groupId: number) => void;
}

const SortableSelectedEntry: FC<SortableSelectedEntryProps> = ({
  context,
  entryId,
  index,
  total,
  saving,
  group,
  onMove,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: buildSortableId(context, entryId), disabled: saving });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging ? 'var(--mantine-shadow-sm)' : undefined,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 2 : undefined,
  } as const;

  return (
    <Paper
      ref={setNodeRef}
      key={`${context}-selected-${entryId}`}
      p="xs"
      withBorder
      shadow="xs"
      style={{ backgroundColor: 'var(--mantine-color-gray-0)', ...style }}
    >
      <Group justify="space-between" align="center" gap="sm">
        <Group gap={8} align="center" wrap="nowrap">
          <Tooltip label="Drag to reorder" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
            >
              <IconGripVertical size={16} />
            </ActionIcon>
          </Tooltip>
          <Stack gap={2} style={{ flex: '1 1 auto' }}>
            <Text fw={600} size="sm">
              {group?.groupBatchName ?? `Group #${entryId}`}
            </Text>
            {group?.groupBatchNameAlt && (
              <Text size="xs" c="dimmed">
                {group.groupBatchNameAlt}
              </Text>
            )}
          </Stack>
        </Group>
        <Group gap={4} wrap="nowrap">
          <Tooltip label="Move up" withArrow>
            <ActionIcon
              variant="light"
              color="gray"
              disabled={index === 0 || saving}
              onClick={() => onMove(context, index, -1)}
            >
              <IconArrowUp size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Move down" withArrow>
            <ActionIcon
              variant="light"
              color="gray"
              disabled={index === total - 1 || saving}
              onClick={() => onMove(context, index, 1)}
            >
              <IconArrowDown size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Remove" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              disabled={saving}
              onClick={() => onRemove(context, entryId)}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
};

export const ManageItemModifiersModal: FC<ManageItemModifiersModalProps> = ({
  opened,
  onClose,
  brandId,
  item,
  modifierGroups,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<ModifierContextKey>('inStore');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ModifierState>(defaultState);
  const [search, setSearch] = useState<{ inStore: string; online: string }>({ inStore: '', online: '' });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const modifierLookup = useMemo(() => {
    const map = new Map<number, ModifierGroupHeader>();
    (modifierGroups ?? []).forEach((group) => map.set(group.groupHeaderId, group));
    return map;
  }, [modifierGroups]);

  const resetState = useCallback(() => {
    setState(defaultState);
    setSearch({ inStore: '', online: '' });
    setError(null);
    setActiveTab('inStore');
  }, []);

  useEffect(() => {
    if (!opened) {
      resetState();
      return;
    }

    if (!brandId || !item) {
      return;
    }

    setLoading(true);
    setError(null);

    menuItemService
      .getItemModifierMappings(brandId, item.itemId)
      .then((response: ItemModifierMappings) => {
        setState({
          inStore: [...response.inStore].sort((a, b) => a.sequence - b.sequence).map((mapping) => mapping.groupHeaderId),
          online: [...response.online].sort((a, b) => a.sequence - b.sequence).map((mapping) => mapping.groupHeaderId),
        });
        setActiveTab((current) => current ?? 'inStore');
      })
      .catch((err) => {
        console.error('Failed to load modifier mappings', err);
        setError('Unable to load modifier mappings. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [opened, brandId, item, resetState]);

  const handleClose = useCallback(() => {
    if (saving) return;
    onClose();
  }, [onClose, saving]);

  const toggleSelection = useCallback(
    (context: ModifierContextKey, groupId: number) => {
      setState((prev) => {
        const current = prev[context];
        const exists = current.includes(groupId);
        const nextContextState = exists ? current.filter((id) => id !== groupId) : [...current, groupId];
        return {
          ...prev,
          [context]: nextContextState,
        };
      });
    },
    [],
  );

  const moveSelection = useCallback((context: ModifierContextKey, index: number, direction: number) => {
    setState((prev) => {
      const items = [...prev[context]];
      const target = index + direction;
      if (target < 0 || target >= items.length) {
        return prev;
      }
      const [moved] = items.splice(index, 1);
      items.splice(target, 0, moved);
      return {
        ...prev,
        [context]: items,
      };
    });
  }, []);

  const removeSelection = useCallback((context: ModifierContextKey, groupId: number) => {
    setState((prev) => ({
      ...prev,
      [context]: prev[context].filter((id) => id !== groupId),
    }));
  }, []);

  const clearSelection = useCallback((context: ModifierContextKey) => {
    setState((prev) => ({
      ...prev,
      [context]: [],
    }));
  }, []);

  const copySelection = useCallback(
    (from: ModifierContextKey, to: ModifierContextKey) => {
      if (from === to) return;
      setState((prev) => ({
        ...prev,
        [to]: [...prev[from]],
      }));
      setActiveTab(to);
    },
    [],
  );

  const contextTotals = useMemo(
    () => ({
      inStore: state.inStore.length,
      online: state.online.length,
    }),
    [state],
  );

  const buildPayload = useCallback(
    (): UpdateItemModifierMappingsPayload => ({
      inStore: state.inStore.map((id, index) => ({
        groupHeaderId: id,
        sequence: index + 1,
      })),
      online: state.online.map((id, index) => ({
        groupHeaderId: id,
        sequence: index + 1,
      })),
    }),
    [state],
  );

  const handleSave = useCallback(async () => {
    if (!brandId || !item) return;
    setSaving(true);
    setError(null);

    const payload = buildPayload();

    try {
      const response = await menuItemService.updateItemModifierMappings(brandId, item.itemId, payload);
      notifications.show({
        title: 'Modifiers updated',
        message: 'Modifier groups have been updated successfully.',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      setState({
        inStore: [...response.inStore].sort((a, b) => a.sequence - b.sequence).map((mapping) => mapping.groupHeaderId),
        online: [...response.online].sort((a, b) => a.sequence - b.sequence).map((mapping) => mapping.groupHeaderId),
      });
      onSaved(response.inStore.length > 0 || response.online.length > 0);
      onClose();
    } catch (err) {
      console.error('Failed to update modifier mappings', err);
      setError('Unable to save modifier mappings. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [brandId, item, buildPayload, onSaved, onClose]);

  const renderAvailableList = (context: ModifierContextKey) => {
    const filter = search[context].trim().toLowerCase();
    const selectedIds = new Set(state[context]);

    const filtered = (modifierGroups ?? []).filter((group) => {
      if (!filter) return true;
      return (
        group.groupBatchName?.toLowerCase().includes(filter) ||
        group.groupBatchNameAlt?.toLowerCase().includes(filter) ||
        String(group.groupHeaderId).includes(filter)
      );
    });

    return (
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">
            Available groups
          </Text>
          <Badge variant="light" color="gray" size="sm">
            {filtered.length}
          </Badge>
        </Group>
        <ScrollArea h={240} type="auto" offsetScrollbars>
          <Stack gap={4}>
            {filtered.length === 0 ? (
              <Text size="sm" c="dimmed">
                No groups match your search.
              </Text>
            ) : (
              filtered.map((group) => {
                const selected = selectedIds.has(group.groupHeaderId);
                return (
                  <Paper
                    key={group.groupHeaderId}
                    withBorder
                    shadow="xs"
                    p="xs"
                    style={{
                      borderColor: selected ? 'var(--mantine-color-indigo-4)' : undefined,
                      backgroundColor: selected ? 'var(--mantine-color-indigo-0)' : undefined,
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleSelection(context, group.groupHeaderId)}
                  >
                    <Group justify="space-between" align="center">
                      <Stack gap={2}>
                        <Group gap={6} align="center">
                          <Text fw={500} size="sm">
                            {group.groupBatchName}
                          </Text>
                          {!group.enabled && (
                            <Badge size="xs" color="gray" variant="light">
                              disabled
                            </Badge>
                          )}
                        </Group>
                        {group.groupBatchNameAlt && (
                          <Text size="xs" c="dimmed">
                            {group.groupBatchNameAlt}
                          </Text>
                        )}
                      </Stack>
                      <ActionIcon
                        variant={selected ? 'filled' : 'light'}
                        color={selected ? 'indigo' : 'gray'}
                        size="sm"
                        aria-label={selected ? 'Remove group' : 'Add group'}
                      >
                        {selected ? <IconCheck size={14} /> : <IconAdjustments size={14} />}
                      </ActionIcon>
                    </Group>
                  </Paper>
                );
              })
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    );
  };

  const renderSelectedList = (context: ModifierContextKey) => {
    const entries = state[context].map((id) => ({
      id,
      group: modifierLookup.get(id),
    }));

    const dragEndHandler = handleSelectedDragEnd(context);
    const sortableItems = entries.map((entry) => buildSortableId(context, entry.id));

    return (
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Group gap={6} align="center">
            <Text fw={600} size="sm">
              Selected order
            </Text>
            <Badge variant="light" size="sm">
              {entries.length}
            </Badge>
          </Group>
          <Group gap={4}>
            <Tooltip label="Copy from the other tab" withArrow>
              <ActionIcon
                variant="subtle"
                color="indigo"
                disabled={
                  (context === 'inStore' ? state.online.length === 0 : state.inStore.length === 0) || saving
                }
                onClick={() => copySelection(context === 'inStore' ? 'online' : 'inStore', context)}
              >
                <IconCopy size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Remove all" withArrow>
              <ActionIcon
                variant="subtle"
                color="red"
                disabled={entries.length === 0 || saving}
                onClick={() => clearSelection(context)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={dragEndHandler}
        >
          <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
            <Stack gap={6}>
              {entries.length === 0 ? (
                <Text size="sm" c="dimmed">
                  {CONTEXTS.find((c) => c.key === context)?.emptyMessage ??
                    'No modifier groups are linked in this context.'}
                </Text>
              ) : (
                entries.map((entry, index) => (
                  <SortableSelectedEntry
                    key={`${context}-selected-${entry.id}`}
                    context={context}
                    entryId={entry.id}
                    index={index}
                    total={entries.length}
                    saving={saving}
                    group={entry.group}
                    onMove={moveSelection}
                    onRemove={removeSelection}
                  />
                ))
              )}
            </Stack>
          </SortableContext>
        </DndContext>
      </Stack>
    );
  };

  const handleSelectedDragEnd = useCallback(
    (context: ModifierContextKey) =>
      (event: DragEndEvent) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) {
          return;
        }

        const activeMeta = parseSortableId(active.id);
        const overMeta = parseSortableId(over.id);

        if (activeMeta.context !== context || overMeta.context !== context || activeMeta.id === null || overMeta.id === null) {
          return;
        }

        setState((prev) => {
          const items = [...prev[context]];
          const oldIndex = items.indexOf(activeMeta.id!);
          const newIndex = items.indexOf(overMeta.id!);

          if (oldIndex === -1 || newIndex === -1) {
            return prev;
          }

          const reordered = arrayMove(items, oldIndex, newIndex);
          return {
            ...prev,
            [context]: reordered,
          };
        });
      },
    [],
  );

  const renderContext = (context: ModifierContextKey) => (
    <Group align="flex-start" gap="xl" wrap="wrap">
      <Stack gap="sm" style={{ flex: '1 1 280px' }}>
        <TextInput
          placeholder="Search modifier groups"
          value={search[context]}
          onChange={(event) => setSearch((prev) => ({ ...prev, [context]: event.currentTarget.value }))}
          leftSection={<IconSearch size={14} />}
        />
        {renderAvailableList(context)}
      </Stack>
      <Stack gap="sm" style={{ flex: '1 1 280px' }}>
        {renderSelectedList(context)}
      </Stack>
    </Group>
  );

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="xl"
      title={
        <Stack gap={4}>
          <Text fw={600}>Manage modifiers</Text>
          {item && (
            <Text size="sm" c="dimmed">
              {item.itemName ?? item.itemCode}
            </Text>
          )}
        </Stack>
      }
      overlayProps={{ opacity: 0.15 }}
      centered
    >
      {loading ? (
        <CenterLoader message="Loading modifier mappings" />
      ) : (
        <Stack gap="lg">
          {error && (
            <Paper withBorder p="sm" radius="md" color="red">
              <Group gap="sm" align="flex-start">
                <IconAlertCircle size={18} color="var(--mantine-color-red-6)" />
                <Text size="sm" c="var(--mantine-color-red-6)">
                  {error}
                </Text>
              </Group>
            </Paper>
          )}
          <Tabs
            value={activeTab}
            onChange={(value) => {
              if (value === 'inStore' || value === 'online') {
                setActiveTab(value);
              }
            }}
          >
            <Tabs.List>
              {CONTEXTS.map((context) => (
                <Tabs.Tab
                  key={context.key}
                  value={context.key}
                  rightSection={
                    contextTotals[context.key] > 0 ? (
                      <Badge size="xs" variant="filled" color="indigo">
                        {contextTotals[context.key]}
                      </Badge>
                    ) : undefined
                  }
                >
                  {context.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            {CONTEXTS.map((context) => (
              <Tabs.Panel key={context.key} value={context.key} mt="md">
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    {context.description}
                  </Text>
                  {renderContext(context.key)}
                </Stack>
              </Tabs.Panel>
            ))}
          </Tabs>
          <Group justify="space-between">
            <Button variant="subtle" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!brandId || !item || (modifierGroups ?? []).length === 0}
            >
              Save changes
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};
