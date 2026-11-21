import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, Users, Eye, Plus,
  Trash2, ShieldCheck, Edit3, CheckCircle, XCircle, Search,
  Archive, ArchiveRestore, UserCheck, UserX, AlertCircle, CheckCircle2,
  ExternalLink, X, Info, Filter, Download, Upload, FileSpreadsheet, FileJson,
  FileText, Check, ChevronDown, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Scheme, SchemeCategory, User } from '../types';
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
  const [schemeSearch, setSchemeSearch] = useState('');
  const [schemeStatusFilter, setSchemeStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Export & Bulk Import state
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedSchemes, setParsedSchemes] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // User Management state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'citizen' | 'admin'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null);

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
  const [newSourceUrl, setNewSourceUrl] = useState('');

  // Edit Scheme Modal state
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editCat, setEditCat] = useState<SchemeCategory>('Women Empowerment');
  const [editClass, setEditClass] = useState<'Central' | 'State'>('Central');
  const [editState, setEditState] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editBenefits, setEditBenefits] = useState('');
  const [editDocs, setEditDocs] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editSourceUrl, setEditSourceUrl] = useState('');
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [editIsVerified, setEditIsVerified] = useState(true);
  const [editIsArchived, setEditIsArchived] = useState(false);

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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schemes, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `janaseva-schemes-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported ${schemes.length} schemes as JSON.`);
    } catch {
      showToast('Failed to export schemes as JSON.', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      const escapeCsv = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const headers = [
        'ID', 'Name', 'Department', 'Classification', 'State',
        'Category', 'Target Beneficiary', 'Description', 'Benefits',
        'Required Documents', 'Official Website', 'Deadline'
      ];

      const rows = schemes.map(s => [
        escapeCsv(s.id),
        escapeCsv(s.name),
        escapeCsv(s.department),
        escapeCsv(s.classification),
        escapeCsv(s.state),
        escapeCsv(s.category),
        escapeCsv(s.beneficiaryCategory || ''),
        escapeCsv(s.description),
        escapeCsv(Array.isArray(s.benefits) ? s.benefits.join('; ') : s.benefits),
        escapeCsv(Array.isArray(s.requiredDocuments) ? s.requiredDocuments.join('; ') : s.requiredDocuments),
        escapeCsv(s.officialWebsite),
        escapeCsv(s.deadline || '')
      ].join(','));

      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headers.join(','), ...rows].join('\r\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", csvContent);
      downloadAnchor.setAttribute("download", `janaseva-schemes-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported ${schemes.length} schemes as CSV.`);
    } catch {
      showToast('Failed to export schemes as CSV.', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setParsedSchemes([]);
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text || !text.trim()) throw new Error('Selected file is empty.');

        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text);
          const list = Array.isArray(data) ? data : (data.schemes || []);
          const valid = list.filter((s: any) => s && (s.name || s.title));
          if (valid.length === 0) throw new Error('No valid scheme records found in JSON.');
          setParsedSchemes(valid);
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
          if (lines.length < 2) throw new Error('CSV must contain a header row and at least one data row.');

          const parseLine = (line: string): string[] => {
            const values: string[] = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                  current += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());
            return values;
          };

          const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
          const rows: any[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = parseLine(lines[i]);
            if (values.length === 0 || !values.some(v => v)) continue;
            const rowObj: any = {};
            headers.forEach((h, idx) => {
              rowObj[h] = values[idx] || '';
            });

            const name = rowObj.name || rowObj.schemename || rowObj.title;
            if (!name) continue;

            const benefits = rowObj.benefits ? rowObj.benefits.split(';').map((b: string) => b.trim()).filter(Boolean) : ['Welfare Assistance'];
            const requiredDocs = rowObj.requireddocuments || rowObj.documents ? (rowObj.requireddocuments || rowObj.documents).split(';').map((d: string) => d.trim()).filter(Boolean) : ['Aadhaar Card'];

            rows.push({
              id: rowObj.id || undefined,
              name,
              department: rowObj.department || rowObj.dept || 'Government Department',
              category: rowObj.category || 'Financial Assistance',
              classification: (rowObj.classification || '').toLowerCase().includes('state') ? 'State' : 'Central',
              state: rowObj.state || 'All India',
              beneficiaryCategory: rowObj.targetbeneficiary || rowObj.beneficiary || 'General',
              description: rowObj.description || rowObj.desc || name,
              benefits,
              requiredDocuments: requiredDocs,
              officialWebsite: rowObj.officialwebsite || rowObj.website || rowObj.url || 'https://india.gov.in',
              deadline: rowObj.deadline || 'Ongoing / No fixed deadline'
            });
          }
          if (rows.length === 0) throw new Error('No valid scheme rows found in CSV.');
          setParsedSchemes(rows);
        } else {
          throw new Error('Unsupported format. Please upload a .json or .csv file.');
        }
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse file.');
        setParsedSchemes([]);
      }
    };

    reader.readAsText(file);
  };

  const handleConfirmBulkImport = async () => {
    if (parsedSchemes.length === 0) return;
    setIsImporting(true);
    try {
      const res = await api.bulkImportSchemes(parsedSchemes);
      if (res.success) {
        showToast(res.message || `Successfully imported ${parsedSchemes.length} schemes.`);
        setShowImportModal(false);
        setParsedSchemes([]);
        setImportFile(null);
        onRefreshSchemes();
        loadMetrics();
      } else {
        setImportError(res.message || 'Failed importing schemes.');
      }
    } catch (err: any) {
      setImportError(err?.response?.data?.message || err?.message || 'Error executing bulk import.');
    } finally {
      setIsImporting(false);
    }
  };

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
        officialWebsite: newWebsite || 'https://india.gov.in',
        officialSourceUrl: newSourceUrl || newWebsite || 'https://india.gov.in'
      });

      if (res.success) {
        setShowAddModal(false);
        setNewName('');
        setNewDept('');
        setNewDesc('');
        setNewBenefits('');
        setNewDocs('');
        setNewWebsite('');
        setNewSourceUrl('');
        showToast('Government scheme created successfully.');
        onRefreshSchemes();
        loadMetrics();
      } else {
        showToast(res.message || 'Failed creating scheme.', 'error');
      }
    } catch {
      showToast('Error communicating with backend.', 'error');
      setShowAddModal(false);
      onRefreshSchemes();
    }
  };

  const handleDeleteScheme = async (id: string, schemeName: string) => {
    if (confirm(`Are you sure you want to permanently delete "${schemeName}"?`)) {
      try {
        const res = await api.deleteScheme(id);
        if (res.success) {
          showToast(`Scheme "${schemeName}" deleted.`);
          onRefreshSchemes();
          loadMetrics();
        }
      } catch {
        showToast('Failed deleting scheme.', 'error');
        onRefreshSchemes();
      }
    }
  };

  const handleStartEdit = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setEditName(scheme.name);
    setEditDept(scheme.department);
    setEditCat(scheme.category);
    setEditClass(scheme.classification);
    setEditState(scheme.state);
    setEditDesc(scheme.description);
    setEditBenefits(Array.isArray(scheme.benefits) ? scheme.benefits.join('\n') : '');
    setEditDocs(Array.isArray(scheme.requiredDocuments) ? scheme.requiredDocuments.join('\n') : '');
    setEditWebsite(scheme.officialWebsite || '');
    setEditSourceUrl(scheme.officialSourceUrl || scheme.officialWebsite || '');
    setEditIsPublished(scheme.isPublished ?? true);
    setEditIsVerified(scheme.isVerified ?? true);
    setEditIsArchived(scheme.isArchived ?? false);
  };

  const handleUpdateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheme || !editName.trim() || !editDept.trim() || !editDesc.trim()) return;

    try {
      const res = await api.updateScheme(editingScheme.id, {
        name: editName,
        department: editDept,
        category: editCat,
        classification: editClass,
        state: editState,
        description: editDesc,
        benefits: editBenefits.split('\n').filter(b => b.trim()),
        requiredDocuments: editDocs.split('\n').filter(d => d.trim()),
        officialWebsite: editWebsite || 'https://india.gov.in',
        officialSourceUrl: editSourceUrl || editWebsite || 'https://india.gov.in',
        isPublished: editIsPublished,
        isVerified: editIsVerified,
        isArchived: editIsArchived
      });

      if (res.success) {
        showToast(`Scheme "${editName}" updated successfully.`);
        setEditingScheme(null);
        onRefreshSchemes();
        loadMetrics();
      }
    } catch {
      showToast('Error updating scheme.', 'error');
      setEditingScheme(null);
      onRefreshSchemes();
    }
  };

  const handleTogglePublish = async (scheme: Scheme) => {
    try {
      const res = await api.publishScheme(scheme.id, !scheme.isPublished);
      showToast(`Scheme "${scheme.name}" is now ${!scheme.isPublished ? 'Published' : 'Draft'}.`);
      onRefreshSchemes();
      loadMetrics();
    } catch (e) {
      console.error('Failed toggling publication status:', e);
      showToast('Failed updating publication status.', 'error');
    }
  };

  const handleToggleArchive = async (scheme: Scheme) => {
    try {
      const willArchive = !scheme.isArchived;
      const confirmAction = window.confirm(
        willArchive
          ? `Archive "${scheme.name}"? It will be hidden from the public directory.`
          : `Restore "${scheme.name}" from archive?`
      );
      if (!confirmAction) return;

      const res = await api.archiveScheme(scheme.id, willArchive);
      showToast(`Scheme "${scheme.name}" ${willArchive ? 'archived' : 'restored'}.`);
      onRefreshSchemes();
      loadMetrics();
    } catch {
      showToast('Failed updating archive status.', 'error');
    }
  };

  const handleToggleUserStatus = async (targetUser: any) => {
    const currentStatus = targetUser.accountStatus || 'active';
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const confirmAction = window.confirm(
      `Are you sure you want to ${newStatus === 'suspended' ? 'SUSPEND' : 'ACTIVATE'} account for ${targetUser.email}?`
    );
    if (!confirmAction) return;

    try {
      const res = await api.updateUserStatus(targetUser.id, newStatus);
      if (res.success) {
        showToast(`User ${targetUser.email} account status updated to ${newStatus}.`);
        loadMetrics();
      } else {
        showToast(res.message || 'Failed updating user status.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error updating user status.', 'error');
    }
  };

  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      const q = schemeSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        (s.name_kn && s.name_kn.toLowerCase().includes(q)) ||
        (s.name_hi && s.name_hi.toLowerCase().includes(q)) ||
        s.department.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (schemeStatusFilter === 'published') return s.isPublished && !s.isArchived;
      if (schemeStatusFilter === 'draft') return !s.isPublished && !s.isArchived;
      if (schemeStatusFilter === 'archived') return Boolean(s.isArchived);
      return true;
    });
  }, [schemes, schemeSearch, schemeStatusFilter]);

  const filteredUsers = useMemo(() => {
    return adminUsers.filter(u => {
      const q = userSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.mobileNumber && u.mobileNumber.includes(q)) ||
        (u.occupation && u.occupation.toLowerCase().includes(q)) ||
        (u.state && u.state.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      const status = u.accountStatus || 'active';
      if (userStatusFilter !== 'all' && status !== userStatusFilter) return false;

      return true;
    });
  }, [adminUsers, userSearch, userRoleFilter, userStatusFilter]);

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
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="bytune-pill flex items-center space-x-2 px-3.5 py-2.5 text-xs font-medium cursor-pointer border border-white/10 hover:border-white/25 active:scale-95 transition-all"
              title="Export schemes catalog"
            >
              <Download className="w-3.5 h-3.5 text-[#8f8bff]" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-[#8a8a97]" />
            </button>

            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bytune-card p-1.5 z-30 shadow-2xl border border-white/15 rounded-xl space-y-1">
                <button
                  type="button"
                  onClick={() => { setShowExportDropdown(false); handleExportJSON(); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[#f5f5f8] hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                >
                  <FileJson className="w-4 h-4 text-[#f3c64f]" />
                  <span>Export as JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowExportDropdown(false); handleExportCSV(); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[#f5f5f8] hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#1ed760]" />
                  <span>Export as CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Bulk Import Button */}
          <button
            type="button"
            onClick={() => {
              setShowImportModal(true);
              setImportFile(null);
              setParsedSchemes([]);
              setImportError(null);
            }}
            className="bytune-pill flex items-center space-x-2 px-3.5 py-2.5 text-xs font-medium cursor-pointer border border-[#8f8bff]/30 bg-[#8f8bff]/10 hover:bg-[#8f8bff]/20 text-[#8f8bff] active:scale-95 transition-all"
            title="Bulk import schemes from JSON or CSV"
          >
            <Upload className="w-3.5 h-3.5 text-[#8f8bff]" />
            <span>Bulk Import</span>
          </button>

          {/* Add New Scheme Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bytune-btn-solid flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#0a0a0c]" />
            <span>Add New Scheme</span>
          </button>
        </div>
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
        <div className="bytune-card overflow-hidden space-y-4 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8a97]" />
              <input
                type="text"
                value={schemeSearch}
                onChange={(e) => setSchemeSearch(e.target.value)}
                placeholder="Search scheme name, department or category..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#8f8bff]/50"
              />
            </div>

            {/* Status Filter Tabs */}
            < div className="flex flex-wrap items-center gap-2" >
              <button
                onClick={() => setSchemeStatusFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${schemeStatusFilter === 'all'
                    ? 'bg-[#8f8bff] text-[#050507] font-semibold'
                    : 'bg-white/[0.04] text-[#8a8a97] hover:text-white'
                  }`}
              >
                All ({schemes.length})
              </button>
              <button
                onClick={() => setSchemeStatusFilter('published')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${schemeStatusFilter === 'published'
                    ? 'bg-[#1ed760] text-[#050507] font-semibold'
                    : 'bg-white/[0.04] text-[#8a8a97] hover:text-white'
                  }`}
              >
                Published ({schemes.filter(s => s.isPublished && !s.isArchived).length})
              </button>
              <button
                onClick={() => setSchemeStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${schemeStatusFilter === 'draft'
                    ? 'bg-[#f3c64f] text-[#050507] font-semibold'
                    : 'bg-white/[0.04] text-[#8a8a97] hover:text-white'
                  }`}
              >
                Drafts ({schemes.filter(s => !s.isPublished && !s.isArchived).length})
              </button>
              <button
                onClick={() => setSchemeStatusFilter('archived')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${schemeStatusFilter === 'archived'
                    ? 'bg-rose-500 text-white font-semibold'
                    : 'bg-white/[0.04] text-[#8a8a97] hover:text-white'
                  }`}
              >
                Archived ({schemes.filter(s => s.isArchived).length})
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8a8a97]">
            <span className="font-mono">Showing {filteredSchemes.length} of {schemes.length} schemes</span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#8a8a97] hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download catalog as CSV spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#1ed760]" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#8a8a97] hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download catalog as raw JSON"
                >
                  <FileJson className="w-3.5 h-3.5 text-[#f3c64f]" />
                  <span>JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowImportModal(true); setImportFile(null); setParsedSchemes([]); setImportError(null); }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#8f8bff]/10 hover:bg-[#8f8bff]/20 text-[#8f8bff] border border-[#8f8bff]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Bulk upload schemes from CSV or JSON"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Bulk Upload</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
              <table className="w-full text-xs text-left divide-y divide-white/[0.08]">
                <thead className="bg-[#0a0a0e]/80 text-[#8a8a97]">
                  <tr>
                    <th className="p-3.5">Scheme Title</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Level</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Verified</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-[#b6b6c2]">
                  {filteredSchemes.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-medium text-[#f5f5f8]">
                        <div>{s.name}</div>
                        {s.officialSourceUrl && (
                          <a
                            href={s.officialSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#6fd8ff] hover:underline inline-flex items-center space-x-1 mt-0.5"
                          >
                            <span>Official Gazetted Source</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>
                      <td className="p-3.5 text-[#8a8a97]">{s.department}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${s.classification === 'State'
                          ? 'bg-[#f3c64f]/15 text-[#f3c64f] border border-[#f3c64f]/30'
                          : 'bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30'
                          }`}>
                          {s.classification}
                        </span>
                      </td>
                      <td className="p-3.5">{s.category}</td>
                      <td className="p-3.5 text-center">
                        {s.isArchived ? (
                          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            Archived
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTogglePublish(s)}
                            className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] cursor-pointer transition-colors ${s.isPublished
                              ? 'bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30 hover:bg-[#1ed760]/25'
                              : 'bg-white/10 text-[#8a8a97] border border-white/10 hover:bg-white/20'
                              }`}
                            title="Click to toggle publication"
                          >
                            {s.isPublished ? 'Published' : 'Draft'}
                          </button>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] ${s.isVerified
                          ? 'bg-[#6fd8ff]/15 text-[#6fd8ff] border border-[#6fd8ff]/30'
                          : 'bg-white/10 text-[#8a8a97] border border-white/10'
                          }`}>
                          {s.isVerified ? 'Official Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        <button
                          onClick={() => handleToggleArchive(s)}
                          className={`bytune-pill p-1.5 cursor-pointer ${s.isArchived
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-[#8a8a97] hover:text-rose-400'
                            }`}
                          title={s.isArchived ? 'Restore Scheme' : 'Archive Scheme'}
                        >
                          {s.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleStartEdit(s)}
                          className="bytune-pill p-1.5 text-[#8a8a97] hover:text-[#8f8bff] cursor-pointer"
                          title="Edit Scheme Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteScheme(s.id, s.name)}
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
          )
    }

          {/* Tab: Users & Citizens */}
          {
            activeTab === 'users' && (
              <div className="bytune-card overflow-hidden space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
                  <div>
                    <h3 className="font-medium text-sm text-[#f5f5f8]">Registered Citizens & Accounts</h3>
                    <p className="text-[11px] text-[#8a8a97] mt-0.5">Directory of authenticated public citizen accounts and administrators with administrative governance controls.</p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] text-[#6fd8ff] border border-white/10 self-start sm:self-auto">
                    {filteredUsers.length} of {adminUsers.length} Accounts
                  </span>
                </div>

                {/* User Search & Filters Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8a97]" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search user name, email, mobile or occupation..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#8f8bff]/50"
                    />
                  </div>

                  <div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value as any)}
                      className="w-full py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#8f8bff]/50"
                    >
                      <option value="all" className="bg-[#101016]">All Roles</option>
                      <option value="citizen" className="bg-[#101016]">Citizens Only</option>
                      <option value="admin" className="bg-[#101016]">Administrators Only</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value as any)}
                      className="w-full py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-[#8f8bff]/50"
                    >
                      <option value="all" className="bg-[#101016]">All Account Statuses</option>
                      <option value="active" className="bg-[#101016]">Active Accounts</option>
                      <option value="suspended" className="bg-[#101016]">Suspended Accounts</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                  <table className="w-full text-xs text-left divide-y divide-white/[0.08]">
                    <thead className="bg-[#0a0a0e]/80 text-[#8a8a97]">
                      <tr>
                        <th className="p-3.5">Full Name</th>
                        <th className="p-3.5">Email</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5">State</th>
                        <th className="p-3.5">Occupation</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-[#b6b6c2]">
                      {filteredUsers.map((u) => {
                        const status = u.accountStatus || 'active';
                        return (
                          <tr key={u.id} className="hover:bg-white/[0.02]">
                            <td className="p-3.5 font-medium text-[#f5f5f8]">{u.fullName}</td>
                            <td className="p-3.5 font-mono text-[#8a8a97]">{u.email}</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${u.role === 'admin'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30'
                                }`}>
                                {u.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3.5">{u.state || 'Karnataka'}</td>
                            <td className="p-3.5">{u.occupation || 'General Citizen'}</td>
                            <td className="p-3.5 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] ${status === 'active'
                                ? 'bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                }`}>
                                {status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-1">
                              <button
                                onClick={() => setSelectedUserForDetail(u)}
                                className="bytune-pill p-1.5 text-[#8a8a97] hover:text-[#6fd8ff] cursor-pointer"
                                title="View Account Profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  className={`bytune-pill p-1.5 cursor-pointer ${status === 'active'
                                    ? 'text-[#8a8a97] hover:text-rose-400'
                                    : 'text-[#8a8a97] hover:text-[#1ed760]'
                                    }`}
                                  title={status === 'active' ? 'Suspend Citizen Account' : 'Activate Citizen Account'}
                                >
                                  {status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }

          {/* Tab: Audit Logs */}
          {
            activeTab === 'logs' && (
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
            )
          }

          {/* Add New Scheme Modal */}
          {
            showAddModal && (
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

                    <div>
                      <label className="block font-medium text-[#b6b6c2] mb-1">Official Gazetted Source URL</label>
                      <input
                        type="url"
                        value={newSourceUrl}
                        onChange={(e) => setNewSourceUrl(e.target.value)}
                        placeholder="https://karnataka.gov.in/gazette/... or official department portal"
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
            )
          }

          {/* Edit Scheme Modal */}
          {
            editingScheme && (
              <div className="fixed inset-0 z-50 bg-[#050507]/80 backdrop-blur-xl flex items-center justify-center p-4">
                <div className="bytune-card max-w-2xl w-full shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col">
                  <div className="bg-[#0a0a0e]/90 text-[#f5f5f8] p-5 flex justify-between items-center border-b border-white/[0.08]">
                    <div>
                      <h3 className="font-medium text-sm">Edit Government Scheme</h3>
                      <p className="text-[10px] text-[#8a8a97]">ID: {editingScheme.id}</p>
                    </div>
                    <button onClick={() => setEditingScheme(null)} className="bytune-pill p-1 text-[#8a8a97] hover:text-white cursor-pointer">✕</button>
                  </div>

                  <form onSubmit={handleUpdateScheme} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-[#b6b6c2] mb-1">Scheme Title</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#b6b6c2] mb-1">Government Department</label>
                        <input
                          type="text"
                          required
                          value={editDept}
                          onChange={(e) => setEditDept(e.target.value)}
                          className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-medium text-[#b6b6c2] mb-1">Category</label>
                        <select
                          value={editCat}
                          onChange={(e) => setEditCat(e.target.value as any)}
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
                          value={editClass}
                          onChange={(e) => setEditClass(e.target.value as any)}
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
                          value={editState}
                          onChange={(e) => setEditState(e.target.value)}
                          className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-[#b6b6c2] mb-1">Scheme Overview & Description</label>
                      <textarea
                        rows={2}
                        required
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full py-2 px-3 rounded-2xl border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#b6b6c2] mb-1">Key Benefits (One per line)</label>
                      <textarea
                        rows={2}
                        value={editBenefits}
                        onChange={(e) => setEditBenefits(e.target.value)}
                        className="w-full py-2 px-3 rounded-2xl border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#b6b6c2] mb-1">Required Documents (One per line)</label>
                      <textarea
                        rows={2}
                        value={editDocs}
                        onChange={(e) => setEditDocs(e.target.value)}
                        className="w-full py-2 px-3 rounded-2xl border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#b6b6c2] mb-1">Official Application Website URL</label>
                      <input
                        type="url"
                        value={editWebsite}
                        onChange={(e) => setEditWebsite(e.target.value)}
                        className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#b6b6c2] mb-1">Official Gazetted Source URL</label>
                      <input
                        type="url"
                        value={editSourceUrl}
                        onChange={(e) => setEditSourceUrl(e.target.value)}
                        placeholder="https://karnataka.gov.in/gazette/..."
                        className="w-full py-2.5 px-4 rounded-full border border-white/10 bg-[#101016] text-[#f5f5f8] focus:border-[#8f8bff]/60 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-6 py-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editIsPublished}
                          onChange={(e) => setEditIsPublished(e.target.checked)}
                          className="rounded border-white/20 bg-[#101016] text-[#8f8bff] focus:ring-0"
                        />
                        <span className="text-[#b6b6c2]">Published (Public Directory)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editIsVerified}
                          onChange={(e) => setEditIsVerified(e.target.checked)}
                          className="rounded border-white/20 bg-[#101016] text-[#1ed760] focus:ring-0"
                        />
                        <span className="text-[#b6b6c2]">Verified Scheme</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editIsArchived}
                          onChange={(e) => setEditIsArchived(e.target.checked)}
                          className="rounded border-white/20 bg-[#101016] text-rose-500 focus:ring-0"
                        />
                        <span className="text-rose-400">Archived (Deprecate from Public View)</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingScheme(null)}
                        className="bytune-btn-ghost flex-1 py-3 rounded-full font-semibold cursor-pointer text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bytune-btn-solid flex-1 py-3 rounded-full font-semibold cursor-pointer text-xs"
                      >
                        Save Scheme Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )
          }

          {/* User Account Inspection Modal */}
          {
            selectedUserForDetail && (
              <div className="fixed inset-0 z-50 bg-[#050507]/80 backdrop-blur-xl flex items-center justify-center p-4">
                <div className="bytune-card max-w-lg w-full shadow-2xl border border-white/10 overflow-hidden">
                  <div className="bg-[#0a0a0e]/90 text-[#f5f5f8] p-5 flex justify-between items-center border-b border-white/[0.08]">
                    <div>
                      <h3 className="font-medium text-sm">Citizen Profile Inspection</h3>
                      <p className="text-[10px] font-mono text-[#8a8a97]">User ID: {selectedUserForDetail.id}</p>
                    </div>
                    <button onClick={() => setSelectedUserForDetail(null)} className="bytune-pill p-1 text-[#8a8a97] hover:text-white cursor-pointer">✕</button>
                  </div>

                  <div className="p-6 space-y-4 text-xs">
                    <div className="flex items-center space-x-4 pb-4 border-b border-white/10">
                      <div className="w-12 h-12 rounded-full bg-[#8f8bff]/20 text-[#8f8bff] flex items-center justify-center font-bold text-base">
                        {selectedUserForDetail.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-[#f5f5f8]">{selectedUserForDetail.fullName}</h4>
                        <p className="text-[#8a8a97] font-mono text-[11px]">{selectedUserForDetail.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#8f8bff]/15 text-[#8f8bff] border border-[#8f8bff]/30">
                            {selectedUserForDetail.role?.toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${(selectedUserForDetail.accountStatus || 'active') === 'active'
                            ? 'bg-[#1ed760]/15 text-[#1ed760] border border-[#1ed760]/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}>
                            {(selectedUserForDetail.accountStatus || 'active').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[#8a8a97] block text-[10px] uppercase font-mono">Mobile</span>
                        <span className="text-white font-medium">{selectedUserForDetail.mobileNumber || 'Not Registered'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[#8a8a97] block text-[10px] uppercase font-mono">State Domicile</span>
                        <span className="text-white font-medium">{selectedUserForDetail.state || 'Karnataka'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[#8a8a97] block text-[10px] uppercase font-mono">Occupation</span>
                        <span className="text-white font-medium">{selectedUserForDetail.occupation || 'General Citizen'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[#8a8a97] block text-[10px] uppercase font-mono">Social Category</span>
                        <span className="text-white font-medium">{selectedUserForDetail.beneficiaryCategory || 'General'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[#8a8a97] block text-[10px] uppercase font-mono">Income Range</span>
                        <span className="text-white font-medium">{selectedUserForDetail.incomeRange || 'Not Specified'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[#8a8a97] block text-[10px] uppercase font-mono">Language</span>
                        <span className="text-white font-medium uppercase font-mono">{selectedUserForDetail.preferredLanguage || 'English'}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                      {selectedUserForDetail.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            handleToggleUserStatus(selectedUserForDetail);
                            setSelectedUserForDetail((prev: User | null) => prev ? {
                              ...prev,
                              accountStatus: (prev.accountStatus || 'active') === 'active' ? 'suspended' : 'active'
                            } : null);
                          }}
                          className={`px-4 py-2 rounded-full font-medium cursor-pointer transition-colors ${(selectedUserForDetail.accountStatus || 'active') === 'active'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                            : 'bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/30 hover:bg-[#1ed760]/30'
                            }`}
                        >
                          {(selectedUserForDetail.accountStatus || 'active') === 'active' ? 'Suspend Account' : 'Activate Account'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedUserForDetail(null)}
                        className="bytune-btn-solid px-5 py-2 rounded-full font-medium cursor-pointer"
                      >
                        Close Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {/* Bulk Import Schemes Modal */}
          {showImportModal && (
            <div className="fixed inset-0 z-50 bg-[#050507]/80 backdrop-blur-xl flex items-center justify-center p-4">
              <div className="bytune-card max-w-2xl w-full shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-[#0a0a0e]/90 text-[#f5f5f8] p-5 flex justify-between items-center border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#8f8bff]" />
                    <h3 className="font-medium text-sm">Bulk Import Welfare Schemes</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                      setParsedSchemes([]);
                      setImportError(null);
                    }}
                    className="bytune-pill p-1 text-[#8a8a97] hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <h4 className="font-medium text-white text-xs flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#8f8bff]" />
                      Supported File Formats
                    </h4>
                    <p className="text-[#8a8a97] text-[11px] leading-relaxed">
                      Upload a <strong>.JSON</strong> or <strong>.CSV</strong> file containing welfare schemes. New schemes will be added to the directory, and existing schemes with matching names or IDs will be safely updated.
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-[#b6b6c2]">
                      <span className="flex items-center gap-1"><FileJson className="w-3 h-3 text-[#f3c64f]" /> JSON (Array of objects)</span>
                      <span className="flex items-center gap-1"><FileSpreadsheet className="w-3 h-3 text-[#1ed760]" /> CSV (Header row required)</span>
                    </div>
                  </div>

                  {/* File Drag & Drop / Input */}
                  <div className="border-2 border-dashed border-white/15 hover:border-[#8f8bff]/50 rounded-2xl p-6 text-center space-y-3 transition-colors bg-white/[0.01]">
                    <input
                      type="file"
                      id="bulk-scheme-file"
                      accept=".json,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="bulk-scheme-file"
                      className="cursor-pointer block space-y-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#8f8bff]/10 border border-[#8f8bff]/20 flex items-center justify-center mx-auto text-[#8f8bff]">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-white font-medium hover:underline">
                          {importFile ? importFile.name : 'Click to choose a file or drag & drop'}
                        </span>
                        <p className="text-[11px] text-[#8a8a97] mt-0.5">
                          {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : 'JSON or CSV up to 10MB'}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Error Banner */}
                  {importError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <span>{importError}</span>
                    </div>
                  )}

                  {/* Preview Section */}
                  {parsedSchemes.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-[#1ed760]" />
                          <span>Ready to import {parsedSchemes.length} schemes</span>
                        </div>
                        <span className="text-[10px] text-[#8a8a97] font-mono">
                          Showing first 5 entries
                        </span>
                      </div>

                      <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
                        <div className="max-h-48 overflow-y-auto">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-white/[0.04] text-[#8a8a97] sticky top-0 border-b border-white/5">
                              <tr>
                                <th className="p-2.5">Scheme Name</th>
                                <th className="p-2.5">Category</th>
                                <th className="p-2.5">Level</th>
                                <th className="p-2.5">State</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-[#f5f5f8]">
                              {parsedSchemes.slice(0, 5).map((s, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02]">
                                  <td className="p-2.5 font-medium truncate max-w-[200px]">{s.name}</td>
                                  <td className="p-2.5 text-[#8a8a97] truncate">{s.category || 'General'}</td>
                                  <td className="p-2.5">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                                      {s.classification || 'Central'}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-[#8a8a97]">{s.state || 'All India'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 border-t border-white/[0.08] bg-[#0a0a0e]/90 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                      setParsedSchemes([]);
                      setImportError(null);
                    }}
                    className="bytune-pill px-4 py-2 text-[#8a8a97] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={parsedSchemes.length === 0 || isImporting}
                    onClick={handleConfirmBulkImport}
                    className={`bytune-btn-solid px-5 py-2 font-semibold flex items-center space-x-2 ${parsedSchemes.length === 0 || isImporting
                        ? 'opacity-40 cursor-not-allowed'
                        : 'cursor-pointer hover:scale-105 transition-all'
                      }`}
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Import {parsedSchemes.length} Schemes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification Container */}
          {
            toast && (
              <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-medium flex items-center space-x-2.5 animate-in slide-in-from-bottom-3 duration-200 ${toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 backdrop-blur-md'
                : 'bg-[#0f172a]/95 text-[#1ed760] border-[#1ed760]/40 backdrop-blur-md'
                }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span>{toast.message}</span>
              </div>
            )
          }
        </div >
      );
};
