import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Text,
  Title,
  Anchor,
  Group,
  TextInput,
  PasswordInput,
  Checkbox,
  Alert,
} from '@mantine/core'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/Auth0Context'
import { IconAlertCircle } from '@tabler/icons-react'
import {
  FaGoogle,
  FaMicrosoft,
  FaApple,
  FaXTwitter,
  FaFacebookF
} from 'react-icons/fa6'
import auth0Service from '../services/auth0Service'

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithRedirect, loginWithSocial } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSocialLogin = (connection: string) => {
    loginWithSocial(connection);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow
        await auth0Service.signup(email, password, firstName, lastName);
        // After signup, automatically log in
        await handleDirectLogin();
      } else {
        // Direct login
        await handleDirectLogin();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
      setLoading(false);
    }
  };

  const handleDirectLogin = async () => {
    // Note: Resource Owner Password Grant might need to be enabled in Auth0
    // For now, fallback to Universal Login
    loginWithRedirect({
      screen_hint: isSignUp ? 'signup' : 'login',
      login_hint: email,
    });
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await auth0Service.forgotPassword(email);
      setShowForgotPassword(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container size={480} px="md">
          <Paper radius="md" p="xl" shadow="xl" style={{ backgroundColor: 'white' }}>
            <Stack gap="lg">
              <Title order={2} ta="center" fw={600}>
                Check your email
              </Title>
              <Text ta="center" c="dimmed">
                We've sent password reset instructions to {email}
              </Text>
              <Button
                variant="light"
                fullWidth
                onClick={() => {
                  setShowForgotPassword(false);
                  setEmail('');
                  setPassword('');
                }}
              >
                Back to login
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

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
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </Title>

            {/* Error Alert */}
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                {error}
              </Alert>
            )}

            {/* Two Column Layout */}
            <Group gap="xl" align="stretch" style={{ alignItems: 'flex-start' }}>
              {/* Left Column - Email/Password Form */}
              <Box style={{ flex: 1, minWidth: 0 }}>
                <form onSubmit={handleSubmit}>
                  <Stack gap="md">
                {/* Sign Up Fields */}
                {isSignUp && (
                  <>
                    <TextInput
                      label="First Name"
                      placeholder="John"
                      size="md"
                      value={firstName}
                      onChange={(e) => setFirstName(e.currentTarget.value)}
                      styles={{
                        label: {
                          marginBottom: 8,
                          fontWeight: 500,
                        },
                      }}
                    />
                    <TextInput
                      label="Last Name"
                      placeholder="Doe"
                      size="md"
                      value={lastName}
                      onChange={(e) => setLastName(e.currentTarget.value)}
                      styles={{
                        label: {
                          marginBottom: 8,
                          fontWeight: 500,
                        },
                      }}
                    />
                  </>
                )}

                {/* Email Field */}
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  size="md"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  styles={{
                    label: {
                      marginBottom: 8,
                      fontWeight: 500,
                    },
                  }}
                />

                {/* Password Field */}
                <Box>
                  {!isSignUp && (
                    <Group justify="space-between" mb={8}>
                      <Text size="sm" fw={500}>
                        Password
                      </Text>
                      <Anchor size="sm" c="indigo" onClick={handleForgotPassword}>
                        Forgot your password?
                      </Anchor>
                    </Group>
                  )}
                  <PasswordInput
                    label={isSignUp ? "Password" : undefined}
                    placeholder="••••••••"
                    size="md"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    styles={isSignUp ? {
                      label: {
                        marginBottom: 8,
                        fontWeight: 500,
                      },
                    } : undefined}
                  />
                </Box>

                {/* Remember Me */}
                {!isSignUp && (
                  <Checkbox
                    label="Remember me on this device"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.currentTarget.checked)}
                  />
                )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="md"
                      radius="md"
                      fullWidth
                      loading={loading}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      {isSignUp ? 'Sign up' : 'Sign in'}
                    </Button>
                  </Stack>
                </form>
              </Box>

              {/* Divider */}
              <Divider orientation="vertical" />

              {/* Right Column - Social Login Buttons */}
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Stack gap="sm">
                  <Text size="xs" c="dimmed" mb="xs">Or continue with</Text>

                  <Button
                    variant="default"
                    size="md"
                    radius="md"
                    fullWidth
                    leftSection={<FaGoogle size={18} />}
                    onClick={() => handleSocialLogin('google-oauth2')}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    Google
                  </Button>

                  <Button
                    variant="default"
                    size="md"
                    radius="md"
                    fullWidth
                    leftSection={<FaMicrosoft size={18} />}
                    onClick={() => handleSocialLogin('windowslive')}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    Microsoft
                  </Button>

                  <Button
                    variant="default"
                    size="md"
                    radius="md"
                    fullWidth
                    leftSection={<FaApple size={18} />}
                    onClick={() => handleSocialLogin('apple')}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    Apple
                  </Button>

                  <Button
                    variant="default"
                    size="md"
                    radius="md"
                    fullWidth
                    leftSection={<FaFacebookF size={18} />}
                    onClick={() => handleSocialLogin('facebook')}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    Facebook
                  </Button>

                  <Button
                    variant="default"
                    size="md"
                    radius="md"
                    fullWidth
                    leftSection={<FaXTwitter size={18} />}
                    onClick={() => handleSocialLogin('twitter')}
                    style={{ justifyContent: 'flex-start' }}
                  >
                    X (Twitter)
                  </Button>
                </Stack>
              </Box>
            </Group>

            {/* Sign up / Sign in toggle */}
            <Box
            p="md"
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: 8,
            }}
          >
            <Group gap="xs" justify="center">
              <Text size="sm" c="dimmed">
                {isSignUp ? 'Already have an account?' : 'New to EWHQ?'}
              </Text>
              <Anchor
                size="sm"
                c="indigo"
                fw={500}
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                style={{ cursor: 'pointer' }}
              >
                {isSignUp ? 'Sign in' : 'Create account'}
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