import { useEffect, useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`${isUser ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'} max-w-[75%] rounded-2xl px-4 py-2 shadow-md border ${isUser ? 'border-blue-500' : 'border-gray-200'}`}>
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your friendly mini-robot. Ask me anything! 🤖🧡' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (e) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const nextMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, temperature: 0.7 })
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Uh oh, I hit a snag talking to my brain in the cloud. Try again in a moment!' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero with Spline */}
      <section className="relative h-[50vh] w-full overflow-hidden">
        <Spline scene="https://prod.spline.design/AeAqaKLmGsS-FPBN/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none" />
        <div className="absolute inset-0 flex items-end md:items-center justify-center md:justify-start p-6 md:p-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Mini Bot Chat</h1>
            <p className="mt-3 text-gray-300 md:text-lg">A playful, friendly AI chatbot. Ask questions, get quick answers, and explore ideas in real time.</p>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section className="relative -mt-12 md:-mt-16 z-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-4 md:p-6">
            <div className="h-[45vh] md:h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {messages.map((m, i) => (
                <Message key={i} role={m.role} content={m.content} />
              ))}
              {loading && (
                <div className="text-sm text-gray-400 animate-pulse">Thinking…</div>
              )}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} className="mt-4 flex gap-2">
              <input
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-neutral-500"
                placeholder="Type your message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 rounded-xl"
              >
                Send
              </button>
            </form>
            <p className="mt-2 text-xs text-neutral-500">Uses OpenAI via a secure server. Set your key on the backend.</p>
          </div>
        </div>
      </section>

      <footer className="mt-16 py-8 text-center text-neutral-500 text-sm">
        Built with love by a friendly robot. 🧡
      </footer>
    </div>
  )
}
