import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell, CheckCircle2, Clock, Trash2, Check,
  Filter, AlertCircle, Sparkles, ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { AppNotification } from '../../types';

export const CitizenNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.warn('Failed loading notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = async (id: string) => {
    await api.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ff9933]/15 text-[#ff9933] border border-[#ff9933]/30">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#8a8a97] mt-1">
            Official announcements, scheme application alerts, and scholarship portal updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-auto flex items-center space-x-1.5"
          >
            <Check className="w-3.5 h-3.5 text-[#8f8bff]" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-white/10 space-x-2 text-xs pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`py-2 px-4 rounded-xl transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-[#8a8a97] hover:text-white'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`py-2 px-4 rounded-xl transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-white/10 text-white font-semibold'
              : 'text-[#8a8a97] hover:text-white'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0c0c12] border border-white/10 text-center space-y-3">
          <Bell className="w-10 h-10 text-[#8a8a97] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-white">No Notifications Found</h3>
          <p className="text-xs text-[#8a8a97]">
            {filter === 'unread'
              ? 'You have caught up on all welfare alerts.'
              : 'No notifications currently registered for your citizen account.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                notif.isRead
                  ? 'bg-white/[0.02] border-white/5 opacity-80'
                  : 'bg-[#8f8bff]/10 border-[#8f8bff]/25 shadow-sm'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] text-[#6fd8ff]">
                    {notif.type.replace('_', ' ')}
                  </span>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#ff9933]" />
                  )}
                  <span className="text-[11px] text-[#8a8a97]">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                <p className="text-xs text-[#b6b6c2] leading-relaxed">{notif.message}</p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#8f8bff] font-semibold transition-colors cursor-pointer"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-[#8a8a97] hover:text-rose-400 transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
