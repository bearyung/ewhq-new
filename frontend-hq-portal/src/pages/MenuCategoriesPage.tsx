import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Title,
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
  Collapse
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
  IconHierarchy
} from '@tabler/icons-react';
import { AutoBreadcrumb } from '../components/AutoBreadcrumb';
import { useBrands } from '../contexts/BrandContext';
import itemCategoryService from '../services/itemCategoryService';
import type { ItemCategory, CreateItemCategory, UpdateItemCategory } from '../types/itemCategory';

interface CategoryTreeNode extends ItemCategory {
  children: CategoryTreeNode[];
  level: number;
}

const MenuCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
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
    enabled: true,
    isSelfOrderingDisplay: true,
    isOnlineStoreDisplay: true
  });

  const { selectedBrand } = useBrands();
  const selectedBrandId = selectedBrand ? parseInt(selectedBrand) : null;

  useEffect(() => {
    if (selectedBrandId) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandId]);

  const fetchCategories = async () => {
    if (!selectedBrandId) return;

    setLoading(true);
    try {
      const data = await itemCategoryService.getItemCategories(selectedBrandId);
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
      notifications.show({
        title: 'Error',
        message: 'Failed to load categories',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setFormData({
      categoryName: '',
      categoryNameAlt: '',
      displayIndex: categories.length,
      isTerminal: true,
      isPublicDisplay: true,
      enabled: true,
      isSelfOrderingDisplay: true,
      isOnlineStoreDisplay: true
    });
    setDialogOpen(true);
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

        notifications.show({
          title: 'Success',
          message: 'Category updated successfully',
          color: 'green'
        });
      } else {
        // Create new category
        const createdCategory = await itemCategoryService.createItemCategory(selectedBrandId, formData);

        // Add the new item to the local state
        setCategories(prevCategories => [...prevCategories, createdCategory]);

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

  const filteredAndSortedCategories = React.useMemo(() => {
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

      {/* Page Header - Non-sticky */}
      <Box
        pt="xl"
        px="xl"
        pb="xl"
        style={{
          backgroundColor: 'white',
        }}
      >
        <Container size="xl">
          <Group justify="space-between">
            <Box>
              <Title order={1} size={28} fw={600}>
                Menu Categories
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                Organize your menu items into logical groups
              </Text>
            </Box>

            <Group gap="sm">
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
            </Group>
          </Group>
        </Container>
      </Box>

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
                    <Table.Th style={{ width: '100px' }}>Visibility</Table.Th>
                    <Table.Th
                      style={{
                        width: '100px',
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
                      <Table.Td colSpan={5}>
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
                      <Table.Td colSpan={5}>
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
                            boxShadow: '-2px 0 4px rgba(0,0,0,0.05)'
                          }}
                        >
                          <Group gap="xs" justify="center">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleEdit(category)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDelete(category)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
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
            <Box style={{ overflow: 'auto' }}>
              <Table striped highlightOnHover style={{ minWidth: '800px' }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '50px' }}></Table.Th>
                    <Table.Th style={{ width: '80px' }}>ID</Table.Th>
                    <Table.Th>Category Name</Table.Th>
                    <Table.Th style={{ width: '120px' }}>Display Order</Table.Th>
                    <Table.Th style={{ width: '100px' }}>Visibility</Table.Th>
                    <Table.Th
                      style={{
                        width: '100px',
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
                  ) : !flattenedTree || flattenedTree.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Text ta="center" c="dimmed" py="lg">
                          {filterText ? 'No categories match your search.' : 'No categories found. Create your first category!'}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    flattenedTree.map((category) => (
                      <Table.Tr key={category.categoryId}>
                        <Table.Td>
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
                            boxShadow: '-2px 0 4px rgba(0,0,0,0.05)'
                          }}
                        >
                          <Group gap="xs" justify="center">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleEdit(category)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleDelete(category)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Box>
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

          <Switch
            label="Visible in Menu"
            description="Show this category in POS and online ordering"
            checked={formData.isPublicDisplay}
            onChange={(e) => setFormData({ ...formData, isPublicDisplay: e.currentTarget.checked })}
          />

          <Switch
            label="Enabled"
            description="Enable or disable this category"
            checked={formData.enabled}
            onChange={(e) => setFormData({ ...formData, enabled: e.currentTarget.checked })}
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
