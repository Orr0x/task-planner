import { useState } from 'react';
import {
  Paper,
  Text,
  Group,
  Badge,
  ActionIcon,
  Menu,
  rem,
  Box,
} from '@mantine/core';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { Task } from '../types';
import { useTask } from '../contexts/TaskContext';
import EditTaskModal from './EditTaskModal';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';

interface TaskCardProps {
  task: Task;
  index: number;
}

const TaskCard = ({ task, index }: TaskCardProps) => {
  const { deleteTask } = useTask();
  const [editModalOpen, setEditModalOpen] = useState(false);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Draggable draggableId={task._id} index={index}>
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
          <Paper
            shadow="xs"
            p="md"
            mb="sm"
            withBorder
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              backgroundColor: snapshot.isDragging
                ? 'var(--mantine-color-gray-1)'
                : undefined,
              ...provided.draggableProps.style,
            }}
          >
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm" lineClamp={2} style={{ flex: 1 }}>
                {task.title}
              </Text>
              <Menu position="bottom-end" shadow="sm">
                <Menu.Target>
                  <ActionIcon variant="subtle" size="sm">
                    <IconDots style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => setEditModalOpen(true)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this task?')) {
                        deleteTask(task._id);
                      }
                    }}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>

            <Text size="sm" c="dimmed" lineClamp={3} mb="xs">
              {task.description}
            </Text>

            <Group justify="space-between" wrap="nowrap">
              <Badge
                color={getStatusColor(task.status)}
                variant="light"
                size="sm"
              >
                {task.status === 'inProgress' ? 'In Progress' : 
                  task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Badge>
              <Box>
                <Text size="xs" c="dimmed">
                  {formatDate(task.startDate)} - {formatDate(task.endDate)}
                </Text>
              </Box>
            </Group>
          </Paper>
        )}
      </Draggable>

      <EditTaskModal
        task={task}
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </>
  );
};

export default TaskCard;