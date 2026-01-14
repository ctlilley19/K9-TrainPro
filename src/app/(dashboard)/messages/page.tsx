'use client';

import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import {
  useConversations,
  useConversation,
  useMessages,
  useSendMessage,
  useMarkMessagesAsRead,
  useCreateConversation,
  useUpdateConversation,
  useMessageTemplates,
  useFamilies,
} from '@/hooks';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Image,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck,
  Dog,
  Clock,
  Archive,
  Pin,
  ChevronDown,
  ChevronLeft,
  FileText,
  X,
} from 'lucide-react';

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useConversations({
    isArchived: false,
    search: searchQuery || undefined,
  });
  const { data: selectedConversation } = useConversation(selectedConversationId || undefined);
  const { data: messages, refetch: refetchMessages } = useMessages(selectedConversationId || undefined);
  const { data: templates } = useMessageTemplates({ isActive: true });
  const { data: families } = useFamilies();

  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesAsRead();
  const createConversation = useCreateConversation();
  const updateConversation = useUpdateConversation();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead.mutate({ conversationId: selectedConversationId, readerType: 'trainer' });
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
        sender_type: 'trainer',
      });
      setMessageInput('');
      refetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleUseTemplate = (content: string) => {
    // Replace placeholders with actual values
    const dogName = selectedConversation?.dog?.name || 'your dog';
    const processedContent = content.replace(/\{dog_name\}/g, dogName);
    setMessageInput(processedContent);
    setShowTemplates(false);
  };

  const handlePinConversation = async (id: string, isPinned: boolean) => {
    await updateConversation.mutateAsync({
      id,
      data: { is_pinned: !isPinned },
    });
  };

  const handleArchiveConversation = async (id: string) => {
    await updateConversation.mutateAsync({
      id,
      data: { is_archived: true },
    });
    if (selectedConversationId === id) {
      setSelectedConversationId(null);
    }
  };

  const selectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowMobileList(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const unreadCount = conversations?.reduce((sum, c) => sum + c.trainer_unread_count, 0) || 0;

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

  return (
    <div>
      <PageHeader
        title="Messages"
        description={unreadCount > 0 ? `${unreadCount} unread` : 'Communicate with pet parents'}
        action={
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setShowNewConversation(true)}
          >
            New Message
          </Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] mt-6">
        {/* Conversations List */}
        <Card
          className={cn(
            'lg:col-span-1 flex flex-col overflow-hidden',
            !showMobileList && 'hidden lg:flex'
          )}
        >
          <div className="p-4 border-b border-white/[0.06]">
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
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
                    onClick={() => selectConversation(conv.id)}
                    className={cn(
                      'w-full flex items-start gap-3 p-4 hover:bg-surface-800/50 transition-colors text-left',
                      selectedConversationId === conv.id && 'bg-surface-800/50'
                    )}
                  >
                    <div className="relative">
                      <Avatar name={conv.family?.name || conv.dog?.name || ''} size="md" />
                      {conv.trainer_unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
                          {conv.trainer_unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white truncate">
                            {conv.family?.name || 'Unknown'}
                          </h3>
                          {conv.is_pinned && (
                            <Pin size={12} className="text-brand-400 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-surface-500">
                          {formatDate(conv.last_message_at)}
                        </span>
                      </div>
                      {conv.dog && (
                        <div className="flex items-center gap-1 text-xs text-surface-500 mt-0.5">
                          <Dog size={10} />
                          {conv.dog.name}
                        </div>
                      )}
                      <p
                        className={cn(
                          'text-sm truncate mt-1',
                          conv.trainer_unread_count > 0
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
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowNewConversation(true)}
                >
                  Start a Conversation
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Messages Area */}
        <Card
          className={cn(
            'lg:col-span-2 flex flex-col overflow-hidden',
            showMobileList && 'hidden lg:flex'
          )}
        >
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="lg:hidden p-2 -ml-2 hover:bg-surface-800 rounded-lg"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <Avatar name={selectedConversation.family?.name || ''} size="md" />
                  <div>
                    <h3 className="font-medium text-white">
                      {selectedConversation.family?.name}
                    </h3>
                    {selectedConversation.dog && (
                      <p className="text-sm text-surface-400 flex items-center gap-1">
                        <Dog size={12} />
                        {selectedConversation.dog.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handlePinConversation(
                        selectedConversation.id,
                        selectedConversation.is_pinned
                      )
                    }
                    className={cn(
                      'p-2 rounded-lg hover:bg-surface-800 transition-colors',
                      selectedConversation.is_pinned && 'text-brand-400'
                    )}
                    title={selectedConversation.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin size={18} />
                  </button>
                  <button
                    onClick={() => handleArchiveConversation(selectedConversation.id)}
                    className="p-2 rounded-lg hover:bg-surface-800 transition-colors text-surface-400"
                    title="Archive"
                  >
                    <Archive size={18} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.map((msg) => {
                  const isTrainer = msg.sender_type === 'trainer';
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex gap-3', isTrainer && 'flex-row-reverse')}
                    >
                      <Avatar
                        name={msg.sender?.name || (isTrainer ? 'Trainer' : 'Parent')}
                        size="sm"
                        className="flex-shrink-0"
                      />
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2',
                          isTrainer
                            ? 'bg-brand-500 text-white rounded-br-md'
                            : 'bg-surface-800 text-white rounded-bl-md'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <div
                          className={cn(
                            'flex items-center gap-1 mt-1 text-xs',
                            isTrainer ? 'text-white/70 justify-end' : 'text-surface-500'
                          )}
                        >
                          <span>{formatTime(msg.created_at)}</span>
                          {isTrainer && (
                            msg.read_by_parent ? (
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

              {/* Quick Replies Toggle */}
              {showTemplates && (
                <div className="px-4 pb-2 border-t border-white/[0.06] pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-surface-400">Quick Replies</span>
                    <button
                      onClick={() => setShowTemplates(false)}
                      className="p-1 hover:bg-surface-800 rounded"
                    >
                      <X size={14} className="text-surface-500" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {templates?.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleUseTemplate(template.content)}
                        className="px-3 py-1.5 rounded-full text-sm bg-surface-800 hover:bg-surface-700 text-surface-300 transition-colors"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t border-white/[0.06]">
                <div className="flex items-end gap-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" title="Attach file">
                      <Paperclip size={18} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" title="Attach image">
                      <Image size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className={showTemplates ? 'text-brand-400' : ''}
                      title="Quick replies"
                    >
                      <FileText size={18} />
                    </Button>
                  </div>
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
                Choose a conversation from the left to view messages
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* New Conversation Modal */}
      <Modal isOpen={showNewConversation} onClose={() => setShowNewConversation(false)}>
        <ModalHeader title="New Conversation" onClose={() => setShowNewConversation(false)} />
        <ModalContent>
          <div className="space-y-4">
            <p className="text-sm text-surface-400">
              Select a family to start a conversation:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {families?.map((family) => (
                <button
                  key={family.id}
                  onClick={async () => {
                    try {
                      const conv = await createConversation.mutateAsync({
                        family_id: family.id,
                      });
                      setSelectedConversationId(conv.id);
                      setShowNewConversation(false);
                      setShowMobileList(false);
                    } catch (error) {
                      console.error('Failed to create conversation:', error);
                    }
                  }}
                  className="w-full p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 text-left transition-colors flex items-center gap-3"
                >
                  <Avatar name={family.name} size="sm" />
                  <div>
                    <p className="font-medium text-white">{family.name}</p>
                    {family.email && (
                      <p className="text-xs text-surface-500">{family.email}</p>
                    )}
                  </div>
                </button>
              ))}
              {(!families || families.length === 0) && (
                <p className="text-center text-surface-500 py-4">
                  No families available
                </p>
              )}
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
