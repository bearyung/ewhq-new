import {
  Box,
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Button,
  TextInput,
  ActionIcon,
  Table,
  Badge,
  Menu,
  Switch,
  Breadcrumbs,
  Anchor,
  UnstyledButton,
  Avatar,
  Checkbox,
  Tooltip,
  Drawer,
  Select,
  Textarea,
  NumberInput,
  ColorSwatch,
  Grid,
  Image,
  FileButton,
} from '@mantine/core'
import {
  IconSearch,
  IconPlus,
  IconFilter,
  IconDownload,
  IconChevronRight,
  IconDots,
  IconEdit,
  IconTrash,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconGripVertical,
  IconPhoto,
  IconUpload,
  IconX,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BreadcrumbWithDropdown } from '../components/BreadcrumbWithDropdown'

// Sample data for categories
const categoriesData = [
  {
    id: 1,
    name: 'Appetizers',
    description: 'Start your meal with our delicious appetizers',
    items: 12,
    visible: true,
    order: 1,
    color: '#5469D4',
    image: null,
  },
  {
    id: 2,
    name: 'Main Courses',
    description: 'Hearty and satisfying main dishes',
    items: 28,
    visible: true,
    order: 2,
    color: '#0E6027',
    image: null,
  },
  {
    id: 3,
    name: 'Beverages',
    description: 'Refreshing drinks and beverages',
    items: 15,
    visible: true,
    order: 3,
    color: '#1C92D2',
    image: null,
  },
  {
    id: 4,
    name: 'Desserts',
    description: 'Sweet endings to your meal',
    items: 8,
    visible: false,
    order: 4,
    color: '#F2994A',
    image: null,
  },
]

export function MenuCategoriesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [drawerOpened, setDrawerOpened] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const resetRef = useRef<() => void>(null)
  const [file, setFile] = useState<File | null>(null)

  // Form state for drawer
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#5469D4',
    visible: true,
  })

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      visible: category.visible,
    })
    setDrawerOpened(true)
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      color: '#5469D4',
      visible: true,
    })
    setDrawerOpened(true)
  }

  const filteredCategories = categoriesData.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectAll = () => {
    setSelectedCategories(categoriesData.map(c => c.id))
  }

  const clearSelection = () => {
    setSelectedCategories([])
  }

  return (
    <Box>
      {/* Sticky Breadcrumbs Only */}
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
                label: 'Categories',
                isDropdown: true,
                dropdownItems: [
                  { label: 'Categories', path: '/menus/categories' },
                  { label: 'Virtual Categories', path: '/menus/virtual-categories' },
                  { label: 'Menu Items', path: '/menus/items' },
                  { label: 'Modifiers', path: '/menus/modifiers' },
                  { label: 'Promotions', path: '/menus/promotions' },
                  { label: 'Discounts', path: '/menus/discounts' },
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
                onClick={handleCreate}
              >
                Add Category
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Main Content Area with two-column layout */}
      <Box style={{ backgroundColor: '#F6F9FC', minHeight: 'calc(100vh - 200px)' }}>
        <Container size="xl" py="xl">
          <Grid gutter="xl">
            {/* Left Column - Main Content (70%) */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              {/* Search and Filter Bar */}
              <Paper
                p="md"
                radius="md"
                mb="md"
                style={{
                  border: '1px solid #E3E8EE',
                  backgroundColor: 'white',
                }}
              >
                <Group justify="space-between">
                  <Group style={{ flex: 1 }}>
                    <TextInput
                      placeholder="Search categories..."
                      leftSection={<IconSearch size={16} />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.currentTarget.value)}
                      style={{ width: 300 }}
                      styles={{
                        input: {
                          border: '1px solid #E3E8EE',
                          '&:focus': {
                            borderColor: '#5469D4',
                          },
                        },
                      }}
                    />
                    <Button
                      variant="default"
                      leftSection={<IconFilter size={16} />}
                      style={{ border: '1px solid #E3E8EE' }}
                    >
                      Filters
                    </Button>
                  </Group>

                  {/* Bulk Actions */}
                  {selectedCategories.length > 0 && (
                    <Group gap="xs">
                      <Badge variant="filled" color="indigo">
                        {selectedCategories.length} selected
                      </Badge>
                      <Button size="xs" variant="subtle" onClick={clearSelection}>
                        Clear
                      </Button>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <Button size="xs" variant="default">
                            Actions
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconEye size={14} />}>
                            Make Visible
                          </Menu.Item>
                          <Menu.Item leftSection={<IconEyeOff size={14} />}>
                            Make Hidden
                          </Menu.Item>
                          <Menu.Item leftSection={<IconCopy size={14} />}>
                            Duplicate
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                            Delete Selected
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  )}
                </Group>
              </Paper>

              {/* Categories Table/List */}
              <Paper
                radius="md"
                style={{
                  border: '1px solid #E3E8EE',
                  backgroundColor: 'white',
                  overflow: 'hidden',
                }}
              >
                {/* Table Header */}
                <Box
                  px="md"
                  py="sm"
                  style={{
                    borderBottom: '1px solid #E3E8EE',
                    backgroundColor: '#F6F9FC',
                  }}
                >
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Checkbox
                        checked={selectedCategories.length === categoriesData.length}
                        indeterminate={
                          selectedCategories.length > 0 &&
                          selectedCategories.length < categoriesData.length
                        }
                        onChange={() => {
                          if (selectedCategories.length === categoriesData.length) {
                            clearSelection()
                          } else {
                            selectAll()
                          }
                        }}
                      />
                      <Text size="sm" fw={500} c="dimmed">
                        {filteredCategories.length} Categories
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      Drag to reorder
                    </Text>
                  </Group>
                </Box>

                {/* Table Body */}
                <Stack gap={0}>
                  {filteredCategories.map((category, index) => (
                    <Box
                      key={category.id}
                      px="md"
                      py="md"
                      style={{
                        borderBottom:
                          index < filteredCategories.length - 1
                            ? '1px solid #F0F0F0'
                            : 'none',
                        backgroundColor: selectedCategories.includes(category.id)
                          ? '#F6F9FC'
                          : 'white',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: '#F6F9FC',
                        },
                      }}
                    >
                      <Group justify="space-between">
                        <Group>
                          {/* Drag Handle */}
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            style={{ cursor: 'grab' }}
                          >
                            <IconGripVertical size={16} />
                          </ActionIcon>

                          {/* Checkbox */}
                          <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => {
                              if (selectedCategories.includes(category.id)) {
                                setSelectedCategories(prev =>
                                  prev.filter(id => id !== category.id)
                                )
                              } else {
                                setSelectedCategories(prev => [...prev, category.id])
                              }
                            }}
                          />

                          {/* Category Info */}
                          <Group>
                            <ColorSwatch color={category.color} size={24} />
                            <Box>
                              <Group gap="xs">
                                <Text fw={500} size="sm">
                                  {category.name}
                                </Text>
                                {!category.visible && (
                                  <Badge size="xs" variant="light" color="gray">
                                    Hidden
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed">
                                {category.description}
                              </Text>
                            </Box>
                          </Group>
                        </Group>

                        <Group>
                          {/* Item Count */}
                          <Badge variant="light" color="blue">
                            {category.items} items
                          </Badge>

                          {/* Visibility Toggle */}
                          <Tooltip label={category.visible ? 'Visible' : 'Hidden'}>
                            <Switch
                              size="sm"
                              checked={category.visible}
                              onChange={() => {}}
                              styles={{
                                track: {
                                  backgroundColor: category.visible ? '#5469D4' : '#ADB5BD',
                                },
                              }}
                            />
                          </Tooltip>

                          {/* Actions Menu */}
                          <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => handleEdit(category)}
                              >
                                Edit Category
                              </Menu.Item>
                              <Menu.Item leftSection={<IconCopy size={14} />}>
                                Duplicate
                              </Menu.Item>
                              <Menu.Item leftSection={<IconEye size={14} />}>
                                View Items
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid.Col>

            {/* Right Column - Sidebar Info (30%) */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Stack gap="md">
                {/* Quick Stats */}
                <Paper
                  p="lg"
                  radius="md"
                  style={{
                    border: '1px solid #E3E8EE',
                    backgroundColor: 'white',
                  }}
                >
                  <Title order={3} size={16} fw={600} mb="md">
                    Quick Stats
                  </Title>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Total Categories</Text>
                      <Text size="sm" fw={500}>{categoriesData.length}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Visible</Text>
                      <Text size="sm" fw={500}>
                        {categoriesData.filter(c => c.visible).length}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Hidden</Text>
                      <Text size="sm" fw={500}>
                        {categoriesData.filter(c => !c.visible).length}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Total Items</Text>
                      <Text size="sm" fw={500}>
                        {categoriesData.reduce((acc, c) => acc + c.items, 0)}
                      </Text>
                    </Group>
                  </Stack>
                </Paper>

                {/* Tips */}
                <Paper
                  p="lg"
                  radius="md"
                  style={{
                    border: '1px solid #FFA94D',
                    backgroundColor: '#FFF4E6',
                  }}
                >
                  <Group gap="xs" mb="sm">
                    <IconAlertCircle size={20} style={{ color: '#FD7E14' }} />
                    <Title order={3} size={16} fw={600}>
                      Pro Tips
                    </Title>
                  </Group>
                  <Stack gap="xs">
                    <Text size="xs">
                      • Drag categories to reorder them in the menu
                    </Text>
                    <Text size="xs">
                      • Hidden categories won't appear in POS or online ordering
                    </Text>
                    <Text size="xs">
                      • Use colors to make categories easily identifiable
                    </Text>
                    <Text size="xs">
                      • Group similar items together for better organization
                    </Text>
                  </Stack>
                </Paper>

                {/* Recent Changes */}
                <Paper
                  p="lg"
                  radius="md"
                  style={{
                    border: '1px solid #E3E8EE',
                    backgroundColor: 'white',
                  }}
                >
                  <Group justify="space-between" mb="md">
                    <Title order={3} size={16} fw={600}>
                      Recent Changes
                    </Title>
                    <Anchor size="xs" c="indigo">
                      View all
                    </Anchor>
                  </Group>
                  <Stack gap="sm">
                    <Box>
                      <Text size="sm" fw={500}>Appetizers</Text>
                      <Text size="xs" c="dimmed">
                        2 items added • 10 mins ago
                      </Text>
                    </Box>
                    <Box>
                      <Text size="sm" fw={500}>Beverages</Text>
                      <Text size="xs" c="dimmed">
                        Price updated • 2 hours ago
                      </Text>
                    </Box>
                    <Box>
                      <Text size="sm" fw={500}>Desserts</Text>
                      <Text size="xs" c="dimmed">
                        Made hidden • Yesterday
                      </Text>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Edit/Create Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title={
          <Title order={2} size={20} fw={600}>
            {editingCategory ? 'Edit Category' : 'New Category'}
          </Title>
        }
        position="right"
        size="md"
        padding="xl"
      >
        <Stack gap="md">
          <TextInput
            label="Category Name"
            placeholder="e.g., Appetizers"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Brief description of this category"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.currentTarget.value })
            }
            rows={3}
          />

          <Box>
            <Text size="sm" fw={500} mb="xs">
              Category Color
            </Text>
            <Group>
              {['#5469D4', '#0E6027', '#1C92D2', '#F2994A', '#E25950', '#8B5CF6'].map(
                color => (
                  <UnstyledButton
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                  >
                    <ColorSwatch
                      color={color}
                      size={32}
                      style={{
                        border: formData.color === color ? '2px solid #5469D4' : 'none',
                        cursor: 'pointer',
                      }}
                    />
                  </UnstyledButton>
                )
              )}
            </Group>
          </Box>

          <Box>
            <Text size="sm" fw={500} mb="xs">
              Category Image (Optional)
            </Text>
            <Paper
              p="lg"
              radius="md"
              style={{
                border: '2px dashed #E3E8EE',
                backgroundColor: '#F6F9FC',
                textAlign: 'center',
              }}
            >
              <IconPhoto size={40} style={{ color: '#ADB5BD', marginBottom: 8 }} />
              <FileButton
                resetRef={resetRef}
                onChange={setFile}
                accept="image/png,image/jpeg"
              >
                {(props) => (
                  <Button {...props} variant="subtle" size="sm">
                    Upload Image
                  </Button>
                )}
              </FileButton>
              {file && (
                <Text size="xs" c="dimmed" mt="xs">
                  Selected: {file.name}
                </Text>
              )}
            </Paper>
          </Box>

          <Switch
            label="Visible in Menu"
            description="Show this category in POS and online ordering"
            checked={formData.visible}
            onChange={(e) =>
              setFormData({ ...formData, visible: e.currentTarget.checked })
            }
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={() => setDrawerOpened(false)}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: '#5469D4' }}
              leftSection={editingCategory ? <IconCheck size={16} /> : <IconPlus size={16} />}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </Group>
        </Stack>
      </Drawer>
    </Box>
  )
}