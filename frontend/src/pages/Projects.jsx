import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import Topbar from '../components/layout/Topbar';
import Modal from '../components/ui/Modal';
import { motion } from 'framer-motion';
import { users } from '../data/mockData';
import {
  Plus, Search, Filter, ArrowUpRight, Calendar,
  MoreHorizontal, Trash2, Edit3,
} from 'lucide-react';

const projectIcons = ['🚀', '📱', '⚡', '📊', '📚', '🎯', '💡', '🔧', '🌐', '🎨'];
const categories = ['Development', 'Design', 'Infrastructure', 'Analytics', 'Documentation', 'Marketing'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Projects() {
  const { projects, addProject, deleteProject } = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);

  const [form, setForm] = useState({
    name: '', description: '', icon: '🚀', color: '#6366f1',
    category: 'Development', deadline: '', members: [],
  });

  const filtered = projects.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreate = () => {
    if (!form.name.trim()) return;
    addProject(form);
    setForm({ name: '', description: '', icon: '🚀', color: '#6366f1', category: 'Development', deadline: '', members: [] });
    setShowCreate(false);
  };

  return (
    <div>
      <Topbar title="Projects" subtitle={`${projects.length} projects total`} />

      <div className="px-8 py-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-56 rounded-xl bg-surface-800/60 border border-surface-700/50 text-sm
                  text-surface-200 placeholder-surface-500 focus:outline-none focus:border-primary-500/50 transition-all"
                id="project-search"
              />
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-800/60 border border-surface-700/50">
              {['all', 'active', 'on-hold', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200
                    ${filterStatus === status
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-surface-400 hover:text-surface-200'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2 text-sm"
            id="create-project-btn"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>

        {/* Projects Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {filtered.map((project) => {
            const memberData = project.members.map(id => users.find(u => u.id === id)).filter(Boolean);
            const statusColors = {
              active: 'badge-emerald',
              'on-hold': 'badge-amber',
              completed: 'badge-primary',
            };
            return (
              <motion.div
                key={project.id}
                variants={item}
                className="glass-card overflow-hidden group hover:border-primary-500/30 transition-all duration-300"
              >
                {/* Color accent bar */}
                <div className="h-1" style={{ backgroundColor: project.color }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{project.icon}</span>
                      <div>
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-semibold text-surface-200 hover:text-surface-100 flex items-center gap-1 group/link"
                        >
                          {project.name}
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </Link>
                        <span className={statusColors[project.status] || 'badge-primary'}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                        className="p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-700/50 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {menuOpen === project.id && (
                        <div className="absolute right-0 top-8 w-36 glass-card shadow-glass p-1.5 z-10">
                          <Link
                            to={`/projects/${project.id}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-300 hover:bg-surface-700/50 hover:text-surface-100"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </Link>
                          <button
                            onClick={() => { deleteProject(project.id); setMenuOpen(null); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 w-full"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-surface-400 mb-4 line-clamp-2">{project.description}</p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-surface-400">Progress</span>
                      <span className="font-semibold text-surface-300">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-700/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-700/30">
                    <div className="flex -space-x-2">
                      {memberData.slice(0, 4).map((member) => (
                        <div
                          key={member.id}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-surface-800"
                          style={{ backgroundColor: member.color + '30', color: member.color }}
                          title={member.name}
                        >
                          {member.initials}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-surface-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400 text-lg">No projects found</p>
            <p className="text-surface-500 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Project" size="lg">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Project Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="My Awesome Project"
              className="input-field"
              id="project-name-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the project..."
              rows={3}
              className="input-field resize-none"
              id="project-description-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {projectIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all
                      ${form.icon === icon ? 'bg-primary-500/20 border-2 border-primary-500/50 scale-110' : 'bg-surface-700/40 border border-surface-700/30 hover:bg-surface-700/60'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
                id="project-category-select"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <label className="block text-sm font-medium text-surface-300 mb-2 mt-4">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="input-field"
                id="project-deadline-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Color</label>
            <div className="flex gap-2">
              {['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'].map((color) => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === color ? 'ring-2 ring-offset-2 ring-offset-surface-800 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color, ringColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-700/50">
            <button onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleCreate} className="btn-primary text-sm" id="project-create-submit">
              Create Project
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
