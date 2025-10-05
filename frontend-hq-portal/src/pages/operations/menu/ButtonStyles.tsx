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
  Grid,
  Center,
  ActionIcon,
  Badge,
  ColorInput,
  Container,
  Loader
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
  IconSearch
} from '@tabler/icons-react';
import { AutoBreadcrumb } from '../../../components/AutoBreadcrumb';
import { ScrollingHeader } from '../../../components/ScrollingHeader';
import { useBrands } from '../../../contexts/BrandContext';
import buttonStyleService from '../../../services/buttonStyleService';
import type { ButtonStyle, CreateButtonStyle, UpdateButtonStyle } from '../../../types/buttonStyle';

const ButtonStylesPage: FC = () => {
  const [buttonStyles, setButtonStyles] = useState<ButtonStyle[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ButtonStyle | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'color'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [formData, setFormData] = useState<CreateButtonStyle>({
    styleName: '',
    backgroundColorTop: '#FFFFFF',
    enabled: true,
    fontSize: 22,
    width: 115,
    height: 84
  });

  const { selectedBrand } = useBrands();
  const selectedBrandId = selectedBrand ? parseInt(selectedBrand) : null;

  // Calculate text color based on background luminance
  const getContrastTextColor = (bgColor: string | null | undefined): string => {
    if (!bgColor) return '#000000';

    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Calculate relative luminance (WCAG formula)
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  useEffect(() => {
    if (selectedBrandId) {
      fetchButtonStyles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandId]);

  const fetchButtonStyles = async () => {
    if (!selectedBrandId) return;

    setLoading(true);
    try {
      const data = await buttonStyleService.getButtonStyles(selectedBrandId);
      setButtonStyles(data || []);
    } catch (error) {
      console.error('Failed to fetch button styles:', error);
      setButtonStyles([]);
      notifications.show({
        title: 'Error',
        message: 'Failed to load button styles',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedStyle(null);
    setFormData({
      styleName: '',
      backgroundColorTop: '#FFFFFF',
      enabled: true,
      fontSize: 22,
      width: 115,
      height: 84
    });
    setDialogOpen(true);
  };

  const handleEdit = (style: ButtonStyle) => {
    if (style.isSystemUse) {
      notifications.show({
        title: 'Error',
        message: 'Cannot edit system button styles',
        color: 'red'
      });
      return;
    }
    setSelectedStyle(style);
    setFormData({
      styleName: style.styleName,
      styleNameAlt: style.styleNameAlt,
      resourceStyleName: style.resourceStyleName,
      backgroundColorTop: style.backgroundColorTop || '#FFFFFF',
      backgroundColorMiddle: style.backgroundColorMiddle,
      backgroundColorBottom: style.backgroundColorBottom,
      enabled: style.enabled,
      fontSize: style.fontSize,
      width: style.width,
      height: style.height,
      imageModeWidth: style.imageModeWidth,
      imageModeHeight: style.imageModeHeight,
      imageModeFontSize: style.imageModeFontSize,
      imageModeResourceStyleName: style.imageModeResourceStyleName
    });
    setDialogOpen(true);
  };

  const handleDelete = (style: ButtonStyle) => {
    if (style.isSystemUse) {
      notifications.show({
        title: 'Error',
        message: 'Cannot delete system button styles',
        color: 'red'
      });
      return;
    }
    setSelectedStyle(style);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedBrandId) return;

    setSaving(true);
    try {
      if (selectedStyle) {
        // Update existing button style
        await buttonStyleService.updateButtonStyle(
          selectedBrandId,
          selectedStyle.buttonStyleId,
          formData as UpdateButtonStyle
        );

        // Update the item in the local state
        setButtonStyles(prevStyles =>
          prevStyles.map(style =>
            style.buttonStyleId === selectedStyle.buttonStyleId
              ? { ...style, ...formData }
              : style
          )
        );

        notifications.show({
          title: 'Success',
          message: 'Button style updated successfully',
          color: 'green'
        });
      } else {
        // Create new button style
        const createdStyle = await buttonStyleService.createButtonStyle(selectedBrandId, formData);

        // Add the new item to the local state
        setButtonStyles(prevStyles => [...prevStyles, createdStyle]);

        notifications.show({
          title: 'Success',
          message: 'Button style created successfully',
          color: 'green'
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save button style:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save button style',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedBrandId || !selectedStyle) return;

    setDeleting(true);
    try {
      await buttonStyleService.deleteButtonStyle(selectedBrandId, selectedStyle.buttonStyleId);

      // Remove the item from the local state
      setButtonStyles(prevStyles =>
        prevStyles.filter(style => style.buttonStyleId !== selectedStyle.buttonStyleId)
      );

      notifications.show({
        title: 'Success',
        message: 'Button style deleted successfully',
        color: 'green'
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete button style:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete button style',
        color: 'red'
      });
    } finally {
      setDeleting(false);
    }
  };

  const convertHexColor = (color: string | null | undefined): string => {
    if (!color) return '#FFFFFF';
    // Handle ARGB format (#FFRRGGBB -> #RRGGBB)
    if (color.length === 9 && color.startsWith('#')) {
      return '#' + color.substring(3);
    }
    return color;
  };

  const formatColorForAPI = (color: string): string => {
    // Convert #RRGGBB to #FFRRGGBB for API
    if (color.length === 7 && color.startsWith('#')) {
      return '#FF' + color.substring(1);
    }
    return color;
  };

  const handleSort = (column: 'id' | 'name' | 'color') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedStyles = useMemo(() => {
    let filtered = buttonStyles;

    // Apply filter
    if (filterText) {
      filtered = filtered.filter(style =>
        style.styleName.toLowerCase().includes(filterText.toLowerCase()) ||
        style.buttonStyleId.toString().includes(filterText)
      );
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'id':
          comparison = a.buttonStyleId - b.buttonStyleId;
          break;
        case 'name':
          comparison = a.styleName.localeCompare(b.styleName);
          break;
        case 'color':
          comparison = (a.backgroundColorTop || '').localeCompare(b.backgroundColorTop || '');
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [buttonStyles, filterText, sortBy, sortOrder]);

  if (!selectedBrand) {
    return (
      <Box p="md">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Brand Selection Required"
          color="blue"
        >
          Please select a brand to manage button styles.
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

      {/* Page Header with Scrolling Behavior */}
      <ScrollingHeader
        title="Button Styles"
        subtitle="Customize menu button appearance and layout"
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
              Add Button Style
            </Button>
          </>
        }
      />

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

            {/* Table with horizontal scroll */}
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
                        Style Name
                        {sortBy === 'name' && (
                          sortOrder === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
                        )}
                      </Group>
                    </Table.Th>
                    <Table.Th>Preview</Table.Th>
                    <Table.Th
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('color')}
                    >
                      <Group gap="xs">
                        Color Code
                        {sortBy === 'color' && (
                          sortOrder === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
                        )}
                      </Group>
                    </Table.Th>
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
                            <Text c="dimmed">Loading button styles...</Text>
                          </Stack>
                        </Center>
                      </Table.Td>
                    </Table.Tr>
                  ) : !filteredAndSortedStyles || filteredAndSortedStyles.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text ta="center" c="dimmed" py="lg">
                          {filterText ? 'No button styles match your search.' : 'No button styles found. Create your first button style!'}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredAndSortedStyles.map((style) => (
                <Table.Tr key={style.buttonStyleId}>
                  <Table.Td>{style.buttonStyleId}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {style.styleName}
                      {style.isSystemUse && (
                        <Badge size="xs" color="blue" variant="light">System</Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Box
                      style={{
                        width: Math.min(style.width || 115, 150),
                        height: Math.min(style.height || 84, 60),
                        backgroundColor: convertHexColor(style.backgroundColorTop),
                        border: '2px solid #ddd',
                        borderRadius: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: `${Math.min(style.fontSize, 14)}px`,
                        fontWeight: 500,
                        color: getContrastTextColor(convertHexColor(style.backgroundColorTop))
                      }}
                    >
                      {style.styleName}
                    </Box>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Box
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: convertHexColor(style.backgroundColorTop),
                          border: '1px solid #ddd',
                          borderRadius: 4
                        }}
                      />
                      <Text size="sm" ff="monospace">
                        {convertHexColor(style.backgroundColorTop)}
                      </Text>
                    </Group>
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
                        onClick={() => handleEdit(style)}
                        disabled={style.isSystemUse}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      {!style.isSystemUse && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(style)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
            </Box>
      </Paper>
        </Container>
      </Box>

      {/* Add/Edit Modal */}
      <Modal
        opened={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={selectedStyle ? 'Edit Button Style' : 'Create New Button Style'}
        size="lg"
      >
        <Stack gap="md">
          {/* Preview Section */}
          <Paper p="lg" withBorder style={{ backgroundColor: '#f8f9fa' }}>
            <Text size="sm" c="dimmed" mb="sm" ta="center">Preview</Text>
            <Center>
              <Box
                style={{
                  width: formData.width || 115,
                  height: formData.height || 84,
                  backgroundColor: convertHexColor(formData.backgroundColorTop),
                  border: '2px solid #ddd',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${formData.fontSize}px`,
                  fontWeight: 500,
                  color: getContrastTextColor(convertHexColor(formData.backgroundColorTop))
                }}
              >
                {formData.styleName || 'Button'}
              </Box>
            </Center>
            <Text size="xs" c="dimmed" mt="xs" ta="center">
              {formData.width || 115}px × {formData.height || 84}px • {formData.fontSize}pt
            </Text>
          </Paper>

          {/* Form Fields */}
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Style Name"
                placeholder="e.g., Primary Button"
                value={formData.styleName}
                onChange={(e) => setFormData({ ...formData, styleName: e.currentTarget.value })}
                required
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <ColorInput
                label="Background Color"
                value={convertHexColor(formData.backgroundColorTop)}
                onChange={(value) => setFormData({
                  ...formData,
                  backgroundColorTop: formatColorForAPI(value)
                })}
                format="hex"
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.styleName.trim() || saving}
              loading={saving}
              color="green"
            >
              {selectedStyle ? 'Update' : 'Create'}
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
          Are you sure you want to delete the button style "{selectedStyle?.styleName}"?
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

export default ButtonStylesPage;
