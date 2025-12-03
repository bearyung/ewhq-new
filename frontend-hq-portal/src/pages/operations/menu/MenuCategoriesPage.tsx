import { useState, useEffect, useMemo } from 'react';
import type { FC } from 'react';
import {
  Box,
  Paper,
  Group,
  Button,
  TextInput,
  Modal,
  Stack,
  Table,
  Text,
  Alert,
  Container,
  ActionIcon,
  Badge,
  Loader,
  Center,
  Switch,
  Tabs,
  Select,
  Tooltip
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconDownload,
  IconChevronUp,
  IconChevronDown,
  IconChevronRight,
  IconSearch,
  IconList,
  IconHierarchy,
  IconGripVertical,
  IconDeviceFloppy,
  IconRotateClockwise2
} from '@tabler/icons-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AutoBreadcrumb } from '../../../components/AutoBreadcrumb';
import { ScrollingHeader } from '../../../components/ScrollingHeader';
import { useBrands } from '../../../contexts/BrandContext';
import itemCategoryService from '../../../services/itemCategoryService';
import buttonStyleService from '../../../services/buttonStyleService';
import type { ItemCategory, CreateItemCategory, UpdateItemCategory } from '../../../types/itemCategory';
import type { ButtonStyle } from '../../../types/buttonStyle';

interface CategoryTreeNode extends ItemCategory {
  children: CategoryTreeNode[];
  level: number;
}

// Sortable row component for drag and drop
interface SortableRowProps {
  category: CategoryTreeNode;
  expandedCategories: Set<number>;
  toggleExpand: (id: number) => void;
  onEdit: (category: ItemCategory) => void;
  onDelete: (category: ItemCategory) => void;
  onAddChild: (category: ItemCategory) => void;
  getButtonStyleById: (buttonStyleId?: number) => ButtonStyle | undefined;
  getButtonStyleColor: (style: ButtonStyle) => string;
}

const SortableRow: FC<SortableRowProps> = ({
  category,
  expandedCategories,
  toggleExpand,
  onEdit,
  onDelete,
  onAddChild,
  getButtonStyleById,
  getButtonStyleColor
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: category.categoryId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
    backgroundColor: isSortableDragging ? '#f0f0f0' : 'white',
  };

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      <Table.Td style={{ width: '40px', padding: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            {...attributes}
            {...listeners}
            style={{
              cursor: 'grab',
              touchAction: 'none',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <IconGripVertical size={16} style={{ color: '#868e96' }} />
          </div>
        </div>
      </Table.Td>
      <Table.Td style={{ width: '50px' }}>
        {category.children.length > 0 && (
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => toggleExpand(category.categoryId)}
          >
            {expandedCategories.has(category.categoryId) ? (
              <IconChevronDown size={16} />
            ) : (
              <IconChevronRight size={16} />
            )}
          </ActionIcon>
        )}
      </Table.Td>
      <Table.Td>{category.categoryId}</Table.Td>
      <Table.Td>
        <Box style={{ paddingLeft: `${category.level * 24}px` }}>
          <Text fw={500} size="sm">
            {category.categoryName}
          </Text>
          {category.categoryNameAlt && (
            <Text size="xs" c="dimmed">
              {category.categoryNameAlt}
            </Text>
          )}
        </Box>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color="blue">
          {category.displayIndex}
        </Badge>
      </Table.Td>
      <Table.Td>
        {(() => {
          const style = getButtonStyleById(category.buttonStyleId);
          if (!style) {
            return (
              <Box
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: '#E0E0E0',
                  border: '1px dashed #999'
                }}
                title="No style"
              />
            );
          }
          return (
            <Box
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                backgroundColor: getButtonStyleColor(style),
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
              title={style.styleName}
            />
          );
        })()}
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={category.isPublicDisplay ? 'green' : 'gray'}
        >
          {category.isPublicDisplay ? 'Visible' : 'Hidden'}
        </Badge>
      </Table.Td>
      <Table.Td
        style={{
          position: 'sticky',
          right: 0,
          backgroundColor: 'white',
          boxShadow: '-2px 0 4px rgba(0,0,0,0.05)',
          width: '140px',
          minWidth: '140px'
        }}
      >
        <Group gap="xs" justify="center">
          <Tooltip label="Add child category" withArrow position="top">
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={() => onAddChild(category)}
              aria-label="Add child category"
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit category" withArrow position="top">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => onEdit(category)}
              aria-label="Edit category"
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete category" withArrow position="top">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onDelete(category)}
              aria-label="Delete category"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

const MenuCategoriesPage: FC = () => {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [originalCategories, setOriginalCategories] = useState<ItemCategory[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'displayIndex'>('displayIndex');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [viewMode, setViewMode] = useState<'flat' | 'tree'>('flat');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<CreateItemCategory>({
    categoryName: '',
    categoryNameAlt: '',
    displayIndex: 0,
    isTerminal: true,
    isPublicDisplay: true,
    isModifier: false,
    isSelfOrderingDisplay: true,
    isOnlineStoreDisplay: true
  });
  const [buttonStyles, setButtonStyles] = useState<ButtonStyle[]>([]);
  const [loadingButtonStyles, setLoadingButtonStyles] = useState(false);

  const { selectedBrand } = useBrands();
  const selectedBrandId = selectedBrand ? parseInt(selectedBrand) : null;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (selectedBrandId) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandId]);

  // Fetch button styles when dialog opens or when page loads
  useEffect(() => {
    if (selectedBrandId) {
      fetchButtonStyles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandId]);

  const fetchCategories = async () => {
    if (!selectedBrandId) return;

    setLoading(true);
    try {
      const data = await itemCategoryService.getItemCategories(selectedBrandId);
      setCategories(data || []);
      // Deep clone the data to ensure originalCategories is truly independent
      setOriginalCategories(JSON.parse(JSON.stringify(data || [])));
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
      setOriginalCategories([]);
      setHasUnsavedChanges(false);
      notifications.show({
        title: 'Error',
        message: 'Failed to load categories',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchButtonStyles = async () => {
    if (!selectedBrandId) return;

    setLoadingButtonStyles(true);
    try {
      const data = await buttonStyleService.getButtonStyles(selectedBrandId);
      setButtonStyles(data || []);
    } catch (error) {
      console.error('Failed to fetch button styles:', error);
      setButtonStyles([]);
    } finally {
      setLoadingButtonStyles(false);
    }
  };

  const openCreateCategoryModal = (overrides: Partial<CreateItemCategory> = {}) => {
    setSelectedCategory(null);
    setFormData({
      categoryName: '',
      categoryNameAlt: '',
      displayIndex: categories.length,
      isTerminal: true,
      isPublicDisplay: true,
      isModifier: false,
      isSelfOrderingDisplay: true,
      isOnlineStoreDisplay: true,
      ...overrides
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    openCreateCategoryModal();
  };

  const handleAddChild = (parentCategory: ItemCategory) => {
    const siblingCount = categories.filter(cat => cat.parentCategoryId === parentCategory.categoryId).length;
    openCreateCategoryModal({
      parentCategoryId: parentCategory.categoryId,
      displayIndex: siblingCount
    });
  };

  const handleEdit = (category: ItemCategory) => {
    setSelectedCategory(category);
    setFormData({
      categoryName: category.categoryName,
      categoryNameAlt: category.categoryNameAlt,
      displayIndex: category.displayIndex,
      parentCategoryId: category.parentCategoryId,
      isTerminal: category.isTerminal,
      isPublicDisplay: category.isPublicDisplay,
      buttonStyleId: category.buttonStyleId,
      printerName: category.printerName,
      isModifier: category.isModifier,
      enabled: category.enabled,
      categoryTypeId: category.categoryTypeId,
      imageFileName: category.imageFileName,
      isSelfOrderingDisplay: category.isSelfOrderingDisplay,
      isOnlineStoreDisplay: category.isOnlineStoreDisplay,
      categoryCode: category.categoryCode
    });
    setDialogOpen(true);
  };

  const handleDelete = (category: ItemCategory) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedBrandId) return;

    setSaving(true);
    try {
      if (selectedCategory) {
        // Update existing category
        await itemCategoryService.updateItemCategory(
          selectedBrandId,
          selectedCategory.categoryId,
          formData as UpdateItemCategory
        );

        // Update the item in the local state
        setCategories(prevCategories =>
          prevCategories.map(cat =>
            cat.categoryId === selectedCategory.categoryId
              ? { ...cat, ...formData }
              : cat
          )
        );

        // Also update original categories to keep them in sync (deep clone)
        setOriginalCategories(prevCategories =>
          JSON.parse(JSON.stringify(
            prevCategories.map(cat =>
              cat.categoryId === selectedCategory.categoryId
                ? { ...cat, ...formData }
                : cat
            )
          ))
        );

        notifications.show({
          title: 'Success',
          message: 'Category updated successfully',
          color: 'green'
        });
      } else {
        // Create new category
        // Always set enabled to true for new categories (soft delete field)
        const createdCategory = await itemCategoryService.createItemCategory(selectedBrandId, {
          ...formData,
          enabled: true
        });

        // Add the new item to the local state
        setCategories(prevCategories => [...prevCategories, createdCategory]);
        // Deep clone when updating original categories
        setOriginalCategories(prevCategories =>
          JSON.parse(JSON.stringify([...prevCategories, createdCategory]))
        );

        notifications.show({
          title: 'Success',
          message: 'Category created successfully',
          color: 'green'
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save category:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save category',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedBrandId || !selectedCategory) return;

    setDeleting(true);
    try {
      await itemCategoryService.deleteItemCategory(selectedBrandId, selectedCategory.categoryId);

      // Remove the item from the local state
      setCategories(prevCategories =>
        prevCategories.filter(cat => cat.categoryId !== selectedCategory.categoryId)
      );
      // Deep clone when updating original categories
      setOriginalCategories(prevCategories =>
        JSON.parse(JSON.stringify(
          prevCategories.filter(cat => cat.categoryId !== selectedCategory.categoryId)
        ))
      );

      notifications.show({
        title: 'Success',
        message: 'Category deleted successfully',
        color: 'green'
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete category:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete category',
        color: 'red'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSort = (column: 'id' | 'name' | 'displayIndex') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories;

    // Apply filter
    if (filterText) {
      filtered = filtered.filter(cat =>
        cat.categoryName.toLowerCase().includes(filterText.toLowerCase()) ||
        cat.categoryId.toString().includes(filterText)
      );
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'id':
          comparison = a.categoryId - b.categoryId;
          break;
        case 'name':
          comparison = a.categoryName.localeCompare(b.categoryName);
          break;
        case 'displayIndex':
          comparison = a.displayIndex - b.displayIndex;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [categories, filterText, sortBy, sortOrder]);

  // Build tree structure from flat list
  const categoryTree = useMemo(() => {
    const buildTree = (parentId: number | null | undefined, level: number = 0): CategoryTreeNode[] => {
      return categories
        .filter(cat => (cat.parentCategoryId ?? null) === (parentId ?? null))
        .sort((a, b) => a.displayIndex - b.displayIndex)
        .map(cat => ({
          ...cat,
          level,
          children: buildTree(cat.categoryId, level + 1)
        }));
    };

    return buildTree(null);
  }, [categories]);

  // Flatten tree for rendering with filter
  const flattenedTree = useMemo(() => {
    // Helper function to check if a node or any of its descendants match the filter
    const nodeMatchesFilter = (node: CategoryTreeNode, searchText: string): boolean => {
      if (!searchText) return true;

      const lowerSearchText = searchText.toLowerCase();

      // Check if current node matches
      if (node.categoryName.toLowerCase().includes(lowerSearchText) ||
          node.categoryId.toString().includes(searchText)) {
        return true;
      }

      // Check if any children match
      return node.children.some(child => nodeMatchesFilter(child, searchText));
    };

    const flatten = (nodes: CategoryTreeNode[], result: CategoryTreeNode[] = []): CategoryTreeNode[] => {
      for (const node of nodes) {
        // Check if node or any descendants match filter
        if (nodeMatchesFilter(node, filterText)) {
          result.push(node);

          // Only show children if parent is expanded
          if (expandedCategories.has(node.categoryId) && node.children.length > 0) {
            flatten(node.children, result);
          }
        }
      }
      return result;
    };

    return flatten(categoryTree);
  }, [categoryTree, expandedCategories, filterText]);

  // Auto-expand categories when filtering to show matching nested results
  useEffect(() => {
    if (filterText) {
      const categoriesToExpand = new Set<number>();

      const hasMatchingDescendant = (node: CategoryTreeNode): boolean => {
        const lowerSearchText = filterText.toLowerCase();

        // Check if any direct children match
        const childMatches = node.children.some(child =>
          child.categoryName.toLowerCase().includes(lowerSearchText) ||
          child.categoryId.toString().includes(filterText)
        );

        if (childMatches) {
          categoriesToExpand.add(node.categoryId);
          return true;
        }

        // Recursively check descendants
        const descendantMatches = node.children.some(child => {
          if (hasMatchingDescendant(child)) {
            categoriesToExpand.add(node.categoryId);
            return true;
          }
          return false;
        });

        return descendantMatches;
      };

      // Check all root nodes
      categoryTree.forEach(node => hasMatchingDescendant(node));

      setExpandedCategories(categoriesToExpand);
    }
  }, [filterText, categoryTree]);

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Drag and drop handlers
  const handleDragStart = () => {
    // Placeholder for future visual feedback
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeCategory = categories.find(c => c.categoryId === active.id);
    const overCategory = categories.find(c => c.categoryId === over.id);

    if (!activeCategory || !overCategory) {
      return;
    }

    // Only allow reordering within same parent
    if ((activeCategory.parentCategoryId ?? null) !== (overCategory.parentCategoryId ?? null)) {
      notifications.show({
        title: 'Invalid Move',
        message: 'Categories can only be reordered within the same parent level',
        color: 'orange'
      });
      return;
    }

    // Get siblings at the same level
    const siblings = categories
      .filter(c => (c.parentCategoryId ?? null) === (activeCategory.parentCategoryId ?? null))
      .sort((a, b) => a.displayIndex - b.displayIndex);

    const oldIndex = siblings.findIndex(c => c.categoryId === activeCategory.categoryId);
    const newIndex = siblings.findIndex(c => c.categoryId === overCategory.categoryId);

    if (oldIndex === newIndex) {
      return;
    }

    // Reorder siblings
    const reorderedSiblings = [...siblings];
    const [movedItem] = reorderedSiblings.splice(oldIndex, 1);
    reorderedSiblings.splice(newIndex, 0, movedItem);

    // Assign new display indices (using intervals of 10)
    const updatedSiblings = reorderedSiblings.map((sibling, index) => ({
      ...sibling,
      displayIndex: index * 10
    }));

    // Update local state only - don't save to backend yet
    setCategories(prevCategories => {
      const categoriesMap = new Map(prevCategories.map(c => [c.categoryId, c]));
      updatedSiblings.forEach(sibling => {
        categoriesMap.set(sibling.categoryId, sibling);
      });
      return Array.from(categoriesMap.values());
    });

    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
  };

  // Save ordering changes to backend
  const handleSaveOrdering = async () => {
    if (!selectedBrandId) return;

    setSavingOrder(true);
    try {
      // Get all categories that have changed displayIndex
      const changedCategories = categories.filter(cat => {
        const original = originalCategories.find(o => o.categoryId === cat.categoryId);
        return original && original.displayIndex !== cat.displayIndex;
      });

      await Promise.all(
        changedCategories.map(category =>
          itemCategoryService.updateItemCategory(
            selectedBrandId,
            category.categoryId,
            {
              categoryName: category.categoryName,
              categoryNameAlt: category.categoryNameAlt,
              displayIndex: category.displayIndex,
              parentCategoryId: category.parentCategoryId,
              isTerminal: category.isTerminal,
              isPublicDisplay: category.isPublicDisplay,
              buttonStyleId: category.buttonStyleId,
              printerName: category.printerName,
              isModifier: category.isModifier,
              enabled: category.enabled,
              categoryTypeId: category.categoryTypeId,
              imageFileName: category.imageFileName,
              isSelfOrderingDisplay: category.isSelfOrderingDisplay,
              isOnlineStoreDisplay: category.isOnlineStoreDisplay,
              categoryCode: category.categoryCode
            }
          )
        )
      );

      // Deep clone and update original categories to match current state
      setOriginalCategories(JSON.parse(JSON.stringify(categories)));
      setHasUnsavedChanges(false);

      notifications.show({
        title: 'Success',
        message: 'Category order saved successfully',
        color: 'green'
      });
    } catch (error) {
      console.error('Failed to save category order:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save category order',
        color: 'red'
      });
    } finally {
      setSavingOrder(false);
    }
  };

  // Revert to original ordering
  const handleRevertOrdering = () => {
    // Deep clone the original categories to ensure proper restoration
    setCategories(JSON.parse(JSON.stringify(originalCategories)));
    setHasUnsavedChanges(false);
    notifications.show({
      title: 'Reverted',
      message: 'Category order has been reverted to the original',
      color: 'blue'
    });
  };

  // Helper function to get button style color for display
  const getButtonStyleColor = (style: ButtonStyle) => {
    // Use backgroundColorTop as primary color, fallback to middle or bottom
    let color = style.backgroundColorTop || style.backgroundColorMiddle || style.backgroundColorBottom || '#E0E0E0';

    // Remove alpha channel if present (convert #AARRGGBB to #RRGGBB)
    if (color.length === 9 && color.startsWith('#')) {
      color = '#' + color.substring(3);
    }

    return color;
  };

  // Helper function to get button style by ID
  const getButtonStyleById = (buttonStyleId?: number): ButtonStyle | undefined => {
    if (!buttonStyleId) return undefined;
    return buttonStyles.find(style => style.buttonStyleId === buttonStyleId);
  };

  // Get available parent categories (excluding self and descendants)
  const getAvailableParents = (excludeCategoryId?: number): ItemCategory[] => {
    if (!excludeCategoryId) {
      return categories.filter(c => c.categoryId !== excludeCategoryId);
    }

    // Build descendants set to prevent circular references
    const descendants = new Set<number>();
    const findDescendants = (categoryId: number) => {
      descendants.add(categoryId);
      categories
        .filter(c => c.parentCategoryId === categoryId)
        .forEach(child => findDescendants(child.categoryId));
    };
    findDescendants(excludeCategoryId);

    return categories.filter(c => !descendants.has(c.categoryId));
  };

  if (!selectedBrand) {
    return (
      <Box p="md">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Brand Selection Required"
          color="blue"
        >
          Please select a brand to manage menu categories.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Add CSS animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Sticky Breadcrumbs */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'white',
          borderBottom: '1px solid #E3E8EE',
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container size="xl" px="xl" style={{ marginInline: 0 }}>
          <AutoBreadcrumb />
        </Container>
      </Box>

      {/* Page Header with Scrolling Behavior */}
      <ScrollingHeader
        title="Menu Categories"
        subtitle="Organize your menu items into logical groups"
        actions={
          <>
            <Button
              variant="default"
              leftSection={<IconDownload size={16} />}
              style={{ border: '1px solid #E3E8EE' }}
            >
              Export
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              style={{
                backgroundColor: '#5469D4',
                color: 'white',
              }}
              onClick={handleAdd}
            >
              Add Category
            </Button>
          </>
        }
      >
        {/* Floating Save Bar - Shows when there are unsaved changes */}
        {hasUnsavedChanges && (
          <Box
            style={{
              position: 'sticky',
              top: 96, // Position below breadcrumb (48px) + compact header (48px)
              zIndex: 97,
              backgroundColor: '#FFF8E1',
              borderBottom: '1px solid #FFD54F',
              padding: '12px 24px',
              animation: 'slideDown 0.3s ease-out',
            }}
          >
            <Container size="xl" style={{ marginInline: 0 }}>
              <Group justify="space-between">
                <Group gap="sm">
                  <IconAlertCircle size={20} color="#F9A825" />
                  <Text size="sm" fw={500} c="dark">
                    You have unsaved changes to the category order
                  </Text>
                </Group>
                <Group gap="xs">
                  <Button
                    variant="default"
                    size="sm"
                    leftSection={<IconRotateClockwise2 size={16} />}
                    onClick={handleRevertOrdering}
                    disabled={savingOrder}
                  >
                    Revert
                  </Button>
                  <Button
                    size="sm"
                    leftSection={<IconDeviceFloppy size={16} />}
                    onClick={handleSaveOrdering}
                    loading={savingOrder}
                    color="blue"
                  >
                    Save Changes
                  </Button>
                </Group>
              </Group>
            </Container>
          </Box>
        )}
      </ScrollingHeader>

      {/* Main Content Area */}
      <Box style={{ backgroundColor: '#F6F9FC', minHeight: 'calc(100vh - 200px)' }}>
        <Container size="xl" py="xl">
          <Paper withBorder shadow="sm" style={{ backgroundColor: 'white' }}>
            {/* Filter Bar */}
            <Box p="md" style={{ borderBottom: '1px solid #E3E8EE' }}>
              <TextInput
                placeholder="Search by name or ID..."
                leftSection={<IconSearch size={16} />}
                value={filterText}
                onChange={(e) => setFilterText(e.currentTarget.value)}
                styles={{
                  input: {
                    border: '1px solid #E3E8EE',
                    '&:focus': {
                      borderColor: '#5469D4',
                    },
                  },
                }}
              />
            </Box>

            {/* View Mode Tabs */}
            <Tabs value={viewMode} onChange={(value) => setViewMode(value as 'flat' | 'tree')}>
              <Tabs.List style={{ borderBottom: '1px solid #E3E8EE', paddingLeft: '1rem' }}>
                <Tabs.Tab value="flat" leftSection={<IconList size={16} />}>
                  Flat View
                </Tabs.Tab>
                <Tabs.Tab value="tree" leftSection={<IconHierarchy size={16} />}>
                  Tree View
                </Tabs.Tab>
              </Tabs.List>

              {/* Flat View Table */}
              <Tabs.Panel value="flat">
                <Box style={{ overflow: 'auto' }}>
                  <Table striped highlightOnHover style={{ minWidth: '800px' }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th
                      style={{ width: '80px', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('id')}
                    >
                      <Group gap="xs">
                        ID
                        {sortBy === 'id' && (
                          sortOrder === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
                        )}
                      </Group>
                    </Table.Th>
                    <Table.Th
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('name')}
                    >
                      <Group gap="xs">
                        Category Name
                        {sortBy === 'name' && (
                          sortOrder === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
                        )}
                      </Group>
                    </Table.Th>
                    <Table.Th
                      style={{ width: '120px', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('displayIndex')}
                    >
                      <Group gap="xs">
                        Display Order
                        {sortBy === 'displayIndex' && (
                          sortOrder === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
                        )}
                      </Group>
                    </Table.Th>
                    <Table.Th style={{ width: '80px' }}>Style</Table.Th>
                    <Table.Th style={{ width: '100px' }}>Visibility</Table.Th>
                    <Table.Th
                      style={{
                        width: '140px',
                        minWidth: '140px',
                        textAlign: 'center',
                        position: 'sticky',
                        right: 0,
                        backgroundColor: 'white',
                        boxShadow: '-2px 0 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      Actions
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {loading ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Center py="xl">
                          <Stack align="center" gap="md">
                            <Loader size="lg" />
                            <Text c="dimmed">Loading categories...</Text>
                          </Stack>
                        </Center>
                      </Table.Td>
                    </Table.Tr>
                  ) : !filteredAndSortedCategories || filteredAndSortedCategories.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Text ta="center" c="dimmed" py="lg">
                          {filterText ? 'No categories match your search.' : 'No categories found. Create your first category!'}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredAndSortedCategories.map((category) => (
                      <Table.Tr key={category.categoryId}>
                        <Table.Td>{category.categoryId}</Table.Td>
                        <Table.Td>
                          <Box>
                            <Text fw={500} size="sm">
                              {category.categoryName}
                            </Text>
                            {category.categoryNameAlt && (
                              <Text size="xs" c="dimmed">
                                {category.categoryNameAlt}
                              </Text>
                            )}
                          </Box>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="blue">
                            {category.displayIndex}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {(() => {
                            const style = getButtonStyleById(category.buttonStyleId);
                            if (!style) {
                              return (
                                <Box
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    backgroundColor: '#E0E0E0',
                                    border: '1px dashed #999'
                                  }}
                                  title="No style"
                                />
                              );
                            }
                            return (
                              <Box
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  backgroundColor: getButtonStyleColor(style),
                                  border: '1px solid rgba(0,0,0,0.1)',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                                title={style.styleName}
                              />
                            );
                          })()}
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            variant="light"
                            color={category.isPublicDisplay ? 'green' : 'gray'}
                          >
                            {category.isPublicDisplay ? 'Visible' : 'Hidden'}
                          </Badge>
                        </Table.Td>
                        <Table.Td
                          style={{
                            position: 'sticky',
                            right: 0,
                            backgroundColor: 'white',
                            boxShadow: '-2px 0 4px rgba(0,0,0,0.05)',
                            width: '140px',
                            minWidth: '140px'
                          }}
                        >
                          <Group gap="xs" justify="center">
                            <Tooltip label="Add child category" withArrow position="top">
                              <ActionIcon
                                variant="subtle"
                                color="green"
                                onClick={() => handleAddChild(category)}
                                aria-label="Add child category"
                              >
                                <IconPlus size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Edit category" withArrow position="top">
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                onClick={() => handleEdit(category)}
                                aria-label="Edit category"
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Delete category" withArrow position="top">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => handleDelete(category)}
                                aria-label="Delete category"
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Box>
          </Tabs.Panel>

          {/* Tree View Table */}
          <Tabs.Panel value="tree">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <Box style={{ overflow: 'auto' }}>
                <Table striped highlightOnHover style={{ minWidth: '800px' }}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: '40px' }}></Table.Th>
                      <Table.Th style={{ width: '50px' }}></Table.Th>
                      <Table.Th style={{ width: '80px' }}>ID</Table.Th>
                      <Table.Th>Category Name</Table.Th>
                      <Table.Th style={{ width: '120px' }}>Display Order</Table.Th>
                      <Table.Th style={{ width: '80px' }}>Style</Table.Th>
                      <Table.Th style={{ width: '100px' }}>Visibility</Table.Th>
                      <Table.Th
                        style={{
                          width: '140px',
                          minWidth: '140px',
                          textAlign: 'center',
                          position: 'sticky',
                          right: 0,
                          backgroundColor: 'white',
                          boxShadow: '-2px 0 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        Actions
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <SortableContext
                    items={flattenedTree.map(c => c.categoryId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Table.Tbody>
                      {loading ? (
                        <Table.Tr>
                          <Table.Td colSpan={8}>
                            <Center py="xl">
                              <Stack align="center" gap="md">
                                <Loader size="lg" />
                                <Text c="dimmed">Loading categories...</Text>
                              </Stack>
                            </Center>
                          </Table.Td>
                        </Table.Tr>
                      ) : !flattenedTree || flattenedTree.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={8}>
                            <Text ta="center" c="dimmed" py="lg">
                              {filterText ? 'No categories match your search.' : 'No categories found. Create your first category!'}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        flattenedTree.map((category) => (
                          <SortableRow
                            key={category.categoryId}
                            category={category}
                            expandedCategories={expandedCategories}
                            toggleExpand={toggleExpand}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAddChild={handleAddChild}
                            getButtonStyleById={getButtonStyleById}
                            getButtonStyleColor={getButtonStyleColor}
                          />
                        ))
                      )}
                    </Table.Tbody>
                  </SortableContext>
              </Table>
            </Box>
          </DndContext>
        </Tabs.Panel>
      </Tabs>
          </Paper>
        </Container>
      </Box>

      {/* Add/Edit Modal */}
      <Modal
        opened={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={selectedCategory ? 'Edit Category' : 'Create New Category'}
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Category Name"
            placeholder="e.g., Appetizers"
            value={formData.categoryName}
            onChange={(e) => setFormData({ ...formData, categoryName: e.currentTarget.value })}
            required
          />

          <TextInput
            label="Alternative Name (Optional)"
            placeholder="e.g., 前菜"
            value={formData.categoryNameAlt || ''}
            onChange={(e) => setFormData({ ...formData, categoryNameAlt: e.currentTarget.value })}
          />

          <Select
            label="Parent Category (Optional)"
            description={selectedCategory ? "Cannot select this category or its children to prevent circular references" : "Leave empty to create a root-level category"}
            placeholder="Select parent category or leave empty for root"
            value={formData.parentCategoryId?.toString() || null}
            onChange={(value) => setFormData({ ...formData, parentCategoryId: value ? parseInt(value) : undefined })}
            data={getAvailableParents(selectedCategory?.categoryId).map(cat => ({
              value: cat.categoryId.toString(),
              label: cat.categoryName
            }))}
            clearable
            searchable
          />

          <TextInput
            label="Display Order"
            type="number"
            value={formData.displayIndex}
            onChange={(e) => setFormData({ ...formData, displayIndex: parseInt(e.currentTarget.value) || 0 })}
          />

          {/* Button Style Selection */}
          <Box>
            <Text size="sm" fw={500} mb={8}>
              Button Style
            </Text>
            <Text size="xs" c="dimmed" mb={12}>
              Select a style for the category button appearance
            </Text>
            {loadingButtonStyles ? (
              <Center py="lg">
                <Loader size="sm" />
              </Center>
            ) : (
              <Box
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '12px',
                  border: '1px solid #E3E8EE',
                  borderRadius: '8px',
                  backgroundColor: '#F8F9FA'
                }}
              >
                {/* None/Default Option */}
                <Box
                  onClick={() => setFormData({ ...formData, buttonStyleId: undefined })}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    padding: '8px',
                    borderRadius: '8px',
                    border: formData.buttonStyleId === undefined ? '2px solid #5469D4' : '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#E0E0E0',
                      border: '2px dashed #999',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text size="xs" c="dimmed">None</Text>
                  </Box>
                  <Text size="xs" mt={4}>Default</Text>
                </Box>

                {/* Button Style Options */}
                {buttonStyles.map((style) => (
                  <Box
                    key={style.buttonStyleId}
                    onClick={() => setFormData({ ...formData, buttonStyleId: style.buttonStyleId })}
                    style={{
                      cursor: 'pointer',
                      textAlign: 'center',
                      padding: '8px',
                      borderRadius: '8px',
                      border: formData.buttonStyleId === style.buttonStyleId ? '2px solid #5469D4' : '2px solid transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#F1F3F5'
                      }
                    }}
                  >
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: getButtonStyleColor(style),
                        border: '1px solid rgba(0,0,0,0.1)',
                        marginBottom: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Text size="xs" mt={4} lineClamp={2} style={{ maxWidth: '64px' }}>
                      {style.styleName}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Switch
            label="Visible in Menu"
            description="Show this category in POS and online ordering"
            checked={formData.isPublicDisplay}
            onChange={(e) => setFormData({ ...formData, isPublicDisplay: e.currentTarget.checked })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.categoryName.trim() || saving}
              loading={saving}
              color="green"
            >
              {selectedCategory ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <Text mb="lg">
          Are you sure you want to delete the category "{selectedCategory?.categoryName}"?
          This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete} loading={deleting} disabled={deleting}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};

export { MenuCategoriesPage };
