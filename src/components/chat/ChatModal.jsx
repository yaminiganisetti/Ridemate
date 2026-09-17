import { useState, useEffect, useRef } from 'react'
import { X, Send } from 'lucide-react'
import { sendMessage, subscribeToChat } from '../../services/chatService'
import { useAuth } from '../../context/AuthContext'

export default function ChatModal({ rideId, driver, onClose }) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const unsub = subscribeToChat(rideId, setMessages)
    return unsub
  }, [rideId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim()) return
    setLoading(true)
    await sendMessage(rideId, user.uid, driver?.uid || 'driver', text.trim())
    setText('')
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="flex items-center gap-3 p-5 border-b border-ink-100">
          <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center text-xl">{driver?.avatar || '🚗'}</div>
          <div>
            <p className="font-semibold text-ink-900 text-sm">{driver?.name || 'Driver'}</p>
            <p className="text-xs text-emerald-500 font-medium">Online</p>
          </div>
          <button onClick={onClose} className="ml-auto"><X size={20} className="text-ink-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="text-center text-ink-400 text-sm py-8">
              <p>Send a message to your driver</p>
            </div>
          )}
          {messages.map(m => {
            const isMe = m.senderId === user.uid
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMe ? 'bg-brand-500 text-white rounded-br-md' : 'bg-ink-100 text-ink-800 rounded-bl-md'
                }`}>
                  {m.text}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-ink-100 flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
            placeholder="Type a message..." className="input-field flex-1 text-sm" />
          <button onClick={handleSend} disabled={!text.trim() || loading}
            className="w-10 h-10 bg-brand-500 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 hover:bg-brand-600 transition-colors shrink-0">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
