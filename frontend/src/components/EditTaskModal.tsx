import { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Stack,
  Select,
  Group,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
import { Task } from '../types';

interface EditTaskModalProps {
  task: Task;
  opened: boolean;
  onClose: () => void;
}

export default function EditTaskModal({ task, opened, onClose }: EditTaskModalProps) {
  const { updateTask } = useTask();
  const { currentProject } = useProject();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [startDate, setStartDate] = useState<Date>(new Date(task.startDate));
  const [endDate, setEndDate] = useState<Date>(new Date(task.endDate));
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setStartDate(new Date(task.startDate));
    setEndDate(new Date(task.endDate));
  }, [task]);

  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    
    // Set hours to start of day
    date.setHours(0, 0, 0, 0);
    setStartDate(date);

    // If end date is before new start date, update it
    if (endDate < date) {
      const newEnd = new Date(date);
      newEnd.setHours(23, 59, 59, 999);
      setEndDate(newEnd);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;
    
    // Set hours to end of day
    date.setHours(23, 59, 59, 999);
    setEndDate(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    setIsLoading(true);

    try {
      // Ensure start date is at start of day and end date is at end of day
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      await updateTask(task._id, {
        title,
        description,
        status,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
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
      title="Edit Task"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minRows={3}
          />

          <Select
            label="Status"
            value={status}
            onChange={(value) => setStatus(value as Task['status'])}
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
              value={startDate}
              onChange={handleStartDateChange}
              required
              clearable={false}
            />

            <DatePickerInput
              label="End Date"
              placeholder="Pick end date"
              value={endDate}
              onChange={handleEndDateChange}
              required
              minDate={startDate}
              clearable={false}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isLoading}>Save Changes</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}