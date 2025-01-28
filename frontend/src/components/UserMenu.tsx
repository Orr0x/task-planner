import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  UnstyledButton,
  Group,
  Avatar,
  Text,
  rem,
  Box,
  useMantineTheme,
} from '@mantine/core';
import {
  IconChevronDown,
  IconLogout,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { authApi } from '../services/api';

const UserMenu = () => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    try {
      authApi.logout();
      notifications.show({
        title: 'Success',
        message: 'You have been logged out successfully',
        color: 'blue',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user?.fullName) {
    return null;
  }

  return (
    <Box>
      <Menu
        width={260}
        position="bottom-end"
        transitionProps={{ transition: 'pop-top-right' }}
        onClose={() => setUserMenuOpened(false)}
        onOpen={() => setUserMenuOpened(true)}
        withinPortal
      >
        <Menu.Target>
          <UnstyledButton
            style={{
              display: 'block',
              width: 'auto',
              padding: '8px 12px',
              borderRadius: theme.radius.sm,
              color: theme.colors.gray[7],
              backgroundColor: userMenuOpened ? theme.colors.gray[0] : 'transparent',
              '&:hover': {
                backgroundColor: theme.colors.gray[0],
              },
            }}
          >
            <Group gap={7} wrap="nowrap">
              <Avatar
                src={null}
                alt={user.fullName}
                radius="xl"
                size={30}
                color="blue"
                styles={{
                  placeholder: {
                    color: 'white',
                    backgroundColor: theme.colors.blue[6],
                  },
                }}
              >
                {user.fullName?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Text size="sm" fw={500} truncate style={{ maxWidth: '150px' }}>
                  {user.fullName}
                </Text>
                <Text size="xs" c="dimmed" truncate style={{ maxWidth: '150px' }}>
                  {user.email}
                </Text>
              </Box>
              <IconChevronDown
                style={{
                  width: rem(12),
                  height: rem(12),
                  transform: userMenuOpened ? 'rotate(180deg)' : 'none',
                  transition: 'transform 200ms ease',
                }}
                stroke={1.5}
              />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Account</Menu.Label>
          <Menu.Item
            leftSection={
              <IconUser style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            }
          >
            Profile
          </Menu.Item>
          <Menu.Item
            leftSection={
              <IconSettings style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            }
          >
            Settings
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>Actions</Menu.Label>
          <Menu.Item
            color="red"
            leftSection={
              <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            }
            onClick={handleLogout}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
};

export default UserMenu;