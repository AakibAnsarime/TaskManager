import React, { useState, useEffect } from 'react';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { Task, SubTask } from './types';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/tasks')
      .then(response => response.json())
      .then(data => setTasks(data))
      .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  const handleAddTask = (newTask: Task) => {
    fetch('http://localhost:3001/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    })
      .then(response => response.json())
      .then(data => setTasks([...tasks, data]))
      .catch(error => console.error('Error adding task:', error));
  };

  const handleAddSubTask = (taskId: string, title: string, description: string) => {
    const newSubTask: SubTask = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      status: 'working',
      createdAt: new Date().toISOString(),
      completedAt: null,
      owner: {
        name: 'John Doe',
        avatar: '/assets/profile.jpg',
      }
    };

    fetch(`http://localhost:3001/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubTask),
    })
      .then(response => response.json())
      .then(data => {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, subTasks: [...task.subTasks, data] } : task
        ));
      })
      .catch(error => console.error('Error adding subtask:', error));
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    fetch(`http://localhost:3001/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
      .then(response => response.json())
      .then(() => {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, status, completedAt: status === 'done' ? new Date().toISOString() : null } : task
        ));
      })
      .catch(error => console.error('Error updating task status:', error));
  };

  const handleSubTaskStatusChange = (taskId: string, subTaskId: string, status: Task['status']) => {
    fetch(`http://localhost:3001/tasks/${taskId}/subtasks/${subTaskId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
      .then(response => response.json())
      .then(() => {
        setTasks(tasks.map(task =>
          task.id === taskId ? {
            ...task,
            subTasks: task.subTasks.map(subTask =>
              subTask.id === subTaskId ? { ...subTask, status, completedAt: status === 'done' ? new Date().toISOString() : null } : subTask
            )
          } : task
        ));
      })
      .catch(error => console.error('Error updating subtask status:', error));
  };

  const handleDeleteTask = (taskId: string) => {
    fetch(`http://localhost:3001/tasks/${taskId}`, {
      method: 'DELETE',
    })
      .then(() => setTasks(tasks.filter(task => task.id !== taskId)))
      .catch(error => console.error('Error deleting task:', error));
  };

  const handleDeleteSubTask = (taskId: string, subTaskId: string) => {
    fetch(`http://localhost:3001/tasks/${taskId}/subtasks/${subTaskId}`, {
      method: 'DELETE',
    })
      .then(() => {
        setTasks(tasks.map(task => {
          if (task.id === taskId) {
            task.subTasks = task.subTasks.filter(subTask => subTask.id !== subTaskId);
          }
          return task;
        }));
      })
      .catch(error => console.error('Error deleting subtask:', error));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Team planning</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 bg-green-600 text-white rounded-full hover:scale-110 transition-transform duration-200"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
        
        <TaskList
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onSubTaskAdd={handleAddSubTask}
          onSubTaskStatusChange={handleSubTaskStatusChange}
          onDeleteTask={handleDeleteTask}
          onDeleteSubTask={handleDeleteSubTask}
        />

        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(title, description, month) => {
            const newTask: Task = {
              id: crypto.randomUUID(),
              title,
              description,
              startTime: null,
              completed: false,
              status: 'working',
              createdAt: new Date().toISOString(),
              completedAt: null,
              owner: {
                name: 'John Doe',
                avatar: '/assets/profile.jpg',
              },
              month,
              subTasks: []
            };
            handleAddTask(newTask);
          }}
        />
      </div>
    </div>
  );
}

export default App;