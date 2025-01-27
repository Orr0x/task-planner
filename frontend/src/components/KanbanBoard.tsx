import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
} from '@dnd-kit/core';
import { Grid, Paper, Title, Button, Group, rem } from '@mantine/core';
import { useTask } from '../contexts/TaskContext';
import { Task } from '../types';
import TaskCard from '../components/TaskCard';
import TaskColumn from '../components/TaskColumn';
import CreateTaskModal from '../components/CreateTaskModal';

const COLUMN_TITLES = {
  todo: 'To Do',
  inProgress: 'In Progress',
  done: 'Done',
} as const;

export default function KanbanBoard() {
  const { tasks, updateTask } = useTask();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t._id === taskId);
    const newStatus = over.id as Task['status'];

    if (task && task.status !== newStatus) {
      updateTask(taskId, { status: newStatus });
    }

    setActiveId(null);
  };

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Task Board</Title>
        <Button onClick={() => setCreateModalOpen(true)}>Create Task</Button>
      </Group>

      <DndContext
        sensors={sensors}
        onDragStart={(event) => setActiveId(event.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <Grid>
          {(Object.keys(COLUMN_TITLES) as Array<keyof typeof COLUMN_TITLES>).map(
            (status) => (
              <Grid.Col span={{ base: 12, md: 4 }} key={status}>
                <Paper
                  shadow="xs"
                  p="md"
                  withBorder
                  style={{ height: '100%', minHeight: rem(500) }}
                >
                  <Title order={3} mb="md">
                    {COLUMN_TITLES[status]}
                  </Title>
                  <TaskColumn
                    tasks={getTasksByStatus(status)}
                    status={status}
                  />
                </Paper>
              </Grid.Col>
            )
          )}
        </Grid>

        <DragOverlay>
          {activeId ? (
            <TaskCard
              task={tasks.find((task) => task._id === activeId)!}
              overlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}