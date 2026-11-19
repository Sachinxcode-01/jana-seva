import React, { useState, useEffect } from 'react';
import {
  Building2, Users, Eye, Plus,
  Trash2, ShieldCheck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Scheme, SchemeCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AdminPageProps {
  schemes: Scheme[];
  onRefreshSchemes: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ schemes, onRefreshSchemes }) => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'schemes' | 'users' | 'logs'>('overview');

  // Add Scheme Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newCat, setNewCat] = useState<SchemeCategory>('Women Empowerment');
  const [newClass, setNewClass] = useState<'Central' | 'State'>('Central');
  const [newState, setNewState] = useState('All India');
  const [newDesc, setNewDesc] = useState('');
  const [newBenefits, setNewBenefits] = useState('');
  const [newDocs, setNewDocs] = useState('');
  const [newWebsite, setNewWebsite] = useState('');

  const loadMetrics = async () => {
    try {
      const data = await api.getAdminMetrics();
      if (data.success) {
        setMetrics(data);
      }
      const usersData = await api.getAdminUsers();
      if (usersData.success) {
        setAdminUsers(usersData.users);
      }
    } catch (e) {
      console.error('Metrics loading error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDept.trim() || !newDesc.trim()) return;

    try {
      const res = await api.createScheme({
          name: newName,
          department: newDept,
          category: newCat,
          classification: newClass,
          state: newState,
          description: newDesc,
          benefits: newBenefits.split('\n').filter(b => b.trim()),
          requiredDocuments: newDocs.split('\n').filter(d => d.trim()),
          officialWebsite: newWebsite || 'https://india.gov.in'
        });

          if (res.success) {
        setShowAddModal(false);
        setNewName('');
        setNewDept('');
        setNewDesc('');
        setNewBenefits('');
        setNewDocs('');
        onRefreshSchemes();
        loadMetrics();
      }
    } catch {
      setShowAddModal(false);
      onRefreshSchemes();
    }
  };

  const handleDeleteScheme = async (id: string) => {
    if (confirm('Are you sure you want to delete this government scheme record?')) {
      try {
        await api.deleteScheme(id);
        onRefreshSchemes();
        loadMetrics();
      } catch {
        onRefreshSchemes();
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4 text-[#f5f5f8]">
        <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-medium text-[#f5f5f8]">Administrator Access Restricted</h2>
        <p className="text-xs text-[#8a8a97] leading-relaxed">
          This portal section is strictly designated for authorized government public administrators. Please sign in with an Administrator profile to manage public scheme datasets.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 text-[#f5f5f8]">
      {/* Header */}
      <div className="bytune-card p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,_rgba(143,139,255,0.12),_transparent_70%)] pointer-events-none" />
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#f3c64f]">
            Government Administration Console
          </span>
          <h1 className="text-2xl sm:text-4xl font-medium tracking-tight mt-1 text-[#f5f5f8]">
            {t('adminDashboardTitle')}
          </h1>
          <p className="text-xs text-[#8a8a97] mt-1 font-mono">
            System Overseer: <strong className="text-[#f5f5f8]">{user?.fullName}</strong> ({user?.email})
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bytune-btn-solid flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#0a0a0c]" />
          <span>Add New Government Scheme</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bytune-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[#8a8a97] text-xs font-normal">
            <span>{t('totalUsers')}</span>
            <Users className="w-4 h-4 text-[#8f8bff]" />
          </div>
          <p className="text-2xl sm:text-3xl font-medium text-[#f5f5f8] font-mono">
            {metrics?.stats?.totalUsers || 148}
          </p>
          <p className="text-[10px] text-[#1ed760] font-mono">Active Citizen Accounts</p>
        </div>

        <div className="bytune-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[#8a8a97] text-xs font-normal">
            <span>{t('totalSchemes')}</span>
            <Building2 className="w-4 h-4 text-[#1ed760]" />
          </div>
          <p className="text-2xl sm:text-3xl font-medium text-[#f5f5f8] font-mono">
            {schemes.length}
          </p>
          <p className="text-[10px] text-[#1ed760] font-mono">Central & State Combined</p>
        </div>

        <div className="bytune-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[#8a8a97] text-xs font-normal">
            <span>{t('verifiedSources')}</span>
            <ShieldCheck className="w-4 h-4 text-[#f3c64f]" />
          </div>
          <p className="text-2xl sm:text-3xl font-medium text-[#f5f5f8] font-mono">
            {schemes.filter(s => s.isVerified).length}
          </p>
          <p className="text-[10px] text-[#1ed760] font-mono">100% Authenticated Portals</p>
        </div>

        <div className="bytune-card p-5 space-y-1">
          <div className="flex items-center justify-between text-[#8a8a97] text-xs font-normal">
            <span>{t('cumulativeViews')}</span>
            <Eye className="w-4 h-4 text-[#6fd8ff]" />
          </div>
          <p className="text-2xl sm:text-3xl font-medium text-[#f5f5f8] font-mono">
            {schemes.reduce((acc, s) => acc + (s.viewCount || 0), 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-[#6fd8ff] font-mono">Citizen Engagement Count</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] space-x-2 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${activeTab === 'overview' ? 'border-[#8f8bff] text-[#f5f5f8] font-semibold' : 'border-transparent text-[#8a8a97] hover:text-[#f5f5f8]'
            }`}
        >
          Analytics & Charts
        </button>
        <button
          onClick={() => setActiveTab('schemes')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${activeTab === 'schemes' ? 'border-[#8f8bff] text-[#f5f5f8] font-semibold' : 'border-transparent text-[#8a8a97] hover:text-[#f5f5f8]'
            }`}
        >
          Manage Schemes ({schemes.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${activeTab === 'users' ? 'border-[#8f8bff] text-[#f5f5f8] font-semibold' : 'border-transparent text-[#8a8a97] hover:text-[#f5f5f8]'
            }`}
        >
          Citizens & Accounts ({adminUsers.length || metrics?.stats?.totalUsers || 0})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${activeTab === 'logs' ? 'border-[#8f8bff] text-[#f5f5f8] font-semibold' : 'border-transparent text-[#8a8a97] hover:text-[#f5f5f8]'
            }`}
        >
          Audit Activity Logs
        </button>
      </div>

      {/* Tab: Analytics & Charts */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Category Distribution */}
          <div className="bytune-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-[#f5f5f8]">Scheme Category Distribution</h3>
              <span className="text-[10px] font-mono text-[#8a8a97]">Recharts Visualization</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.categoryChartData || [
                  { category: 'Women', count: 2 },
                  { category: 'Students', count: 2 },
                  { category: 'Farmers', count: 2 },
                  { category: 'Health', count: 1 },
                  { category: 'Finance', count: 2 }
                ]}>
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#8a8a97' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#8a8a97' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#101016', borderColor: 'rgba(255,255,255,0.1)', color: '#f5f5f8', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#8f8bff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Most Viewed Schemes */}
          <div className="bytune-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-[#f5f5f8]">Most Viewed Schemes</h3>
              <span className="text-[10px] font-mono text-[#8a8a97]">Citizen Traffic Metric</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.mostViewed || [
                  { name: 'PM-KISAN', views: 3120 },
                  { name: 'Ayushman', views: 2840 },
                  { name: 'SSP Scholar', views: 2310 },
                  { name: 'Yuva Nidhi', views: 2150 },
                  { name: 'PMFBY', views: 1980 }
                ]} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#8a8a97' }} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: '#8a8a97' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#101016', borderColor: 'rgba(255,255,255,0.1)', color: '#f5f5f8', borderRadius: '12px' }} />
                  <Bar dataKey="views" fill="#1ed760" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Manage Schemes Table */}
      {activeTab === 'schemes' && (
        <div className="bytune-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left divide-y divide-white/[0.08]">
              <thead className="bg-[#0a0a0e]/80 text-[#8a8a97]">
                <tr>
                  <th className="p-4">Scheme Title</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Views</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-[#b6b6c2]">
                {schemes.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-medium text-[#f5f5f8]">{s.name}</td>
                    <td className="p-4 text-[#8a8a97]">{s.department}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${s.classification === 'State' ? 'bg-[#f3c64f]/15 text-[#f3c64f] border border-[#f3c64f]/30' : 'bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30'
                        }`}>
                        {s.classification}
                      </span>
                    </td>
                    <td className="p-4">{s.category}</td>
                    <td className="p-4 font-mono text-[#f5f5f8]">{s.viewCount}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteScheme(s.id)}
                        className="bytune-pill p-1.5 text-[#8a8a97] hover:text-rose-400 cursor-pointer"
                        title="Delete Scheme"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users & Citizens */}
      {activeTab === 'users' && (
        <div className="bytune-card overflow-hidden">
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm text-[#f5f5f8]">Registered Citizens & Accounts</h3>
              <p className="text-[11px] text-[#8a8a97] mt-0.5">Directory of authenticated public accounts and administrators.</p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] text-[#6fd8ff] border border-white/10">
              {adminUsers.length} Registered
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left divide-y divide-white/[0.08]">
              <thead className="bg-[#0a0a0e]/80 text-[#8a8a97]">
                <tr>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">State</th>
                  <th className="p-4">Occupation</th>
                  <th className="p-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-[#b6b6c2]">
                {adminUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-medium text-[#f5f5f8]">{u.fullName}</td>
                    <td className="p-4 font-mono text-[#8a8a97]">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${u.role === 'admin'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30'
                        }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">{u.state || 'Karnataka'}</td>
                    <td className="p-4">{u.occupation || 'General Citizen'}</td>
                    <td className="p-4 font-mono text-[11px] text-[#8a8a97]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bytune-card p-6 space-y-4">
          <h3 className="font-medium text-sm text-[#f5f5f8]">Administrative Audit Trail</h3>
          <div className="divide-y divide-white/[0.06] text-xs">
            {(metrics?.recentLogs || []).map((l: any) => (
              <div key={l.id} className="py-3 flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[#8f8bff]">{l.action}</span>
                    <span className="text-white/20">•</span>
                    <span className="font-medium text-[#f5f5f8]">{l.target}</span>
                  </div>
                  <p className="text-[#8a8a97] mt-0.5">{l.details}</p>
                </div>
                <span className="text-[10px] font-mono text-[#8a8a97] shrink-0">
                  {new Date(l.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#050507]/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bytune-card max-w-2xl w-full shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#0a0a0e]/90 text-[#f5f5f8] p-5 flex justify-between items-center border-b border-white/[0.08]">
              <h3 className="font-medium text-sm">Add New Verified Government Scheme</h3>
              <button onClick={() => setShowAddModal(false)} className="bytune-pill p-1 text-[#8a8a97] hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateScheme} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">Scheme Title</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Pradhan Mantri Awas Yojana"
                    className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">Government Department</label>
                  <input
                    type="text"
                    required
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    placeholder="e.g. Ministry of Housing & Urban Affairs"
                    className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as any)}
                    className="w-full py-2.5 px-3 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                  >
                    <option value="Women Empowerment">Women Empowerment</option>
                    <option value="Student Scholarships">Student Scholarships</option>
                    <option value="Farmer Welfare">Farmer Welfare</option>
                    <option value="Employment Opportunities">Employment Opportunities</option>
                    <option value="Financial Assistance">Financial Assistance</option>
                    <option value="Health and Social Welfare">Health and Social Welfare</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">Classification</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value as any)}
                    className="w-full py-2.5 px-3 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                  >
                    <option value="Central">Central Scheme</option>
                    <option value="State">Karnataka State Scheme</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#b6b6c2] mb-1">State Scope</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">Scheme Overview & Description</label>
                <textarea
                  rows={2}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detail the objectives and livelihood assistance provided..."
                  className="w-full py-2 px-3 rounded-2xl border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">Key Benefits (One per line)</label>
                <textarea
                  rows={2}
                  value={newBenefits}
                  onChange={(e) => setNewBenefits(e.target.value)}
                  placeholder="₹2,000 monthly DBT&#10;Zero registration charges"
                  className="w-full py-2 px-3 rounded-2xl border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">Required Documents (One per line)</label>
                <textarea
                  rows={2}
                  value={newDocs}
                  onChange={(e) => setNewDocs(e.target.value)}
                  placeholder="Aadhaar Card&#10;Ration Card&#10;Bank Passbook"
                  className="w-full py-2 px-3 rounded-2xl border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#b6b6c2] mb-1">Official Application Website URL</label>
                <input
                  type="url"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bytune-btn-solid w-full py-3 rounded-full font-semibold cursor-pointer text-xs"
                >
                  Publish Verified Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
