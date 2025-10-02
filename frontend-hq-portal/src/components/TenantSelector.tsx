import { Box, UnstyledButton, Group, Text, Menu, Divider, ScrollArea } from '@mantine/core';
import {
  IconChevronDown,
  IconBuilding,
  IconPlus,
  IconCheck,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useBrands } from '../contexts/BrandContext';
import { useState, useMemo } from 'react';

export function TenantSelector() {
  const navigate = useNavigate();
  const { companiesWithBrands, selectedBrand, selectBrand } = useBrands();
  const [menuOpened, setMenuOpened] = useState(false);

  // Group brands by company from BrandContext
  const groupedBrands = useMemo(() => {
    const groups: Record<string, Array<{ id: number; name: string; companyId: number; companyName: string }>> = {};

    companiesWithBrands.forEach(cwb => {
      const companyName = cwb.company.name || `Company #${cwb.company.id}`;

      if (!groups[companyName]) {
        groups[companyName] = [];
      }

      cwb.brands.forEach(brand => {
        groups[companyName].push({
          id: brand.id,
          name: brand.name,
          companyId: cwb.company.id,
          companyName: companyName,
        });
      });
    });

    return groups;
  }, [companiesWithBrands]);

  // Get current tenant display name
  const currentTenantName = useMemo(() => {
    if (!selectedBrand) {
      return 'Select Brand';
    }

    // Find the selected brand in grouped brands
    for (const brands of Object.values(groupedBrands)) {
      const brand = brands.find(b => b.id.toString() === selectedBrand);
      if (brand) {
        return brand.name;
      }
    }

    return 'Select Brand';
  }, [selectedBrand, groupedBrands]);

  // Get tenant initials for avatar
  const getTenantInitials = () => {
    if (!currentTenantName || currentTenantName === 'No Organization') return 'N';
    return currentTenantName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleTenantSwitch = async (brandId: number) => {
    await selectBrand(brandId.toString());
    setMenuOpened(false);
  };

  return (
    <Menu
      shadow="md"
      width={280}
      position="bottom-start"
      offset={4}
      opened={menuOpened}
      onChange={setMenuOpened}
    >
      <Menu.Target>
        <UnstyledButton
          w="100%"
          p="xs"
          style={(theme) => ({
            borderRadius: theme.radius.md,
            border: `1px solid ${theme.colors.gray[3]}`,
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: theme.colors.gray[0],
              borderColor: theme.colors.gray[4],
            },
          })}
        >
          <Group gap="sm">
            {/* Desktop avatar */}
            <Box visibleFrom="sm">
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
                {getTenantInitials()}
              </Box>
            </Box>
            {/* Mobile avatar */}
            <Box hiddenFrom="sm">
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: '#5469D4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 20,
                }}
              >
                {getTenantInitials()}
              </Box>
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} lineClamp={1} visibleFrom="sm">
                {currentTenantName}
              </Text>
              <Text size="md" fw={600} lineClamp={1} hiddenFrom="sm">
                {currentTenantName}
              </Text>
            </Box>
            <Box visibleFrom="sm">
              <IconChevronDown
                size={16}
                style={{
                  color: '#697386',
                  transform: menuOpened ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </Box>
            <Box hiddenFrom="sm">
              <IconChevronDown
                size={20}
                style={{
                  color: '#697386',
                  transform: menuOpened ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </Box>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown p={0}>
        {/* Brands grouped by company */}
        <ScrollArea h={300} type="auto">
          <Box p="xs">
            {Object.entries(groupedBrands).map(([companyName, brands]) => (
              <Box key={companyName} mb="sm">
                <Text
                  size="xs"
                  fw={600}
                  c="dimmed"
                  tt="uppercase"
                  px="xs"
                  mb={4}
                >
                  {companyName}
                </Text>
                {brands.map((brand) => (
                  <Menu.Item
                    key={brand.id}
                    leftSection={<IconBuilding size={16} />}
                    rightSection={
                      selectedBrand === brand.id.toString() ? (
                        <IconCheck size={16} color="#5469D4" />
                      ) : null
                    }
                    onClick={() => handleTenantSwitch(brand.id)}
                    style={{
                      backgroundColor:
                        selectedBrand === brand.id.toString()
                          ? 'rgba(84, 105, 212, 0.1)'
                          : undefined,
                    }}
                  >
                    <Text size="sm">{brand.name}</Text>
                  </Menu.Item>
                ))}
              </Box>
            ))}

            {Object.keys(groupedBrands).length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="md">
                No organizations available
              </Text>
            )}
          </Box>
        </ScrollArea>

        <Divider my="sm" />

        {/* Organization Management button at bottom */}
        <Box px="xs" pb="xs">
          <Menu.Item
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate('/organization-management')}
            style={{
              borderRadius: 6,
              fontWeight: 500,
              padding: '10px 12px',
            }}
          >
            Organization Management
          </Menu.Item>
        </Box>
      </Menu.Dropdown>
    </Menu>
  );
}
