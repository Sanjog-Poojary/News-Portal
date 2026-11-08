import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import {
  fetchAdminUsers,
  updateUserRole,
  fetchModerationQueue,
  resolveModerationItem,
  fetchAuditLogs,
  broadcastBreakingNews
} from '../services/api';
import {
  ShieldAlert,
  Users,
  Flag,
  FileCheck2,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  Check,
  UserCheck,
  Activity
} from 'lucide-react';

export default function AdminDashboard({ onOpenBroadcast }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'rbac' | 'moderation' | 'audit' | 'broadcast'
  
  // Data states
  const [users, setUsers] = useState([]);
  const [moderationItems, setModerationItems] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Broadcast state
  const [headline, setHeadline] = useState('');
  const [category, setCategory] = useState('Tech');
  const [urgency, setUrgency] = useState('high');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [uList, mList, aLogs] = await Promise.all([
        fetchAdminUsers(),
        fetchModerationQueue(),
        fetchAuditLogs()
      ]);
      setUsers(uList || []);
      setModerationItems(mList || []);
      setAuditLogs(aLogs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setActionSuccess('');
    setActionError('');
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: updated.role } : u));
      setActionSuccess(`Updated ${updated.name}'s role to ${updated.role.toUpperCase()}`);
    } catch (err) {
      setActionError(err.message || 'Failed to update role');
    }
  };

  const handleResolveModeration = async (type, id, action) => {
    setActionSuccess('');
    setActionError('');
    try {
      await resolveModerationItem(type, id, action);
      setModerationItems(prev => prev.filter(item => item.id !== id));
      setActionSuccess(`Item ${action === 'approve' ? 'approved (flags cleared)' : 'removed from database'}.`);
    } catch (err) {
      setActionError(err.message || 'Failed to resolve moderation item');
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!headline.trim()) return;
    setActionSuccess('');
    setActionError('');
    try {
      await broadcastBreakingNews({ headline, category, urgency });
      setActionSuccess('Emergency bulletin dispatched over Socket.io to all active sessions!');
      setHeadline('');
    } catch (err) {
      setActionError(err.message || 'Failed to broadcast');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-10 shadow-card-soft mb-8 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-700 uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Platform Governance & Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
            Admin Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global access enforcement, real-time dispatch, content moderation, and AI fact-check audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-mono font-bold">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>RBAC ENFORCEMENT ACTIVE</span>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Two-Column Admin Layout (DESIGN View 6) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Sidebar Navigation */}
        <aside className="space-y-2">
          <div className="bg-white rounded-2xl border border-surface-border p-3 shadow-card-soft space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                activeTab === 'overview'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Overview Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('rbac')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === 'rbac'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>User RBAC</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                activeTab === 'rbac' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('moderation')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === 'moderation'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flag className="w-4 h-4" />
                <span>Moderation Queue</span>
              </div>
              {moderationItems.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">
                  {moderationItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === 'audit'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4" />
                <span>AI Override Logs</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                activeTab === 'audit' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {auditLogs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('broadcast')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                activeTab === 'broadcast'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Emergency Dispatcher</span>
            </button>
          </div>
        </aside>

        {/* Right Content Panels */}
        <main className="md:col-span-3 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-card-soft">
                  <span className="text-xs font-mono text-slate-500 font-semibold uppercase">Registered Users</span>
                  <p className="text-3xl font-extrabold text-textPrimary mt-2">{users.length}</p>
                  <p className="text-xs text-teal-700 font-mono mt-1 font-semibold">Reader, Author & Admin</p>
                </div>

                <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-card-soft">
                  <span className="text-xs font-mono text-slate-500 font-semibold uppercase">Flagged For Review</span>
                  <p className="text-3xl font-extrabold text-textPrimary mt-2">{moderationItems.length}</p>
                  <p className="text-xs text-amber-600 font-mono mt-1 font-semibold">Auto-hidden on 3 flags</p>
                </div>

                <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-card-soft">
                  <span className="text-xs font-mono text-slate-500 font-semibold uppercase">HITL AI Overrides</span>
                  <p className="text-3xl font-extrabold text-textPrimary mt-2">{auditLogs.length}</p>
                  <p className="text-xs text-teal-700 font-mono mt-1 font-semibold">100% Rationale Audited</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card-soft">
                <h3 className="text-base font-bold text-textPrimary mb-3">Guardrail Compliance Monitor</h3>
                <div className="space-y-2 text-xs font-mono text-slate-600">
                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 flex items-center justify-between">
                    <span>• Zero-Purple Palette Rule</span>
                    <span className="font-bold text-teal-800">ENFORCED</span>
                  </div>
                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 flex items-center justify-between">
                    <span>• DOMPurify Rich-Text Sanitization</span>
                    <span className="font-bold text-teal-800">ACTIVE</span>
                  </div>
                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 flex items-center justify-between">
                    <span>• Mandatory Override Rationale (&ge; 15 chars)</span>
                    <span className="font-bold text-teal-800">AUDITED</span>
                  </div>
                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 flex items-center justify-between">
                    <span>• 3-Second Comment Throttle & Auto-Moderation</span>
                    <span className="font-bold text-teal-800">THROTTLED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER RBAC */}
          {activeTab === 'rbac' && (
            <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card-soft space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                <h2 className="text-lg font-bold text-textPrimary">Role-Based Access Control (RBAC)</h2>
                <span className="text-xs font-mono text-slate-400">Total Users: {users.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Current Role</th>
                      <th className="py-3 px-4 text-right">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <Avatar
                            name={u.name}
                            src={u.avatar}
                            className="w-8 h-8 rounded-full border border-slate-200 text-[10px]"
                          />
                          <span className="font-bold text-textPrimary">{u.name}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                              u.role === 'admin'
                                ? 'bg-teal-100 text-teal-900 border border-teal-300'
                                : u.role === 'author'
                                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 focus:outline-none focus:border-teal-500"
                          >
                            <option value="reader">Reader</option>
                            <option value="author">Author</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MODERATION QUEUE */}
          {activeTab === 'moderation' && (
            <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card-soft space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                <div>
                  <h2 className="text-lg font-bold text-textPrimary">Reported Content Moderation Queue</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    User-flagged comments and discussion threads (Threshold &ge; 3 auto-hides)
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  {moderationItems.length} items
                </span>
              </div>

              {moderationItems.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-mono text-xs">
                  <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                  <p>Moderation queue is clean. No flagged content pending review.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {moderationItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-[280px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {item.type}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            {item.flagCount} flags
                          </span>
                          <span className="text-xs text-slate-500 font-mono">By {item.author || 'User'}</span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          "{item.content}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolveModeration(item.type, item.id, 'approve')}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 text-teal-600" />
                          <span>Approve & Clear</span>
                        </button>
                        <button
                          onClick={() => handleResolveModeration(item.type, item.id, 'remove')}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI OVERRIDE AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card-soft space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                <div>
                  <h2 className="text-lg font-bold text-textPrimary">AI Fact-Check Editorial Override Trail</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    GAURDRAIL.md Mandate: All manual adjustments require verified &ge; 15-character rationale
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                  {auditLogs.length} Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Article & Editor</th>
                      <th className="py-3 px-4">Claim Delta</th>
                      <th className="py-3 px-4">Editorial Rationale</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-bold text-textPrimary truncate">{log.articleTitle}</p>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Editor: {log.editorName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-amber-700 font-mono font-bold line-through mr-1.5">
                            {log.originalStatus}
                          </span>
                          <span className="text-teal-700 font-mono font-bold">
                            ➔ {log.overriddenStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-md">
                          <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-2 rounded-lg border border-slate-200">
                            "{log.reason}"
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: EMERGENCY DISPATCHER */}
          {activeTab === 'broadcast' && (
            <div className="bg-white rounded-3xl border border-surface-border p-6 sm:p-8 shadow-card-soft space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-textPrimary">Instant Socket.io Breaking News Dispatcher</h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Broadcasts immediately to all connected browser ribbons (Rate limit: 5/min)
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">
                    Breaking News Headline
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Enter urgent high-priority news bulletin..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-textPrimary placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Tech">Tech & AI</option>
                      <option value="World">World Affairs</option>
                      <option value="Politics">Global Policy</option>
                      <option value="Sports">Sports</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-700 mb-1.5">Urgency</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-500"
                    >
                      <option value="high">High Urgency</option>
                      <option value="critical">Critical / Alert</option>
                      <option value="medium">Standard Bulletin</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Real-Time Alert</span>
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
