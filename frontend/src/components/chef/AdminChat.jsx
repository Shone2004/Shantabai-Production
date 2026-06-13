import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, Shield, AlertCircle, Check, CheckCheck } from "lucide-react";
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

export default function AdminChat() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Fetch/Create Admin Conversation on mount
  useEffect(() => {
    const setupAdminChat = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Let backend auto-resolve the ADMIN user ID and find/create convo
        const response = await api.post("/chat/conversation", {
          type: "ADMIN_PROVIDER"
        });

        if (response.data.success) {
          const convo = response.data.conversation;
          setConversation(convo);

          // Fetch messages
          const msgResponse = await api.get(`/chat/conversations/${convo._id}/messages`);
          if (msgResponse.data.success) {
            setMessages(msgResponse.data.messages);
            setTimeout(() => scrollToBottom("auto"), 50);
          }
        }
      } catch (err) {
        console.error("Failed to setup admin chat:", err);
        setError("Unable to open support chat with Admin. Please check back later.");
      } finally {
        setLoading(false);
      }
    };

    setupAdminChat();
  }, []);

  // 2. Setup socket room and event handlers
  useEffect(() => {
    if (!conversation?._id) return;

    const socket = getSocket();
    if (!socket) return;
    socketRef.current = socket;

    // Join room
    socket.emit("join_conversation", { conversationId: conversation._id });

    // Mark as read immediately
    socket.emit("mark_read", { conversationId: conversation._id });
    api.put(`/chat/conversations/${conversation._id}/read`).catch(console.error);

    const handleReceiveMessage = (message) => {
      if (message.conversationId === conversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTimeout(() => scrollToBottom("smooth"), 50);

        if (message.senderId !== user._id) {
          socket.emit("mark_read", { conversationId: conversation._id });
          api.put(`/chat/conversations/${conversation._id}/read`).catch(console.error);
        }
      }
    };

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
    if (conversation?._id) {
      window.activeChatId = conversation._id;
    }
    return () => {
      window.activeChatId = null;
    };
  }, [conversation?._id]);

  // Handle Send Message
  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !conversation?._id) return;

    const socket = socketRef.current || getSocket();
    if (socket && socket.connected) {
      socket.emit("send_message", {
        conversationId: conversation._id,
        text: text.trim(),
      });
    } else {
      // Fallback
      api.post("/chat/messages", {
        conversationId: conversation._id,
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

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[calc(100vh-140px)] overflow-hidden animate-scale-in">
      {/* Active Chat Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center gap-3 flex-shrink-0 text-white">
        <div className="w-10 h-10 rounded-full bg-brand-green/20 text-white font-black flex items-center justify-center flex-shrink-0 border border-slate-800">
          🛡️
        </div>
        <div>
          <h4 className="text-sm font-bold truncate">Shantabai Administration</h4>
          <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
            Internal Support Channel
          </p>
        </div>
      </div>

      {/* Chat History Scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col min-h-0 bg-slate-50/50">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
            <p className="text-xs font-semibold mt-2">Connecting to support channel...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-rose-500 p-4 text-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-350 shadow-sm mb-3">
              <Shield className="w-8 h-8 text-slate-350" />
            </div>
            <h5 className="text-sm font-bold text-slate-800">No Support History</h5>
            <p className="text-xs text-slate-400 max-w-[220px] mt-1 leading-relaxed">
              Introduce yourself here. Administrators will see your messages and reply in real-time.
            </p>
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
          placeholder="Send support message..."
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
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
