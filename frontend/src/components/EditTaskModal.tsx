import { useState, useEffect } from 'react';
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
import { Task, UpdateTaskInput } from '../types';

interface EditTaskModalProps {
  task: Task | null;
  opened: boolean;
  onClose: () => void;
}

const EditTaskModal = ({ task, opened, onClose }: EditTaskModalProps) => {
  const { updateTask } = useTask();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Required<UpdateTaskInput>>({
    title: '',
    description: '',
    status: 'todo',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    assignedTo: '',
    projectId: '',
  });

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        startDate: task.startDate,
        endDate: task.endDate,
        assignedTo: task.assignedTo.id,
        projectId: task.projectId,
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    try {
      setLoading(true);
      // Only send changed fields
      const changedFields: UpdateTaskInput = {};
      const originalTask = {
        title: task.title,
        description: task.description,
        status: task.status,
        startDate: task.startDate,
        endDate: task.endDate,
        assignedTo: task.assignedTo.id,
        projectId: task.projectId,
      };

      (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
        if (formData[key] !== originalTask[key]) {
          if (key === 'status') {
            changedFields[key] = formData[key] as Task['status'];
          } else {
            changedFields[key] = formData[key];
          }
        }
      });

      await updateTask(task._id, changedFields);
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
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

  if (!task) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Task"
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
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EditTaskModal;