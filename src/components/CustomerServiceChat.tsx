'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

export default function CustomerServiceChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '您好！欢迎来到中药材B2B平台客服中心。我是您的专属客服助手，有什么可以帮助您的吗？',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Simple keyword-based responses
    if (lowerMessage.includes('价格') || lowerMessage.includes('多少钱')) {
      return '关于产品价格，您可以在产品详情页查看具体报价。我们的价格都是实时更新的市场价格，如需批量采购可享受优惠。'
    } else if (lowerMessage.includes('质量') || lowerMessage.includes('品质')) {
      return '我们平台所有中药材都经过严格的质量检测，确保符合国家药典标准。每个产品都有详细的质量证书和检测报告。'
    } else if (lowerMessage.includes('发货') || lowerMessage.includes('物流')) {
      return '我们支持全国发货，一般情况下1-3个工作日内发货。支持顺丰、德邦等多种物流方式，确保产品安全送达。'
    } else if (lowerMessage.includes('退换') || lowerMessage.includes('售后')) {
      return '我们提供7天无理由退换货服务。如果收到的产品有质量问题，请及时联系我们，我们会第一时间为您处理。'
    } else if (lowerMessage.includes('注册') || lowerMessage.includes('账号')) {
      return '注册很简单！点击页面右上角的"注册"按钮，填写基本信息即可。注册后您就可以浏览产品、下单采购了。'
    } else if (lowerMessage.includes('支付') || lowerMessage.includes('付款')) {
      return '我们支持多种支付方式：支付宝、微信支付、银行转账等。大额订单还支持货到付款服务。'
    } else {
      const responses = [
        '感谢您的咨询！我已经记录了您的问题，稍后会有专业客服为您详细解答。',
        '这是一个很好的问题！建议您可以浏览我们的帮助中心，或者直接联系在线客服获取更详细的信息。',
        '我理解您的需求。为了给您提供更准确的帮助，建议您登录后在个人中心提交详细的咨询信息。',
        '谢谢您选择我们的平台！如果您有任何其他问题，随时可以联系我们的客服团队。'
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(inputText)
      const botMessage: Message = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Button */}
      <div 
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
        >
          💬 客服
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">在线客服</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 text-xl"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
