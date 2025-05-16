import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from '../components/ChatBubble';
import ContextMenu from '../components/ContextMenu';
import ChatHistory from '../components/ChatHistory';
import EstimateDebtForm from '../components/EstimateDebtForm';
import NavigationBar from '../components/NavigationBar';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
// Import our API functions instead of using fetch directly
import { ChatMessage, ChatRoom, getUserChatRooms, getChatMessages, sendChatMessage, createChatRoom, updateChatMessage } from '@/lib/api';

// Modified ChatMessage to match our API interface
interface LocalChatMessage {
  id: string | number;
  text: string;
  isUser: boolean;
  archived?: boolean;
  timestamp?: string;
}

const ChatbotPage: React.FC = () => {
  // State variables
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalChatMessage[]>([
    {
      id: 1,
      text: 'How may I assist you?',
      isUser: false,
      archived: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    messageId: string | number | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    messageId: null,
  });
  const [showSidebar, setShowSidebar] = useState(false);
  const [showEstimateForm, setShowEstimateForm] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // New state variables for chat rooms
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle authentication and fetch user's chat rooms
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          // Fetch user's chat rooms
          const rooms = await getUserChatRooms(user.uid);
          setChatRooms(rooms);

          // Select the first room or create one if none exists
          if (rooms.length > 0) {
            setCurrentRoomId(rooms[0].id);
            loadChatMessages(user.uid, rooms[0].id);
          } else {
            // Create a default chat room if none exists
            const newRoom = await createChatRoom(user.uid, 'New Chat');
            setChatRooms([newRoom]);
            setCurrentRoomId(newRoom.id);
          }
        } catch (error) {
          console.error('Failed to fetch chat rooms:', error);
        }
      } else {
        setUserId(null);
        setChatRooms([]);
        setCurrentRoomId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load messages for the current chat room
  const loadChatMessages = async (uid: string, roomId: string) => {
    if (!uid || !roomId) return;

    setIsLoadingMessages(true);
    try {
      const chatMessages = await getChatMessages(uid, roomId);

      // Transform API messages to local format if needed
      const formattedMessages: LocalChatMessage[] = chatMessages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        isUser: msg.isUser,
        archived: msg.archived || false,
        timestamp: msg.timestamp,
      }));

      setMessages(
        formattedMessages.length > 0
          ? formattedMessages
          : [
              {
                id: Date.now(),
                text: getGreeting() + ', how may I assist you with your financial needs today?',
                isUser: false,
                archived: false,
                timestamp: new Date().toISOString(),
              },
            ]
      );
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      // Set a default welcome message on error
      setMessages([
        {
          id: Date.now(),
          text: 'Welcome to DebtBot, your personal financial assistant! How may I help you with your financial goals today?',
          isUser: false,
          archived: false,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Create a new chat room
  const handleCreateNewChat = async () => {
    if (!userId) return;

    try {
      const newRoom = await createChatRoom(userId, `Chat ${chatRooms.length + 1}`);
      setChatRooms([...chatRooms, newRoom]);
      setCurrentRoomId(newRoom.id);

      // Reset messages for new chat
      setMessages([
        {
          id: Date.now(),
          text: getGreeting() + ", I'm your financial assistant. How can I help optimize your finances today?",
          isUser: false,
          archived: false,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to create new chat room:', error);
    }
  };

  // Handler functions
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>, id: string | number) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      messageId: id,
    });
  };

  const handleArchive = async () => {
    if (contextMenu.messageId !== null && userId && currentRoomId) {
      // First update the UI optimistically
      setMessages((prev) => prev.map((msg) => (msg.id === contextMenu.messageId ? { ...msg, archived: true } : msg)));

      // Then update on the server
      try {
        if (typeof contextMenu.messageId === 'string') {
          await updateChatMessage(userId, currentRoomId, contextMenu.messageId, { archived: true });
        }
      } catch (error) {
        console.error('Failed to archive message:', error);
        // Revert the UI change if the server update fails
        setMessages((prev) => prev.map((msg) => (msg.id === contextMenu.messageId ? { ...msg, archived: false } : msg)));
      }

      setContextMenu({ ...contextMenu, visible: false });
    }
  };

  const handleDelete = () => {
    if (contextMenu.messageId !== null) {
      setMessages((prev) => prev.filter((msg) => msg.id !== contextMenu.messageId));
      setContextMenu({ ...contextMenu, visible: false });
      // Note: We would need to add an API call here to delete the message on the server
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const simulateTyping = (text: string) => {
    setTypingIndicator(true);

    // Create a realistic typing delay based on message length
    const typingDelay = Math.min(
      Math.max(1000, text.length * 10), // Between 1-5 seconds based on length
      5000
    );

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setTypingIndicator(false);
        resolve();
      }, typingDelay);
    });
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || !userId || !currentRoomId || isSending) return;

    setIsSending(true);
    const userInput = input;
    const tempId = Date.now(); // Temporary ID for optimistic UI update

    const newUserMessage: LocalChatMessage = {
      id: tempId,
      text: userInput,
      isUser: true,
      archived: false,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update UI
    setMessages((prev) => [...prev, newUserMessage]);
    setInput(''); // Clear input immediately

    // Focus back on input after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Show typing indicator instead of loading message
    setTypingIndicator(true);

    try {
      // Use the API function instead of direct fetch
      const botMessage = await sendChatMessage(userId, currentRoomId, userInput);

      // Simulate realistic typing time
      await simulateTyping(botMessage.text);

      // Add the actual bot response
      const botResponse: LocalChatMessage = {
        id: botMessage.id,
        text: botMessage.text,
        isUser: false,
        archived: false,
        timestamp: botMessage.timestamp,
      };

      setMessages((prev) => [...prev, botResponse]);

      // Update the chat room's last message
      if (chatRooms.length > 0) {
        const updatedRooms = chatRooms.map((room) =>
          room.id === currentRoomId
            ? {
                ...room,
                last_message: userInput,
                last_message_time: new Date().toISOString(),
              }
            : room
        );
        setChatRooms(updatedRooms);
      }
    } catch (error) {
      console.error('Failed to send message or fetch response:', error);
      setTypingIndicator(false);

      const errorMessage: LocalChatMessage = {
        id: Date.now() + 4,
        text: "I'm having trouble connecting right now. Can you check your connection and try again?",
        isUser: false,
        archived: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleEstimateDebt = async (amount: number, term: number, interest: number) => {
    // Make sure we have a user and chat room
    if (!userId || !currentRoomId) {
      console.error('User not logged in or no chat room selected');
      return;
    }

    setIsSending(true);

    // 1. Calculate monthly payment
    const monthlyInterest = interest / 100 / 12;
    const payment = (amount * monthlyInterest) / (1 - Math.pow(1 + monthlyInterest, -term));
    const totalPayment = payment * term;
    const totalInterest = totalPayment - amount;

    const estimationTextForUser = `Here is the debt estimation result: 
- Principal: Rp${amount.toLocaleString()}
- Term: ${term} months
- Annual interest: ${interest}%
- Monthly payment: Rp${payment.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}
- Total interest: Rp${totalInterest.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}
- Total payment: Rp${totalPayment.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;

    // 2. Add the estimation as a USER message (optimistic UI update)
    const tempId = Date.now();
    const userEstimationMessage: LocalChatMessage = {
      id: tempId,
      text: estimationTextForUser,
      isUser: true,
      archived: false,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userEstimationMessage]);
    setShowEstimateForm(false);

    // Show typing indicator
    setTypingIndicator(true);

    try {
      // Use our API function
      const botMessage = await sendChatMessage(userId, currentRoomId, estimationTextForUser);

      // Simulate realistic typing time
      await simulateTyping(botMessage.text);

      // Add bot response
      const botResponse: LocalChatMessage = {
        id: botMessage.id,
        text: botMessage.text,
        isUser: false,
        archived: false,
        timestamp: botMessage.timestamp,
      };

      setMessages((prev) => [...prev, botResponse]);

      // Update the chat room's last message
      if (chatRooms.length > 0) {
        const updatedRooms = chatRooms.map((room) =>
          room.id === currentRoomId
            ? {
                ...room,
                last_message: 'Debt estimation: Rp' + payment.toLocaleString(undefined, { maximumFractionDigits: 0 }) + '/month',
                last_message_time: new Date().toISOString(),
              }
            : room
        );
        setChatRooms(updatedRooms);
      }
    } catch (error) {
      console.error('Failed to send debt estimation message:', error);
      setTypingIndicator(false);

      const errorMessage: LocalChatMessage = {
        id: Date.now() + 2,
        text: "I'm having trouble analyzing your debt estimation right now. Please try again in a moment.",
        isUser: false,
        archived: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
    if (userId && chatId !== currentRoomId) {
      setCurrentRoomId(chatId);
      loadChatMessages(userId, chatId);
    }
    setShowSidebar(false);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Ensure there's an initial message if message list is empty
  useEffect(() => {
    if (messages.length === 0 && !isLoadingMessages) {
      const greeting = getGreeting();
      setMessages([
        {
          id: Date.now(),
          text: `${greeting}! I'm DebtBot, your personal financial assistant. How can I help manage your finances today?`,
          isUser: false,
          archived: false,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [messages, isLoadingMessages]);

  // Click outside handler for context menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.visible && menuButtonRef.current && !menuButtonRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }

      // Close emoji picker when clicking outside
      if (showEmojiPicker && e.target instanceof Element && !e.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible, showEmojiPicker]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, typingIndicator]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl+N for new chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNewChat();
      }

      // Escape to close modals/forms
      if (e.key === 'Escape') {
        if (showEstimateForm) {
          setShowEstimateForm(false);
        }
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showEstimateForm, showEmojiPicker]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 15) return 'Good afternoon';
    if (hour < 19) return 'Good evening';
    return 'Good night';
  };

  // Simple emoji picker component
  const EmojiPicker = () => {
    const emojis = ['😊', '👍', '💰', '📈', '📉', '💳', '💸', '🏦', '💵', '🤔', '👏', '🙏', '❤️', '⭐', '🔥'];
    return (
      <div className="absolute bottom-16 left-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 emoji-picker-container border dark:border-gray-700 z-30">
        <div className="grid grid-cols-5 gap-2">
          {emojis.map((emoji, index) => (
            <button key={index} className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors" onClick={() => handleAddEmoji(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-[100vh] w-full overflow-hidden ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} transition-colors duration-200`}>
      {/* Enhanced Chat History Sidebar with Rooms */}
      {showSidebar && (
        <div
          className={`w-[280px] md:w-[320px] lg:w-[380px] fixed md:relative z-30 h-[100vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r shadow-xl md:shadow-none transition-all`}
        >
          <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="font-medium text-lg md:text-xl">Chat History</h2>
            <div className="flex space-x-2">
              <button className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-app-blue'}`} onClick={handleCreateNewChat} aria-label="New chat">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button className={`p-2 rounded-full md:hidden ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} onClick={() => setShowSidebar(false)} aria-label="Close sidebar">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-2">
            {chatRooms.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>No chat history yet</p>
                <button className={`mt-2 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-app-blue hover:bg-blue-600'} text-white transition-colors`} onClick={handleCreateNewChat}>
                  Start New Chat
                </button>
              </div>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    currentRoomId === room.id ? (theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-app-blue') : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleChatSelect(room.id)}
                >
                  <div className="font-medium">{room.name}</div>
                  {room.last_message && <div className={`text-xs md:text-sm truncate mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{room.last_message}</div>}
                  <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{room.last_message_time && new Date(room.last_message_time).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col w-full h-[100vh] pb-[72px] relative">
        {/* Header */}
        <header className={`flex items-center justify-between h-[60px] px-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} sticky top-0 z-20`}>
          <div className="flex items-center">
            <button className={`h-6 w-6 mr-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} hover:opacity-80 transition-opacity`} onClick={() => setShowSidebar(!showSidebar)} aria-label="Toggle sidebar">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-center">
              <h1 className={`text-lg md:text-xl font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-app-blue'}`}>DebtBot</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              ref={menuButtonRef}
              className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} three-dot-menu`}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setContextMenu({
                  visible: true,
                  x: rect.left - 100,
                  y: rect.bottom + 10,
                  messageId: messages[messages.length - 1]?.id || null,
                });
              }}
              aria-label="Menu"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {/* Chat Area with Enhanced Gradient Background */}
        <div
          ref={chatAreaRef}
          className={`flex-1 overflow-y-auto p-4 flex flex-col ${theme === 'dark' ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-yellow-50 to-blue-50'} text-base md:text-lg`}
          style={{ height: 'calc(100vh - 60px - 140px)' }}
        >
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${theme === 'dark' ? 'border-blue-400' : 'border-app-blue'}`}></div>
            </div>
          ) : (
            <>
              {messages
                .filter((msg) => !msg.archived)
                .map((msg) => (
                  <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} onContextMenu={(e) => handleContextMenu(e, msg.id)} />
                ))}

              {/* Typing indicator */}
              {typingIndicator && (
                <div className={`self-start max-w-[80%] md:max-w-[70%] rounded-lg p-3 mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-sm`}>
                  <div className="flex space-x-1 items-center h-6">
                    <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-app-blue'} animate-pulse`}></div>
                    <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-app-blue'} animate-pulse delay-75`}></div>
                    <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-app-blue'} animate-pulse delay-150`}></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input area with enhanced styling */}
        <div className={`h-[140px] px-4 py-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
          {!showEstimateForm ? (
            <div className={`flex items-center rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} p-2`}>
              <button
                className={`flex items-center justify-center h-8 w-8 rounded-full mr-2 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                aria-label="Add emoji"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c.78 2.34 2.72 4 5 4s4.22-1.66 5-4H7zm9-2c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-7-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>

              {showEmojiPicker && <EmojiPicker />}

              <input
                type="text"
                ref={inputRef}
                className={`flex-1 outline-none px-2 text-base md:text-lg ${theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-800'}`}
                placeholder="Type your message..."
                value={input}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isSending}
              />

              <button
                className={`flex items-center justify-center h-8 px-2 sm:px-3 mr-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-blue-300' : 'bg-gray-100 hover:bg-gray-200 text-app-blue'}`}
                onClick={() => setShowEstimateForm(true)}
                disabled={isSending}
              >
                <span className="text-xs md:text-base whitespace-nowrap">
                  <span className="sm:hidden">$ Est.</span>
                  <span className="hidden sm:inline md:hidden">Estimate</span>
                  <span className="hidden md:inline">Estimate Debt</span>
                </span>
              </button>

              <button
                className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
                  theme === 'dark'
                    ? input.trim()
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : input.trim()
                    ? 'bg-app-blue hover:bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleSendMessage}
                disabled={!input.trim() || isSending}
                aria-label="Send message"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className={`rounded-lg shadow-md p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
              <h3 className={`text-sm md:text-lg mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Ask about your finances</h3>
              <div className="flex items-center">
                <button className={`flex items-center justify-center h-8 w-8 rounded-full mr-2 ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-app-blue text-white'}`}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                <button
                  className={`flex items-center justify-center h-8 px-3 rounded-full border flex-1 mr-2 ${
                    theme === 'dark' ? 'border-gray-600 text-blue-300 bg-gray-800 hover:bg-gray-700' : 'border-gray-300 text-app-blue bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setShowEstimateForm(false)}
                >
                  <span className="mr-1">$</span>
                  <span>Estimate Debt</span>
                  <svg className="h-5 w-5 ml-2 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>

                <button className={`flex items-center justify-center h-8 w-8 rounded-full ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-app-blue text-white'}`}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Quick action buttons */}
          <div className="flex mt-2 overflow-x-auto pb-1 space-x-2 no-scrollbar">
            <button
              className={`whitespace-nowrap px-3 py-1 text-xs rounded-full border ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              onClick={() => {
                setInput("What's the best way to save money?");
                if (inputRef.current) inputRef.current.focus();
              }}
            >
              💰 Saving tips
            </button>
            <button
              className={`whitespace-nowrap px-3 py-1 text-xs rounded-full border ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              onClick={() => {
                setInput('How do I create a budget?');
                if (inputRef.current) inputRef.current.focus();
              }}
            >
              📊 Budgeting help
            </button>
            <button
              className={`whitespace-nowrap px-3 py-1 text-xs rounded-full border ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              onClick={() => {
                setInput("What's debt consolidation?");
                if (inputRef.current) inputRef.current.focus();
              }}
            >
              💳 About debt consolidation
            </button>
            <button
              className={`whitespace-nowrap px-3 py-1 text-xs rounded-full border ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setShowEstimateForm(true)}
            >
              🧮 Calculate payment
            </button>
          </div>
        </div>

        {/* Fixed Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20 w-full">
          <NavigationBar />
        </div>

        {/* Context Menu with theme support */}
        {contextMenu.visible && <ContextMenu x={contextMenu.x} y={contextMenu.y} onArchive={handleArchive} onDelete={handleDelete} />}

        {/* Estimate Debt Form Modal with theme support */}
        {showEstimateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`relative max-w-lg w-full rounded-xl p-5 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-2xl transform transition-all`}>
              <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={() => setShowEstimateForm(false)}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <EstimateDebtForm onClose={() => setShowEstimateForm(false)} onSubmit={handleEstimateDebt} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotPage;
