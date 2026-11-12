import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { fetchBreakingNews, fetchLiveFeed } from '../services/api';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [breakingNews, setBreakingNews] = useState([]);
  const [liveFeedItems, setLiveFeedItems] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const addNotification = (notification) => {
    setNotifications((previous) => [
      {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        ...notification
      },
      ...previous
    ].slice(0, 30));
  };

  useEffect(() => {
    // Initial fetch of breaking news
    fetchBreakingNews()
      .then(items => setBreakingNews(items))
      .catch(err => console.warn('Could not load initial breaking news:', err));
    fetchLiveFeed()
      .then(items => setLiveFeedItems(items))
      .catch(err => console.warn('Could not load initial live feed:', err));

    // Connect to WebSocket server
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for live breaking news broadcasts from Admin
    socketInstance.on('breaking:news', (item) => {
      setBreakingNews(prev => [item, ...prev.slice(0, 19)]);
      setLatestAlert(item);
      // Clear popup alert after 7 seconds
      setTimeout(() => setLatestAlert(null), 7000);
    });

    socketInstance.on('live:feed', (item) => {
      setLiveFeedItems((prev) => [
        item,
        ...prev.filter((existing) => existing.url !== item.url)
      ].slice(0, 30));
      addNotification({
        type: 'news',
        title: 'New live story',
        message: item.title,
        item
      });
    });

    socketInstance.on('forum:reply', ({ threadId, threadTitle, reply }) => {
      addNotification({
        type: 'forum',
        title: 'New forum reply',
        message: `${reply.author?.name || 'Someone'} replied to "${threadTitle}"`,
        item: { threadId, reply }
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('user:join', user._id);
    }
  }, [socket, user?._id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        breakingNews,
        liveFeedItems,
        latestAlert,
        notifications,
        unreadNotificationCount: notifications.length,
        markNotificationsRead: () => setNotifications([]),
        dismissAlert: () => setLatestAlert(null)
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
