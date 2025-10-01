import { Breadcrumbs, Anchor, Text, Menu, Group, UnstyledButton } from '@mantine/core'
import { IconChevronRight, IconSelector } from '@tabler/icons-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface BreadcrumbItem {
  label: string
  path?: string
  isDropdown?: boolean
  dropdownItems?: { label: string; path: string }[]
}

interface BreadcrumbWithDropdownProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbWithDropdown({ items }: BreadcrumbWithDropdownProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeDropdownLabel, setActiveDropdownLabel] = useState<string>('')

  useEffect(() => {
    // Update dropdown label based on current path
    items.forEach(item => {
      if (item.dropdownItems) {
        const currentItem = item.dropdownItems.find(
          dropItem => dropItem.path === location.pathname
        )
        if (currentItem) {
          setActiveDropdownLabel(currentItem.label)
        }
      }
    })
  }, [location.pathname, items])

  return (
    <Breadcrumbs
      separator={<IconChevronRight size={14} />}
      styles={{
        root: { fontSize: 14 },
        separator: { color: '#697386' },
      }}
    >
      {items.map((item, index) => {
        if (item.isDropdown && item.dropdownItems) {
          return (
            <Menu key={index} shadow="md" width={200} position="bottom-start">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={4}>
                    <Text size="sm" fw={500} c="dark">
                      {activeDropdownLabel || item.label}
                    </Text>
                    <IconSelector size={16} style={{ color: '#697386' }} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                {item.dropdownItems.map(dropItem => (
                  <Menu.Item
                    key={dropItem.path}
                    onClick={() => navigate(dropItem.path)}
                    style={{
                      backgroundColor:
                        location.pathname === dropItem.path ? '#F6F9FC' : 'transparent',
                    }}
                  >
                    <Text
                      size="sm"
                      fw={location.pathname === dropItem.path ? 500 : 400}
                      c={location.pathname === dropItem.path ? '#5469D4' : 'inherit'}
                    >
                      {dropItem.label}
                    </Text>
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )
        }

        if (item.path) {
          return (
            <Anchor key={index} onClick={() => navigate(item.path!)} c="dimmed">
              {item.label}
            </Anchor>
          )
        }

        return (
          <Text key={index} c="dark" fw={500}>
            {item.label}
          </Text>
        )
      })}
    </Breadcrumbs>
  )
}