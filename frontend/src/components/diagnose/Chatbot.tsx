'use client'
import { useState, useRef, useEffect } from 'react'
import { getBotResponse } from '@/lib/utils'
import type { ChatMessage } from '@/types'

const initMessages: ChatMessage[] = [
  { id: '1', role: 'bot', content: "I've completed the analysis. Your tomato plant shows **Late Blight** (Phytophthora infestans) at high severity. This is a serious fungal disease that spreads quickly — immediate action is recommended. What would you like to know?", timestamp: new Date() },
  { id: '2', role: 'bot', content: "You can ask me about: treatment timing, organic alternatives, how to prevent spread to other plants, or what to do if symptoms worsen.", timestamp: new Date() },
]

export function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>(initMessages)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const send = () => {
    if (!input.trim()) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    const q = input
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const botMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'bot', content: getBotResponse(q), timestamp: new Date() }
      setMessages(prev => [...prev, botMsg])
      setTyping(false)
    }, 1500)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-base">🤖</div>
        <div>
          <div className="font-semibold text-sm">CropGuard Assistant</div>
          <div className="text-xs text-green-600">● Online</div>
        </div>
      </div>
      <div className="h-60 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-hide">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${msg.role === 'bot' ? 'bg-green-100' : 'bg-green-600 text-white'}`}>
              {msg.role === 'bot' ? '🤖' : 'JO'}
            </div>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'bot' ? 'bg-gray-100 text-gray-800 rounded-tl-sm' : 'bg-green-600 text-white rounded-tr-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs">🤖</div>
            <div className="flex gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-sm">
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-gray-100 flex gap-2">
        <input
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask a follow-up question..."
          className="flex-1 px-4 py-2 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-green-500 transition-colors"
        />
        <button onClick={send} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors">Send</button>
      </div>
    </div>
  )
}
