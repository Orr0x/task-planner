import { useState } from 'react';
import {
  AppShell,
  Burger,
  Group,
  Title,
  Button,
  Box,
  Text,
  Menu,
  Avatar,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout, IconUser } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import KanbanBoard from '../components/KanbanBoard';
import GanttChart from '../components/GanttChart';
import TaskList from '../components/TaskList';
import ProjectSelector from '../components/ProjectSelector';

type ViewType = 'kanban' | 'gantt' | 'list';

export default function Dashboard() {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();
  const { currentProject } = useProject();
  const [view, setView] = useState<ViewType>('kanban');

  const handleLogout = () => {
    logout();
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group>
              <Title order={3}>Task Planner</Title>
              <ProjectSelector />
            </Group>
          </Group>

          <Group>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Button
                  variant="subtle"
                  leftSection={
                    <Avatar
                      color="blue"
                      radius="xl"
                      size={24}
                    >
                      {user?.fullName.charAt(0)}
                    </Avatar>
                  }
                >
                  {user?.fullName}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item
                  leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                >
                  Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Box>
          <Text fw={500} size="sm" mb="xs">
            Views
          </Text>
          <Group gap="xs">
            <Button
              variant={view === 'kanban' ? 'filled' : 'light'}
              onClick={() => setView('kanban')}
            >
              Kanban
            </Button>
            <Button
              variant={view === 'gantt' ? 'filled' : 'light'}
              onClick={() => setView('gantt')}
            >
              Gantt
            </Button>
            <Button
              variant={view === 'list' ? 'filled' : 'light'}
              onClick={() => setView('list')}
            >
              List
            </Button>
          </Group>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        {!currentProject ? (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '1rem',
            }}
          >
            <Text size="xl" fw={500}>
              Welcome to Task Planner
            </Text>
            <Text c="dimmed">
              Create a project to get started
            </Text>
            <ProjectSelector />
          </Box>
        ) : (
          <>
            {view === 'kanban' && <KanbanBoard />}
            {view === 'gantt' && <GanttChart />}
            {view === 'list' && <TaskList />}
          </>
        )}
      </AppShell.Main>
    </AppShell>
  );
}