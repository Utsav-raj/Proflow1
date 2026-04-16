import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import Topbar from '../components/layout/Topbar';
import Modal from '../components/ui/Modal';
import { motion } from 'framer-motion';
import { users } from '../data/mockData';
import {
  Plus, CheckCircle2, Circle, Clock, ArrowLeft,
  Calendar, Tag, User, ChevronDown, ChevronUp, Trash2,
} from 'lucide-react';

const priorityConfig = {
  high: { label: 'High', class: 'badge-rose' },
  medium: { label: 'Medium', class: 'badge-amber' },
  low: { label: 'Low', class: 'badge-emerald' },
};

const statusConfig = {
  todo: { label: 'To Do', icon: Circle, color: 'text-surface-400' },
  'in-progress': { label: 'In Progress', icon: Clock, color: 'text-amber-400' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-400' },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { projects, tasks, addTask, updateTask, deleteTask, getProjectTasks } = useProjects();
  const project = projects.find(p => p.id === id);
  const projectTasks = getProjectTasks(id);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium',
    status: 'todo', assignee: '', deadline: '', tags: '',
  });

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-surface-400 text-lg">Project not found</p>
          <Link to="/projects" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
            ← Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const filteredTasks = projectTasks.filter(t => filterStatus === 'all' || t.status === filterStatus);

  const handleCreateTask = () => {
    if (!taskForm.title.trim()) return;
    addTask({
      ...taskForm,
      projectId: id,
      tags: taskForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', assignee: '', deadline: '', tags: '' });
    setShowCreateTask(false);
  };

  const memberData = project.members.map(mid => users.find(u => u.id === mid)).filter(Boolean);

  return (
    <div>
      <Topbar title={`${project.icon} ${project.name}`} subtitle={project.description} />

      <div className="px-8 py-6 space-y-6">
        {/* Back link + stats */}
        <div className="flex items-center justify-between">
          <Link to="/projects" className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
          <button
            onClick={() => setShowCreateTask(true)}
            className="btn-primary flex items-center gap-2 text-sm"
            id="add-task-btn"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-surface-400 mb-1">Progress</p>
            <p className="text-2xl font-display font-bold text-surface-100">{project.progress}%</p>
            <div className="h-1.5 bg-surface-700/60 rounded-full overflow-hidden mt-2">
              <div className="h-full rounded-full" style={{ backgroundColor: project.color, width: `${project.progress}%` }} />
            </div>
          </div>
          <div className="stat-card">
            <p className="text-sm text-surface-400 mb-1">Tasks</p>
            <p className="text-2xl font-display font-bold text-surface-100">
              {project.tasksCompleted}<span className="text-surface-500 text-lg">/{project.tasksTotal}</span>
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-surface-400 mb-1">Deadline</p>
            <p className="text-lg font-display font-bold text-surface-100">
              {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-surface-400 mb-2">Team</p>
            <div className="flex -space-x-2">
              {memberData.map((member) => (
                <div
                  key={member.id}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 border-surface-800"
                  style={{ backgroundColor: member.color + '30', color: member.color }}
                  title={member.name}
                >
                  {member.initials}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Filter */}
        <div className="flex items-center gap-2">
          {['all', 'todo', 'in-progress', 'done'].map((status) => {
            const count = status === 'all' ? projectTasks.length : projectTasks.filter(t => t.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200
                  ${filterStatus === status ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-surface-400 hover:text-surface-200 bg-surface-800/40 border border-surface-700/30'}`}
              >
                {status === 'all' ? 'All' : statusConfig[status]?.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Task List */}
        <motion.div layout className="space-y-3">
          {filteredTasks.map((task) => {
            const assignee = users.find(u => u.id === task.assignee);
            const priority = priorityConfig[task.priority];
            const status = statusConfig[task.status];
            const StatusIcon = status.icon;
            const isExpanded = expandedTask === task.id;

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card-light overflow-hidden"
              >
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-700/20 transition-colors"
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo';
                      updateTask(task.id, { status: next });
                    }}
                    className={`${status.color} hover:scale-110 transition-transform`}
                  >
                    <StatusIcon className="w-5 h-5" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.status === 'done' ? 'text-surface-500 line-through' : 'text-surface-200'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={priority.class}>{priority.label}</span>
                      {task.tags.map(tag => (
                        <span key={tag} className="badge-cyan text-[10px]">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {assignee && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: assignee.color + '30', color: assignee.color }}
                      title={assignee.name}
                    >
                      {assignee.initials}
                    </div>
                  )}

                  {task.deadline && (
                    <span className="text-xs text-surface-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}

                  {isExpanded ? <ChevronUp className="w-4 h-4 text-surface-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 border-t border-surface-700/30"
                  >
                    <p className="text-sm text-surface-400 mt-3 mb-4">{task.description}</p>

                    {task.subtasks.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Subtasks</p>
                        <div className="space-y-2">
                          {task.subtasks.map((sub) => (
                            <div key={sub.id} className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center
                                ${sub.completed ? 'bg-emerald-500/20 border-emerald-500/50' : 'border-surface-600'}`}
                              >
                                {sub.completed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                              </div>
                              <span className={`text-sm ${sub.completed ? 'text-surface-500 line-through' : 'text-surface-300'}`}>
                                {sub.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <select
                        value={task.status}
                        onChange={(e) => updateTask(task.id, { status: e.target.value })}
                        className="input-field text-xs py-1.5 px-3 w-auto"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                        className="input-field text-xs py-1.5 px-3 w-auto"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="ml-auto p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-surface-600 mx-auto mb-3" />
            <p className="text-surface-400">No tasks in this view</p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} title="Add New Task" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Task Title</label>
            <input
              type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="What needs to be done?" className="input-field" id="task-title-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Description</label>
            <textarea
              value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Add more details..." rows={3} className="input-field resize-none" id="task-description-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Priority</label>
              <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="input-field" id="task-priority-select">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Status</label>
              <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="input-field" id="task-status-select">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Assignee</label>
              <select value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                className="input-field" id="task-assignee-select">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Deadline</label>
              <input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                className="input-field" id="task-deadline-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Tags (comma-separated)</label>
            <input type="text" value={taskForm.tags} onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
              placeholder="frontend, feature, bug" className="input-field" id="task-tags-input" />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-surface-700/50">
            <button onClick={() => setShowCreateTask(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleCreateTask} className="btn-primary text-sm" id="task-create-submit">Create Task</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
