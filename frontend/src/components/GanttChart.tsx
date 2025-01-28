import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Paper,
  Text,
  Group,
  Button,
  Box,
  ScrollArea,
  Badge,
  Tooltip,
  rem,
  Select,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useTask } from '../contexts/TaskContext';
import { Task } from '../types';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import React from 'react';

const CELL_WIDTH = 60;
const LABEL_WIDTH = rem(200);
const ROW_HEIGHT = rem(50);
const HEADER_HEIGHT = rem(60);
const DEFAULT_DAYS_TO_SHOW = 14;
const RESIZE_HANDLE_WIDTH = 8;

interface ResizeHandleProps {
  taskId: string;
  position: 'start' | 'end';
  onResizeStart: (taskId: string, position: 'start' | 'end', event: React.MouseEvent) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ taskId, position, onResizeStart }) => {
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onResizeStart(taskId, position, e);
  }, [taskId, position, onResizeStart]);

  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: rem(RESIZE_HANDLE_WIDTH * 2),
        cursor: 'ew-resize',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(position === 'start' ? { left: -RESIZE_HANDLE_WIDTH } : { right: -RESIZE_HANDLE_WIDTH }),
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          position: 'absolute',
          top: '25%',
          bottom: '25%',
          width: '4px',
          backgroundColor: 'var(--mantine-color-blue-5)',
          opacity: 0,
          transition: 'all 0.15s ease',
          borderRadius: '2px',
        }}
        onMouseEnter={(e) => {
          const target = e.currentTarget;
          target.style.opacity = '0.8';
          target.style.top = '10%';
          target.style.bottom = '10%';
          target.style.boxShadow = '0 0 4px rgba(0, 0, 0, 0.2)';
          target.style.width = '6px';
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget;
          target.style.opacity = '0';
          target.style.top = '25%';
          target.style.bottom = '25%';
          target.style.boxShadow = 'none';
          target.style.width = '4px';
        }}
      />
    </Box>
  );
};

const GanttChart: React.FC = () => {
  const { tasks, updateTask } = useTask();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewStartDate, setViewStartDate] = useState<Date>(new Date());
  const [daysToShow, setDaysToShow] = useState(DEFAULT_DAYS_TO_SHOW);
  const [now, setNow] = useState(new Date());
  const [resizing, setResizing] = useState<{
    taskId: string;
    position: 'start' | 'end';
    initialX: number;
    initialDate: Date;
    task: Task;
  } | null>(null);

  const getDateDiffInDays = useCallback((date1: Date, date2: Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  const formatDateTime = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }, []);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getTaskGridPosition = useCallback((task: Task) => {
    const startDate = new Date(task.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(task.endDate);
    endDate.setHours(23, 59, 59, 999);

    // Calculate days from view start to task start and end
    const daysFromViewStartToTaskStart = getDateDiffInDays(viewStartDate, startDate);
    const daysFromViewStartToTaskEnd = getDateDiffInDays(viewStartDate, endDate);

    // If the task is completely outside our visible range
    if (daysFromViewStartToTaskStart >= daysToShow || daysFromViewStartToTaskEnd < 0) {
      return null;
    }

    // Calculate visible start and end columns
    const visibleStart = Math.max(0, daysFromViewStartToTaskStart);
    const visibleEnd = Math.min(daysToShow, daysFromViewStartToTaskEnd + 1);

    return {
      gridColumnStart: visibleStart + 1,
      gridColumnEnd: visibleEnd + 1,
    };
  }, [viewStartDate, daysToShow, getDateDiffInDays]);

  // Handle resize events
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;

      const deltaX = e.clientX - resizing.initialX;
      const daysDelta = Math.round(deltaX / CELL_WIDTH);
      
      const newDate = new Date(resizing.initialDate);
      newDate.setDate(newDate.getDate() + daysDelta);

      // Update task bar position in real-time
      const taskBar = document.querySelector(`[data-task-id="${resizing.taskId}"]`) as HTMLElement;
      if (taskBar) {
        const gridPosition = getTaskGridPosition({
          ...resizing.task,
          [resizing.position === 'start' ? 'startDate' : 'endDate']: newDate.toISOString(),
        });

        if (gridPosition) {
          taskBar.style.gridColumn = `${gridPosition.gridColumnStart} / ${gridPosition.gridColumnEnd}`;
        }
      }
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (!resizing) return;

      const deltaX = e.clientX - resizing.initialX;
      const daysDelta = Math.round(deltaX / CELL_WIDTH);
      
      const newDate = new Date(resizing.initialDate);
      newDate.setDate(newDate.getDate() + daysDelta);

      try {
        if (resizing.position === 'start') {
          const endDate = new Date(resizing.task.endDate);
          if (newDate < endDate) {
            await updateTask(resizing.taskId, { startDate: newDate.toISOString() });
          }
        } else {
          const startDate = new Date(resizing.task.startDate);
          if (newDate > startDate) {
            await updateTask(resizing.taskId, { endDate: newDate.toISOString() });
          }
        }
      } catch (error) {
        console.error('Failed to update task:', error);
      }

      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, updateTask, getTaskGridPosition]);

  // Calculate date boundaries from tasks
  const { earliestStart, latestEnd } = useMemo(() => {
    if (!tasks.length) {
      const today = new Date();
      return { 
        earliestStart: today,
        latestEnd: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      };
    }

    return tasks.reduce(
      (acc, task) => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        
        return {
          earliestStart: !acc.earliestStart || startDate < acc.earliestStart ? startDate : acc.earliestStart,
          latestEnd: !acc.latestEnd || endDate > acc.latestEnd ? endDate : acc.latestEnd,
        };
      },
      { 
        earliestStart: new Date(tasks[0].startDate),
        latestEnd: new Date(tasks[0].endDate)
      }
    );
  }, [tasks]);

  // Generate date range
  const dateRange: Date[] = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date(viewStartDate);
    date.setDate(viewStartDate.getDate() + i);
    return date;
  });

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

  const isTaskVisible = useCallback((task: Task) => {
    const taskStart = new Date(task.startDate);
    taskStart.setHours(0, 0, 0, 0);
    const taskEnd = new Date(task.endDate);
    taskEnd.setHours(23, 59, 59, 999);
    
    const rangeEnd = new Date(dateRange[dateRange.length - 1]);
    rangeEnd.setHours(23, 59, 59, 999);
    
    return taskEnd >= viewStartDate && taskStart <= rangeEnd;
  }, [viewStartDate, dateRange]);

  const getCurrentTimePosition = useCallback(() => {
    const viewStartCopy = new Date(viewStartDate);
    viewStartCopy.setHours(0, 0, 0, 0);
    
    const viewEndCopy = new Date(viewStartCopy);
    viewEndCopy.setDate(viewEndCopy.getDate() + daysToShow - 1);
    viewEndCopy.setHours(23, 59, 59, 999);

    // If current time is outside view range, don't show the line
    if (now < viewStartCopy || now > viewEndCopy) {
      return null;
    }

    // Calculate milliseconds since view start
    const msSinceStart = now.getTime() - viewStartCopy.getTime();
    const totalDayMs = 24 * 60 * 60 * 1000;
    
    // Convert to pixels
    const pixels = (msSinceStart / totalDayMs) * CELL_WIDTH;
    
    return {
      left: `${pixels}px`,
    };
  }, [viewStartDate, daysToShow, now]);

  const handleResizeStart = useCallback((taskId: string, position: 'start' | 'end', event: React.MouseEvent) => {
    event.preventDefault();
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    setResizing({
      taskId,
      position,
      initialX: event.clientX,
      initialDate: new Date(position === 'start' ? task.startDate : task.endDate),
      task,
    });
  }, [tasks]);

  const visibleTasks = useMemo(() => tasks.filter(isTaskVisible), [tasks, isTaskVisible]);
  const timePosition = getCurrentTimePosition();

  return (
    <>
      <Group justify="space-between" mb="md">
        <Group>
          <Text size="xl" fw={700}>
            Gantt Chart
          </Text>
          <Text c="dimmed" style={{ whiteSpace: 'nowrap' }}>
            Current Time: {formatDateTime(now)}
          </Text>
        </Group>
        <Group>
          <DatePickerInput
            label="View from"
            value={viewStartDate}
            onChange={(date) => date && setViewStartDate(date)}
            minDate={earliestStart}
            maxDate={latestEnd}
            clearable={false}
          />
          <Select
            label="Days to show"
            value={daysToShow.toString()}
            onChange={(value) => setDaysToShow(Number(value))}
            data={[
              { value: '7', label: '1 Week' },
              { value: '14', label: '2 Weeks' },
              { value: '30', label: '1 Month' },
              { value: '90', label: '3 Months' },
            ]}
          />
          <Button onClick={() => setCreateModalOpen(true)}>Create Task</Button>
        </Group>
      </Group>

      <Paper shadow="xs" withBorder>
        <Box style={{ display: 'flex', height: '100%', minHeight: rem(400) }}>
          {/* Fixed Left Panel - Task Labels */}
          <Box
            style={{
              width: LABEL_WIDTH,
              flexShrink: 0,
              borderRight: '1px solid var(--mantine-color-gray-3)',
              backgroundColor: 'var(--mantine-color-body)',
              position: 'relative',
              zIndex: 3,
            }}
          >
            {/* Header */}
            <Box
              style={{
                height: HEADER_HEIGHT,
                borderBottom: '1px solid var(--mantine-color-gray-3)',
                padding: rem(12),
              }}
            >
              <Text fw={500}>Tasks</Text>
            </Box>

            {/* Task Labels */}
            {visibleTasks.map((task, index) => (
              <Box
                key={task._id}
                style={{
                  height: ROW_HEIGHT,
                  padding: rem(12),
                  borderBottom: '1px solid var(--mantine-color-gray-2)',
                  backgroundColor: index % 2 === 0 ? 'var(--mantine-color-gray-0)' : undefined,
                }}
              >
                <Group gap="xs">
                  <Text size="sm" truncate fw={500}>
                    {task.title}
                  </Text>
                  <Badge size="sm" color={getStatusColor(task.status)}>
                    {task.status === 'inProgress' ? 'In Progress' : 
                      task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>
                </Group>
              </Box>
            ))}
          </Box>

          {/* Scrollable Timeline Panel */}
          <ScrollArea type="auto">
            <Box
              style={{
                width: `${dateRange.length * CELL_WIDTH}px`,
                position: 'relative',
              }}
            >
              {/* Timeline Header */}
              <Box
                style={{
                  height: HEADER_HEIGHT,
                  borderBottom: '1px solid var(--mantine-color-gray-3)',
                  backgroundColor: 'var(--mantine-color-body)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${daysToShow}, ${rem(CELL_WIDTH)})`,
                }}
              >
                {dateRange.map((date) => (
                  <Box
                    key={date.toISOString()}
                    style={{
                      borderLeft: '1px solid var(--mantine-color-gray-3)',
                      padding: rem(4),
                      textAlign: 'center',
                    }}
                  >
                    <Text size="sm" fw={500}>
                      {date.getDate()}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {date.toLocaleString('default', { month: 'short' })}
                    </Text>
                  </Box>
                ))}
              </Box>

              {/* Current Time Indicator */}
              {timePosition && (
                <Box
                  style={{
                    position: 'absolute',
                    top: HEADER_HEIGHT,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: 'var(--mantine-color-red-6)',
                    zIndex: 4,
                    ...timePosition,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Task Rows */}
              {visibleTasks.map((task, index) => {
                const gridPosition = getTaskGridPosition(task);
                if (!gridPosition) return null;

                return (
                  <Box
                    key={task._id}
                    style={{
                      height: ROW_HEIGHT,
                      borderBottom: '1px solid var(--mantine-color-gray-2)',
                      backgroundColor: index % 2 === 0 ? 'var(--mantine-color-gray-0)' : undefined,
                      position: 'relative',
                      display: 'grid',
                      gridTemplateColumns: `repeat(${daysToShow}, ${rem(CELL_WIDTH)})`,
                    }}
                  >
                    {/* Grid Lines */}
                    {dateRange.map((date) => (
                      <Box
                        key={date.toISOString()}
                        style={{
                          borderLeft: '1px solid var(--mantine-color-gray-2)',
                          height: '100%',
                        }}
                      />
                    ))}

                    {/* Task Bar */}
                    <Tooltip
                      label={`${task.title}\n${task.description}\nStatus: ${task.status}\nStart: ${new Date(
                        task.startDate
                      ).toLocaleDateString()}\nEnd: ${new Date(task.endDate).toLocaleDateString()}`}
                      multiline
                    >
                      <Box
                        data-task-id={task._id}
                        style={{
                          gridColumn: `${gridPosition.gridColumnStart} / ${gridPosition.gridColumnEnd}`,
                          position: 'absolute',
                          top: '50%',
                          left: '2px',
                          right: '2px',
                          transform: 'translateY(-50%)',
                          height: rem(30),
                          backgroundColor: `var(--mantine-color-${getStatusColor(task.status)}-4)`,
                          borderRadius: 'var(--mantine-radius-sm)',
                          cursor: resizing?.taskId === task._id ? 'ew-resize' : 'pointer',
                          transition: resizing ? 'none' : 'all 0.2s',
                          zIndex: resizing?.taskId === task._id ? 5 : 1,
                          '&:hover': {
                            filter: 'brightness(0.95)',
                          },
                        }}
                        onClick={() => !resizing && setEditTask(task)}
                      >
                        <Group px={rem(8)} py={rem(4)} style={{ height: '100%' }} wrap="nowrap">
                          <Text size="xs" truncate>
                            {task.title}
                          </Text>
                        </Group>
                        <ResizeHandle
                          taskId={task._id}
                          position="start"
                          onResizeStart={handleResizeStart}
                        />
                        <ResizeHandle
                          taskId={task._id}
                          position="end"
                          onResizeStart={handleResizeStart}
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>
          </ScrollArea>
        </Box>
      </Paper>

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
    </>
  );
};

export default GanttChart;