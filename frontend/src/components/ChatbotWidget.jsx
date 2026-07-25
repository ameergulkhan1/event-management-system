import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react'
import { apiSendChatMessage } from '../services/chatApi.js'
import './ChatbotWidget.css'

// Fixed position for the widget (no longer draggable)
const POSITION = { bottom: 24, right: 24 }

export default function ChatbotWidget() {
  const [isOpen, setIsOpen]     = useState(false)
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Ask me anything about upcoming university events.' }
  ])
  const [input, setInput]       = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const chatEndRef              = useRef(null)

  // scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  // ── SEND MESSAGE ──
  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }])
    setIsLoading(true)

    try {
      const data = await apiSendChatMessage(userMessage)
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I couldn't process that request right now." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e)
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="chatbot-window"
          style={{ bottom: POSITION.bottom + 66, right: POSITION.right }}
        >
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-header-avatar">
                <Bot />
              </div>
              <div>
                <div className="chatbot-header-title">Campus AI Assistant</div>
                <div className="chatbot-header-status">Online</div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <X />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-msgs">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.sender}`}>
                <div className="chatbot-msg-bubble">{msg.text}</div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="chatbot-typing">
                <div className="chatbot-typing-dots">
                  <div className="chatbot-dot" />
                  <div className="chatbot-dot" />
                  <div className="chatbot-dot" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form className="chatbot-input-row" onSubmit={handleSend}>
            <input
              className="chatbot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about events..."
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={isLoading || !input.trim()}
            >
              <Send />
            </button>
          </form>
        </div>
      )}

      {/* Floating Bubble */}
      <div
        className="chatbot-bubble"
        style={{ bottom: POSITION.bottom, right: POSITION.right }}
        onClick={() => setIsOpen(prev => !prev)}
      >
        {isOpen ? <X /> : <MessageSquare />}
        {!isOpen && <div className="chatbot-bubble-dot" />}
      </div>
    </>
  )
}