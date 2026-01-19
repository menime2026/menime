"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "date" | "read">) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const STORAGE_KEY = "menime-notifications";

// Mock initial data for demonstration
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "New Collection Alert!",
    message: "Check out our latest summer arrivals.",
    date: new Date().toISOString(),
    read: false,
    type: "info",
    link: "/collections/summer",
  },
  {
    id: "2",
    title: "Order Shipped",
    message: "Your order #12345 has been shipped successfully.",
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: true,
    type: "success",
    link: "/orders/12345",
  },
];

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse notifications", e);
        setNotifications(INITIAL_NOTIFICATIONS);
      }
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage whenever notifications change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications, isInitialized]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "date" | "read">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        deleteNotification,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
