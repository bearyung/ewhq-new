import React, { useState, useEffect } from 'react';
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
  Checkbox,
  Text,
  Alert,
  NumberInput,
  Grid,
  Center,
  ActionIcon,
  Badge,
  ColorInput,
  Container
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconDownload
} from '@tabler/icons-react';
import { BreadcrumbWithDropdown } from '../../../components/BreadcrumbWithDropdown';
import { useBrands } from '../../../contexts/BrandContext';
import buttonStyleService from '../../../services/buttonStyleService';
import type { ButtonStyle, CreateButtonStyle, UpdateButtonStyle } from '../../../types/buttonStyle';

const ButtonStylesPage: React.FC = () => {
  const [buttonStyles, setButtonStyles] = useState<ButtonStyle[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<ButtonStyle | null>(null);
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

  useEffect(() => {
    if (selectedBrandId) {
      fetchButtonStyles();
    }
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

    try {
      if (selectedStyle) {
        await buttonStyleService.updateButtonStyle(
          selectedBrandId,
          selectedStyle.buttonStyleId,
          formData as UpdateButtonStyle
        );
        notifications.show({
          title: 'Success',
          message: 'Button style updated successfully',
          color: 'green'
        });
      } else {
        await buttonStyleService.createButtonStyle(selectedBrandId, formData);
        notifications.show({
          title: 'Success',
          message: 'Button style created successfully',
          color: 'green'
        });
      }
      setDialogOpen(false);
      fetchButtonStyles();
    } catch (error) {
      console.error('Failed to save button style:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save button style',
        color: 'red'
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedBrandId || !selectedStyle) return;

    try {
      await buttonStyleService.deleteButtonStyle(selectedBrandId, selectedStyle.buttonStyleId);
      notifications.show({
        title: 'Success',
        message: 'Button style deleted successfully',
        color: 'green'
      });
      setDeleteDialogOpen(false);
      fetchButtonStyles();
    } catch (error) {
      console.error('Failed to delete button style:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete button style',
        color: 'red'
      });
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
          <BreadcrumbWithDropdown
            items={[
              { label: 'Dashboard', path: '/' },
              { label: 'Menu Management', path: '/menus' },
              {
                label: 'Button Styles',
                isDropdown: true,
                dropdownItems: [
                  { label: 'Categories', path: '/menus/categories' },
                  { label: 'Virtual Categories', path: '/menus/virtual-categories' },
                  { label: 'Menu Items', path: '/menus/items' },
                  { label: 'Modifiers', path: '/menus/modifiers' },
                  { label: 'Promotions', path: '/menus/promotions' },
                  { label: 'Discounts', path: '/menus/discounts' },
                  { label: 'Button Styles', path: '/operations/menu/button-styles' },
                ],
              },
            ]}
          />
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
                Button Styles
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                Customize menu button appearance and layout
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
                Add Button Style
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Box style={{ backgroundColor: '#F6F9FC', minHeight: 'calc(100vh - 200px)' }}>
        <Container size="xl" py="xl">
          <Paper withBorder shadow="sm" style={{ backgroundColor: 'white' }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '80px' }}>ID</Table.Th>
              <Table.Th>Style Name</Table.Th>
              <Table.Th>Preview</Table.Th>
              <Table.Th>Color Code</Table.Th>
              <Table.Th>Dimensions</Table.Th>
              <Table.Th>Font Size</Table.Th>
              <Table.Th style={{ width: '100px', textAlign: 'center' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {!buttonStyles || buttonStyles.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" c="dimmed" py="lg">
                    No button styles found. Create your first button style!
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              buttonStyles.map((style) => (
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
                        color: style.fontColor || '#000000'
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
                  <Table.Td>
                    <Text size="sm">{style.width} × {style.height}px</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{style.fontSize}pt</Text>
                  </Table.Td>
                  <Table.Td>
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
                  fontWeight: 500
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
            <Grid.Col span={6}>
              <TextInput
                label="Style Name"
                placeholder="e.g., Primary Button"
                value={formData.styleName}
                onChange={(e) => setFormData({ ...formData, styleName: e.currentTarget.value })}
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Alternative Name"
                placeholder="Optional alternative name"
                value={formData.styleNameAlt || ''}
                onChange={(e) => setFormData({ ...formData, styleNameAlt: e.currentTarget.value })}
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

            <Grid.Col span={4}>
              <NumberInput
                label="Font Size (pt)"
                value={formData.fontSize}
                onChange={(value) => setFormData({ ...formData, fontSize: value || 22 })}
                min={8}
                max={72}
              />
            </Grid.Col>

            <Grid.Col span={4}>
              <NumberInput
                label="Width (px)"
                value={formData.width || 115}
                onChange={(value) => setFormData({ ...formData, width: value || 115 })}
                min={50}
                max={500}
              />
            </Grid.Col>

            <Grid.Col span={4}>
              <NumberInput
                label="Height (px)"
                value={formData.height || 84}
                onChange={(value) => setFormData({ ...formData, height: value || 84 })}
                min={30}
                max={300}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Checkbox
                label="Enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.currentTarget.checked })}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.styleName.trim()}
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
          <Button variant="default" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default ButtonStylesPage;