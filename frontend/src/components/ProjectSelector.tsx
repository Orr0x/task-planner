import { useState } from 'react';
import {
  Group,
  Select,
  Button,
  Modal,
  TextInput,
  Textarea,
  Stack,
  Box,
  Text,
  Loader,
  useMantineTheme,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useProject } from '../contexts/ProjectContext';
import { Project, CreateProjectInput } from '../types';

const ProjectSelector = () => {
  const theme = useMantineTheme();
  const {
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    isLoading,
    error,
  } = useProject();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProjectInput>({
    name: '',
    description: '',
    members: [], // Current user will be added automatically
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all required fields',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);
      await createProject(formData);
      notifications.show({
        title: 'Success',
        message: 'Project created successfully',
        color: 'green',
      });
      setCreateModalOpen(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        members: [],
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to create project',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Text c="red" size="sm">
        Error loading projects: {error.message}
      </Text>
    );
  }

  return (
    <>
      <Group gap="xs">
        {isLoading ? (
          <Loader size="sm" />
        ) : (
          <Box style={{ minWidth: '250px', maxWidth: '400px' }}>
            <Select
              placeholder={projects.length ? "Select a project" : "No projects available"}
              data={projects.map((project: Project) => ({
                value: project._id,
                label: project.name,
              }))}
              value={currentProject?._id}
              onChange={(value) => {
                const project = projects.find((p) => p._id === value);
                if (project) {
                  setCurrentProject(project);
                  notifications.show({
                    title: 'Project Selected',
                    message: `Switched to project: ${project.name}`,
                    color: 'blue',
                  });
                }
              }}
              searchable
              clearable
              disabled={isLoading}
              styles={{
                input: {
                  '&:focus': {
                    borderColor: theme.colors.blue[6],
                  },
                },
              }}
              comboboxProps={{
                position: 'bottom',
                offset: 5,
                shadow: 'sm',
                withinPortal: true,
              }}
            />
          </Box>
        )}
        <Button
          variant="light"
          onClick={() => setCreateModalOpen(true)}
          disabled={isLoading}
          leftSection={<IconPlus size={16} />}
          styles={{
            root: {
              backgroundColor: theme.colors.blue[0],
              color: theme.colors.blue[8],
              '&:hover': {
                backgroundColor: theme.colors.blue[1],
              },
            },
          }}
        >
          New Project
        </Button>
      </Group>

      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
        size="md"
      >
        <form onSubmit={handleCreateProject}>
          <Stack>
            <TextInput
              label="Project Name"
              placeholder="Enter project name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.currentTarget.value })
              }
            />

            <Textarea
              label="Description"
              placeholder="Enter project description"
              minRows={3}
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.currentTarget.value })
              }
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create Project
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};

export default ProjectSelector;