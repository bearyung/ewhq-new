import {
  Box,
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Button,
  Tabs,
  Badge,
  TextInput,
  ActionIcon,
  Card,
  SimpleGrid,
  UnstyledButton,
  ThemeIcon,
  Anchor,
  Breadcrumbs,
} from '@mantine/core'
import {
  IconSearch,
  IconPlus,
  IconCategory,
  IconTags,
  IconPackage,
  IconAdjustments,
  IconPercentage,
  IconDiscount2,
  IconChevronRight,
  IconLayoutGrid,
  IconList,
  IconFilter,
  IconDownload,
  IconUpload,
  IconPalette,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Sub-navigation items with descriptions
const menuSections = [
  {
    id: 'categories',
    label: 'Categories',
    icon: IconCategory,
    color: 'indigo',
    description: 'Organize menu items into logical groups',
    stats: '12 categories',
    path: '/menus/categories',
  },
  {
    id: 'virtual-categories',
    label: 'Virtual Categories',
    icon: IconTags,
    color: 'teal',
    description: 'Create dynamic categories based on rules',
    stats: '5 virtual',
    path: '/menus/virtual-categories',
  },
  {
    id: 'items',
    label: 'Menu Items',
    icon: IconPackage,
    color: 'blue',
    description: 'Manage all menu items and their details',
    stats: '156 items',
    path: '/menus/items',
  },
  {
    id: 'modifiers',
    label: 'Modifiers',
    icon: IconAdjustments,
    color: 'grape',
    description: 'Add-ons and customization options',
    stats: '24 modifiers',
    path: '/menus/modifiers',
  },
  {
    id: 'promotions',
    label: 'Promotions',
    icon: IconPercentage,
    color: 'orange',
    description: 'Special offers and promotional campaigns',
    stats: '3 active',
    path: '/menus/promotions',
  },
  {
    id: 'discounts',
    label: 'Discounts',
    icon: IconDiscount2,
    color: 'red',
    description: 'Discount rules and coupon management',
    stats: '8 rules',
    path: '/menus/discounts',
  },
  {
    id: 'button-styles',
    label: 'Button Styles',
    icon: IconPalette,
    color: 'violet',
    description: 'Customize menu button appearance and layout',
    stats: '4 styles',
    path: '/operations/menu/button-styles',
  },
]

export function MenuPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string | null>('overview')

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
          <Breadcrumbs
            separator={<IconChevronRight size={14} />}
            styles={{
              root: { fontSize: 14 },
              separator: { color: '#697386' },
            }}
          >
            <Anchor onClick={() => navigate('/')} c="dimmed">
              Dashboard
            </Anchor>
            <Text c="dark" fw={500}>Menu Management</Text>
          </Breadcrumbs>
        </Container>
      </Box>

      {/* Page Header - Non-sticky */}
      <Box
        pt="xl"
        px="xl"
        pb="lg"
        style={{
          backgroundColor: 'white',
        }}
      >
        <Container size="xl">
          {/* Page Title and Actions */}
          <Group justify="space-between" mb="xl">
            <Box>
              <Title order={1} size={28} fw={600}>
                Menu Management
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                Configure your menu structure, items, and pricing
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
                variant="default"
                leftSection={<IconUpload size={16} />}
                style={{ border: '1px solid #E3E8EE' }}
              >
                Import
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                style={{
                  backgroundColor: '#5469D4',
                  color: 'white',
                }}
              >
                Add Item
              </Button>
            </Group>
          </Group>

          {/* Tab Navigation for Different Views */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List style={{ borderBottom: 'none' }}>
              <Tabs.Tab value="overview" style={{ fontSize: 14 }}>
                Overview
              </Tabs.Tab>
              <Tabs.Tab value="analytics" style={{ fontSize: 14 }}>
                Analytics
                <Badge size="sm" variant="filled" color="red" ml={8}>
                  3
                </Badge>
              </Tabs.Tab>
              <Tabs.Tab value="settings" style={{ fontSize: 14 }}>
                Settings
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Box p="xl" style={{ backgroundColor: '#F6F9FC', minHeight: 'calc(100vh - 200px)' }}>
        <Container size="xl">
          {activeTab === 'overview' && (
            <Stack gap="xl">
              {/* Quick Stats */}
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                <Paper p="md" radius="md" style={{ border: '1px solid #E3E8EE', backgroundColor: 'white' }}>
                  <Group justify="space-between">
                    <Box>
                      <Text size="xs" c="dimmed" fw={500} tt="uppercase">Total Items</Text>
                      <Title order={3} size={24} fw={600} mt={4}>156</Title>
                    </Box>
                    <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                      <IconPackage size={20} />
                    </ThemeIcon>
                  </Group>
                </Paper>

                <Paper p="md" radius="md" style={{ border: '1px solid #E3E8EE', backgroundColor: 'white' }}>
                  <Group justify="space-between">
                    <Box>
                      <Text size="xs" c="dimmed" fw={500} tt="uppercase">Categories</Text>
                      <Title order={3} size={24} fw={600} mt={4}>12</Title>
                    </Box>
                    <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
                      <IconCategory size={20} />
                    </ThemeIcon>
                  </Group>
                </Paper>

                <Paper p="md" radius="md" style={{ border: '1px solid #E3E8EE', backgroundColor: 'white' }}>
                  <Group justify="space-between">
                    <Box>
                      <Text size="xs" c="dimmed" fw={500} tt="uppercase">Active Promos</Text>
                      <Title order={3} size={24} fw={600} mt={4}>3</Title>
                    </Box>
                    <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                      <IconPercentage size={20} />
                    </ThemeIcon>
                  </Group>
                </Paper>

                <Paper p="md" radius="md" style={{ border: '1px solid #E3E8EE', backgroundColor: 'white' }}>
                  <Group justify="space-between">
                    <Box>
                      <Text size="xs" c="dimmed" fw={500} tt="uppercase">Out of Stock</Text>
                      <Title order={3} size={24} fw={600} mt={4}>5</Title>
                    </Box>
                    <ThemeIcon size="lg" radius="md" variant="light" color="red">
                      <IconPackage size={20} />
                    </ThemeIcon>
                  </Group>
                </Paper>
              </SimpleGrid>

              {/* Search Bar */}
              <Paper p="md" radius="md" style={{ border: '1px solid #E3E8EE', backgroundColor: 'white' }}>
                <Group>
                  <TextInput
                    placeholder="Search menu sections..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    style={{ flex: 1 }}
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
                  <Group gap={4}>
                    <ActionIcon
                      variant="default"
                      size="lg"
                      style={{ border: '1px solid #E3E8EE' }}
                    >
                      <IconLayoutGrid size={18} />
                    </ActionIcon>
                    <ActionIcon
                      variant="default"
                      size="lg"
                      style={{ border: '1px solid #E3E8EE' }}
                    >
                      <IconList size={18} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>

              {/* Section Cards Grid */}
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {menuSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <UnstyledButton
                      key={section.id}
                      onClick={() => navigate(section.path)}
                      style={{ display: 'block' }}
                    >
                      <Card
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        style={{
                          border: '1px solid #E3E8EE',
                          backgroundColor: 'white',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            borderColor: '#5469D4',
                          },
                        }}
                      >
                        <Group justify="space-between" mb="md">
                          <ThemeIcon
                            size="xl"
                            radius="md"
                            variant="light"
                            color={section.color}
                          >
                            <Icon size={24} />
                          </ThemeIcon>
                          <IconChevronRight size={20} style={{ color: '#697386' }} />
                        </Group>

                        <Title order={3} size={18} fw={600} mb={8}>
                          {section.label}
                        </Title>

                        <Text size="sm" c="dimmed" mb="md">
                          {section.description}
                        </Text>

                        <Group justify="space-between">
                          <Badge
                            size="sm"
                            variant="light"
                            color={section.color}
                            style={{ textTransform: 'none' }}
                          >
                            {section.stats}
                          </Badge>
                          <Text size="xs" c="indigo" fw={500}>
                            Manage →
                          </Text>
                        </Group>
                      </Card>
                    </UnstyledButton>
                  )
                })}
              </SimpleGrid>

              {/* Recent Activity Section */}
              <Paper p="xl" radius="md" style={{ border: '1px solid #E3E8EE', backgroundColor: 'white' }}>
                <Group justify="space-between" mb="md">
                  <Title order={2} size={20} fw={600}>
                    Recent Activity
                  </Title>
                  <Anchor size="sm" c="indigo">
                    View all →
                  </Anchor>
                </Group>

                <Stack gap="sm">
                  <Group justify="space-between" p="sm" style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <Group>
                      <ThemeIcon size="md" radius="md" variant="light" color="green">
                        <IconPlus size={16} />
                      </ThemeIcon>
                      <Box>
                        <Text size="sm" fw={500}>New item added</Text>
                        <Text size="xs" c="dimmed">Spicy Chicken Burger added to Main Courses</Text>
                      </Box>
                    </Group>
                    <Text size="xs" c="dimmed">2 hours ago</Text>
                  </Group>

                  <Group justify="space-between" p="sm" style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <Group>
                      <ThemeIcon size="md" radius="md" variant="light" color="orange">
                        <IconPercentage size={16} />
                      </ThemeIcon>
                      <Box>
                        <Text size="sm" fw={500}>Promotion activated</Text>
                        <Text size="xs" c="dimmed">Happy Hour 20% off on selected drinks</Text>
                      </Box>
                    </Group>
                    <Text size="xs" c="dimmed">5 hours ago</Text>
                  </Group>

                  <Group justify="space-between" p="sm">
                    <Group>
                      <ThemeIcon size="md" radius="md" variant="light" color="blue">
                        <IconAdjustments size={16} />
                      </ThemeIcon>
                      <Box>
                        <Text size="sm" fw={500}>Modifier updated</Text>
                        <Text size="xs" c="dimmed">Extra cheese price changed from $2 to $2.50</Text>
                      </Box>
                    </Group>
                    <Text size="xs" c="dimmed">Yesterday</Text>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          )}

          {activeTab === 'analytics' && (
            <Paper p="xl" radius="md" style={{ border: '1px solid #E3E8EE', backgroundColor: 'white' }}>
              <Title order={2} size={20} fw={600} mb="md">
                Menu Analytics
              </Title>
              <Text c="dimmed">Analytics content coming soon...</Text>
            </Paper>
          )}

          {activeTab === 'settings' && (
            <Paper p="xl" radius="md" style={{ border: '1px solid #E3E8EE', backgroundColor: 'white' }}>
              <Title order={2} size={20} fw={600} mb="md">
                Menu Settings
              </Title>
              <Text c="dimmed">Settings content coming soon...</Text>
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  )
}