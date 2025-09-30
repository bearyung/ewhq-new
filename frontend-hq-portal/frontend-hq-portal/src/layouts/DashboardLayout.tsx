import { AppShell, Burger, Group, TextInput, ActionIcon, Badge, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import {
  IconSearch,
  IconApps,
  IconHelp,
  IconBell,
  IconSettings,
  IconPlus,
} from '@tabler/icons-react'

export function DashboardLayout() {
  const [opened, { toggle }] = useDisclosure()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding={0}
      styles={{
        main: {
          backgroundColor: '#F6F9FC',
        },
      }}
    >
      <AppShell.Header
        style={{
          borderBottom: '1px solid #E3E8EE',
          backgroundColor: 'white',
        }}
      >
        <Group h="100%" px="md" justify="space-between" gap="md">
          <Group gap="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

            {/* Search */}
            <TextInput
              placeholder="Search"
              leftSection={<IconSearch size={16} />}
              rightSection={
                <Box
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#F6F9FC',
                    borderRadius: 4,
                    fontSize: 11,
                    color: '#697386',
                    fontWeight: 500,
                  }}
                >
                  /
                </Box>
              }
              styles={{
                input: {
                  width: 300,
                  borderRadius: 6,
                  border: '1px solid #E3E8EE',
                  fontSize: 14,
                  '&:focus': {
                    borderColor: '#5469D4',
                  },
                },
              }}
            />
          </Group>

          {/* Right side tools */}
          <Group gap="xs">
            {/* Test Mode Badge */}
            <Badge
              size="sm"
              variant="light"
              style={{
                backgroundColor: '#FFE6CC',
                color: '#8B5000',
                textTransform: 'none',
                fontWeight: 500,
                padding: '4px 8px',
              }}
            >
              Test mode has moved.
            </Badge>

            <ActionIcon variant="subtle" color="gray" size="lg">
              <IconApps size={20} />
            </ActionIcon>

            <ActionIcon variant="subtle" color="gray" size="lg">
              <IconHelp size={20} />
            </ActionIcon>

            <ActionIcon variant="subtle" color="gray" size="lg">
              <IconBell size={20} />
            </ActionIcon>

            <ActionIcon variant="subtle" color="gray" size="lg">
              <IconSettings size={20} />
            </ActionIcon>

            <ActionIcon
              variant="filled"
              size="lg"
              style={{
                backgroundColor: '#5469D4',
              }}
            >
              <IconPlus size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          borderRight: '1px solid #E3E8EE',
          backgroundColor: 'white',
          overflow: 'hidden',
        }}
      >
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}