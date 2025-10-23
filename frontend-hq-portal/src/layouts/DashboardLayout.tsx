import { useState } from 'react'
import { Box, Group, TextInput, ActionIcon, Burger, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import {
  IconSearch,
  IconApps,
  IconHelp,
  IconBell,
  IconSettings,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react'

export function DashboardLayout() {
  const [opened, { toggle }] = useDisclosure()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <Box style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar - Fixed, full height - Desktop */}
      <Box
        visibleFrom="sm"
        style={{
          width: isSidebarCollapsed ? 0 : 260,
          flexShrink: 0,
          borderRight: isSidebarCollapsed ? 'none' : '1px solid #E3E8EE',
          backgroundColor: 'white',
          overflow: 'hidden',
          transition: 'width 160ms ease',
        }}
        aria-hidden={isSidebarCollapsed}
      >
        {!isSidebarCollapsed && (
          <Box style={{ width: 260, height: '100%' }} p="md">
            <Sidebar />
          </Box>
        )}
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
            <Sidebar onClose={toggle} />
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
          <Group h="100%" px="md" gap="md" style={{ flex: 1 }}>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />

            {/* Search - Mobile (icon only) */}
            <ActionIcon
              hiddenFrom="sm"
              variant="subtle"
              color="gray"
              size="lg"
            >
              <IconSearch size={20} />
            </ActionIcon>

            <Tooltip
              label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              withArrow
            >
              <ActionIcon
                visibleFrom="sm"
                variant={isSidebarCollapsed ? 'filled' : 'light'}
                color={isSidebarCollapsed ? 'indigo' : 'gray'}
                size="lg"
                aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-pressed={isSidebarCollapsed}
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              >
                {isSidebarCollapsed ? (
                  <IconLayoutSidebarLeftExpand size={18} />
                ) : (
                  <IconLayoutSidebarLeftCollapse size={18} />
                )}
              </ActionIcon>
            </Tooltip>

            {/* Search - Desktop (flexible width) */}
            <Box visibleFrom="sm" style={{ flex: 1 }}>
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
                    borderRadius: 6,
                    border: '1px solid #E3E8EE',
                    fontSize: 14,
                    '&:focus': {
                      borderColor: '#5469D4',
                    },
                  },
                }}
              />
            </Box>

            {/* Right side tools */}
            <Group gap="xs">
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
