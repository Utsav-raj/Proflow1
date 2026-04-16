import { useState, useCallback } from 'react';
import { useProjects } from '../context/ProjectContext';
import Topbar from '../components/layout/Topbar';
import Modal from '../components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { users } from '../data/mockData';
import {
  Plus, Circle, Clock, CheckCircle2, GripVertical,
  Calendar, Tag, User, MoreHorizontal, Trash2, Edit3,
} from 'lucide-react';

const columns = [
  { id: 'todo', title: 'To Do', icon: Circle, color: '#94a3b8', bgColor: 'bg-surface-500/10' },
  { id: 'in-progress', title: 'In Progress', icon: Clock, color: '#f59e0b', bgColor: 'bg-amber-500/10' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: '#10b981', bgColor: 'bg-emerald-500/10' },
];

const priorityColors = {
  high: 'border-l-rose-500',
  medium: 'border-l-amber-500',
  low: 'border-l-emerald-500',
};

export default function KanbanPage() {
  const { projects, tasks, addTask, updateTask, moveTask, deleteTask } = useProjects();
  const [selectedProject, setSelectedProject] = useState('all');
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createForColumn, setCreateForColumn] = useState('todo');
  const [taskMenu, setTaskMenu] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium',
    assignee: '', deadline: '', tags: '', projectId: '',
  });

  const filteredTasks = selectedProject === 'all'
    ? tasks
    : tasks.filter(t => t.projectId === selectedProject);

  const getColumnTasks = (status) => filteredTasks.filter(t => t.status === status);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    // Make dragged element semi-transparent
    setTimeout(() => {
      e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedTask && draggedTask.status !== columnId) {
      moveTask(draggedTask.id, columnId);
    }
    setDraggedTask(null);
  };

  const handleOpenCreate = (columnId) => {
    setCreateForColumn(columnId);
    setTaskForm({ ...taskForm, projectId: selectedProject === 'all' ? (projects[0]?.id || '') : selectedProject });
    setShowCreateTask(true);
  };

  const handleCreateTask = () => {
    if (!taskForm.title.trim() || !taskForm.projectId) return;
    addTask({
      ...taskForm,
      status: createForColumn,
      tags: taskForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setTaskForm({ title: '', description: '', priority: 'medium', assignee: '', deadline: '', tags: '', projectId: '' });
    setShowCreateTask(false);
  };

  return (
    <div>
      <Topbar title="Kanban Board" subtitle="Drag and drop tasks to update status" />

      <div className="px-8 py-6">
        {/* Project Filter */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedProject('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
              ${selectedProject === 'all' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-surface-400 bg-surface-800/40 border border-surface-700/30 hover:text-surface-200'}`}
          >
            All Projects
          </button>
          {projects.filter(p => p.status !== 'completed').map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2
                ${selectedProject === project.id ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-surface-400 bg-surface-800/40 border border-surface-700/30 hover:text-surface-200'}`}
            >
              <span>{project.icon}</span> {project.name}
            </button>
          ))}
        </div>

        {/* Kanban Columns */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnTasks = getColumnTasks(column.id);
            const isOver = dragOverColumn === column.id;

            return (
              <div
                key={column.id}
                className={`kanban-column transition-all duration-200 ${isOver ? 'border-primary-500/50 bg-primary-500/5' : ''}`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <column.icon className="w-4.5 h-4.5" style={{ color: column.color }} />
                    <h3 className="font-semibold text-surface-200 text-sm">{column.title}</h3>
                    <span className="w-6 h-6 rounded-full bg-surface-700/60 text-surface-400 text-xs font-semibold flex items-center justify-center">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenCreate(column.id)}
                    className="p-1 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-700/50 transition-colors"
                    id={`add-task-${column.id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Task Cards */}
                <div className="space-y-3 min-h-[200px]">
                  <AnimatePresence mode="popLayout">
                    {columnTasks.map((task) => {
                      const assignee = users.find(u => u.id === task.assignee);
                      const project = projects.find(p => p.id === task.projectId);

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          className={`task-card border-l-[3px] ${priorityColors[task.priority]} relative group`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="w-3.5 h-3.5 text-surface-600 cursor-grab" />
                            </div>
                            <div className="relative ml-auto">
                              <button
                                onClick={(e) => { e.stopPropagation(); setTaskMenu(taskMenu === task.id ? null : task.id); }}
                                className="p-1 rounded text-surface-500 hover:text-surface-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                              {taskMenu === task.id && (
                                <div className="absolute right-0 top-6 w-32 glass-card shadow-glass p-1 z-20">
                                  <button
                                    onClick={() => { deleteTask(task.id); setTaskMenu(null); }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 w-full"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {project && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="text-xs">{project.icon}</span>
                              <span className="text-[11px] text-surface-500 font-medium">{project.name}</span>
                            </div>
                          )}

                          <h4 className={`text-sm font-medium mb-2 ${task.status === 'done' ? 'text-surface-500 line-through' : 'text-surface-200'}`}>
                            {task.title}
                          </h4>

                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {task.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-700/50 text-surface-400">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Subtask Progress */}
                          {task.subtasks.length > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-[10px] text-surface-500 mb-1">
                                <span>Subtasks</span>
                                <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                              </div>
                              <div className="h-1 bg-surface-700/60 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500/60 rounded-full transition-all duration-300"
                                  style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-surface-700/30">
                            {assignee ? (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                                  style={{ backgroundColor: assignee.color + '25', color: assignee.color }}
                                >
                                  {assignee.initials}
                                </div>
                                <span className="text-[11px] text-surface-500">{assignee.name.split(' ')[0]}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-surface-600">Unassigned</span>
                            )}

                            {task.deadline && (
                              <span className="text-[11px] text-surface-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {columnTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-surface-700/30 rounded-xl">
                      <p className="text-surface-600 text-sm">Drop tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} title="Quick Add Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Title</label>
            <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="Task title" className="input-field" id="kanban-task-title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Project</label>
            <select value={taskForm.projectId} onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
              className="input-field" id="kanban-task-project">
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Priority</label>
              <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="input-field" id="kanban-task-priority">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Assignee</label>
              <select value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                className="input-field" id="kanban-task-assignee">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Deadline</label>
            <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
              className="input-field" id="kanban-task-deadline" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-surface-700/50">
            <button onClick={() => setShowCreateTask(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleCreateTask} className="btn-primary text-sm" id="kanban-task-submit">Add Task</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
