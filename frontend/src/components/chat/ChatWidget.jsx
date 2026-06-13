import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare, Loader2, Check, CheckCheck, AlertCircle } from "lucide-react";
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

export default function ChatWidget({ 
  isOpen, 
  onClose, 
  partnerId, 
  partnerName, 
  partnerRole, // "PROVIDER", "CUSTOMER", or "ADMIN"
  conversationType // "CUSTOMER_PROVIDER" or "ADMIN_PROVIDER"
}) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Auto-scroll helper
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Fetch / Create Conversation on mount
  useEffect(() => {
    if (!isOpen || !partnerId) return;

    const setupChat = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get or Create conversation with partner
        const response = await api.post("/chat/conversation", {
          type: conversationType,
          partnerId
        });

        if (response.data.success) {
          const convo = response.data.conversation;
          setConversation(convo);

          // Fetch previous messages
          const msgResponse = await api.get(`/chat/conversations/${convo._id}/messages`);
          if (msgResponse.data.success) {
            setMessages(msgResponse.data.messages);
            setTimeout(() => scrollToBottom("auto"), 50);
          }
        } else {
          setError("Failed to initialize chat session.");
        }
      } catch (err) {
        console.error("Error setting up chat:", err);
        setError("Error opening chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    setupChat();
  }, [isOpen, partnerId, conversationType]);

  // 2. Connect socket and register listeners once conversation is ready
  useEffect(() => {
    if (!conversation?._id) return;

    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    // Join room
    socket.emit("join_conversation", { conversationId: conversation._id });

    // Mark messages as read on join
    socket.emit("mark_read", { conversationId: conversation._id });
    api.put(`/chat/conversations/${conversation._id}/read`).catch(console.error);

    // Socket Event: receive_message
    const handleReceiveMessage = (message) => {
      if (message.conversationId === conversation._id) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTimeout(() => scrollToBottom("smooth"), 50);

        // Mark as read if user is the receiver
        if (message.senderId !== user._id) {
          socket.emit("mark_read", { conversationId: conversation._id });
          api.put(`/chat/conversations/${conversation._id}/read`).catch(console.error);
        }
      }
    };

    // Socket Event: messages_read
    const handleMessagesRead = ({ conversationId, readBy }) => {
      if (conversationId === conversation._id && readBy !== user._id) {
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
  }, [conversation?._id, user?._id]);

  // Track active chat state for notification suppression
  useEffect(() => {
    if (isOpen && conversation?._id) {
      window.activeChatId = conversation._id;
    }
    return () => {
      window.activeChatId = null;
    };
  }, [isOpen, conversation?._id]);

  // Handle Send Message
  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !conversation?._id) return;

    const socket = socketRef.current || getSocket();
    if (socket && socket.connected) {
      socket.emit("send_message", {
        conversationId: conversation._id,
        text: text.trim()
      });
    } else {
      // Fallback to REST API if socket is disconnected
      api.post("/chat/messages", {
        conversationId: conversation._id,
        text: text.trim()
      })
      .then((res) => {
        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.message]);
          setTimeout(() => scrollToBottom("smooth"), 50);
        }
      })
      .catch((err) => {
        console.error("HTTP send fallback failed:", err);
        setError("Network error. Message failed to send.");
      });
    }

    setText("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full h-full sm:w-[400px] sm:h-[600px] bg-white sm:rounded-[24px] shadow-2xl flex flex-col z-[100] border border-slate-100 overflow-hidden animate-scale-in">
      {/* Chat Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-brand-green/20 text-white font-extrabold flex items-center justify-center border border-white/10 flex-shrink-0">
            {partnerName ? partnerName.charAt(0).toUpperCase() : "👤"}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold truncate leading-tight">{partnerName || "Chat"}</h4>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
              {partnerRole === "PROVIDER" ? "Chef / Home Cook" : partnerRole === "ADMIN" ? "Support Admin" : "Customer"}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 flex flex-col min-h-0">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
            <p className="text-xs font-semibold mt-2">Loading conversation...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-rose-500 p-4 text-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-350 shadow-sm mb-3">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h5 className="text-sm font-bold text-slate-800">Start the conversation!</h5>
            <p className="text-xs text-slate-400 max-w-[200px] mt-1 leading-relaxed">
              Send a friendly message to introduce yourself or ask a question.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === user._id;
            const timeString = new Date(msg.createdAt).toLocaleTimeString([], { 
              hour: "2-digit", 
              minute: "2-digit" 
            });

            return (
              <div
                key={msg._id || index}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] ${isMe ? "self-end" : "self-start"}`}
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
                  <span className="text-[9px] font-semibold text-slate-400">{timeString}</span>
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

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white flex gap-2 items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 text-xs font-semibold rounded-full px-4 py-2.5 outline-none transition-all placeholder:text-slate-400"
          disabled={loading || error}
        />
        <button
          type="submit"
          disabled={!text.trim() || loading || error}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-sm ${
            text.trim() && !loading && !error
              ? "bg-slate-900 hover:bg-slate-800 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
