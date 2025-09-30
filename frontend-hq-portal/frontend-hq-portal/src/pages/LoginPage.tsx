import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Anchor,
  Group,
} from '@mantine/core'
import { IconBrandGoogle } from '@tabler/icons-react'

export function LoginPage() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Logo */}
      <Box
        style={{
          position: 'absolute',
          top: 32,
          left: 32,
        }}
      >
        <Text size="xl" fw={700} c="white">
          EWHQ
        </Text>
      </Box>

      <Container size={480} px="md">
        <Paper
          radius="md"
          p="xl"
          shadow="xl"
          style={{
            backgroundColor: 'white',
          }}
        >
          <Stack gap="lg">
            <Title order={2} ta="center" fw={600}>
              Sign in to your account
            </Title>

            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder=""
                size="md"
                styles={{
                  label: {
                    marginBottom: 8,
                    fontWeight: 500,
                  },
                }}
              />

              <Box>
                <Group justify="space-between" mb={8}>
                  <Text size="sm" fw={500}>
                    Password
                  </Text>
                  <Anchor size="sm" c="indigo">
                    Forgot your password?
                  </Anchor>
                </Group>
                <PasswordInput
                  placeholder=""
                  size="md"
                />
              </Box>

              <Checkbox
                label="Remember me on this device"
                defaultChecked
              />

              <Button
                size="md"
                radius="md"
                fullWidth
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Sign in
              </Button>

              <Divider label="OR" labelPosition="center" />

              <Stack gap="sm">
                <Button
                  variant="default"
                  size="md"
                  radius="md"
                  fullWidth
                  leftSection={<IconBrandGoogle size={18} />}
                >
                  Sign in with Google
                </Button>

                <Button
                  variant="default"
                  size="md"
                  radius="md"
                  fullWidth
                >
                  Sign in with passkey
                </Button>

                <Button
                  variant="default"
                  size="md"
                  radius="md"
                  fullWidth
                >
                  Sign in with SSO
                </Button>
              </Stack>
            </Stack>

            <Box
              p="md"
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: 8,
              }}
            >
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  New to EWHQ?
                </Text>
                <Anchor size="sm" c="indigo" fw={500}>
                  Create account
                </Anchor>
              </Group>
            </Box>
          </Stack>
        </Paper>

        <Box mt="xl" ta="center">
          <Text size="sm" c="white" style={{ opacity: 0.9 }}>
            If you're an admin, you can require two-step authentication for your entire team in settings.
          </Text>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        style={{
          position: 'absolute',
          bottom: 32,
          left: 32,
        }}
      >
        <Group gap="md">
          <Anchor size="sm" c="white" style={{ opacity: 0.9 }}>
            © EWHQ
          </Anchor>
          <Anchor size="sm" c="white" style={{ opacity: 0.9 }}>
            Privacy & terms
          </Anchor>
        </Group>
      </Box>
    </Box>
  )
}