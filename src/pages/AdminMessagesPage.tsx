import React, { useState, useEffect } from 'react';
import { inquiryService } from '../services/api';
import { Button } from '../components/Button';
import {
  Mail, MessageSquare, ShieldAlert, AlertCircle,
  Trash2, RefreshCw, ChevronRight, X, Eye,
  Clock, MailOpen, ArrowLeft, Send
} from 'lucide-react';

export default function AdminMessagesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchInquiries = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await inquiryService.getAll();
      setInquiries(res.data.inquiries || res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inquiries list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleOpenDetail = async (id: string) => {
    setIsDetailLoading(true);
    setModalOpen(true);
    try {
      const res = await inquiryService.getById(id);
      setSelectedInquiry(res.data.inquiry);
      // Update local state to mark as read immediately
      setInquiries(prev =>
        prev.map(item => item._id === id ? { ...item, isRead: true } : item)
      );
    } catch (err: any) {
      console.error('Failed to load message detail:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await inquiryService.delete(id);
      setInquiries(prev => prev.filter(item => item._id !== id));
      if (selectedInquiry?._id === id) {
        setModalOpen(false);
        setSelectedInquiry(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInquiry(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Mail className="text-white h-6 w-6" />
            </div>
            User Messages
          </h1>
          <p className="text-slate-500 mt-1">Review and manage contact submissions from the public landing page.</p>
        </div>
        <Button variant="outline" onClick={fetchInquiries} className="gap-2 self-start sm:self-center">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Main Grid / Table */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
            <MessageSquare className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No Messages Found</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            There are no inquiries stored in the database. When users submit the Contact Form, their messages will automatically show up here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                  <th className="px-6 py-4">Sender</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Received</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {inquiries.map((inq) => (
                  <tr
                    key={inq._id}
                    onClick={() => handleOpenDetail(inq._id)}
                    className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${!inq.isRead ? 'font-bold bg-indigo-50/20' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{inq.name}</div>
                      <div className="text-xs text-slate-400 font-medium">{inq.email}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {inq.subject || 'No Subject'}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                      {new Date(inq.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${inq.isRead
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-indigo-100 text-indigo-700'
                        }`}>
                        {inq.isRead ? 'Read' : 'New'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(inq._id)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 rounded-lg"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDelete(e, inq._id)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <MailOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Inquiry Detail</h3>
                  <div className="text-xs font-semibold text-slate-400">Read & Reply options</div>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            {isDetailLoading || !selectedInquiry ? (
              <div className="p-12 text-center space-y-3">
                <Clock className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-500">Loading message details...</p>
              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-6">

                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4.5 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-600">
                  <div>
                    <span className="uppercase text-slate-400 block mb-0.5 tracking-wider text-[10px] font-black">From</span>
                    <span className="text-slate-800 text-sm font-bold block">{selectedInquiry.name}</span>
                    <span className="text-slate-400 block">{selectedInquiry.email}</span>
                  </div>
                  <div>
                    <span className="uppercase text-slate-400 block mb-0.5 tracking-wider text-[10px] font-black">Submitted</span>
                    <span className="text-slate-800 text-sm font-bold block">
                      {new Date(selectedInquiry.createdAt).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-slate-400 block">
                      {new Date(selectedInquiry.createdAt).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Subject and body */}
                <div className="space-y-3">
                  <h4 className="text-lg font-black text-slate-800">
                    Subject: {selectedInquiry.subject || 'No Subject'}
                  </h4>
                  <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-2xl text-slate-700 text-sm whitespace-pre-wrap leading-relaxed min-h-32">
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Buttons / CTA */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                  {/* Change this block */}
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject || 'Inquiry')}`}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" /> Reply via Email
                  </a>
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      handleDelete(e, selectedInquiry._id);
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl py-2.5 font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4.5 w-4.5" /> Delete message
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCloseModal}
                    className="rounded-xl py-2.5 font-semibold text-slate-600"
                  >
                    Close
                  </Button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
