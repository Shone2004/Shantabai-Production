import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Send, MessageSquare, Loader2, Check, CheckCheck, Search, X, ArrowLeft } from "lucide-react";
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

export default function ChatSection() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const currentUserId = useMemo(() => user?.id || user?._id, [user]);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // 1. Fetch conversations pool
  const fetchConversations = useCallback(async (selectFirstId = null) => {
    try {
      setSidebarLoading(true);
      const res = await api.get("/chat/conversations");
      if (res.data?.success) {
        const convos = res.data.conversations || [];
        setConversations(convos);
        
        if (selectFirstId) {
          const target = convos.find(c => c._id === selectFirstId);
          if (target) setActiveConvo(target);
        }
      }
    } catch (err) {
      console.error("Failed to load conversation list panel:", err);
    } finally {
      setSidebarLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Fetch message history on selection shift
  useEffect(() => {
    if (!activeConvo?._id) return;

    let isMounted = true;
    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const res = await api.get(`/chat/conversations/${activeConvo._id}/messages`);
        if (res.data?.success && isMounted) {
          setMessages(res.data.messages || []);
          requestAnimationFrame(() => scrollToBottom("auto"));
        }
      } catch (err) {
        console.error("Failed to pull message history:", err);
      } finally {
        if (isMounted) setMessagesLoading(false);
      }
    };

    fetchMessages();
    return () => { isMounted = false; };
  }, [activeConvo?._id, scrollToBottom]);

  // 3. Real-time Synchronization Engine
  useEffect(() => {
    const socket = getSocket(user);
    if (!socket) return;
    socketRef.current = socket;

    if (activeConvo?._id) {
      socket.emit("join_conversation", { conversationId: activeConvo._id });
      socket.emit("mark_read", { conversationId: activeConvo._id });
      
      api.put(`/chat/conversations/${activeConvo._id}/read`)
        .then(() => {
          setConversations(prev => prev.map(c => c._id === activeConvo._id ? { ...c, unreadCount: 0 } : c));
        })
        .catch(console.error);
        
      window.activeChatId = activeConvo._id;
    }

    const handleCustomIncomingMessage = (event) => {
      const message = event.detail;
      if (!message) return;

      const targetConvoId = message.conversationId || message.conversation?._id || message.conversation;
      const extractedText = typeof message.text === 'string' ? message.text : message.text?.text || "";

      setConversations(prev => prev.map(c => {
        if (String(c._id) === String(targetConvoId)) {
          const isCurrentActive = String(activeConvo?._id) === String(targetConvoId);
          const isSelf = String(message.senderId) === String(currentUserId);
          return {
            ...c,
            lastMessage: extractedText,
            lastMessageAt: message.createdAt || new Date().toISOString(),
            unreadCount: isCurrentActive || isSelf ? c.unreadCount : (c.unreadCount || 0) + 1
          };
        }
        return c;
      }));

      if (activeConvo?._id && String(targetConvoId) === String(activeConvo._id)) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id || (m.clientId && m.clientId === message.clientId));
          if (exists) {
            return prev.map(m => (m.clientId === message.clientId || m._id === message._id) ? message : m);
          }
          return [...prev, message];
        });
        requestAnimationFrame(() => scrollToBottom("smooth"));

        if (String(message.senderId) !== String(currentUserId)) {
          socket.emit("mark_read", { conversationId: activeConvo._id });
          api.put(`/chat/conversations/${activeConvo._id}/read`).catch(console.error);
        }
      }
    };

    const handleMessagesRead = ({ conversationId, readBy }) => {
      if (activeConvo?._id && String(conversationId) === String(activeConvo._id) && String(readBy) !== String(currentUserId)) {
        setMessages(prev => prev.map(msg => String(msg.senderId) === String(currentUserId) ? { ...msg, isRead: true } : msg));
      }
    };

    window.addEventListener("socket_message_received", handleCustomIncomingMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      window.removeEventListener("socket_message_received", handleCustomIncomingMessage);
      socket.off("messages_read", handleMessagesRead);
      window.activeChatId = null;
    };
  }, [activeConvo?._id, currentUserId, user, scrollToBottom]);

  // 4. Message Dispatch Handlers
  const handleSend = (e) => {
    e.preventDefault();
    const messageText = text.trim();
    if (!messageText || !activeConvo?._id) return;

    const tempClientId = Date.now().toString();
    const localOptimisticMessage = {
      _id: tempClientId,
      clientId: tempClientId,
      conversationId: activeConvo._id,
      senderId: currentUserId,
      text: messageText,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, localOptimisticMessage]);
    requestAnimationFrame(() => scrollToBottom("smooth"));

    setConversations(prev => prev.map(c => c._id === activeConvo._id ? {
      ...c,
      lastMessage: messageText,
      lastMessageAt: new Date().toISOString()
    } : c));

    const socket = socketRef.current || getSocket();
    if (socket?.connected) {
      socket.emit("send_message", {
        conversationId: activeConvo._id,
        text: messageText,
        clientId: tempClientId
      });
    } else {
      api.post("/chat/messages", { conversationId: activeConvo._id, text: messageText })
        .then(res => {
          if (res.data?.success) {
            setMessages(prev => prev.map(m => m._id === tempClientId ? res.data.message : m));
          }
        })
        .catch(err => console.error("HTTP send fallback failed:", err));
    }

    setText("");
  };

  const getPartnerDetails = useCallback((convo) => {
    if (!convo?.otherParticipant) {
      return { name: "Chat User", kitchenName: "", role: "USER", profileImage: null };
    }
    const { user: userData = {}, providerProfile = {}, role } = convo.otherParticipant;
    return {
      name: userData.name || "Chat User",
      kitchenName: providerProfile.kitchenName || "",
      role: userData.role || role || "USER",
      profileImage: userData.profileImage || null
    };
  }, []);

  const filteredConversations = useMemo(() => {
    return conversations.filter(convo => {
      if (!searchQuery.trim()) return true;
      const partner = getPartnerDetails(convo);
      const query = searchQuery.toLowerCase();
      return partner.name?.toLowerCase().includes(query) || partner.kitchenName?.toLowerCase().includes(query);
    });
  }, [conversations, searchQuery, getPartnerDetails]);

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-screen bg-slate-50 overflow-hidden subpixel-antialiased">
      
      {/* SIDEBAR CONTAINER */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transition-all ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 bg-white">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm rounded-lg pl-9 pr-4 py-2 outline-none transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {sidebarLoading ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
              <p className="text-sm font-medium">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((convo) => {
              const partner = getPartnerDetails(convo);
              const isSelected = activeConvo?._id === convo._id;
              const hasUnread = convo.unreadCount > 0;
              const lastMsgText = typeof convo.lastMessage === "object" ? convo.lastMessage?.text : convo.lastMessage;
              const lastMsgTime = convo.lastMessage?.createdAt || convo.lastMessageAt;

              return (
                <div
                  key={convo._id}
                  onClick={() => setActiveConvo(convo)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 font-semibold flex items-center justify-center border border-slate-200 relative flex-shrink-0">
                    {partner.name ? partner.name.charAt(0).toUpperCase() : "👤"}
                    {hasUnread && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className={`text-sm truncate ${hasUnread ? 'text-slate-900 font-semibold' : 'text-slate-700 font-medium'}`}>
                        {partner.kitchenName || partner.name}
                      </h4>
                      {lastMsgTime && (
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {new Date(lastMsgTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${hasUnread ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                      {lastMsgText || "New conversation started"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* WINDOW VIEWPORTS */}
      <div className={`flex-1 flex flex-col bg-slate-50 min-w-0 ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
        {activeConvo ? (
          <>
            {/* Header section */}
            <div className="bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveConvo(null)}
                  className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center flex-shrink-0">
                  {getPartnerDetails(activeConvo).name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate leading-snug">
                    {getPartnerDetails(activeConvo).kitchenName || getPartnerDetails(activeConvo).name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {getPartnerDetails(activeConvo).role === "PROVIDER" ? "Service Provider" : "Client"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setActiveConvo(null); setMessages([]); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bubble Thread panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 flex flex-col">
              {messagesLoading ? (
                <div className="h-full flex-1 flex items-center justify-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = String(msg.senderId) === String(currentUserId);
                  const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isMe ? "items-end self-end" : "items-start self-start"} max-w-[75%]`}
                    >
                      <div className={`px-4 py-2 rounded-xl text-sm leading-relaxed break-words shadow-2xs ${isMe ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"}`}>
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">{timeStr}</span>
                        {isMe && (
                          <span>
                            {msg.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-600 stroke-[2]" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
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

            {/* Form Entry Panel Tray */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm rounded-lg px-4 py-2 outline-none transition-all placeholder:text-slate-400 text-slate-800"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${text.trim() ? "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer" : "bg-slate-50 text-slate-300 cursor-not-allowed"}`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">No conversation selected</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1 leading-normal">
              Select an item from your inbox thread panel list to view messaging logs and details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}