import { Box, Group, TextInput, ActionIcon, Badge, Burger } from '@mantine/core'
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
    <Box style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar - Fixed, full height - Desktop */}
      <Box
        visibleFrom="sm"
        style={{
          width: 260,
          flexShrink: 0,
          borderRight: '1px solid #E3E8EE',
          backgroundColor: 'white',
          overflow: 'hidden',
        }}
      >
        <Box style={{ width: 260, height: '100%' }} p="md">
          <Sidebar />
        </Box>
      </Box>

      {/* Mobile Sidebar Overlay */}
      {opened && (
        <Box
          hiddenFrom="sm"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 100,
          }}
          onClick={toggle}
        >
          <Box
            style={{
              width: 260,
              height: '100%',
              backgroundColor: 'white',
              borderRight: '1px solid #E3E8EE',
            }}
            p="md"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </Box>
        </Box>
      )}

      {/* Main Content Area */}
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header - only above main content */}
        <Box
          style={{
            height: 60,
            borderBottom: '1px solid #E3E8EE',
            backgroundColor: 'white',
            flexShrink: 0,
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
        </Box>

        {/* Scrollable Content */}
        <Box
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#F6F9FC',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
