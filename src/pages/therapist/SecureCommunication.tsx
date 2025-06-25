import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Video, 
  MessageSquare, 
  Phone, 
  Send, 
  Paperclip, 
  Calendar,
  Shield,
  Lock,
  Users,
  Search,
  Filter,
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Image,
  Mic,
  X,
  Plus
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'file' | 'appointment' | 'system';
  timestamp: string;
  read: boolean;
  encrypted: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
  emergencyLevel?: 'none' | 'low' | 'medium' | 'high';
}

interface VideoSession {
  id: string;
  clientId: string;
  clientName: string;
  scheduledTime: string;
  duration: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  recordingAvailable?: boolean;
  notes?: string;
}

const SecureCommunication: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [videoSessions, setVideoSessions] = useState<VideoSession[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'video' | 'settings'>('messages');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [currentVideoSession, setCurrentVideoSession] = useState<VideoSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'urgent'>('all');

  const mockConversations: Conversation[] = [
    {
      id: '1',
      participantId: 'client1',
      participantName: 'Sarah Johnson',
      lastMessage: {
        id: 'msg1',
        senderId: 'client1',
        receiverId: 'therapist1',
        content: 'Thank you for the session today. I feel much better about the upcoming presentation.',
        type: 'text',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        encrypted: true
      },
      unreadCount: 2,
      isOnline: true,
      emergencyLevel: 'none'
    },
    {
      id: '2',
      participantId: 'client2',
      participantName: 'Michael Chen',
      lastMessage: {
        id: 'msg2',
        senderId: 'client2',
        receiverId: 'therapist1',
        content: 'I\'ve been having trouble sleeping again. Could we schedule an earlier session?',
        type: 'text',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        encrypted: true
      },
      unreadCount: 1,
      isOnline: false,
      lastSeen: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      emergencyLevel: 'medium'
    },
    {
      id: '3',
      participantId: 'client3',
      participantName: 'Emily Davis',
      lastMessage: {
        id: 'msg3',
        senderId: 'therapist1',
        receiverId: 'client3',
        content: 'How are you feeling after completing the mindfulness exercises?',
        type: 'text',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: true,
        encrypted: true
      },
      unreadCount: 0,
      isOnline: true,
      emergencyLevel: 'none'
    }
  ];

  const mockVideoSessions: VideoSession[] = [
    {
      id: 'v1',
      clientId: 'client1',
      clientName: 'Sarah Johnson',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 50,
      status: 'scheduled'
    },
    {
      id: 'v2',
      clientId: 'client2',
      clientName: 'Michael Chen',
      scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      duration: 50,
      status: 'completed',
      recordingAvailable: true,
      notes: 'Discussed anxiety management techniques'
    },
    {
      id: 'v3',
      clientId: 'client4',
      clientName: 'James Wilson',
      scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 50,
      status: 'scheduled'
    }
  ];

  useEffect(() => {
    loadConversations();
    loadVideoSessions();
  }, []);

  const loadConversations = () => {
    setConversations(mockConversations);
  };

  const loadVideoSessions = () => {
    setVideoSessions(mockVideoSessions);
  };

  const loadMessages = (conversationId: string) => {
    // Mock messages for selected conversation
    const mockMessages: Message[] = [
      {
        id: 'msg1',
        senderId: 'client1',
        receiverId: 'therapist1',
        content: 'Hi Dr. Smith, I wanted to follow up on our session from yesterday.',
        type: 'text',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        encrypted: true
      },
      {
        id: 'msg2',
        senderId: 'therapist1',
        receiverId: 'client1',
        content: 'Hello Sarah! I\'m glad you reached out. How are you feeling today?',
        type: 'text',
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        read: true,
        encrypted: true
      },
      {
        id: 'msg3',
        senderId: 'client1',
        receiverId: 'therapist1',
        content: 'I\'ve been practicing the breathing exercises you taught me. They really help with my anxiety.',
        type: 'text',
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        read: true,
        encrypted: true
      },
      {
        id: 'msg4',
        senderId: 'client1',
        receiverId: 'therapist1',
        content: 'Thank you for the session today. I feel much better about the upcoming presentation.',
        type: 'text',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        encrypted: true
      }
    ];
    setMessages(mockMessages);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'therapist1',
      receiverId: selectedConversation.participantId,
      content: newMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
      read: false,
      encrypted: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation's last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: message }
          : conv
      )
    );
  };

  const startVideoCall = (clientId: string, clientName: string) => {
    const newSession: VideoSession = {
      id: Date.now().toString(),
      clientId,
      clientName,
      scheduledTime: new Date().toISOString(),
      duration: 0,
      status: 'active'
    };
    setCurrentVideoSession(newSession);
    setShowVideoCall(true);
  };

  const endVideoCall = () => {
    if (currentVideoSession) {
      setVideoSessions(prev => 
        prev.map(session => 
          session.id === currentVideoSession.id 
            ? { ...session, status: 'completed' }
            : session
        )
      );
    }
    setShowVideoCall(false);
    setCurrentVideoSession(null);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'unread' && conv.unreadCount > 0) ||
      (filterStatus === 'urgent' && conv.emergencyLevel !== 'none');
    return matchesSearch && matchesFilter;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getEmergencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-green-600" />
              Secure Communication
            </h1>
            <p className="text-gray-600 text-sm mt-1">End-to-end encrypted messaging and video calls</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'messages' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2 inline" />
              Messages
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'video' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Video className="w-4 h-4 mr-2 inline" />
              Video Sessions
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4 mr-2 inline" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {activeTab === 'messages' && (
          <>
            {/* Conversations Sidebar */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-2">
                  {['all', 'unread', 'urgent'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setFilterStatus(filter as any)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        filterStatus === filter 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      loadMessages(conversation.id);
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {conversation.participantName.charAt(0)}
                        </div>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                        )}
                        {conversation.emergencyLevel !== 'none' && (
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                            conversation.emergencyLevel === 'high' ? 'bg-red-500' :
                            conversation.emergencyLevel === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.participantName}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {conversation.lastMessage.encrypted && (
                              <Lock className="w-3 h-3 text-green-600" />
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1">
                            {!conversation.isOnline && conversation.lastSeen && (
                              <span className="text-xs text-gray-400">
                                Last seen {formatTime(conversation.lastSeen)}
                              </span>
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {selectedConversation.participantName.charAt(0)}
                        </div>
                        <div>
                          <h2 className="font-medium text-gray-900">{selectedConversation.participantName}</h2>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.isOnline ? 'Online' : `Last seen ${formatTime(selectedConversation.lastSeen || '')}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startVideoCall(selectedConversation.participantId, selectedConversation.participantName)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Phone className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isFromTherapist = message.senderId === 'therapist1';
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isFromTherapist ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isFromTherapist
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className={`text-xs ${
                                isFromTherapist ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </span>
                              {message.encrypted && (
                                <Lock className={`w-3 h-3 ${
                                  isFromTherapist ? 'text-blue-100' : 'text-green-600'
                                }`} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-end space-x-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-colors">
                        <Mic className="w-5 h-5" />
                      </button>
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          placeholder="Type your message... (encrypted)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={1}
                        />
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Lock className="w-3 h-3 mr-1 text-green-600" />
                      End-to-end encrypted • HIPAA compliant
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a client from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'video' && (
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Video Sessions</h2>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Session
                </button>
              </div>

              {/* Upcoming Sessions */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Upcoming Sessions</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {videoSessions.filter(s => s.status === 'scheduled').map((session) => (
                    <div key={session.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{session.clientName}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(session.scheduledTime).toLocaleString()} • {session.duration} minutes
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startVideoCall(session.clientId, session.clientName)}
                            className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Join
                          </button>
                          <button className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                            <Calendar className="w-4 h-4 mr-1" />
                            Reschedule
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Recent Sessions</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {videoSessions.filter(s => s.status === 'completed').map((session) => (
                    <div key={session.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{session.clientName}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(session.scheduledTime).toLocaleString()} • {session.duration} minutes
                          </p>
                          {session.notes && (
                            <p className="text-sm text-gray-500 mt-1">{session.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {session.recordingAvailable && (
                            <span className="flex items-center text-xs text-green-600">
                              <FileText className="w-3 h-3 mr-1" />
                              Recording Available
                            </span>
                          )}
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 p-6">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Communication Settings</h2>
              
              {/* Security Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Security & Encryption
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">End-to-End Encryption</label>
                      <p className="text-sm text-gray-600">All messages are automatically encrypted</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">HIPAA Compliance</label>
                      <p className="text-sm text-gray-600">Platform meets all HIPAA requirements</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">Message History Retention</label>
                      <p className="text-sm text-gray-600">Messages stored for 7 years (configurable)</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Configure</button>
                  </div>
                </div>
              </div>
              
              {/* Notification Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700">Emergency Messages</label>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700">Session Reminders</label>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700">New Messages</label>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      <AnimatePresence>
        {showVideoCall && currentVideoSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 h-3/4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Video Session with {currentVideoSession.clientName}</h2>
                <button
                  onClick={endVideoCall}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="bg-gray-900 rounded-lg h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Video Call Active</h3>
                  <p className="text-gray-300 mb-6">In a real implementation, this would show the video feed</p>
                  <div className="flex items-center justify-center space-x-4">
                    <button className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
                      <Phone className="w-6 h-6 text-white" />
                    </button>
                    <button className="p-3 bg-gray-600 rounded-full hover:bg-gray-700 transition-colors">
                      <Mic className="w-6 h-6 text-white" />
                    </button>
                    <button className="p-3 bg-gray-600 rounded-full hover:bg-gray-700 transition-colors">
                      <Video className="w-6 h-6 text-white" />
                    </button>
                    <button 
                      onClick={endVideoCall}
                      className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecureCommunication; 