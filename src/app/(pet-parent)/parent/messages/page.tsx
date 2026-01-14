'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  usePetParentConversations,
  useConversation,
  useMessages,
  useSendMessage,
  useMarkMessagesAsRead,
} from '@/hooks';
import {
  MessageSquare,
  Send,
  Search,
  Image,
  Paperclip,
  Check,
  CheckCheck,
  Dog,
  ArrowLeft,
} from 'lucide-react';

export default function ParentMessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showConversations, setShowConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = usePetParentConversations();
  const { data: selectedConversation } = useConversation(selectedConversationId || undefined);
  const { data: messages, refetch: refetchMessages } = useMessages(selectedConversationId || undefined);

  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesAsRead();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead.mutate({ conversationId: selectedConversationId, readerType: 'parent' });
    }
  }, [selectedConversationId]);

  // Auto-select first conversation on load
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    try {
      await sendMessage.mutateAsync({
        conversation_id: selectedConversationId,
        content: messageInput.trim(),
        sender_type: 'parent',
      });
      setMessageInput('');
      refetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowConversations(false);
  };

  const handleBackToList = () => {
    setShowConversations(true);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return formatTime(dateString);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = conversations?.reduce((sum, c) => sum + c.parent_unread_count, 0) || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-surface-400">
          {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : "Chat with your dog's trainers"}
        </p>
      </div>

      <div className="h-[calc(100vh-250px)] min-h-[500px]">
        <Card className="h-full flex flex-col overflow-hidden">
          <div className="flex h-full">
            {/* Conversations List */}
            <div
              className={cn(
                'w-full md:w-80 border-r border-white/[0.06] flex flex-col',
                !showConversations && 'hidden md:flex'
              )}
            >
              <div className="p-4 border-b border-white/[0.06]">
                <h2 className="font-medium text-white">Conversations</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversationsLoading ? (
                  <div className="p-4 text-center text-surface-500">Loading...</div>
                ) : conversations && conversations.length > 0 ? (
                  <div className="divide-y divide-white/[0.06]">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => handleSelectConversation(conv.id)}
                        className={cn(
                          'w-full flex items-start gap-3 p-4 hover:bg-surface-800/50 transition-colors text-left',
                          selectedConversationId === conv.id && 'bg-surface-800/50'
                        )}
                      >
                        <div className="relative">
                          <Avatar name={conv.dog?.name || conv.family?.name || ''} size="md" />
                          {conv.parent_unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
                              {conv.parent_unread_count}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white truncate">
                              {conv.dog?.name || 'General'}
                            </h3>
                            <span className="text-xs text-surface-500">
                              {formatDate(conv.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-surface-400 truncate">
                            {conv.title || 'Training Updates'}
                          </p>
                          <p
                            className={cn(
                              'text-sm truncate mt-1',
                              conv.parent_unread_count > 0
                                ? 'text-white font-medium'
                                : 'text-surface-500'
                            )}
                          >
                            {conv.last_message_preview || 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <MessageSquare size={32} className="mx-auto text-surface-600 mb-3" />
                    <p className="text-surface-500">No conversations yet</p>
                    <p className="text-sm text-surface-600 mt-2">
                      Your trainer will message you here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div
              className={cn(
                'flex-1 flex flex-col',
                showConversations && 'hidden md:flex'
              )}
            >
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-white/[0.06]">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="md:hidden"
                      onClick={handleBackToList}
                    >
                      <ArrowLeft size={18} />
                    </Button>
                    <Avatar name={selectedConversation.dog?.name || ''} size="md" />
                    <div>
                      <h3 className="font-medium text-white">
                        {selectedConversation.dog?.name || 'General'}
                      </h3>
                      <p className="text-sm text-surface-400">
                        {selectedConversation.title || 'Training Updates'}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages?.map((msg) => {
                      const isParent = msg.sender_type === 'parent';
                      return (
                        <div
                          key={msg.id}
                          className={cn('flex gap-3', isParent && 'flex-row-reverse')}
                        >
                          <Avatar
                            name={msg.sender?.name || (isParent ? 'You' : 'Trainer')}
                            size="sm"
                            className="flex-shrink-0"
                          />
                          <div
                            className={cn(
                              'max-w-[80%] rounded-2xl px-4 py-2',
                              isParent
                                ? 'bg-brand-500 text-white rounded-br-md'
                                : 'bg-surface-800 text-white rounded-bl-md'
                            )}
                          >
                            {!isParent && msg.sender?.name && (
                              <p className="text-xs text-surface-400 mb-1">
                                {msg.sender.name}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <div
                              className={cn(
                                'flex items-center gap-1 mt-1 text-xs',
                                isParent ? 'text-white/70 justify-end' : 'text-surface-500'
                              )}
                            >
                              <span>{formatTime(msg.created_at)}</span>
                              {isParent && (
                                msg.read_by_trainer ? (
                                  <CheckCheck size={12} />
                                ) : (
                                  <Check size={12} />
                                )
                              )}
                            </div>
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {msg.reactions.map((r, i) => (
                                  <span key={i} className="text-sm">{r.reaction}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/[0.06]">
                    <div className="flex items-end gap-2">
                      <Button variant="ghost" size="icon-sm" title="Attach file">
                        <Paperclip size={18} />
                      </Button>
                      <Button variant="ghost" size="icon-sm" title="Attach image">
                        <Image size={18} />
                      </Button>
                      <div className="flex-1">
                        <textarea
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type a message..."
                          rows={1}
                          className="w-full px-4 py-3 rounded-xl bg-surface-800 border border-white/[0.06] text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none min-h-[44px] max-h-32"
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendMessage.isPending}
                      >
                        <Send size={18} />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <MessageSquare size={48} className="text-surface-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Select a Conversation
                  </h3>
                  <p className="text-surface-400">
                    Choose a conversation to view messages
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
