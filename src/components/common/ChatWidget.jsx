// src/components/common/ChatWidget.jsx
import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react'
import { createPortal } from 'react-dom'

const AUTO_REPLIES = {
  'hello': 'Hi there! 👋 How can I help you today?',
  'help': 'I can help with:\n• App downloads\n• Account issues\n• Upload problems\n• General questions\n\nWhat do you need help with?',
  'download': 'To download an app:\n1. Browse or search for an app\n2. Click the "Get App" button\n3. Check your Downloads page\n\nHaving issues? Let me know!',
  'upload': 'To upload your app:\n1. Click "Upload" in the nav\n2. Fill in app details\n3. Upload your files\n4. Submit for review\n\nNeed more help with uploading?',
  'account': 'For account issues, go to Settings.\n\nYou can:\n• Change password\n• Update profile\n• Manage notifications\n• Delete account',
  'default': "Thanks for your message! Our team will get back to you shortly. In the meantime, try these:\n• Type 'help' for common topics\n• Check our FAQ at /help\n• Email: support@appstore.com",
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! 👋 I'm the AppStore assistant. How can I help you today?",
      time: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const getAutoReply = (text) => {
    const lower = text.toLowerCase()
    for (const [keyword, reply] of Object.entries(AUTO_REPLIES)) {
      if (keyword !== 'default' && lower.includes(keyword)) {
        return reply
      }
    }
    return AUTO_REPLIES.default
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input.trim(),
      time: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const reply = getAutoReply(input)
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: reply,
        time: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1500)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const widget = (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 lg:bottom-6 right-6 z-[60] w-14 h-14 bg-main text-bg rounded-full shadow-lg hover:shadow-[0_0_25px_var(--main-color)] transition-all hover:scale-110 flex items-center justify-center animate-bounce-in"
        >
          <MessageCircle className="w-6 h-6" />
          {/* Unread Dot */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-bg" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`
          fixed z-[60] bg-bg-secondary rounded-2xl shadow-2xl border border-bg overflow-hidden
          transition-all duration-300
          ${isMinimized
            ? 'bottom-24 lg:bottom-6 right-6 w-72 h-14'
            : 'bottom-24 lg:bottom-6 right-6 w-[360px] h-[500px] max-h-[80vh]'
          }
        `}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-main text-bg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-bg/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">AppStore Support</p>
                <p className="text-xs opacity-80">
                  {isTyping ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-bg/20 rounded-lg transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-bg/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-120px)]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.type === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`
                      w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                      ${msg.type === 'bot' ? 'bg-main/20' : 'bg-bg'}
                    `}>
                      {msg.type === 'bot' 
                        ? <Bot className="w-4 h-4 text-main" /> 
                        : <User className="w-4 h-4 text-text-muted" />
                      }
                    </div>
                    <div className={`
                      max-w-[80%] rounded-2xl px-4 py-2.5
                      ${msg.type === 'bot'
                        ? 'bg-bg rounded-bl-sm'
                        : 'bg-main text-bg rounded-br-sm'
                      }
                    `}>
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.type === 'bot' ? 'text-text-muted' : 'opacity-70'
                      }`}>
                        {formatTime(msg.time)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-main/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-main" />
                    </div>
                    <div className="bg-bg rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-bg">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-bg rounded-xl px-4 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-main"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2.5 bg-main text-bg rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )

  return createPortal(widget, document.body)
}

export default ChatWidget