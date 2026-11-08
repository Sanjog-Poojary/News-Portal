import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  ShieldAlert,
  Newspaper,
  MessageSquare,
  PenTool,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Compass,
  Bell
} from 'lucide-react';
import Avatar from './Avatar';
import { useSocket } from '../context/SocketContext';

export default function Navbar({
  currentView = 'home',
  onChangeView,
  onOpenAuth,
  searchQuery,
  setSearchQuery,
  onSelectCategory
}) {
  const { user, isAuthenticated, logout, isAuthor, isAdmin } = useAuth();
  const { notifications, unreadNotificationCount, markNotificationsRead } = useSocket();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (setSearchQuery) {
        setSearchQuery(localSearch);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  return (
    <header className="sticky top-0 z-40 w-full pt-3 px-4 sm:px-6 lg:px-8 pointer-events-none">
      <nav className="max-w-7xl mx-auto pointer-events-auto rounded-2xl glass-panel px-4 sm:px-6 py-3 shadow-md transition-all duration-300">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-7">
            <button
              onClick={() => onChangeView && onChangeView('home')}
              className="group flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-700 transition-all">
                <span className="font-mono font-black text-base tracking-tighter">N</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold tracking-tight text-base text-textPrimary font-mono">NEWS</span>
                  <span className="text-teal-600 font-mono font-black">.PORTAL</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-textMuted font-mono -mt-1 font-semibold">
                  AI-Verified Media
                </span>
              </div>
            </button>

            {/* View Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => {
                  if (onChangeView) onChangeView('home');
                  if (onSelectCategory) onSelectCategory('All');
                }}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentView === 'home'
                    ? 'bg-teal-50 text-teal-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Newspaper className="w-4 h-4 text-teal-600" />
                <span>Live Feed</span>
              </button>

              <button
                onClick={() => onChangeView && onChangeView('forum')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentView === 'forum'
                    ? 'bg-teal-50 text-teal-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <span>Forum</span>
              </button>

              {isAuthor && (
                <button
                  onClick={() => onChangeView && onChangeView('author')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    currentView === 'author'
                      ? 'bg-teal-50 text-teal-800 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <PenTool className="w-4 h-4 text-teal-600" />
                  <span>Author Studio</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => onChangeView && onChangeView('admin')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    currentView === 'admin'
                      ? 'bg-teal-50 text-teal-800 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-teal-600" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>
          </div>

          {/* Center Search Input */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search verified articles, claims, tags..."
                className="w-full pl-9 pr-12 py-1.5 bg-canvas border border-surface-border rounded-xl text-sm text-textPrimary placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-xs"
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 font-semibold">
                  Ctrl+K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Section: Auth & Role Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications((visible) => !visible);
                      setShowUserMenu(false);
                    }}
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-surface-border bg-white text-slate-600 shadow-xs transition-colors hover:border-teal-400 hover:text-teal-700"
                    aria-label="Open notifications"
                    aria-expanded={showNotifications}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-teal-600 px-1 text-[9px] font-bold leading-4 text-white">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-surface-border bg-white p-2 text-xs shadow-dropdown z-50">
                      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                        <span className="font-bold text-slate-900">Notifications</span>
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={markNotificationsRead}
                            className="text-[10px] font-mono uppercase tracking-wide text-teal-700 hover:text-teal-900"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p className="px-3 py-6 text-center text-slate-500">
                          You are all caught up.
                        </p>
                      ) : (
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div key={notification.id} className="border-b border-slate-100 px-3 py-3 last:border-0">
                              <p className="font-bold text-slate-900">{notification.title}</p>
                              <p className="mt-1 leading-relaxed text-slate-600">{notification.message}</p>
                              <time className="mt-1 block text-[10px] font-mono text-slate-400">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </time>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-surface-border hover:border-teal-400 transition-all text-left shadow-xs"
                >
                  <Avatar
                    name={user.name}
                    src={user.avatar}
                    className="w-7 h-7 rounded-lg border border-slate-200 text-[9px]"
                  />
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </p>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-surface-border shadow-dropdown p-2 text-xs z-50 animate-fade-in">
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5 inline-block px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono uppercase font-bold">
                        Role: {user.role}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onChangeView('home');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2 font-medium transition-colors"
                    >
                      <Compass className="w-4 h-4 text-teal-600" />
                      <span>News Feed</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onChangeView('forum');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2 font-medium transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-teal-600" />
                      <span>Community Forum</span>
                    </button>

                    {isAuthor && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onChangeView('author');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2 font-medium transition-colors"
                      >
                        <PenTool className="w-4 h-4 text-teal-600" />
                        <span>Author Studio</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onChangeView('admin');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2 font-medium transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-teal-600" />
                        <span>Admin Control Panel</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 mt-1 border-t border-slate-100 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs tracking-wide shadow-sm transition-all flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>
      </nav>
    </header>
  );
}
