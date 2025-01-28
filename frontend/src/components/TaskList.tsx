import { useState } from 'react';
import {
  Table,
  Group,
  Text,
  Menu,
  ActionIcon,
  rem,
  Badge,
  ScrollArea,
} from '@mantine/core';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { useProject } from '../contexts/ProjectContext';
import { useTask } from '../contexts/TaskContext';
import { Task } from '../types';
import EditTaskModal from './EditTaskModal';

const TaskList = () => {
  const { currentProject } = useProject();
  const { tasks, deleteTask } = useTask();
  const [editTask, setEditTask] = useState<Task | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'gray';
      case 'inProgress':
        return 'blue';
      case 'done':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'inProgress':
        return 'In Progress';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (!currentProject) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Select a project to view tasks
      </Text>
    );
  }

  return (
    <>
      <ScrollArea>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Assigned To</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>End Date</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tasks.map((task) => (
              <Table.Tr key={task._id}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {task.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {task.description}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(task.status)}>
                    {getStatusLabel(task.status)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{task.assignedTo?.fullName}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {new Date(task.startDate).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {new Date(task.endDate).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={0} justify="flex-end">
                    <Menu
                      transitionProps={{ transition: 'pop' }}
                      withArrow
                      position="bottom-end"
                      withinPortal
                    >
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size={rem(30)}
                        >
                          <IconDots style={{ width: rem(16) }} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={
                            <IconPencil
                              style={{ width: rem(16), height: rem(16) }}
                            />
                          }
                          onClick={() => setEditTask(task)}
                        >
                          Edit task
                        </Menu.Item>
                        <Menu.Item
                          color="red"
                          leftSection={
                            <IconTrash
                              style={{ width: rem(16), height: rem(16) }}
                            />
                          }
                          onClick={() => handleDelete(task._id)}
                        >
                          Delete task
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <EditTaskModal
        task={editTask}
        onClose={() => setEditTask(null)}
        opened={!!editTask}
      />
    </>
  );
};

export default TaskList;