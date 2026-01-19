import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { EmailQueue, EmailQueueInsert, createEmailQueueItem, getEmailQueueItems, updateEmailQueueItem, deleteEmailQueueItem } from '@/services/supabase/emailQueue'

interface EmailQueueContextType {
  emailQueue: EmailQueue[]
  loading: boolean
  error: string | null
  loadEmailQueue: () => Promise<void>
  addToQueue: (data: EmailQueueInsert) => Promise<EmailQueue | null>
  updateQueueItem: (id: string, data: Partial<EmailQueueInsert>) => Promise<EmailQueue | null>
  removeFromQueue: (id: string) => Promise<boolean>
}

const EmailQueueContext = createContext<EmailQueueContextType | undefined>(undefined)

export const useEmailQueue = () => {
  const context = useContext(EmailQueueContext)
  if (!context) {
    throw new Error('useEmailQueue must be used within an EmailQueueProvider')
  }
  return context
}

export const EmailQueueProvider = ({ children }: { children: ReactNode }) => {
  const [emailQueue, setEmailQueue] = useState<EmailQueue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEmailQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEmailQueueItems()
      setEmailQueue(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const addToQueue = useCallback(async (data: EmailQueueInsert) => {
    const newItem = await createEmailQueueItem(data)
    if (newItem) {
      setEmailQueue(prev => [newItem, ...prev])
    }
    return newItem
  }, [])

  const updateQueueItem = useCallback(async (id: string, data: Partial<EmailQueueInsert>) => {
    const updatedItem = await updateEmailQueueItem(id, data)
    if (updatedItem) {
      setEmailQueue(prev => prev.map(item => item.id === id ? updatedItem : item))
    }
    return updatedItem
  }, [])

  const removeFromQueue = useCallback(async (id: string) => {
    const success = await deleteEmailQueueItem(id)
    if (success) {
      setEmailQueue(prev => prev.filter(item => item.id !== id))
    }
    return success
  }, [])

  const value = {
    emailQueue,
    loading,
    error,
    loadEmailQueue,
    addToQueue,
    updateQueueItem,
    removeFromQueue,
  }

  return (
    <EmailQueueContext.Provider value={value}>
      {children}
    </EmailQueueContext.Provider>
  )
} 