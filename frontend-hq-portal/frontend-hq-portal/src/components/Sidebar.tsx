import { Stack, NavLink, Box, Text, UnstyledButton, Group, Collapse, Divider, Avatar, Menu } from '@mantine/core'
import {
  IconHome,
  IconWallet,
  IconReceipt,
  IconUsers,
  IconPackage,
  IconFileText,
  IconTerminal,
  IconCreditCard,
  IconLink,
  IconUsers as IconConnectedAccounts,
  IconChevronRight,
  IconSettings,
  IconPlug,
  IconCash,
  IconChartBar,
  IconDots,
  IconLogout,
  IconUser,
} from '@tabler/icons-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedProducts, setExpandedProducts] = useState<string[]>([])

  const coreLinks = [
    { icon: IconHome, label: 'Home', path: '/' },
    { icon: IconWallet, label: 'Balances', path: '/balances' },
    { icon: IconReceipt, label: 'Transactions', path: '/transactions' },
    { icon: IconUsers, label: 'Customers', path: '/customers' },
    { icon: IconPackage, label: 'Product catalogue', path: '/products' },
  ]

  const shortcuts = [
    { icon: IconFileText, label: 'Tax forms', path: '/tax-forms' },
    { icon: IconTerminal, label: 'Terminal', path: '/terminal' },
    { icon: IconCreditCard, label: 'Billing overview', path: '/billing' },
    { icon: IconLink, label: 'Connect overview', path: '/connect' },
    { icon: IconConnectedAccounts, label: 'Connected accounts', path: '/connected-accounts' },
  ]

  const products = [
    { icon: IconLink, label: 'Connect', key: 'connect' },
    { icon: IconCash, label: 'Payments', key: 'payments' },
    { icon: IconCreditCard, label: 'Billing', key: 'billing' },
    { icon: IconChartBar, label: 'Reporting', key: 'reporting' },
    { icon: IconDots, label: 'More', key: 'more' },
  ]

  const toggleProduct = (key: string) => {
    setExpandedProducts(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Scrollable Content */}
      <Box style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Stack gap={0}>
      {/* Account Switcher */}
      <Box mb="md">
        <UnstyledButton
          w="100%"
          p="xs"
          style={(theme) => ({
            borderRadius: theme.radius.md,
            border: `1px solid ${theme.colors.gray[3]}`,
            '&:hover': {
              backgroundColor: theme.colors.gray[0],
            },
          })}
        >
          <Group gap="sm">
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                backgroundColor: '#5469D4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              C
            </Box>
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={500} lineClamp={1}>
                Caterlord QSR
              </Text>
            </Box>
            <IconChevronRight size={16} style={{ color: '#697386' }} />
          </Group>
        </UnstyledButton>
      </Box>

      {/* Core Navigation */}
      <Box mb="md">
        <Stack gap={2}>
          {coreLinks.map((link) => (
            <NavLink
              key={link.path}
              label={link.label}
              leftSection={<link.icon size={18} stroke={1.5} />}
              active={location.pathname === link.path}
              onClick={() => navigate(link.path)}
              styles={{
                root: {
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 14,
                },
                label: {
                  fontSize: 14,
                  fontWeight: 500,
                },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Shortcuts Section */}
      <Box mb="md">
        <Group justify="space-between" mb={8} px={4}>
          <Text size="xs" fw={600} c="dimmed" tt="uppercase">
            Shortcuts
          </Text>
          <UnstyledButton>
            <IconSettings size={14} style={{ color: '#697386' }} />
          </UnstyledButton>
        </Group>
        <Stack gap={2}>
          {shortcuts.map((link) => (
            <NavLink
              key={link.path}
              label={link.label}
              leftSection={<link.icon size={18} stroke={1.5} />}
              active={location.pathname === link.path}
              onClick={() => navigate(link.path)}
              styles={{
                root: {
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 14,
                },
                label: {
                  fontSize: 14,
                  fontWeight: 500,
                },
              }}
            />
          ))}
        </Stack>
      </Box>

      <Divider my="sm" />

      {/* Products Section */}
      <Box mb="md">
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={8} px={4}>
          Products
        </Text>
        <Stack gap={2}>
          {products.map((product) => (
            <Box key={product.key}>
              <UnstyledButton
                w="100%"
                p="8px 12px"
                onClick={() => toggleProduct(product.key)}
                style={(theme) => ({
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  '&:hover': {
                    backgroundColor: theme.colors.gray[0],
                  },
                })}
              >
                <product.icon size={18} stroke={1.5} style={{ color: '#697386' }} />
                <Text size="sm" fw={500} style={{ flex: 1 }}>
                  {product.label}
                </Text>
                <IconChevronRight
                  size={14}
                  style={{
                    color: '#697386',
                    transform: expandedProducts.includes(product.key) ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </UnstyledButton>
              <Collapse in={expandedProducts.includes(product.key)}>
                <Box pl="md" py="xs">
                  <Text size="xs" c="dimmed">
                    {product.label} submenu items
                  </Text>
                </Box>
              </Collapse>
            </Box>
          ))}
        </Stack>
      </Box>

        </Stack>
      </Box>

      {/* User Profile - Fixed at bottom */}
      <Box
        style={{
          borderTop: '1px solid #E3E8EE',
          backgroundColor: 'white',
          padding: '12px 0',
        }}
      >
        <Menu shadow="md" width={260} position="top-start">
          <Menu.Target>
            <UnstyledButton
              w="100%"
              p="xs"
              style={(theme) => ({
                borderRadius: 8,
                '&:hover': {
                  backgroundColor: theme.colors.gray[0],
                },
              })}
            >
              <Group gap="sm">
                <Avatar
                  color="indigo"
                  radius="xl"
                  size="md"
                  style={{
                    backgroundColor: '#5469D4',
                  }}
                >
                  MY
                </Avatar>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={600} lineClamp={1}>
                    Michael Yung
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    bearyung@gmail.com
                  </Text>
                </Box>
                <IconChevronRight size={16} style={{ color: '#697386' }} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Account</Menu.Label>
            <Menu.Item leftSection={<IconUser size={16} />}>
              Profile
            </Menu.Item>
            <Menu.Item leftSection={<IconSettings size={16} />}>
              Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconLogout size={16} />}>
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>
    </Box>
  )
}