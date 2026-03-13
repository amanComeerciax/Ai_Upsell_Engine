import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface Notification {
    id: string
    type: 'order' | 'upsell' | 'conversion' | 'impression'
    title: string
    description: string
    timestamp: Date
    read: boolean
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
    markAllRead: () => void
    clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    addNotification: () => { },
    markAllRead: () => { },
    clearAll: () => { },
})

export const useNotifications = () => useContext(NotificationContext)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])

    const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotif: Notification = {
            ...n,
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date(),
            read: false,
        }
        setNotifications(prev => [newNotif, ...prev].slice(0, 50)) // Keep last 50
    }, [])

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }, [])

    const clearAll = useCallback(() => {
        setNotifications([])
    }, [])

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    )
}
