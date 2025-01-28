import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Text,
  Stack,
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { authApi } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Clear any existing auth data on mount
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const response = await authApi.login(formData);
      
      if (response.success && response.data.token && response.data.user) {
        // Store auth data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        notifications.show({
          title: 'Success',
          message: `Welcome back, ${response.data.user.fullName}!`,
          color: 'green',
        });

        // Navigate to the protected route or home
        navigate(from, { replace: true });
      } else {
        setError('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.error || 
        error.message || 
        'Failed to login. Please check your credentials and try again.'
      );
      
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to login',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Welcome back!</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Don't have an account yet?{' '}
        <Link to="/register" style={{ color: 'var(--mantine-color-blue-6)' }}>
          Create account
        </Link>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Error" 
            color="red" 
            mb="md"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.currentTarget.value })
              }
              error={error ? ' ' : undefined}
              disabled={loading}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.currentTarget.value })
              }
              error={error ? ' ' : undefined}
              disabled={loading}
            />

            <Button 
              type="submit" 
              loading={loading}
              fullWidth
            >
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;