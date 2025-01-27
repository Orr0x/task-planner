import { useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Select,
  Stack,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useTask } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import type { CreateTaskInput } from '../types';

interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({ opened, onClose }: CreateTaskModalProps) {
  const { createTask } = useTask();
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize dates with start of day for start date and end of day for end date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const [formData, setFormData] = useState<Omit<CreateTaskInput, 'projectId'>>({
    title: '',
    description: '',
    status: 'todo',
    startDate: today.toISOString(),
    endDate: todayEnd.toISOString(),
    assignedTo: user?.id || '',
  });

  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    
    // Set hours to start of day
    date.setHours(0, 0, 0, 0);
    
    // If end date is before new start date, update both
    const currentEnd = new Date(formData.endDate);
    if (currentEnd < date) {
      const newEnd = new Date(date);
      newEnd.setHours(23, 59, 59, 999);
      setFormData({
        ...formData,
        startDate: date.toISOString(),
        endDate: newEnd.toISOString(),
      });
    } else {
      setFormData({
        ...formData,
        startDate: date.toISOString(),
      });
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;
    
    // Set hours to end of day
    date.setHours(23, 59, 59, 999);
    setFormData({
      ...formData,
      endDate: date.toISOString(),
    });
  };

  const resetForm = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    setFormData({
      title: '',
      description: '',
      status: 'todo',
      startDate: now.toISOString(),
      endDate: endOfDay.toISOString(),
      assignedTo: user?.id || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) {
      // This shouldn't happen as the create task button should be disabled when no project is selected
      return;
    }

    setIsLoading(true);

    try {
      await createTask(formData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentProject) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Task"
      size="md"
      padding="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Enter task title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter task description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            minRows={3}
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(value: string | null) =>
              setFormData({
                ...formData,
                status: (value as 'todo' | 'inProgress' | 'done') || 'todo',
              })
            }
            data={[
              { value: 'todo', label: 'To Do' },
              { value: 'inProgress', label: 'In Progress' },
              { value: 'done', label: 'Done' },
            ]}
            required
          />

          <Group grow>
            <DatePickerInput
              label="Start Date"
              placeholder="Pick start date"
              value={new Date(formData.startDate)}
              onChange={handleStartDateChange}
              required
              clearable={false}
            />

            <DatePickerInput
              label="End Date"
              placeholder="Pick end date"
              value={new Date(formData.endDate)}
              onChange={handleEndDateChange}
              required
              minDate={new Date(formData.startDate)}
              clearable={false}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Create Task
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}