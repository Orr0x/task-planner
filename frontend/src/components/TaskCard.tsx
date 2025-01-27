import { useDraggable } from '@dnd-kit/core';
import { Paper, Text, Group, ActionIcon, Menu, Badge, rem, Tooltip } from '@mantine/core';
import { IconDots, IconPencil, IconTrash, IconCalendar, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import { Task } from '../types';
import { useTask } from '../contexts/TaskContext';
import EditTaskModal from '../components/EditTaskModal';

interface TaskCardProps {
  task: Task;
  overlay?: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export default function TaskCard({ task, overlay }: TaskCardProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { deleteTask } = useTask();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task._id,
    data: task,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'blue';
      case 'inProgress':
        return 'yellow';
      case 'done':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'inProgress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (overlay) {
    return (
      <Paper
        shadow="sm"
        p="md"
        withBorder
        style={{
          backgroundColor: 'white',
          width: '100%',
          maxWidth: rem(300),
        }}
      >
        <Text fz="sm" fw={500}>{task.title}</Text>
      </Paper>
    );
  }

  const dateRange = `${formatDate(task.startDate)} - ${formatDate(task.endDate)}`;

  return (
    <>
      <Paper
        ref={setNodeRef}
        shadow="sm"
        p="md"
        withBorder
        style={{
          ...style,
          cursor: 'grab',
          position: 'relative',
          touchAction: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 'var(--mantine-shadow-md)',
          },
        }}
        {...attributes}
        {...listeners}
      >
        <Group justify="space-between" mb="xs">
          <Text fz="sm" fw={500} style={{ flex: 1 }} lineClamp={1}>
            {task.title}
          </Text>
          <Menu withinPortal position="bottom-end" shadow="sm">
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconPencil size={16} />}
                onClick={() => setEditModalOpen(true)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={() => deleteTask(task._id)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Text size="sm" c="dimmed" mb="xs" lineClamp={2}>
          {task.description}
        </Text>

        <Group gap="xs">
          <Badge color={getStatusColor(task.status)}>
            {getStatusLabel(task.status)}
          </Badge>
          
          <Tooltip label={dateRange} position="bottom">
            <Group gap="xs" wrap="nowrap">
              <IconCalendar size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                {formatDate(task.startDate)}
              </Text>
            </Group>
          </Tooltip>

          <Tooltip label={`Assigned to ${task.assignedTo.fullName}`} position="bottom">
            <Group gap="xs" wrap="nowrap">
              <IconUser size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="xs" c="dimmed" truncate>
                {task.assignedTo.fullName}
              </Text>
            </Group>
          </Tooltip>
        </Group>
      </Paper>

      <EditTaskModal
        task={task}
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </>
  );
}