import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Stack } from '@mantine/core';
import { Task } from '../types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  tasks: Task[];
  status: Task['status'];
}

export default function TaskColumn({ tasks, status }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <SortableContext
      id={status}
      items={tasks.map((task) => task._id)}
      strategy={verticalListSortingStrategy}
    >
      <Stack
        ref={setNodeRef}
        gap="sm"
        style={{
          minHeight: '100%',
          transition: 'background-color 200ms ease',
        }}
      >
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
      </Stack>
    </SortableContext>
  );
}