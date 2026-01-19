"use client";

import { useNotifications } from "@/components/providers/notification-provider";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck, Bell, X } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { notifications, markAsRead, deleteNotification, markAllAsRead } =
    useNotifications();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Notifications
        </h1>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 self-start text-sm font-medium text-blue-600 hover:text-blue-700 sm:self-auto"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
          <div className="mb-4 rounded-full bg-gray-50 p-4">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No notifications
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You&apos;re all caught up! Check back later for updates.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative flex gap-3 rounded-lg border p-3 transition-all sm:gap-4 sm:p-4 ${
                notification.read
                  ? "border-gray-200 bg-white"
                  : "border-red-100 bg-red-50/30"
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="shrink-0">
                {!notification.read ? (
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-red-600 sm:mt-1 sm:h-2.5 sm:w-2.5" />
                ) : (
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-gray-200 sm:mt-1 sm:h-2.5 sm:w-2.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        notification.read ? "text-gray-900" : "text-gray-900"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-600 sm:mt-1 sm:text-sm">
                      {notification.message}
                    </p>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="mt-1.5 inline-block text-xs font-medium text-blue-600 hover:underline sm:mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View details
                      </Link>
                    )}
                    <p className="mt-1.5 text-[10px] text-gray-400 sm:mt-2 sm:text-xs">
                      {formatDistanceToNow(new Date(notification.date), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors sm:p-2"
                    aria-label="Delete notification"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
