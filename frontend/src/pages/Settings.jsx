import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Topbar from '../components/layout/Topbar';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Save, Check } from 'lucide-react';

export default function Settings() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    role: currentUser?.role || '',
  });
  const [notifSettings, setNotifSettings] = useState({
    taskAssigned: true,
    taskCompleted: true,
    deadlineWarning: true,
    comments: true,
    projectUpdates: false,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <Topbar title="Settings" subtitle="Manage your account preferences" />

      <div className="px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-56 flex-shrink-0">
            <div className="glass-card p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-primary-500/15 text-primary-400'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/30'
                    }`}
                >
                  <tab.icon className="w-4.5 h-4.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 glass-card p-8"
          >
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-display font-semibold text-surface-100">Profile Settings</h2>
                <div className="flex items-center gap-6 pb-6 border-b border-surface-700/50">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
                    style={{ backgroundColor: currentUser?.color + '25', color: currentUser?.color }}
                  >
                    {currentUser?.initials}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-surface-200">{currentUser?.name}</p>
                    <p className="text-sm text-surface-400">{currentUser?.role}</p>
                    <button className="text-sm text-primary-400 hover:text-primary-300 mt-1 font-medium">
                      Change avatar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Full Name</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="input-field" id="settings-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
                    <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="input-field" id="settings-email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Role</label>
                    <input type="text" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      className="input-field" id="settings-role" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Timezone</label>
                    <select className="input-field" id="settings-timezone">
                      <option>Asia/Kolkata (UTC+5:30)</option>
                      <option>America/New_York (UTC-5)</option>
                      <option>Europe/London (UTC+0)</option>
                      <option>Asia/Tokyo (UTC+9)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-display font-semibold text-surface-100">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'taskAssigned', label: 'Task Assigned', desc: 'When a task is assigned to you' },
                    { key: 'taskCompleted', label: 'Task Completed', desc: 'When a teammate completes a task' },
                    { key: 'deadlineWarning', label: 'Deadline Warning', desc: 'Before a task deadline approaches' },
                    { key: 'comments', label: 'Comments', desc: 'When someone comments on your task' },
                    { key: 'projectUpdates', label: 'Project Updates', desc: 'General project activity notifications' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-surface-800/30 border border-surface-700/20">
                      <div>
                        <p className="text-sm font-medium text-surface-200">{item.label}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifSettings({ ...notifSettings, [item.key]: !notifSettings[item.key] })}
                        className={`w-11 h-6 rounded-full transition-all duration-300 relative
                          ${notifSettings[item.key] ? 'bg-primary-500' : 'bg-surface-600'}`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300
                            ${notifSettings[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-display font-semibold text-surface-100">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Current Password</label>
                    <input type="password" placeholder="••••••••" className="input-field max-w-md" id="current-password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">New Password</label>
                    <input type="password" placeholder="••••••••" className="input-field max-w-md" id="new-password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-2">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="input-field max-w-md" id="confirm-new-password" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/20">
                  <p className="text-sm font-medium text-surface-200 mb-1">Two-Factor Authentication</p>
                  <p className="text-xs text-surface-500 mb-3">Add an extra layer of security to your account</p>
                  <button className="btn-secondary text-sm">Enable 2FA</button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-display font-semibold text-surface-100">Appearance</h2>
                <div>
                  <p className="text-sm font-medium text-surface-300 mb-3">Theme</p>
                  <div className="flex gap-4">
                    {[
                      { label: 'Dark', active: true, bg: 'bg-surface-900', border: 'border-primary-500/50' },
                      { label: 'Light', active: false, bg: 'bg-white', border: 'border-surface-600/30' },
                      { label: 'System', active: false, bg: 'bg-gradient-to-br from-surface-900 to-white', border: 'border-surface-600/30' },
                    ].map((theme) => (
                      <button
                        key={theme.label}
                        className={`w-28 p-3 rounded-xl border-2 transition-all ${theme.active ? theme.border : theme.border} hover:border-primary-500/30`}
                      >
                        <div className={`w-full h-16 rounded-lg ${theme.bg} mb-2`} />
                        <p className={`text-xs font-medium ${theme.active ? 'text-primary-400' : 'text-surface-400'}`}>{theme.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-300 mb-3">Accent Color</p>
                  <div className="flex gap-3">
                    {['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6', '#ec4899'].map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-xl transition-all hover:scale-110 ${color === '#6366f1' ? 'ring-2 ring-offset-2 ring-offset-surface-800' : ''}`}
                        style={{ backgroundColor: color, ringColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end mt-8 pt-5 border-t border-surface-700/50">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 text-sm px-6 py-2.5 rounded-xl font-semibold transition-all duration-300
                  ${saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'btn-primary'}`}
                id="settings-save"
              >
                {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
