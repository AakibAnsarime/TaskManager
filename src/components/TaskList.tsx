import React, { useState } from 'react';
import { Task } from '../types';
import { MoreVertical, ChevronDown, ChevronRight, Plus, Calendar, Trash2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onSubTaskAdd: (taskId: string, title: string, description: string) => void;
  onSubTaskStatusChange: (taskId: string, subTaskId: string, status: Task['status']) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteSubTask: (taskId: string, subTaskId: string) => void;
}

export function TaskList({
  tasks,
  onStatusChange,
  onSubTaskAdd,
  onSubTaskStatusChange,
  onDeleteTask,
  onDeleteSubTask,
}: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [newSubTaskTitle, setNewSubTaskTitle] = useState<string>('');
  const [newSubTaskDescription, setNewSubTaskDescription] = useState<string>('');
  const [addingSubTaskFor, setAddingSubTaskFor] = useState<string | null>(null);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return 'bg-green-500';
      case 'working':
        return 'bg-orange-400';
      case 'stuck':
        return 'bg-red-500';
      default:
        return 'bg-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleAddSubTask = (taskId: string) => {
    if (newSubTaskTitle.trim()) {
      onSubTaskAdd(taskId, newSubTaskTitle, newSubTaskDescription);
      setNewSubTaskTitle('');
      setNewSubTaskDescription('');
      setAddingSubTaskFor(null);
    }
  };

  const renderTaskRow = (task: Task, isSubTask = false, parentTaskId?: string) => (
    <div className={`grid grid-cols-12 px-4 py-3 items-center hover:bg-gray-50 ${isSubTask ? 'bg-gray-50' : ''}`}>
      <div className="col-span-4 font-medium text-gray-900 flex items-center space-x-2">
        {!isSubTask && (
          <button
            onClick={() => toggleTaskExpansion(task.id)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {expandedTasks.has(task.id) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        <span>{task.title}</span>
      </div>
      <div className="col-span-2">
        <div className="flex items-center space-x-2">
          <img
            src={task.owner.avatar}
            alt={task.owner.name}
            className="w-6 h-6 rounded-full"
          />
        </div>
      </div>
      <div className="col-span-2">
        <select
          value={task.status}
          onChange={(e) => 
            isSubTask && parentTaskId 
              ? onSubTaskStatusChange(parentTaskId, task.id, e.target.value as Task['status'])
              : onStatusChange(task.id, e.target.value as Task['status'])
          }
          className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(task.status)}`}
        >
          <option value="done">Done</option>
          <option value="working">Working on it</option>
          <option value="stuck">Stuck</option>
        </select>
      </div>
      <div className="col-span-4 flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Created: {formatDate(task.createdAt)}</span>
        </div>
        {task.completedAt && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <Calendar className="h-4 w-4" />
            <span>Completed: {formatDate(task.completedAt)}</span>
          </div>
        )}
        <button
          onClick={() => isSubTask && parentTaskId ? onDeleteSubTask(parentTaskId, task.id) : onDeleteTask(task.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderSubTasks = (task: Task) => {
    if (!expandedTasks.has(task.id)) return null;

    return (
      <div className="pl-8 border-l-2 border-gray-100">
        {task.subTasks.map((subTask) => (
          <div key={subTask.id}>
            {renderTaskRow(subTask as Task, true, task.id)}
          </div>
        ))}
        {addingSubTaskFor === task.id ? (
          <div className="grid grid-cols-12 px-4 py-3 bg-gray-50">
            <div className="col-span-12 space-y-2">
              <input
                type="text"
                value={newSubTaskTitle}
                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                placeholder="Enter subtask title"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                value={newSubTaskDescription}
                onChange={(e) => setNewSubTaskDescription(e.target.value)}
                placeholder="Enter subtask description"
                className="w-full px-3 py-2 border rounded-md"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddSubTask(task.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingSubTaskFor(null)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingSubTaskFor(task.id)}
            className="flex items-center space-x-1 px-4 py-2 text-blue-500 hover:text-blue-600"
          >
            <Plus className="h-4 w-4" />
            <span>Add subtask</span>
          </button>
        )}
      </div>
    );
  };

  const renderTaskGroup = (month: 'this' | 'next', title: string) => {
    const monthTasks = tasks.filter((task) => task.month === month);
    
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-blue-500 mb-4">{title}</h2>
        <div className="bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-12 px-4 py-2 border-b border-gray-100 text-sm text-gray-500">
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-4">Dates</div>
          </div>
          {monthTasks.map((task) => (
            <div key={task.id}>
              {renderTaskRow(task)}
              {renderSubTasks(task)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderTaskGroup('this', 'This month')}
      {renderTaskGroup('next', 'Next month')}
    </div>
  );
}