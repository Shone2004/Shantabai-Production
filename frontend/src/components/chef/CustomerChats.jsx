import React, { useState, useEffect, useRef } from "react";
import { Send, Search, MessageSquare, Loader2, ArrowLeft, Check, CheckCheck } from "lucide-react";
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

export default function CustomerChats() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Load conversation list on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/chat/conversations");
        if (res.data.success) {
          // Filter to only CUSTOMER_PROVIDER chats
          const customerChats = res.data.conversations.filter(
            (c) => c.type === "CUSTOMER_PROVIDER"
          );
          setConversations(customerChats);
        }
      } catch (err) {
        console.error("Error loading conversations:", err);
      } finally {
        setListLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // 2. Setup socket connection and event routing
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    // Listen for incoming messages (updating lists or active chat)
    const handleReceiveMessage = (message) => {
      // If the message is for the currently open conversation
      if (selectedConvo && message.conversationId === selectedConvo._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTimeout(() => scrollToBottom("smooth"), 50);

        // Notify socket/backend read
        if (message.senderId !== user._id) {
          socket.emit("mark_read", { conversationId: selectedConvo._id });
          api.put(`/chat/conversations/${selectedConvo._id}/read`).catch(console.error);
        }
      }

      // Update the conversation list metadata in real-time
      setConversations((prevList) =>
        prevList
          .map((convo) => {
            if (convo._id === message.conversationId) {
              return {
                ...convo,
                lastMessage: message.text,
                lastMessageAt: message.createdAt,
                unreadCount:
                  selectedConvo && selectedConvo._id === message.conversationId
                    ? 0
                    : message.senderId !== user._id
                    ? (convo.unreadCount || 0) + 1
                    : convo.unreadCount,
              };
            }
            return convo;
          })
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    };

    const handleMessagesRead = ({ conversationId, readBy }) => {
      if (selectedConvo && conversationId === selectedConvo._id && readBy !== user._id) {
        setMessages((prev) =>
          prev.map((msg) => (msg.senderId === user._id ? { ...msg, isRead: true } : msg))
        );
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [selectedConvo?._id, user?._id]);

  // 3. Load messages when selected conversation changes
  useEffect(() => {
    if (!selectedConvo?._id) return;

    const loadMessages = async () => {
      setChatLoading(true);
      try {
        const res = await api.get(`/chat/conversations/${selectedConvo._id}/messages`);
        if (res.data.success) {
          setMessages(res.data.messages);
          setTimeout(() => scrollToBottom("auto"), 50);

          // Mark as read
          const socket = socketRef.current || getSocket();
          if (socket) {
            socket.emit("join_conversation", { conversationId: selectedConvo._id });
            socket.emit("mark_read", { conversationId: selectedConvo._id });
          }
          await api.put(`/chat/conversations/${selectedConvo._id}/read`);
          
          // Reset unread count locally
          setConversations((prev) =>
            prev.map((c) => (c._id === selectedConvo._id ? { ...c, unreadCount: 0 } : c))
          );
        }
      } catch (err) {
        console.error("Error loading chat messages:", err);
      } finally {
        setChatLoading(false);
      }
    };

    loadMessages();
  }, [selectedConvo?._id]);

  // Track active chat state for notification suppression
  useEffect(() => {
    if (selectedConvo?._id) {
      window.activeChatId = selectedConvo._id;
    }
    return () => {
      window.activeChatId = null;
    };
  }, [selectedConvo?._id]);

  // Handle send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedConvo?._id) return;

    const socket = socketRef.current || getSocket();
    if (socket && socket.connected) {
      socket.emit("send_message", {
        conversationId: selectedConvo._id,
        text: text.trim(),
      });
    } else {
      // Fallback
      api.post("/chat/messages", {
        conversationId: selectedConvo._id,
        text: text.trim(),
      }).then((res) => {
        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.message]);
          setTimeout(() => scrollToBottom("smooth"), 50);
        }
      }).catch(console.error);
    }

    setText("");
  };

  // Filter conversations by search query
  const filteredConvos = conversations.filter((c) =>
    (c.otherParticipant?.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex h-[calc(100vh-140px)] overflow-hidden animate-fade-in">
      {/* List Panel (Conversations) */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col ${
          selectedConvo ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-slate-50 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-xs font-semibold rounded-full outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {listLoading ? (
            <div className="p-8 text-center text-slate-400 animate-pulse">
              Loading chat sessions...
            </div>
          ) : filteredConvos.length === 0 ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
              <MessageSquare className="w-8 h-8 text-slate-350 mb-2" />
              <p className="text-xs font-bold">No Conversations Found</p>
              <p className="text-[10px] text-slate-400 max-w-[200px] mt-1 leading-normal">
                Customer chats will appear here when they request order details or message you.
              </p>
            </div>
          ) : (
            filteredConvos.map((convo) => {
              const other = convo.otherParticipant?.user;
              const isSelected = selectedConvo?._id === convo._id;
              const hasUnread = convo.unreadCount > 0;
              const lastMessageTime = convo.lastMessageAt
                ? new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";

              return (
                <button
                  key={convo._id}
                  onClick={() => setSelectedConvo(convo)}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-colors hover:bg-slate-50 border-l-4 cursor-pointer ${
                    isSelected ? "bg-slate-50/70 border-slate-900" : "border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-green/20 text-slate-900 font-black flex items-center justify-center flex-shrink-0">
                    {other?.name ? other.name.charAt(0).toUpperCase() : "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h5 className={`text-xs font-bold truncate ${hasUnread ? "text-slate-950 font-black" : "text-slate-700"}`}>
                        {other?.name || "Customer"}
                      </h5>
                      <span className="text-[9px] text-slate-400 font-semibold">{lastMessageTime}</span>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${hasUnread ? "text-slate-900 font-bold" : "text-slate-400"}`}>
                      {convo.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {hasUnread && (
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                      {convo.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Panel (Messages) */}
      <div
        className={`flex-1 flex flex-col bg-slate-50/50 ${
          !selectedConvo ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConvo ? (
          <>
            {/* Active Chat Header */}
            <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setSelectedConvo(null)}
                className="md:hidden p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 cursor-pointer"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-full bg-brand-green/20 text-slate-900 font-black flex items-center justify-center flex-shrink-0">
                {selectedConvo.otherParticipant?.user?.name ? selectedConvo.otherParticipant.user.name.charAt(0).toUpperCase() : "👤"}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-800 truncate">
                  {selectedConvo.otherParticipant?.user?.name || "Customer"}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                  Customer Reservation
                </p>
              </div>
            </div>

            {/* Chat History Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col min-h-0">
              {chatLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
                  <p className="text-xs font-semibold mt-2">Loading chat history...</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === user._id;
                  const time = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] ${
                        isMe ? "self-end" : "self-start"
                      }`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm break-words ${
                          isMe
                            ? "bg-slate-900 text-white rounded-tr-none"
                            : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[9px] font-semibold text-slate-400">{time}</span>
                        {isMe && (
                          <span className="text-slate-400">
                            {msg.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Sticky Chat Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex gap-2 items-center flex-shrink-0">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-xs font-semibold rounded-full px-4 py-2.5 outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!text.trim() || chatLoading}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-sm ${
                  text.trim() && !chatLoading
                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-350 shadow-sm mb-3">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h5 className="text-sm font-bold text-slate-800">No Chat Selected</h5>
            <p className="text-xs text-slate-400 max-w-[220px] mt-1 leading-relaxed">
              Choose a customer conversation from the list to start messaging in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
