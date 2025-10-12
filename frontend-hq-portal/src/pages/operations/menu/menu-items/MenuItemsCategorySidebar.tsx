import type { FC, ReactNode } from 'react';
import { Badge, Button, Divider, Group, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch, IconSparkles } from '@tabler/icons-react';
import { CenterLoader } from './CenterLoader';
import type { CategoryNode } from './menuItemsUtils';

interface MenuItemsCategorySidebarProps {
  isDesktopLayout: boolean;
  categorySearch: string;
  onCategorySearchChange: (value: string) => void;
  selectedCategoryId: number | null;
  totalCategoryItems: number;
  lookupsLoading: boolean;
  filteredCategories: CategoryNode[];
  renderCategoryNodes: (nodes: CategoryNode[]) => ReactNode;
  onAllItems: () => void;
}

export const MenuItemsCategorySidebar: FC<MenuItemsCategorySidebarProps> = ({
  isDesktopLayout,
  categorySearch,
  onCategorySearchChange,
  selectedCategoryId,
  totalCategoryItems,
  lookupsLoading,
  filteredCategories,
  renderCategoryNodes,
  onAllItems,
}) => (
  <Stack
    gap="sm"
    style={
      isDesktopLayout
        ? {
            flex: 1,
            overflow: 'hidden',
            minHeight: 0,
          }
        : undefined
    }
  >
    <Group justify="space-between" align="center">
      <Text size="xl" fw={700}>
        Menu Items
      </Text>
    </Group>
    <Divider />
    <Group justify="space-between">
      <Text fw={600} size="sm">
        Categories
      </Text>
      <Badge variant="light" color="gray">
        {totalCategoryItems} items
      </Badge>
    </Group>
    <TextInput
      placeholder="Search categories"
      value={categorySearch}
      onChange={(event) => onCategorySearchChange(event.currentTarget.value)}
      leftSection={<IconSearch size={16} />}
    />
    <Button
      variant={selectedCategoryId === null ? 'filled' : 'subtle'}
      color={selectedCategoryId === null ? 'indigo' : 'gray'}
      leftSection={<IconSparkles size={16} />}
      onClick={onAllItems}
    >
      All items
    </Button>
    <Divider label="Browse" labelPosition="center" />
    <ScrollArea
      type="auto"
      offsetScrollbars
      style={
        isDesktopLayout
          ? {
              flex: 1,
              minHeight: 0,
            }
          : undefined
      }
    >
      {lookupsLoading ? (
        <CenterLoader message="Loading categories" />
      ) : filteredCategories.length > 0 ? (
        <Stack gap="sm">{renderCategoryNodes(filteredCategories)}</Stack>
      ) : (
        <Stack gap="xs" align="center" py="md">
          <IconSparkles size={20} color="var(--mantine-color-gray-6)" />
          <Text size="sm" c="dimmed" ta="center">
            No categories match your search.
          </Text>
        </Stack>
      )}
    </ScrollArea>
  </Stack>
);
