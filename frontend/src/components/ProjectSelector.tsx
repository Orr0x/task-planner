import { useState } from 'react';
import {
  Menu,
  Button,
  Text,
  Modal,
  TextInput,
  Textarea,
  Stack,
  Group,
  ActionIcon,
  Loader,
  Alert,
  Box,
} from '@mantine/core';
import {
  IconChevronDown,
  IconPlus,
  IconSettings,
  IconTrash,
  IconEdit,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useProject } from '../contexts/ProjectContext';
import type { CreateProjectInput } from '../types';

interface CreateProjectModalProps {
  opened: boolean;
  onClose: () => void;
}

function CreateProjectModal({ opened, onClose }: CreateProjectModalProps) {
  const { createProject } = useProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('Name and description are required');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const newProject: CreateProjectInput = {
        name: name.trim(),
        description: description.trim(),
        members: [], // TODO: Add member selection
      };
      await createProject(newProject);
      setName('');
      setDescription('');
      onClose();
    } catch (error: any) {
      console.error('Failed to create project:', error);
      setError(error.response?.data?.error || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Create New Project" size="md">
      <form onSubmit={handleSubmit}>
        <Stack>
          {error && (
            <Alert color="red" icon={<IconAlertCircle />}>
              {error}
            </Alert>
          )}
          <TextInput
            label="Project Name"
            placeholder="Enter project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            data-autofocus
          />
          <Textarea
            label="Description"
            placeholder="Enter project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minRows={3}
            required
            disabled={isLoading}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Create Project
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default function ProjectSelector() {
  const { projects, currentProject, setCurrentProject, deleteProject, isLoading, error } = useProject();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Render loading state
  if (isLoading) {
    return (
      <Button variant="subtle" disabled leftSection={<Loader size="xs" />}>
        Loading...
      </Button>
    );
  }

  // Render error state
  if (error) {
    return (
      <Button variant="subtle" color="red" leftSection={<IconAlertCircle size={16} />}>
        Error loading projects
      </Button>
    );
  }

  // Render create project button when no projects exist
  if (!currentProject) {
    return (
      <Box>
        <Button
          variant="filled"
          onClick={() => setCreateModalOpen(true)}
          leftSection={<IconPlus size={16} />}
        >
          Create Project
        </Button>
        <CreateProjectModal
          opened={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      </Box>
    );
  }

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setDeleteLoading(projectId);
      try {
        await deleteProject(projectId);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  // Render project selector with dropdown
  return (
    <>
      <Menu position="bottom-start" shadow="md">
        <Menu.Target>
          <Button
            variant="subtle"
            rightSection={<IconChevronDown size={16} />}
            pr={12}
          >
            <Group gap="xs">
              <Text size="sm" fw={500}>
                {currentProject.name}
              </Text>
            </Group>
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Switch Project</Menu.Label>
          {projects.map((project) => (
            <Menu.Item
              key={project._id}
              onClick={() => setCurrentProject(project)}
              rightSection={
                project._id === currentProject._id && (
                  <Group gap={8}>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add edit project modal
                      }}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      loading={deleteLoading === project._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project._id);
                      }}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                )
              }
            >
              {project.name}
            </Menu.Item>
          ))}
          <Menu.Divider />
          <Menu.Item
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create New Project
          </Menu.Item>
          <Menu.Item
            leftSection={<IconSettings size={16} />}
            // TODO: Add project settings modal
          >
            Project Settings
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <CreateProjectModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}