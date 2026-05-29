import React, { useState, useEffect, useMemo } from 'react';
import { userService } from '../services/api';
import { Button } from '../components/Button';
import {
  Users, Search, Trash2, ShieldOff, ShieldCheck,
  AlertCircle, RefreshCw, ChevronDown, Filter
} from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  landlord: 'bg-indigo-100 text-indigo-700',
  tenant: 'bg-emerald-100 text-emerald-700',
};

function ConfirmModal({ message, onConfirm, onCancel, danger }: {
  message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${danger ? 'bg-red-50' : 'bg-amber-50'}`}>
          <AlertCircle className={`h-7 w-7 ${danger ? 'text-red-500' : 'text-amber-500'}`} />
        </div>
        <p className="text-center text-slate-700 font-medium mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} className="flex-1" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ userId: string; action: 'delete' | 'block'; name: string } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await userService.getAll();
      setUsers(res.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !search ||
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      const matchStatus = statusFilter === 'All' ||
        (statusFilter === 'Active' ? u.isActive : !u.isActive);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleBlock = async (userId: string) => {
    setActionLoading(userId + '_block');
    try {
      const res = await userService.blockUser(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: res.data.user.isActive } : u));
      showToast('success', res.data.message);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleDelete = async (userId: string) => {
    setActionLoading(userId + '_delete');
    try {
      await userService.delete(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      showToast('success', 'User removed successfully');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Delete failed');
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <ShieldCheck className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {toast.text}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.action === 'delete'
            ? `Permanently remove ${confirmModal.name}? This cannot be undone.`
            : `Toggle block status for ${confirmModal.name}?`}
          danger={confirmModal.action === 'delete'}
          onCancel={() => setConfirmModal(null)}
          onConfirm={() => confirmModal.action === 'delete'
            ? handleDelete(confirmModal.userId)
            : handleBlock(confirmModal.userId)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="text-white h-6 w-6" />
            </div>
            User Management
          </h1>
          <p className="text-slate-500 mt-1">View, block, and remove users across all roles.</p>
        </div>
        <Button variant="outline" onClick={fetchUsers} className="gap-2 self-start sm:self-center">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />{error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer">
              <option value="All">All Roles</option>
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No users match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-semibold">User</th>
                  <th className="text-left px-6 py-3 font-semibold">Role</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="text-left px-6 py-3 font-semibold">Joined</th>
                  <th className="text-right px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant={u.isActive ? 'outline' : 'primary'}
                          className={`gap-1.5 text-xs ${u.isActive ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : ''}`}
                          isLoading={actionLoading === u._id + '_block'}
                          onClick={() => setConfirmModal({ userId: u._id, action: 'block', name: `${u.firstName} ${u.lastName}` })}
                          disabled={u.role === 'admin'}
                        >
                          {u.isActive ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                          {u.isActive ? 'Block' : 'Unblock'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          className="gap-1.5 text-xs"
                          isLoading={actionLoading === u._id + '_delete'}
                          onClick={() => setConfirmModal({ userId: u._id, action: 'delete', name: `${u.firstName} ${u.lastName}` })}
                          disabled={u.role === 'admin'}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
