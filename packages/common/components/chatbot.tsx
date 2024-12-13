'use client';

import { MessageOutlined, SendOutlined } from '@ant-design/icons';
import { Document } from '@langchain/core/documents';
import { Button, Input, message } from 'antd';
import React, { useState } from 'react';
import { sendRequest } from '../utils/http';
import './chatbot.css';

interface Message {
  content: string;
  reference?: Document[];
  isUser: boolean;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { content: '请问有什么可以帮您的？', reference: [], isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // const [position, setPosition] = useState({
  //   x: 0,
  //   y: 0,
  // });
  // const dragRef = useRef<{
  //   isDragging: boolean;
  //   startX: number;
  //   startY: number;
  //   hasMoved: boolean;
  // }>({
  //   isDragging: false,
  //   startX: 0,
  //   startY: 0,
  //   hasMoved: false,
  // });

  // const handleMouseDown = (e: React.MouseEvent) => {
  //   dragRef.current.isDragging = true;
  //   dragRef.current.startX = e.clientX - position.x;
  //   dragRef.current.startY = e.clientY - position.y;
  //   dragRef.current.hasMoved = false;
  // };

  // const handleMouseMove = (e: MouseEvent) => {
  //   if (!dragRef.current.isDragging) return;
  //   dragRef.current.hasMoved = true;

  //   const newX = e.clientX - dragRef.current.startX;
  //   const newY = e.clientY - dragRef.current.startY;

  //   // 限制不超出视窗边界
  //   const maxX = window.innerWidth - 60; // 按钮宽度
  //   const maxY = window.innerHeight - 60; // 按钮高度

  //   setPosition({
  //     x: Math.min(Math.max(0, newX), maxX),
  //     y: Math.min(Math.max(0, newY), maxY),
  //   });
  // };

  // const handleMouseUp = () => {
  //   dragRef.current.isDragging = false;
  // };

  // React.useEffect(() => {
  //   document.addEventListener('mousemove', handleMouseMove);
  //   document.addEventListener('mouseup', handleMouseUp);
  //   return () => {
  //     document.removeEventListener('mousemove', handleMouseMove);
  //     document.removeEventListener('mouseup', handleMouseUp);
  //   };
  // }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = { content: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const json = await sendRequest<{
        reference: Document[];
        message: string;
      }>('/api/chat', {
        method: 'POST',
        body: { query: input },
      });

      if (json) {
        const botMessage = {
          content: json.message,
          reference: json.reference,
          isUser: false,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      message.error('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // const handleClick = () => {
  //   if (!dragRef.current.hasMoved) {
  //     setIsOpen(!isOpen);
  //   }
  // };

  return (
    <div className="chatbot__wrapper">
      <div
        className="chatbot__dialog"
        style={{
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transform: isOpen ? 'scale(1)' : 'scale(0.8)',
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                marginBottom: '8px',
              }}
            >
              <div
                className={
                  'chatbot__message ' +
                  (msg.isUser
                    ? 'chatbot__message__user'
                    : 'chatbot__message__robot')
                }
              >
                <div style={{ marginBottom: '4px' }}>{msg.content}</div>
                <div>
                  {msg.reference?.map((doc, idx) => (
                    <div key={doc.metadata?.url || idx}>
                      <a
                        href={doc.metadata?.url}
                        style={{ display: 'flex', width: '100%' }}
                      >
                        <span
                          style={{
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={doc.metadata?.pdf?.info?.Title}
                        >
                          {doc.metadata?.pdf?.info?.Title}
                        </span>
                        <span style={{ marginLeft: '8px' }}>
                          P{doc.metadata.loc.pageNumber}.
                          {doc.metadata?.loc?.lines
                            ? `Line 
                          ${doc.metadata.loc.lines.from || 1}-
                          ${doc.metadata.loc.lines.to}`
                            : ''}
                        </span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            placeholder="输入消息..."
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
          />
        </div>
      </div>

      <Button
        className="chatbot__icon"
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined />}
        // onClick={handleClick}
        onClick={() => setIsOpen(!isOpen)}
        // onMouseDown={handleMouseDown}
        // style={{
        //   left: `${position.x}px`,
        //   top: `${position.y}px`,
        // }}
      />
    </div>
  );
};

export default Chatbot;
