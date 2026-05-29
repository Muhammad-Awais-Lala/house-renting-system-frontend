import React, { useState, useEffect, useMemo } from 'react';
import { propertyService } from '../services/api';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import {
  Building2, Search, Trash2, Eye, AlertCircle,
  RefreshCw, ChevronDown, Filter, MapPin, BedDouble, Bath
} from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  apartment: 'bg-blue-100 text-blue-700',
  house: 'bg-green-100 text-green-700',
  studio: 'bg-orange-100 text-orange-700',
  penthouse: 'bg-purple-100 text-purple-700',
  condo: 'bg-teal-100 text-teal-700',
  townhouse: 'bg-rose-100 text-rose-700',
};

function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
        <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-center text-slate-700 font-medium mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}>Remove Listing</Button>
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' fill='%23f1f5f9'%3E%3Crect width='300' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProperties = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await propertyService.getAll({ limit: 1000 });
      setProperties(res.data.properties || res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const filtered = useMemo(() => {
    return properties.filter(p => {
      const matchSearch = !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || p.propertyType === typeFilter;
      return matchSearch && matchType;
    });
  }, [properties, search, typeFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await propertyService.delete(deleteId);
      setProperties(prev => prev.filter(p => (p._id || p.id) !== deleteId));
      showToast('success', 'Listing removed successfully');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const propertyTypes = ['All', 'apartment', 'house', 'studio', 'penthouse', 'condo', 'townhouse'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <Building2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {toast.text}
        </div>
      )}

      {/* Confirm Modal */}
      {deleteId && (
        <ConfirmModal
          message={`Remove listing "${deleteTitle}"? This action cannot be undone.`}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="text-white h-6 w-6" />
            </div>
            Property Monitoring
          </h1>
          <p className="text-slate-500 mt-1">Review and remove inappropriate property listings.</p>
        </div>
        <Button variant="outline" onClick={fetchProperties} className="gap-2 self-start sm:self-center">
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
            placeholder="Search by title or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer capitalize">
            {propertyTypes.map(t => <option key={t} value={t} className="capitalize">{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} found</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Building2 className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">No listings match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => {
            const id = p._id || p.id;
            const img = p.images?.[0]?.url || p.images?.[0] || PLACEHOLDER_IMG;
            return (
              <div key={id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                <div className="relative h-44 overflow-hidden">
                  <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${TYPE_COLORS[p.propertyType] || 'bg-slate-100 text-slate-600'}`}>
                      {p.propertyType}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-indigo-700 shadow-sm">
                    PKR {p.price?.toLocaleString()}/mo
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-slate-900 truncate mb-1">{p.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-3 truncate">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {p.bedrooms} bed</span>
                    <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {p.bathrooms} bath</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/properties/${id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => { setDeleteId(id); setDeleteTitle(p.title); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
