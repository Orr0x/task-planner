import { useState } from 'react';
import {
  Table,
  Group,
  Text,
  ActionIcon,
  Menu,
  Badge,
  TextInput,
  Box,
  Button,
  rem,
  UnstyledButton,
  Center,
  Checkbox,
  Select,
  Modal,
} from '@mantine/core';
import {
  IconDots,
  IconPencil,
  IconTrash,
  IconSearch,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconUserCircle,
  IconFilter,
} from '@tabler/icons-react';
import { useTask } from '../contexts/TaskContext';
import { Task } from '../types';
import EditTaskModal from './EditTaskModal';
import CreateTaskModal from './CreateTaskModal';

type SortField = 'title' | 'status' | 'startDate' | 'endDate' | 'assignedTo';
type SortDirection = 'asc' | 'desc';

interface ThProps {
  children: React.ReactNode;
  sortable?: boolean;
  field?: SortField;
  onSort?: (field: SortField) => void;
  sorted?: SortDirection | null;
}

function Th({ children, sortable, sorted, field, onSort }: ThProps) {
  return (
    <Table.Th>
      <UnstyledButton
        onClick={() => sortable && field && onSort?.(field)}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: sortable ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        <Text fw={500}>{children}</Text>
        {sortable && (
          <Center>
            {sorted === 'asc' && <IconChevronUp size={14} />}
            {sorted === 'desc' && <IconChevronDown size={14} />}
            {!sorted && <IconSelector size={14} />}
          </Center>
        )}
      </UnstyledButton>
    </Table.Th>
  );
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

interface BulkAssignModalProps {
  opened: boolean;
  onClose: () => void;
  onAssign: (userId: string) => void;
}

function BulkAssignModal({ opened, onClose, onAssign }: BulkAssignModalProps) {
  const [selectedUser, setSelectedUser] = useState('');

  const handleSubmit = () => {
    onAssign(selectedUser);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Assign Tasks">
      <Box>
        <Select
          label="Assign to"
          placeholder="Select user"
          value={selectedUser}
          onChange={(value) => setSelectedUser(value || '')}
          data={[
            // TODO: Replace with actual user list
            { value: 'user1', label: 'User 1' },
            { value: 'user2', label: 'User 2' },
          ]}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Assign</Button>
        </Group>
      </Box>
    </Modal>
  );
}

export default function TaskList() {
  const { tasks, deleteTask, bulkDeleteTasks, bulkUpdateTasks } = useTask();
  const [search, setSearch] = useState('');
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');
  const [assignModalOpen, setAssignModalOpen] = useState(false);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortTasks = (a: Task, b: Task) => {
    if (!sortField || !sortDirection) return 0;

    const multiplier = sortDirection === 'asc' ? 1 : -1;

    switch (sortField) {
      case 'title':
        return multiplier * a.title.localeCompare(b.title);
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      case 'startDate':
        return multiplier * (new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      case 'endDate':
        return multiplier * (new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
      case 'assignedTo':
        return multiplier * a.assignedTo.fullName.localeCompare(b.assignedTo.fullName);
      default:
        return 0;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedTasks(checked ? filteredTasks.map(task => task._id) : []);
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) {
      await bulkDeleteTasks(selectedTasks);
      setSelectedTasks([]);
    }
  };

  const handleBulkUpdateStatus = async (status: Task['status']) => {
    await bulkUpdateTasks(selectedTasks, { status });
    setSelectedTasks([]);
  };

  const handleBulkAssign = async (userId: string) => {
    await bulkUpdateTasks(selectedTasks, { assignedTo: userId });
    setSelectedTasks([]);
  };

  const filteredTasks = tasks
    .filter(task => 
      (statusFilter === 'all' || task.status === statusFilter) &&
      (task.title.toLowerCase().includes(search.toLowerCase()) ||
       task.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort(sortTasks);

  return (
    <>
      <Box mb="md">
        <Group justify="space-between" mb="sm">
          <Group>
            <TextInput
              placeholder="Search tasks..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: rem(300) }}
            />
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as Task['status'] | 'all')}
              data={[
                { value: 'all', label: 'All Statuses' },
                { value: 'todo', label: 'To Do' },
                { value: 'inProgress', label: 'In Progress' },
                { value: 'done', label: 'Done' },
              ]}
              leftSection={<IconFilter size={16} />}
            />
          </Group>
          <Button onClick={() => setCreateModalOpen(true)}>Create Task</Button>
        </Group>

        {selectedTasks.length > 0 && (
          <Group mb="sm">
            <Text size="sm">{selectedTasks.length} tasks selected</Text>
            <Button.Group>
              <Button
                variant="light"
                size="xs"
                onClick={() => handleBulkUpdateStatus('todo')}
              >
                Mark as Todo
              </Button>
              <Button
                variant="light"
                size="xs"
                onClick={() => handleBulkUpdateStatus('inProgress')}
              >
                Mark as In Progress
              </Button>
              <Button
                variant="light"
                size="xs"
                onClick={() => handleBulkUpdateStatus('done')}
              >
                Mark as Done
              </Button>
              <Button
                variant="light"
                size="xs"
                onClick={() => setAssignModalOpen(true)}
                leftSection={<IconUserCircle size={16} />}
              >
                Assign To
              </Button>
              <Button
                variant="light"
                color="red"
                size="xs"
                onClick={handleBulkDelete}
                leftSection={<IconTrash size={16} />}
              >
                Delete
              </Button>
            </Button.Group>
          </Group>
        )}
      </Box>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: rem(40) }}>
              <Checkbox
                onChange={(event) => handleSelectAll(event.currentTarget.checked)}
                checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                indeterminate={selectedTasks.length > 0 && selectedTasks.length < filteredTasks.length}
              />
            </Table.Th>
            <Th
              sortable
              field="title"
              sorted={sortField === 'title' ? sortDirection : null}
              onSort={handleSort}
            >
              Title
            </Th>
            <Th>Description</Th>
            <Th
              sortable
              field="status"
              sorted={sortField === 'status' ? sortDirection : null}
              onSort={handleSort}
            >
              Status
            </Th>
            <Th
              sortable
              field="startDate"
              sorted={sortField === 'startDate' ? sortDirection : null}
              onSort={handleSort}
            >
              Start Date
            </Th>
            <Th
              sortable
              field="endDate"
              sorted={sortField === 'endDate' ? sortDirection : null}
              onSort={handleSort}
            >
              End Date
            </Th>
            <Th
              sortable
              field="assignedTo"
              sorted={sortField === 'assignedTo' ? sortDirection : null}
              onSort={handleSort}
            >
              Assigned To
            </Th>
            <Th>Actions</Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredTasks.map((task) => (
            <Table.Tr key={task._id}>
              <Table.Td>
                <Checkbox
                  checked={selectedTasks.includes(task._id)}
                  onChange={(event) => handleSelectTask(task._id, event.currentTarget.checked)}
                />
              </Table.Td>
              <Table.Td>
                <Text fz="sm" fw={500}>{task.title}</Text>
              </Table.Td>
              <Table.Td>
                <Text lineClamp={2}>{task.description}</Text>
              </Table.Td>
              <Table.Td>
                <Badge color={getStatusColor(task.status)}>
                  {task.status === 'inProgress' ? 'In Progress' : 
                    task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              </Table.Td>
              <Table.Td>{formatDate(task.startDate)}</Table.Td>
              <Table.Td>{formatDate(task.endDate)}</Table.Td>
              <Table.Td>{task.assignedTo.fullName}</Table.Td>
              <Table.Td>
                <Menu withinPortal position="bottom-end" shadow="sm">
                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconPencil size={16} />}
                      onClick={() => setEditTask(task)}
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
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {editTask && (
        <EditTaskModal
          task={editTask}
          opened={!!editTask}
          onClose={() => setEditTask(null)}
        />
      )}

      <CreateTaskModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <BulkAssignModal
        opened={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleBulkAssign}
      />
    </>
  );
}