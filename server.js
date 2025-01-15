import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tasksFilePath = path.join(__dirname, 'tasks.json');

app.get('/tasks', (req, res) => {
  fs.readFile(tasksFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read tasks data' });
    }
    res.json(JSON.parse(data));
  });
});

app.post('/tasks', (req, res) => {
  const newTask = req.body;
  fs.readFile(tasksFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read tasks data' });
    }
    const tasks = JSON.parse(data);
    tasks.push(newTask);
    fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save task' });
      }
      res.status(201).json(newTask);
    });
  });
});

app.post('/tasks/:taskId/subtasks', (req, res) => {
  const { taskId } = req.params;
  const newSubTask = req.body;
  fs.readFile(tasksFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read tasks data' });
    }
    let tasks = JSON.parse(data);
    tasks = tasks.map(task => {
      if (task.id === taskId) {
        task.subTasks.push(newSubTask);
      }
      return task;
    });
    fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save subtask' });
      }
      res.status(201).json(newSubTask);
    });
  });
});

app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  fs.readFile(tasksFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read tasks data' });
    }
    let tasks = JSON.parse(data);
    tasks = tasks.filter(task => task.id !== id);
    fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete task' });
      }
      res.status(204).end();
    });
  });
});

app.delete('/tasks/:taskId/subtasks/:subTaskId', (req, res) => {
  const { taskId, subTaskId } = req.params;
  fs.readFile(tasksFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read tasks data' });
    }
    let tasks = JSON.parse(data);
    tasks = tasks.map(task => {
      if (task.id === taskId) {
        task.subTasks = task.subTasks.filter(subTask => subTask.id !== subTaskId);
      }
      return task;
    });
    fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete subtask' });
      }
      res.status(204).end();
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});