import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2, Check, CheckCheck, Search, X } from "lucide-react";
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

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Fetch all conversations for the list panel
  const fetchConversations = async (selectFirstId = null) => {
    try {
      setSidebarLoading(true);
      const res = await api.get("/chat/conversations");
      if (res.data.success) {
        setConversations(res.data.conversations);
        
        if (selectFirstId) {
          const target = res.data.conversations.find(c => c._id === selectFirstId);
          if (target) setActiveConvo(target);
        }
      }
    } catch (err) {
      console.error("Failed to load conversation list panel:", err);
    } finally {
      setSidebarLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 2. Fetch messages whenever the active conversation changes
  useEffect(() => {
    if (!activeConvo?._id) return;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const res = await api.get(`/chat/conversations/${activeConvo._id}/messages`);
        if (res.data.success) {
          setMessages(res.data.messages);
          setTimeout(() => scrollToBottom("auto"), 50);
        }
      } catch (err) {
        console.error("Failed to pull message history:", err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [activeConvo?._id]);

// 3. Setup real-time Socket engine linkages
  useEffect(() => {
    const socket = getSocket(user); // Initializes socket with user context reference
    if (!socket) return;
    socketRef.current = socket;

    const currentUserId = user?.id || user?._id;

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

    // This local handler catches the broadcast from your socket.js file
    const handleCustomIncomingMessage = (event) => {
      const message = event.detail;
      console.log("🎯 UI Layer Caught Message Event:", message);

      // Updates sidebar conversation snippets dynamically
      setConversations(prev => {
        return prev.map(c => {
          const targetConvoId = message.conversationId || message.conversation?._id || message.conversation;
          
          if (String(c._id) === String(targetConvoId)) {
            return {
              ...c,
              lastMessage: typeof message.text === 'string' ? message.text : message.text?.text,
              lastMessageAt: message.createdAt || new Date().toISOString(),
              unreadCount: String(activeConvo?._id) === String(targetConvoId) || String(message.senderId) === String(currentUserId)
                ? c.unreadCount 
                : (c.unreadCount || 0) + 1
            };
          }
          return c;
        });
      });

      // Appends bubble into active main conversation window instantly
      if (activeConvo?._id) {
        const targetConvoId = message.conversationId || message.conversation?._id || message.conversation;
        
        if (String(targetConvoId) === String(activeConvo._id)) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id || (m.clientId && m.clientId === message.clientId))) {
              return prev.map(m => (m.clientId === message.clientId || m._id === message._id) ? message : m);
            }
            return [...prev, message];
          });
          setTimeout(() => scrollToBottom("smooth"), 50);

          if (String(message.senderId) !== String(currentUserId)) {
            socket.emit("mark_read", { conversationId: activeConvo._id });
            api.put(`/chat/conversations/${activeConvo._id}/read`).catch(console.error);
          }
        }
      }
    };

    const handleMessagesRead = ({ conversationId, readBy }) => {
      if (activeConvo?._id && String(conversationId) === String(activeConvo._id) && String(readBy) !== String(currentUserId)) {
        setMessages((prev) =>
          prev.map((msg) => (String(msg.senderId) === String(currentUserId) ? { ...msg, isRead: true } : msg))
        );
      }
    };

    // Listen to our custom unified event layer
    window.addEventListener("socket_message_received", handleCustomIncomingMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      window.removeEventListener("socket_message_received", handleCustomIncomingMessage);
      socket.off("messages_read", handleMessagesRead);
      window.activeChatId = null;
    };
  }, [activeConvo?._id, user?._id, user?.id]);
  
  
  
  
  // 4. Handle Message Send Triggers
  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConvo?._id) return;

    const messageText = text.trim();
    const currentUserId = user?.id || user?._id;
    const tempClientId = Date.now().toString();

    // Create an optimistic local message object so the sender sees their text box update instantly
    const localOptimisticMessage = {
      _id: tempClientId,
      clientId: tempClientId,
      conversationId: activeConvo._id,
      senderId: currentUserId,
      text: messageText,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    // Render text instantly in user bubble container layout
    setMessages((prev) => [...prev, localOptimisticMessage]);
    setTimeout(() => scrollToBottom("smooth"), 50);

    // Update conversational item sidebar summary layout metadata
    setConversations(prev => prev.map(c => c._id === activeConvo._id ? {
      ...c,
      lastMessage: { text: messageText, createdAt: new Date().toISOString() }
    } : c));

    const socket = socketRef.current || getSocket();
    if (socket && socket.connected) {
      socket.emit("send_message", {
        conversationId: activeConvo._id,
        text: messageText,
        clientId: tempClientId // Send ID along to track confirmation
      });
    } else {
      // Offline fallback pipeline using standard API endpoints
      api.post("/chat/messages", {
        conversationId: activeConvo._id,
        text: messageText
      })
      .then((res) => {
        if (res.data.success) {
          setMessages((prev) => 
            prev.map(m => m._id === tempClientId ? res.data.message : m)
          );
        }
      })
      .catch((err) => {
        console.error("HTTP send fallback failed:", err);
      });
    }

    setText("");
  };

  // Updated parsing engine to match your backend's "otherParticipant" payload structure
  const getPartnerDetails = (convo) => {
    if (!convo || !convo.otherParticipant) {
      return { name: "Chat User", kitchenName: "", role: "USER" };
    }

    const oPart = convo.otherParticipant;
    const userData = oPart.user || {};
    const providerData = oPart.providerProfile || {};

    return {
      name: userData.name || "Chat User",
      kitchenName: providerData.kitchenName || "",
      role: userData.role || oPart.role || "USER",
      profileImage: userData.profileImage || null
    };
  };

  const filteredConversations = conversations.filter(convo => {
    const partner = getPartnerDetails(convo);
    
    if (!searchQuery.trim()) return true;

    const nameMatch = partner.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const kitchenMatch = partner.kitchenName?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || kitchenMatch;
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-screen bg-slate-50 overflow-hidden animate-in fade-in duration-200">
      
      {/* SIDEBAR COLUMN: CONVERSATIONS LIST */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 bg-white">
          <h1 className="text-xl font-black text-slate-800 tracking-tight mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-xs font-semibold rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* List Layout Container */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {sidebarLoading ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold">Loading inbox feeds...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
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
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors relative ${isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                >
                  {/* Avatar layout */}
                  <div className="w-11 h-11 rounded-full bg-emerald-800/10 text-emerald-800 font-black flex items-center justify-center border border-emerald-800/5 relative flex-shrink-0">
                    {partner.name ? partner.name.charAt(0).toUpperCase() : "👤"}
                    {hasUnread && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </div>

                  {/* Metadata display layout elements */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className={`text-xs font-bold truncate ${hasUnread ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                        {partner.kitchenName || partner.name}
                      </h4>
                      {lastMsgTime && (
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {new Date(lastMsgTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${hasUnread ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                      {lastMsgText || "Started a new conversation"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CHAT BOARD COLUMN: MESSAGES FEED THREAD CONTAINER */}
      <div className={`flex-1 flex flex-col bg-slate-50 min-w-0 ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
        {activeConvo ? (
          <>
{/* Header section */}
<div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between h-16 shadow-2xs">

  <div className="flex items-center gap-3">
    <button
      onClick={() => setActiveConvo(null)}
      className="md:hidden mr-1 p-2 hover:bg-slate-50 rounded-lg text-slate-500"
    >
      ← Back
    </button>

    <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center flex-shrink-0">
      {getPartnerDetails(activeConvo).name.charAt(0).toUpperCase()}
    </div>

    <div>
      <h3 className="text-xs font-extrabold text-slate-800 leading-tight">
        {getPartnerDetails(activeConvo).kitchenName ||
          getPartnerDetails(activeConvo).name}
      </h3>

      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
        {getPartnerDetails(activeConvo).role === "PROVIDER"
          ? "Chef / Cook Profile"
          : "Client Account"}
      </p>
    </div>
  </div>

  {/* Close Chat Button */}
  <button
    onClick={() => {
      setActiveConvo(null);
      setMessages([]);
    }}
    className="p-2 rounded-full hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all"
    title="Close Chat"
  >
    <X className="w-5 h-5" />
  </button>

</div>

            {/* Content list body layout container frame */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 flex flex-col">
              {messagesLoading ? (
                <div className="h-full flex-1 flex items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-800" />
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = String(msg.senderId) === String(user?.id || user?._id);
                  const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isMe ? "items-end self-end" : "items-start self-start"} max-w-[80%]`}
                    >
                      <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-xs break-words ${isMe ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"}`}>
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[9px] font-semibold text-slate-400">{timeStr}</span>
                        {isMe && (
                          <span>
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

            {/* Input message entry tray panel form controls */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-xs font-semibold rounded-xl px-4 py-2.5 outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-xs flex-shrink-0 cursor-pointer ${text.trim() ? "bg-slate-900 hover:bg-slate-800 text-white" : "bg-slate-50 text-slate-400 cursor-not-allowed"}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-xs mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Your Conversations Board</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
              Select an ongoing thread item from the navigation panel layout to open the interface.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}