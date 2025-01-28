import { useState } from 'react';
import {
  Paper,
  Text,
  Group,
  Button,
  Stack,
  Box,
  rem,
} from '@mantine/core';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useTask } from '../contexts/TaskContext';
import { Task } from '../types';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';

const KanbanBoard = () => {
  const { tasks, updateTask } = useTask();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const columns: { id: Task['status']; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ];

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update task status if moved to a different column
    if (destination.droppableId !== source.droppableId) {
      try {
        await updateTask(draggableId, {
          status: destination.droppableId as Task['status'],
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };

  const getColumnColor = (status: Task['status']) => {
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

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text size="xl" fw={700}>
          Kanban Board
        </Text>
        <Button onClick={() => setCreateModalOpen(true)}>Create Task</Button>
      </Group>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Group align="flex-start" grow>
          {columns.map((column) => (
            <Paper
              key={column.id}
              shadow="xs"
              p="md"
              withBorder
              style={{
                backgroundColor: 'var(--mantine-color-gray-0)',
                minHeight: rem(500),
              }}
            >
              <Box
                mb="md"
                style={{
                  borderBottom: `3px solid var(--mantine-color-${getColumnColor(
                    column.id
                  )}-6)`,
                  paddingBottom: rem(8),
                }}
              >
                <Group justify="space-between">
                  <Text fw={600}>{column.title}</Text>
                  <Text size="sm" c="dimmed">
                    {getTasksByStatus(column.id).length}
                  </Text>
                </Group>
              </Box>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <Stack
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    gap="sm"
                    style={{ minHeight: rem(100) }}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        index={index}
                      />
                    ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            </Paper>
          ))}
        </Group>
      </DragDropContext>

      <CreateTaskModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
};

export default KanbanBoard;