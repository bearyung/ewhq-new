import { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Button,
  Container,
  Paper,
  Card,
  TextInput,
  Radio,
  Alert,
  Loader,
  Text,
  Title,
  Divider,
  Stack,
  Badge,
  Avatar,
  Group,
  Flex,
} from '@mantine/core';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/Auth0Context';
import {
  IconBuilding,
  IconBuildingStore,
  IconBuildingCommunity,
  IconUserPlus,
  IconUserCircle,
} from '@tabler/icons-react';

const steps = ['Choose Action', 'Setup Details', 'Confirmation'];

interface TenantSetup {
  companyName?: string;
  brandName?: string;
  shopName?: string;
  shopAddress?: string;
  inviteCode?: string;
}

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, getAccessToken, logout, hasTenantAssociation, isLoading } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [action, setAction] = useState<'create' | 'join' | ''>('');
  const [tenantSetup, setTenantSetup] = useState<TenantSetup>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitationDetails, setInvitationDetails] = useState<{ organizationName: string; role?: string } | null>(null);

  // Check for invitation code in URL
  useEffect(() => {
    const inviteCode = searchParams.get('invite');
    if (inviteCode) {
      setAction('join');
      setTenantSetup({ inviteCode });
      // Automatically move to step 2 when invite code is present
      setActiveStep(1);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && hasTenantAssociation()) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, hasTenantAssociation, navigate]);

  if (isLoading) {
    return (
      <Container size="md" mt={32} mb={32}>
        <Paper p="xl" withBorder>
          <Flex direction="column" align="center">
            <Loader size="md" />
            <Text size="sm" mt="md">
              Checking your account status...
            </Text>
          </Flex>
        </Paper>
      </Container>
    );
  }

  const handleNext = () => {
    setError('');

    if (activeStep === 0 && !action) {
      setError('Please select an action to continue');
      return;
    }

    if (activeStep === 1) {
      if (action === 'create') {
        if (!tenantSetup.companyName || !tenantSetup.brandName || !tenantSetup.shopName) {
          setError('Please fill in all required fields');
          return;
        }
      } else if (action === 'join') {
        if (!tenantSetup.inviteCode) {
          setError('Please enter an invitation code');
          return;
        }
      }
    }

    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      logout();
    } else {
      setActiveStep((prevStep) => prevStep - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = await getAccessToken();
      const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5125';

      if (action === 'create') {
        const response = await fetch(`${apiUrl}/api/tenants/setup`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyName: tenantSetup.companyName,
            brandName: tenantSetup.brandName,
            shopName: tenantSetup.shopName,
            shopAddress: tenantSetup.shopAddress,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create tenant setup');
        }

        const result = await response.json();
        console.log('Tenant setup created:', result);
        navigate('/');
      } else if (action === 'join') {
        const response = await fetch(`${apiUrl}/api/invitations/accept`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inviteCode: tenantSetup.inviteCode,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to join with invitation code');
        }

        const result = await response.json();
        console.log('Joined tenant:', result);
        navigate('/');
      }
    } catch (error: unknown) {
      console.error('Error in onboarding:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during setup';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateInviteCode = async () => {
    if (!tenantSetup.inviteCode) return;

    setLoading(true);
    try {
      const token = await getAccessToken();
      const apiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5125';
      const response = await fetch(`${apiUrl}/api/invitations/validate/${tenantSetup.inviteCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const details = await response.json();
        setInvitationDetails(details);
      } else {
        setError('Invalid invitation code');
        setInvitationDetails(null);
      }
    } catch (error) {
      console.error('Error validating invite code:', error);
      setError('Failed to validate invitation code');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Title order={3} mb="md">
              Welcome to EWHQ Portal
            </Title>
            <Text size="sm" c="dimmed" mb="xl">
              To get started, you need to either create a new organization or join an existing one.
            </Text>

            <Radio.Group
              value={action}
              onChange={(value) => setAction(value as 'create' | 'join')}
            >
              <Stack gap="md">
                <Card
                  padding="lg"
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => setAction('create')}
                >
                  <Radio
                    value="create"
                    label={
                      <Box ml="sm">
                        <Group gap="xs" mb={4}>
                          <IconBuildingStore size={24} color="var(--mantine-color-blue-6)" />
                          <Text fw={600} size="lg">Create New Organization</Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                          Set up a new company, brand, and shop for your business
                        </Text>
                      </Box>
                    }
                  />
                </Card>

                <Card
                  padding="lg"
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => setAction('join')}
                >
                  <Radio
                    value="join"
                    label={
                      <Box ml="sm">
                        <Group gap="xs" mb={4}>
                          <IconUserPlus size={24} color="var(--mantine-color-blue-6)" />
                          <Text fw={600} size="lg">Join Existing Organization</Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                          Use an invitation code to join an existing company, brand, or shop
                        </Text>
                      </Box>
                    }
                  />
                </Card>
              </Stack>
            </Radio.Group>
          </Box>
        );

      case 1:
        if (action === 'create') {
          return (
            <Box>
              <Title order={3} mb="xs">
                Create Your Organization
              </Title>
              <Text size="sm" c="dimmed" mb="xl">
                Set up your company structure. Think of it as: Company (like Yum Group) → Brand (like Burger King) → Shop (like BK Downtown)
              </Text>

              <Stack gap="xl">
                <Box>
                  <Group gap="xs" mb="sm">
                    <IconBuilding size={20} color="var(--mantine-color-blue-6)" />
                    <Text fw={500} size="sm">Company Details</Text>
                  </Group>
                  <TextInput
                    label="Company Name"
                    placeholder="e.g., ABC Restaurant Group"
                    value={tenantSetup.companyName || ''}
                    onChange={(e) => setTenantSetup({ ...tenantSetup, companyName: e.target.value })}
                    required
                    description="The parent organization that owns multiple brands"
                  />
                </Box>

                <Box>
                  <Group gap="xs" mb="sm">
                    <IconBuildingStore size={20} color="var(--mantine-color-blue-6)" />
                    <Text fw={500} size="sm">Brand Details</Text>
                  </Group>
                  <TextInput
                    label="Brand Name"
                    placeholder="e.g., Pizza Palace"
                    value={tenantSetup.brandName || ''}
                    onChange={(e) => setTenantSetup({ ...tenantSetup, brandName: e.target.value })}
                    required
                    description="The brand name customers recognize"
                  />
                </Box>

                <Box>
                  <Group gap="xs" mb="sm">
                    <IconBuildingCommunity size={20} color="var(--mantine-color-blue-6)" />
                    <Text fw={500} size="sm">Shop Details</Text>
                  </Group>
                  <Stack gap="md">
                    <TextInput
                      label="Shop Name"
                      placeholder="e.g., Downtown Branch"
                      value={tenantSetup.shopName || ''}
                      onChange={(e) => setTenantSetup({ ...tenantSetup, shopName: e.target.value })}
                      required
                      description="The specific location or outlet name"
                    />
                    <TextInput
                      label="Shop Address"
                      placeholder="e.g., 123 Main St, City, State"
                      value={tenantSetup.shopAddress || ''}
                      onChange={(e) => setTenantSetup({ ...tenantSetup, shopAddress: e.target.value })}
                      description="Physical address of the shop (optional)"
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
          );
        } else if (action === 'join') {
          return (
            <Box>
              <Title order={3} mb="xs">
                Join Existing Organization
              </Title>
              <Text size="sm" c="dimmed" mb="xl">
                Enter the invitation code you received from your organization administrator.
              </Text>

              <Stack gap="xl">
                <TextInput
                  label="Invitation Code"
                  placeholder="Enter your invitation code"
                  value={tenantSetup.inviteCode || ''}
                  onChange={(e) => setTenantSetup({ ...tenantSetup, inviteCode: e.target.value })}
                  required
                  description="The code should be provided by your administrator"
                  onBlur={validateInviteCode}
                />

                {invitationDetails && (
                  <Alert color="green" title="Valid Invitation Found!">
                    <Box mt="xs">
                      <Text size="sm">
                        You will join: <Text span fw={600}>{invitationDetails.organizationName}</Text>
                      </Text>
                      {invitationDetails.role && (
                        <Text size="sm" mt={4}>
                          Role: <Badge color="blue" size="sm">{invitationDetails.role}</Badge>
                        </Text>
                      )}
                    </Box>
                  </Alert>
                )}
              </Stack>
            </Box>
          );
        }
        return null;

      case 2:
        return (
          <Box>
            <Title order={3} mb="md">
              Confirm Your Setup
            </Title>

            {action === 'create' ? (
              <Box>
                <Text size="sm" mb="md">
                  Please review your organization details:
                </Text>
                <Paper withBorder p="md">
                  <Stack gap="md">
                    <Box>
                      <Text size="xs" c="dimmed">Company</Text>
                      <Text fw={500}>{tenantSetup.companyName}</Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text size="xs" c="dimmed">Brand</Text>
                      <Text fw={500}>{tenantSetup.brandName}</Text>
                    </Box>
                    <Divider />
                    <Box>
                      <Text size="xs" c="dimmed">Shop</Text>
                      <Text fw={500}>{tenantSetup.shopName}</Text>
                      {tenantSetup.shopAddress && (
                        <Text size="sm" c="dimmed">{tenantSetup.shopAddress}</Text>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            ) : (
              <Box>
                <Text size="sm" mb="md">
                  You are about to join:
                </Text>
                {invitationDetails && (
                  <Paper withBorder p="md">
                    <Stack gap="xs">
                      <Text fw={600}>
                        {invitationDetails.organizationName}
                      </Text>
                      {invitationDetails.role && (
                        <Box>
                          <Text size="xs" c="dimmed">Your Role:</Text>
                          <Text size="sm">{invitationDetails.role}</Text>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Box>
            )}

            <Alert color="blue" mt="xl">
              Click "Complete Setup" to finalize your organization setup and access the dashboard.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 0',
      }}
    >
      <Container size="md">
        <Paper p="xl" radius="md" shadow="xl">
          {/* User Account Display */}
          <Box
            mb="lg"
            p="md"
            bg="var(--mantine-color-gray-0)"
            style={{
              borderRadius: 'var(--mantine-radius-sm)',
              border: '1px solid var(--mantine-color-gray-3)',
            }}
          >
            <Group gap="md">
              <Avatar color="blue" size="md" radius="xl">
                <IconUserCircle size={24} />
              </Avatar>
              <Box>
                <Text size="xs" c="dimmed">
                  Logged in as
                </Text>
                <Text fw={500}>
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email}
                </Text>
                {user?.firstName && user?.lastName && (
                  <Text size="xs" c="dimmed">
                    {user.email}
                  </Text>
                )}
              </Box>
            </Group>
          </Box>

          <Stepper active={activeStep} mb="xl">
            {steps.map((label) => (
              <Stepper.Step key={label} label={label} />
            ))}
          </Stepper>

          {error && (
            <Alert color="red" mb="md">
              {error}
            </Alert>
          )}

          <Box mih={400}>
            {getStepContent(activeStep)}
          </Box>

          <Group justify="space-between" mt={32}>
            <Button
              variant="default"
              disabled={loading}
              onClick={handleBack}
            >
              {activeStep === 0 ? 'Logout' : 'Back'}
            </Button>
            <Button
              variant="filled"
              onClick={handleNext}
              disabled={loading}
              leftSection={loading ? <Loader size={16} /> : undefined}
            >
              {activeStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            </Button>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}
