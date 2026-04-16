import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import Topbar from '../components/layout/Topbar';
import { motion } from 'framer-motion';
import { users, activityLog } from '../data/mockData';
import {
  FolderKanban, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, ArrowUpRight, Users, BarChart3,
} from 'lucide-react';

const statConfig = [
  { key: 'totalProjects', label: 'Total Projects', icon: FolderKanban, color: '#6366f1', bg: 'bg-primary-500/10' },
  { key: 'completedTasks', label: 'Completed Tasks', icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-500/10' },
  { key: 'inProgress', label: 'In Progress', icon: Clock, color: '#f59e0b', bg: 'bg-amber-500/10' },
  { key: 'overdue', label: 'Upcoming Deadlines', icon: AlertTriangle, color: '#f43f5e', bg: 'bg-rose-500/10' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

export default function Dashboard() {
  const { projects, tasks } = useProjects();
  const { currentUser } = useAuth();

  const stats = useMemo(() => ({
    totalProjects: projects.length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: projects.filter(p => new Date(p.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && p.status === 'active').length,
  }), [projects, tasks]);

  const activeProjects = projects.filter(p => p.status === 'active');

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      <Topbar
        title={`${getGreeting()}, ${currentUser?.name?.split(' ')[0] || 'User'} 👋`}
        subtitle="Here's what's happening with your projects today"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-8 py-6 space-y-8"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statConfig.map((stat) => (
            <motion.div
              key={stat.key}
              variants={item}
              className="stat-card group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className="w-5.5 h-5.5" style={{ color: stat.color }} />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-3xl font-display font-bold text-surface-100">{stats[stat.key]}</p>
              <p className="text-sm text-surface-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Projects */}
          <motion.div variants={item} className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-semibold text-surface-100">Active Projects</h2>
              <Link to="/projects" className="text-sm text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {activeProjects.slice(0, 4).map((project) => {
                const memberData = project.members.map(id => users.find(u => u.id === id)).filter(Boolean);
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 border border-surface-700/30 hover:border-surface-600/50 transition-all duration-200 group"
                  >
                    <div className="text-2xl">{project.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-surface-200 group-hover:text-surface-100 truncate">
                          {project.name}
                        </h3>
                        <span className="badge-primary text-[10px]">{project.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-surface-700/60 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                        </div>
                        <span className="text-xs text-surface-400 font-medium w-9 text-right">{project.progress}%</span>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {memberData.slice(0, 3).map((member) => (
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
                    <div className="text-right">
                      <p className="text-xs text-surface-500">
                        {project.tasksCompleted}/{project.tasksTotal} tasks
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={item} className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-semibold text-surface-100">Recent Activity</h2>
              <BarChart3 className="w-4.5 h-4.5 text-surface-500" />
            </div>
            <div className="space-y-1">
              {activityLog.map((activity) => {
                const user = users.find(u => u.id === activity.user);
                return (
                  <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-surface-700/30 last:border-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: user?.color + '25', color: user?.color }}
                    >
                      {user?.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-300">
                        <span className="font-medium text-surface-200">{user?.name}</span>{' '}
                        <span className="text-surface-400">{activity.action}</span>{' '}
                        <span className="font-medium text-surface-200">{activity.target}</span>
                      </p>
                      <p className="text-xs text-surface-500 mt-0.5">{activity.project} · {activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Team Overview */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-semibold text-surface-100">Team Members</h2>
            <Users className="w-4.5 h-4.5 text-surface-500" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {users.map((member) => {
              const memberTasks = tasks.filter(t => t.assignee === member.id);
              const completedTasks = memberTasks.filter(t => t.status === 'done').length;
              return (
                <div
                  key={member.id}
                  className="flex flex-col items-center p-4 rounded-xl bg-surface-800/30 border border-surface-700/20 hover:border-surface-600/40 transition-all duration-200"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mb-3"
                    style={{ backgroundColor: member.color + '25', color: member.color }}
                  >
                    {member.initials}
                  </div>
                  <p className="text-sm font-medium text-surface-200 text-center">{member.name}</p>
                  <p className="text-xs text-surface-500">{member.role}</p>
                  <p className="text-xs text-surface-400 mt-2">{completedTasks}/{memberTasks.length} tasks</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
