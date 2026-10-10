import { MessageSquare } from 'lucide-react'
export default function MessagesPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-card p-10 text-center">
        <MessageSquare size={40} className="mx-auto mb-4 text-slate-300"/>
        <h2 className="font-display font-bold text-xl text-slate-900 mb-2">Messages</h2>
        <p className="text-slate-400 text-sm">Your ride chat history appears here after completed rides.</p>
      </div>
    </div>
  )
}
