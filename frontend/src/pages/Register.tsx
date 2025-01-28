import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  // Clear any existing auth data on mount
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.register(formData);
      
      if (response.success && response.data.token && response.data.user) {
        // Store auth data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        notifications.show({
          title: 'Success',
          message: `Welcome, ${response.data.user.fullName}! Your account has been created.`,
          color: 'green',
        });

        // Navigate to home
        navigate('/', { replace: true });
      } else {
        setError('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.error || 
        error.message || 
        'Failed to create account. Please try again.'
      );
      
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to create account',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Create an account</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--mantine-color-blue-6)' }}>
          Sign in
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
              label="Full Name"
              placeholder="Your name"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.currentTarget.value })
              }
              error={error ? ' ' : undefined}
              disabled={loading}
            />

            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.currentTarget.value })
              }
              error={error ? ' ' : undefined}
              disabled={loading}
            />

            <PasswordInput
              label="Password"
              placeholder="Create a password"
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
              Create account
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default Register;