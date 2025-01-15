import React, { useState, useEffect } from 'react';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { Task, SubTask } from './types';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { LayoutGrid, Table2, Trello, Plus } from 'lucide-react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
    };

    fetchTasks();
  }, []);

  const handleAddTask = async (newTask: Task) => {
    const docRef = await addDoc(collection(db, 'tasks'), newTask);
    setTasks([...tasks, { ...newTask, id: docRef.id }]);
  };

  const handleAddSubTask = async (taskId: string, title: string, description: string) => {
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

    const taskDocRef = doc(db, 'tasks', taskId);
    const task = tasks.find(task => task.id === taskId);
    if (task) {
      const updatedSubTasks = [...task.subTasks, newSubTask];
      await updateDoc(taskDocRef, { subTasks: updatedSubTasks });
      setTasks(tasks.map(task => task.id === taskId ? { ...task, subTasks: updatedSubTasks } : task));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleDeleteSubTask = async (taskId: string, subTaskId: string) => {
    const taskDocRef = doc(db, 'tasks', taskId);
    const task = tasks.find(task => task.id === taskId);
    if (task) {
      const updatedSubTasks = task.subTasks.filter(subTask => subTask.id !== subTaskId);
      await updateDoc(taskDocRef, { subTasks: updatedSubTasks });
      setTasks(tasks.map(task => task.id === taskId ? { ...task, subTasks: updatedSubTasks } : task));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Team planning</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
                <button className="p-2 text-blue-600 bg-blue-50 rounded">
                  <Table2 className="h-5 w-5" />
                </button>
              </div>
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
          onStatusChange={async (taskId, status) => {
            const taskDocRef = doc(db, 'tasks', taskId);
            const task = tasks.find(task => task.id === taskId);
            if (task) {
              const updatedTask = { ...task, status, completedAt: status === 'done' ? new Date().toISOString() : null };
              await updateDoc(taskDocRef, updatedTask);
              setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
            }
          }}
          onSubTaskAdd={handleAddSubTask}
          onSubTaskStatusChange={async (taskId, subTaskId, status) => {
            const taskDocRef = doc(db, 'tasks', taskId);
            const task = tasks.find(task => task.id === taskId);
            if (task) {
              const updatedSubTasks = task.subTasks.map(subTask =>
                subTask.id === subTaskId ? { ...subTask, status, completedAt: status === 'done' ? new Date().toISOString() : null } : subTask
              );
              await updateDoc(taskDocRef, { subTasks: updatedSubTasks });
              setTasks(tasks.map(task => task.id === taskId ? { ...task, subTasks: updatedSubTasks } : task));
            }
          }}
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