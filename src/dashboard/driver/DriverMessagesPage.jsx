import { MessageSquare } from 'lucide-react'
export default function DriverMessagesPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-card p-10 text-center">
        <MessageSquare size={40} className="mx-auto mb-4 text-ink-300"/>
        <h2 className="font-display font-bold text-xl text-ink-900 mb-2">Messages</h2>
        <p className="text-ink-400 text-sm">Chat messages from active rides appear here.</p>
      </div>
    </div>
  )
}
