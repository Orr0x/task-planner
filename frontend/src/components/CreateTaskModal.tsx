import { useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Select,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useTask } from '../contexts/TaskContext';
import { useProject } from '../contexts/ProjectContext';
import { Task, CreateTaskInput } from '../types';

interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
}

const CreateTaskModal = ({ opened, onClose }: CreateTaskModalProps) => {
  const { createTask } = useTask();
  const { currentProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<CreateTaskInput, 'projectId'>>({
    title: '',
    description: '',
    status: 'todo',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: '', // Will be set to current user by default in the backend
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    try {
      setLoading(true);
      await createTask(formData); // createTask will add projectId internally
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: '',
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    if (date) {
      setFormData({
        ...formData,
        [field]: date.toISOString(),
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Task"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Title"
            placeholder="Enter task title"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.currentTarget.value })
            }
          />

          <Textarea
            label="Description"
            placeholder="Enter task description"
            minRows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.currentTarget.value })
            }
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(value) =>
              setFormData({ ...formData, status: value as Task['status'] })
            }
            data={[
              { value: 'todo', label: 'To Do' },
              { value: 'inProgress', label: 'In Progress' },
              { value: 'done', label: 'Done' },
            ]}
          />

          <Group grow>
            <DatePickerInput
              label="Start Date"
              placeholder="Pick start date"
              required
              value={new Date(formData.startDate)}
              onChange={(date) => handleDateChange('startDate', date)}
              maxDate={new Date(formData.endDate)}
            />

            <DatePickerInput
              label="End Date"
              placeholder="Pick end date"
              required
              value={new Date(formData.endDate)}
              onChange={(date) => handleDateChange('endDate', date)}
              minDate={new Date(formData.startDate)}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Task
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;