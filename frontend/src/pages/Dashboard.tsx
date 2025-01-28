import { useState } from 'react';
import {
  Container,
  SegmentedControl,
  Group,
  Paper,
  rem,
  Box,
  AppShell,
} from '@mantine/core';
import { 
  IconLayoutKanban, 
  IconTimeline, 
  IconList,
  IconCalendar,
} from '@tabler/icons-react';
import KanbanBoard from '../components/KanbanBoard';
import GanttChart from '../components/GanttChart';
import TaskList from '../components/TaskList';
import CalendarView from '../components/CalendarView';
import ProjectSelector from '../components/ProjectSelector';
import UserMenu from '../components/UserMenu';

type ViewType = 'kanban' | 'gantt' | 'list' | 'calendar';

const Dashboard = () => {
  const [view, setView] = useState<ViewType>('kanban');

  const renderView = () => {
    switch (view) {
      case 'kanban':
        return <KanbanBoard />;
      case 'gantt':
        return <GanttChart />;
      case 'list':
        return <TaskList />;
      case 'calendar':
        return <CalendarView />;
      default:
        return null;
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
      styles={{
        main: {
          background: 'var(--mantine-color-gray-0)',
        },
      }}
    >
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md" bg="white">
          <ProjectSelector />
          <UserMenu />
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container fluid>
          {/* View Selector */}
          <Paper shadow="xs" withBorder mb="md" bg="white">
            <Box p="md">
              <Group justify="center">
                <SegmentedControl
                  value={view}
                  onChange={(value) => setView(value as ViewType)}
                  data={[
                    {
                      value: 'kanban',
                      label: (
                        <Group gap={rem(4)}>
                          <IconLayoutKanban size={16} />
                          <span>Kanban</span>
                        </Group>
                      ),
                    },
                    {
                      value: 'gantt',
                      label: (
                        <Group gap={rem(4)}>
                          <IconTimeline size={16} />
                          <span>Gantt</span>
                        </Group>
                      ),
                    },
                    {
                      value: 'calendar',
                      label: (
                        <Group gap={rem(4)}>
                          <IconCalendar size={16} />
                          <span>Calendar</span>
                        </Group>
                      ),
                    },
                    {
                      value: 'list',
                      label: (
                        <Group gap={rem(4)}>
                          <IconList size={16} />
                          <span>List</span>
                        </Group>
                      ),
                    },
                  ]}
                  size="sm"
                />
              </Group>
            </Box>
          </Paper>

          {/* Main Content */}
          <Box>{renderView()}</Box>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default Dashboard;