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

  // New state variables for chat rooms
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
                text: getGreeting() + ', how may I assist you?',
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
          text: 'Welcome to DebtBot! How may I assist you today?',
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
          text: getGreeting() + ', how may I assist you with your finances?',
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

  const handleSendMessage = async () => {
    if (input.trim() === '' || !userId || !currentRoomId) return;

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

    const loadingBotMessageId = tempId + 1; // Unique ID
    const loadingBotMessage: LocalChatMessage = {
      id: loadingBotMessageId,
      text: 'Thinking...',
      isUser: false,
      archived: false,
    };
    setMessages((prev) => [...prev, loadingBotMessage]);

    try {
      // Use the API function instead of direct fetch
      const botMessage = await sendChatMessage(userId, currentRoomId, userInput);

      // Remove the loading message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingBotMessageId));

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
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingBotMessageId));
      const errorMessage: LocalChatMessage = {
        id: Date.now() + 4,
        text: "Sorry, I couldn't connect to the server. Please check your connection or if the backend is running.",
        isUser: false,
        archived: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleEstimateDebt = async (amount: number, term: number, interest: number) => {
    // Make sure we have a user and chat room
    if (!userId || !currentRoomId) {
      console.error('User not logged in or no chat room selected');
      return;
    }

    // 1. Calculate monthly payment
    const monthlyInterest = interest / 100 / 12;
    const payment = (amount * monthlyInterest) / (1 - Math.pow(1 + monthlyInterest, -term));

    const estimationTextForUser = `Here is the debt estimation result: Debt amount Rp${amount.toLocaleString()}, Term ${term} months, Annual interest ${interest}%. The estimated monthly payment is Rp${payment.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}. What do you think?`;

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

    // 3. Send this message via our API and get bot response
    const loadingId = tempId + 1;
    const loadingMessage: LocalChatMessage = {
      id: loadingId,
      text: 'Thinking about your estimation...',
      isUser: false,
      archived: false,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Use our API function
      const botMessage = await sendChatMessage(userId, currentRoomId, estimationTextForUser);

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingId));

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
                last_message: estimationTextForUser.substring(0, 50) + '...',
                last_message_time: new Date().toISOString(),
              }
            : room
        );
        setChatRooms(updatedRooms);
      }
    } catch (error) {
      console.error('Failed to send debt estimation message:', error);
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingId));
      const errorMessage: LocalChatMessage = {
        id: Date.now() + 2,
        text: "Sorry, I couldn't connect to the server to discuss your debt estimation.",
        isUser: false,
        archived: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleChatSelect = (chatId: string) => {
    if (userId && chatId !== currentRoomId) {
      setCurrentRoomId(chatId);
      loadChatMessages(userId, chatId);
    }
    setShowSidebar(false);
  };

  // Ensure there's an initial message if message list is empty
  useEffect(() => {
    if (messages.length === 0 && !isLoadingMessages) {
      const greeting = getGreeting();
      setMessages([
        {
          id: Date.now(),
          text: `${greeting}, how may I assist you?`,
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
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 15) return 'Good afternoon';
    if (hour < 19) return 'Good evening';
    return 'Good night';
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Enhanced Chat History Sidebar with Rooms */}
      {showSidebar && (
        <div className="w-64 bg-white border-r h-full overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-medium text-lg md:text-xl">Chat History</h2>
            <button className="p-1 rounded-full hover:bg-gray-100" onClick={handleCreateNewChat}>
              <svg className="w-5 h-5 text-app-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="p-2">
            {chatRooms.map((room) => (
              <div key={room.id} className={`p-3 rounded-lg mb-2 cursor-pointer ${currentRoomId === room.id ? 'bg-blue-50 text-app-blue' : 'hover:bg-gray-50'}`} onClick={() => handleChatSelect(room.id)}>
                <div className="font-medium">{room.name}</div>
                {room.last_message && <div className="text-xs md:text-lg text-gray-500 truncate mt-1">{room.last_message}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 relative pb-[72px]">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <button className="h-6 w-6 mr-3 text-gray-500" onClick={() => setShowSidebar(!showSidebar)}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="text-lg md:text-xl font-medium text-app-blue">DebtBot</h1>
          </div>
          <button
            ref={menuButtonRef}
            className="h-6 w-6 text-gray-500 three-dot-menu"
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
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* Chat Area with Yellow Gradient Background */}
        <div ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 flex flex-col bg-chat-gradient text-base md:text-xl">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-blue"></div>
            </div>
          ) : (
            messages.filter((msg) => !msg.archived).map((msg) => <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} onContextMenu={(e) => handleContextMenu(e, msg.id)} />)
          )}
        </div>

        {/* Input area */}
        <div className="p-3 bg-white border-t">
          {!showEstimateForm ? (
            <div className="flex items-center bg-white rounded-lg border p-2">
              <input type="text" className="flex-1 outline-none px-2 text-base md:text-xl" placeholder="Ketikkan pesan..." value={input} onChange={handleInputChange} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />

              <button className="flex items-center justify-center h-8 px-3 mr-2 rounded-full bg-gray-100 hover:bg-gray-200 text-app-blue" onClick={() => setShowEstimateForm(true)}>
                <span className="mr-1">$</span>
                <span className="text-base md:text-xl">Estimate Debt</span>
              </button>

              <button className="flex items-center justify-center h-8 w-8 rounded-full text-app-blue" onClick={handleSendMessage}>
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="rounded-lg bg-white shadow-md p-4">
              <h3 className="text-sm md:text-xl text-gray-500 mb-2">Ask about your finances</h3>
              <div className="flex items-center">
                <button className="flex items-center justify-center h-8 w-8 rounded-full bg-app-blue text-white mr-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                <button className="flex items-center justify-center h-8 px-3 rounded-full border text-app-blue flex-1 mr-2 bg-white" onClick={() => setShowEstimateForm(false)}>
                  <span className="mr-1">$</span>
                  <span>Estimate Debt</span>
                  <svg className="h-5 w-5 ml-2 text-app-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>

                <button className="flex items-center justify-center h-8 w-8 rounded-full bg-app-blue text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-20 w-full">
          <NavigationBar />
        </div>

        {/* Context Menu */}
        {contextMenu.visible && <ContextMenu x={contextMenu.x} y={contextMenu.y} onArchive={handleArchive} onDelete={handleDelete} />}

        {/* Estimate Debt Form Modal */}
        {showEstimateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <EstimateDebtForm onClose={() => setShowEstimateForm(false)} onSubmit={handleEstimateDebt} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotPage;
