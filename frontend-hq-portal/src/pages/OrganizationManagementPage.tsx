import React, { useState } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Stack,
  Title,
  Text,
  Group,
  Button,
  Card,
  Badge,
  Table,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Alert,
} from '@mantine/core';
import {
  IconBuilding,
  IconBuildingStore,
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useAuth } from '../contexts/Auth0Context';

export function OrganizationManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>('companies');
  const [addModalOpened, setAddModalOpened] = useState(false);

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Stack gap="xl" mb="xl">
        <Group justify="space-between" align="start">
          <div>
            <Title order={2}>Organization Management</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Manage your companies, brands, shops, and user access rights
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setAddModalOpened(true)}
          >
            Add New
          </Button>
        </Group>
      </Stack>

      {/* Tabs */}
      <Paper withBorder radius="md">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="companies" leftSection={<IconBuilding size={16} />}>
              Companies
            </Tabs.Tab>
            <Tabs.Tab value="brands" leftSection={<IconBuildingStore size={16} />}>
              Brands
            </Tabs.Tab>
            <Tabs.Tab value="shops" leftSection={<IconBuildingStore size={16} />}>
              Shops
            </Tabs.Tab>
            <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
              User Access
            </Tabs.Tab>
          </Tabs.List>

          {/* Companies Tab */}
          <Tabs.Panel value="companies" p="xl">
            <Stack gap="lg">
              <Title order={4}>Companies</Title>

              {user?.companies && user.companies.length > 0 ? (
                <Stack gap="md">
                  {user.companies.map((company) => (
                    <Card key={company.companyId} withBorder p="md">
                      <Group justify="space-between" mb="sm">
                        <Group>
                          <IconBuilding size={20} />
                          <Text fw={500}>{company.name || `Company #${company.companyId}`}</Text>
                        </Group>
                        <Group gap="xs">
                          <Badge color={company.isActive ? 'green' : 'gray'}>
                            {company.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="light">{company.role}</Badge>
                          <ActionIcon variant="light" color="blue">
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon variant="light" color="red">
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">Company ID</Text>
                          <Text size="sm">{company.companyId}</Text>
                        </Group>
                        {company.acceptedAt && (
                          <Group justify="space-between">
                            <Text size="sm" c="dimmed">Joined</Text>
                            <Text size="sm">{new Date(company.acceptedAt).toLocaleDateString()}</Text>
                          </Group>
                        )}
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Alert icon={<IconAlertCircle size={16} />} color="blue">
                  You don't have any companies yet. Click "Add New" to create one.
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Brands Tab */}
          <Tabs.Panel value="brands" p="xl">
            <Stack gap="lg">
              <Title order={4}>Brands</Title>
              <Alert icon={<IconAlertCircle size={16} />} color="blue">
                Brand management functionality will be available soon. Brands are sub-organizations under companies.
              </Alert>
            </Stack>
          </Tabs.Panel>

          {/* Shops Tab */}
          <Tabs.Panel value="shops" p="xl">
            <Stack gap="lg">
              <Title order={4}>Shops</Title>
              {user?.shopId ? (
                <Card withBorder p="md">
                  <Group justify="space-between" mb="sm">
                    <Group>
                      <IconBuildingStore size={20} />
                      <Text fw={500}>Shop #{user.shopId}</Text>
                    </Group>
                    <Group gap="xs">
                      <ActionIcon variant="light" color="blue">
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Shop ID</Text>
                      <Text size="sm">{user.shopId}</Text>
                    </Group>
                  </Stack>
                </Card>
              ) : (
                <Alert icon={<IconAlertCircle size={16} />} color="blue">
                  No shop associated with your account yet. Click "Add New" to create one.
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>

          {/* User Access Tab */}
          <Tabs.Panel value="users" p="xl">
            <Stack gap="lg">
              <Title order={4}>User Access Rights</Title>
              <Alert icon={<IconAlertCircle size={16} />} color="blue">
                User access management functionality will be available soon. Here you'll be able to invite users and manage their access rights to companies, brands, and shops.
              </Alert>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* Add Modal */}
      <Modal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        title={`Add New ${activeTab === 'companies' ? 'Company' : activeTab === 'brands' ? 'Brand' : activeTab === 'shops' ? 'Shop' : 'User'}`}
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder={`Enter ${activeTab === 'companies' ? 'company' : activeTab === 'brands' ? 'brand' : 'shop'} name`}
            required
          />
          {activeTab === 'brands' && (
            <Select
              label="Company"
              placeholder="Select company"
              data={user?.companies?.map(c => ({
                value: c.companyId.toString(),
                label: c.name || `Company #${c.companyId}`
              })) || []}
              required
            />
          )}
          {activeTab === 'shops' && (
            <>
              <Select
                label="Company"
                placeholder="Select company"
                data={user?.companies?.map(c => ({
                  value: c.companyId.toString(),
                  label: c.name || `Company #${c.companyId}`
                })) || []}
                required
              />
              <Select
                label="Brand"
                placeholder="Select brand"
                data={[]}
                required
              />
            </>
          )}
          {activeTab === 'users' && (
            <>
              <TextInput
                label="Email"
                placeholder="user@example.com"
                type="email"
                required
              />
              <Select
                label="Role"
                placeholder="Select role"
                data={[
                  { value: 'Admin', label: 'Admin' },
                  { value: 'Manager', label: 'Manager' },
                  { value: 'Employee', label: 'Employee' },
                  { value: 'Standard', label: 'Standard' },
                ]}
                required
              />
            </>
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setAddModalOpened(false)}>
              Cancel
            </Button>
            <Button>
              Add {activeTab === 'companies' ? 'Company' : activeTab === 'brands' ? 'Brand' : activeTab === 'shops' ? 'Shop' : 'User'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
