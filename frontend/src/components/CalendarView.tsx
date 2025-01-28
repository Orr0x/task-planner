import { useState } from 'react';
import {
  Paper,
  Text,
  Box,
  Group,
  Button,
  Stack,
  rem,
  Tooltip,
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useTask } from '../contexts/TaskContext';
import { Task } from '../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

const CalendarView = () => {
  const { tasks } = useTask();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get calendar days for current month, starting from Monday
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // 1 = Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get tasks for the current month view
  const monthTasks = tasks.filter(task => {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    return (
      (startDate <= calendarEnd && endDate >= calendarStart) ||
      (startDate >= calendarStart && startDate <= calendarEnd) ||
      (endDate >= calendarStart && endDate <= calendarEnd)
    );
  });

  // Calculate task positions and heights
  const getTaskStyle = (task: Task, dayDate: Date) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    // Check if task spans this day
    if (dayDate >= taskStart && dayDate <= taskEnd) {
      return {
        backgroundColor: getStatusColor(task.status),
        padding: '2px 4px',
        borderRadius: '2px',
        fontSize: rem(10),
        color: '#fff',
        marginBottom: '2px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
      };
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'var(--mantine-color-gray-6)';
      case 'inProgress':
        return 'var(--mantine-color-blue-6)';
      case 'done':
        return 'var(--mantine-color-green-6)';
      default:
        return 'var(--mantine-color-gray-6)';
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Stack gap="xs">
        {/* Calendar Header */}
        <Group justify="space-between" mb="xs">
          <Button 
            variant="subtle" 
            onClick={handlePrevMonth}
            leftSection={<IconChevronLeft size={16} />}
            size="xs"
          >
            Previous
          </Button>
          <Text size="xl" fw={500}>
            {format(currentDate, 'MMMM yyyy')}
          </Text>
          <Button 
            variant="subtle" 
            onClick={handleNextMonth}
            rightSection={<IconChevronRight size={16} />}
            size="xs"
          >
            Next
          </Button>
        </Group>

        {/* Calendar Grid */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            backgroundColor: 'var(--mantine-color-gray-3)',
            border: '1px solid var(--mantine-color-gray-3)',
            height: 'calc(100vh - 220px)', // Responsive height
            minHeight: '500px',
          }}
        >
          {/* Weekday Headers - Starting from Monday */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <Box
              key={day}
              p="xs"
              bg="white"
              style={{ textAlign: 'center' }}
            >
              <Text size="sm" fw={500}>{day}</Text>
            </Box>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day) => {
            const dayTasks = monthTasks.filter(task => {
              const taskStart = new Date(task.startDate);
              const taskEnd = new Date(task.endDate);
              return day >= taskStart && day <= taskEnd;
            });

            return (
              <Box
                key={day.toISOString()}
                p="xs"
                bg="white"
                style={{
                  minHeight: '80px',
                  opacity: isSameMonth(day, currentDate) ? 1 : 0.5,
                  border: isToday(day) ? '2px solid var(--mantine-color-blue-5)' : undefined,
                  overflow: 'hidden',
                }}
              >
                <Text 
                  size="sm" 
                  c={isToday(day) ? 'blue' : undefined}
                  fw={isToday(day) ? 500 : undefined}
                >
                  {format(day, 'd')}
                </Text>
                <Stack gap={4} mt={4}>
                  {dayTasks.map((task) => {
                    const style = getTaskStyle(task, day);
                    if (!style) return null;

                    return (
                      <Tooltip 
                        key={task._id} 
                        label={`${task.title} (${format(new Date(task.startDate), 'MMM d')} - ${format(new Date(task.endDate), 'MMM d')})`}
                        position="bottom"
                        withArrow
                      >
                        <Box style={style}>
                          {task.title}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Stack>
    </Paper>
  );
};

export default CalendarView;