import { createContext, useContext, useState, useCallback } from 'react';
import { projects as initialProjects, tasks as initialTasks } from '../data/mockData';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);

  const addProject = useCallback((project) => {
    const newProject = {
      ...project,
      id: `p${Date.now()}`,
      status: 'active',
      progress: 0,
      tasksTotal: 0,
      tasksCompleted: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback((id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
  }, []);

  const addTask = useCallback((task) => {
    const newTask = {
      ...task,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      subtasks: task.subtasks || [],
    };
    setTasks(prev => [...prev, newTask]);
    // Update project task count
    setProjects(prev => prev.map(p => {
      if (p.id === task.projectId) {
        const total = p.tasksTotal + 1;
        return { ...p, tasksTotal: total, progress: Math.round((p.tasksCompleted / total) * 100) };
      }
      return p;
    }));
    return newTask;
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => {
      const oldTask = prev.find(t => t.id === id);
      const newTasks = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      
      // Update project progress if status changed
      if (oldTask && updates.status && oldTask.status !== updates.status) {
        const projectId = oldTask.projectId;
        const projectTasks = newTasks.filter(t => t.projectId === projectId);
        const completed = projectTasks.filter(t => t.status === 'done').length;
        const total = projectTasks.length;
        setProjects(prev2 => prev2.map(p => {
          if (p.id === projectId) {
            return { ...p, tasksCompleted: completed, progress: total ? Math.round((completed / total) * 100) : 0 };
          }
          return p;
        }));
      }
      
      return newTasks;
    });
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task) {
        setProjects(prev2 => prev2.map(p => {
          if (p.id === task.projectId) {
            const total = p.tasksTotal - 1;
            const completed = task.status === 'done' ? p.tasksCompleted - 1 : p.tasksCompleted;
            return { ...p, tasksTotal: total, tasksCompleted: completed, progress: total ? Math.round((completed / total) * 100) : 0 };
          }
          return p;
        }));
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const moveTask = useCallback((taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
  }, [updateTask]);

  const getProjectTasks = useCallback((projectId) => {
    return tasks.filter(t => t.projectId === projectId);
  }, [tasks]);

  return (
    <ProjectContext.Provider value={{
      projects, tasks, addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask, moveTask, getProjectTasks,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within ProjectProvider');
  return context;
}
