import { createContext, useContext, useEffect, useState } from 'react'
import { subscribeToNotifications } from '../services/notificationService'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!user) { setNotifications([]); return }
    const unsub = subscribeToNotifications(user.uid, setNotifications)
    return unsub
  }, [user])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
