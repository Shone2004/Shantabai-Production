import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  ShieldAlert, 
  Calendar, 
  Tag, 
  Clock, 
  Send,
  AlertCircle,
  CheckCircle,
  FileText
} from "lucide-react";
import api from "../../../services/api";
import { getSocket } from "../../../services/socket";

const TicketDetailsModal = ({ ticketId, isOpen, onClose, showToast, formatDateTime, onTicketUpdated }) => {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const chatEndRef = useRef(null);

  // Fetch ticket details
  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/support/tickets/${ticketId}`);
      if (res.data.success) {
        setTicket(res.data.ticket);
        setMessages(res.data.messages);
        
        // Suppress background notifications for this ticket
        window.activeTicketId = ticketId;
      }
    } catch (err) {
      console.error("Error fetching ticket details:", err);
      showToast("error", "Failed to load ticket details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
    }
    return () => {
      window.activeTicketId = null;
    };
  }, [ticketId]);

  // Setup Socket.IO subscription
  useEffect(() => {
    if (!ticket) return;

    const socket = getSocket();
    if (!socket) return;

    // Join room
    socket.emit("join_ticket", { ticketId: ticket._id });

    // Handle incoming messages
    const handleReceiveMessage = (msg) => {
      if (msg.ticketId === ticket._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    // Handle status updates
    const handleStatusUpdated = (data) => {
      if (data.ticketDbId === ticket._id) {
        setTicket((prev) => ({ ...prev, status: data.status }));
      }
    };

    socket.on("receive_ticket_message", handleReceiveMessage);
    socket.on("ticket_status_updated", handleStatusUpdated);

    scrollToBottom();

    return () => {
      socket.off("receive_ticket_message", handleReceiveMessage);
      socket.off("ticket_status_updated", handleStatusUpdated);
    };
  }, [ticket]);

  // Scroll chat window to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message reply
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !ticket) return;

    const text = chatInput.trim();
    setChatInput("");

    try {
      await api.post(`/support/tickets/${ticket._id}/messages`, {
        message: text,
      });
      // The socket event will trigger append locally
    } catch (err) {
      console.error("Failed to send reply:", err);
      showToast("error", "Failed to send message reply");
    }
  };

  // Update status (e.g. from dropdown or quick buttons)
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await api.put(`/support/tickets/${ticket._id}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        setTicket((prev) => ({ ...prev, status: newStatus }));
        showToast("success", `Ticket status updated to ${newStatus}`);
        if (onTicketUpdated) onTicketUpdated();
      }
    } catch (err) {
      console.error("Failed to update ticket status:", err);
      showToast("error", "Failed to update ticket status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Open":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Closed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPriorityBadgeStyle = (prio) => {
    switch (prio) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Low":
        return "bg-slate-50 text-slate-600 border-slate-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-scale-in">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-400 text-xs sm:text-sm">{ticket?.ticketId || "SUP-XXXX"}</span>
            {ticket && (
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(ticket.status)}`}>
                {ticket.status}
              </span>
            )}
            {ticket && (
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadgeStyle(ticket.priority)}`}>
                {ticket.priority} Priority
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          /* Loader */
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading Ticket Data...</p>
          </div>
        ) : (
          /* Modal Content Grid */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* LEFT: Customer & Ticket Info Panel */}
            <div className="w-full md:w-[35%] border-b md:border-b-0 md:border-r border-slate-100 p-5 overflow-y-auto space-y-5 bg-slate-50/30 flex-shrink-0">
              
              {/* Customer Info Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Customer Information</h4>
                <div className="flex items-center gap-3 mb-4">
                  {ticket.customerId?.profileImage ? (
                    <img
                      src={ticket.customerId.profileImage}
                      alt={ticket.customerName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {getInitials(ticket.customerName)}
                    </div>
                  )}
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm leading-tight">{ticket.customerName}</h5>
                    <span className="text-[10px] text-slate-400 font-semibold">{ticket.customerId?.role || "CUSTOMER"} Account</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{ticket.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{ticket.customerId?.phone || "No phone linked"}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-50 text-[11px] text-slate-400">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>User since: {formatDateTime(ticket.customerId?.createdAt).split(" • ")[0]}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Details Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ticket Metadata</h4>
                
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Subject</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{ticket.subject}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">{ticket.category}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Priority</span>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">{ticket.priority}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-50 space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Created: {formatDateTime(ticket.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Updated: {formatDateTime(ticket.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Status / Actions */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ticket Actions</h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Update Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    disabled={updatingStatus}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold bg-white text-slate-700"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => handleUpdateStatus("Resolved")}
                    disabled={updatingStatus || ticket.status === "Resolved"}
                    className="w-full bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-100 hover:border-transparent py-2 rounded-xl text-[10px] font-bold tracking-wide transition cursor-pointer disabled:opacity-50 text-center"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("Closed")}
                    disabled={updatingStatus || ticket.status === "Closed"}
                    className="w-full bg-slate-50 hover:bg-slate-600 text-slate-500 hover:text-white border border-slate-200 hover:border-transparent py-2 rounded-xl text-[10px] font-bold tracking-wide transition cursor-pointer disabled:opacity-50 text-center"
                  >
                    Close Ticket
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Chat Room Conversation */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/20">
              
              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isOwn = msg.senderRole === "ADMIN";
                  return (
                    <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-2xs ${
                        isOwn 
                          ? "bg-indigo-600 text-white rounded-tr-none" 
                          : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        <div className={`text-[9px] mt-1.5 ${isOwn ? "text-indigo-200" : "text-slate-400"} text-right font-medium`}>
                          {formatDateTime(msg.createdAt).split(" • ")[1] || formatDateTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Sticky Message Input Bar */}
              <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0">
                {ticket.status === "Closed" ? (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold">
                    <CheckCircle className="w-4.5 h-4.5 text-slate-400" />
                    <span>This ticket is marked Closed. Re-open the ticket to send a reply.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={1}
                      className="flex-1 border border-slate-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-xs leading-relaxed"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center flex-shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TicketDetailsModal;
