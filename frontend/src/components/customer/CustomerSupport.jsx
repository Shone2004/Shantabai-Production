import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  LifeBuoy, 
  Send, 
  ArrowLeft, 
  AlertCircle, 
  Clock, 
  Tag, 
  CheckCircle,
  MessageSquare,
  Search,
  Plus,
  X,
  Inbox,
  Sparkles
} from "lucide-react";
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

const CustomerSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  
  // Create Ticket Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Booking Issue");
  const [priority, setPriority] = useState("Low");
  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const chatEndRef = useRef(null);

  // Keep references to state values in refs so popstate listener always has access to latest values
  const stateRef = useRef({ isCreateOpen, subject, messageText, activeTicket });
  useEffect(() => {
    stateRef.current = { isCreateOpen, subject, messageText, activeTicket };
  }, [isCreateOpen, subject, messageText, activeTicket]);

  // Scroll lock when modal overlays are active
  useEffect(() => {
    if (isCreateOpen || activeTicket) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCreateOpen, activeTicket]);

  // Handle hardware back button popstate listener
  useEffect(() => {
    const handlePopState = (e) => {
      const current = stateRef.current;
      
      // If create ticket modal was open and user pressed back
      if (current.isCreateOpen && window.location.hash !== "#create-support") {
        if (current.subject.trim() || current.messageText.trim()) {
          const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
          if (!confirmDiscard) {
            // Push history state back so hash remains and modal stays open
            window.history.pushState({ modal: "create" }, "", "#create-support");
            return;
          }
        }
        setIsCreateOpen(false);
        setSubject("");
        setMessageText("");
      }

      // If chat modal was open and user pressed back
      if (current.activeTicket && !window.location.hash.startsWith("#chat-")) {
        setActiveTicket(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/support/tickets");
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error("Error fetching support tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    const handleNotificationAlert = () => {
      fetchTickets();
    };

    window.addEventListener("support_notification_alert", handleNotificationAlert);
    return () => {
      window.removeEventListener("support_notification_alert", handleNotificationAlert);
    };
  }, []);

  // Open & Close ticket creation modal (with history push/pop)
  const handleOpenCreate = () => {
    setFormError("");
    setFormSuccess("");
    setIsCreateOpen(true);
    window.history.pushState({ modal: "create" }, "", "#create-support");
  };

  const handleCloseCreate = () => {
    if (subject.trim() || messageText.trim()) {
      const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
      if (!confirmDiscard) {
        return;
      }
    }
    setIsCreateOpen(false);
    setSubject("");
    setMessageText("");
    if (window.location.hash === "#create-support") {
      window.history.back();
    }
  };

  // Open & Close ticket chat details modal (with history push/pop)
  const openTicketChat = async (ticket) => {
    try {
      const res = await api.get(`/support/tickets/${ticket._id}`);
      if (res.data.success) {
        setActiveTicket(res.data.ticket);
        setMessages(res.data.messages);
        window.activeTicketId = ticket._id;
        window.history.pushState({ modal: "chat" }, "", `#chat-${ticket._id}`);
      }
    } catch (err) {
      console.error("Error opening ticket chat:", err);
    }
  };

  const handleCloseChat = () => {
    setActiveTicket(null);
    if (window.location.hash.startsWith("#chat-")) {
      window.history.back();
    }
  };

  // Socket Connection for Chat
  useEffect(() => {
    if (!activeTicket) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("join_ticket", { ticketId: activeTicket._id });

    const handleReceiveMessage = (msg) => {
      if (msg.ticketId === activeTicket._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleStatusUpdated = (data) => {
      if (data.ticketDbId === activeTicket._id) {
        setActiveTicket((prev) => ({ ...prev, status: data.status }));
      }
    };

    socket.on("receive_ticket_message", handleReceiveMessage);
    socket.on("ticket_status_updated", handleStatusUpdated);

    scrollToBottom();

    return () => {
      socket.off("receive_ticket_message", handleReceiveMessage);
      socket.off("ticket_status_updated", handleStatusUpdated);
      window.activeTicketId = null;
    };
  }, [activeTicket]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Submit Ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!subject.trim() || !messageText.trim()) {
      setFormError("Subject and Message details are required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/support/tickets", {
        subject: subject.trim(),
        category,
        priority,
        message: messageText.trim(),
      });

      if (res.data.success) {
        setFormSuccess("Support ticket created successfully!");
        setSubject("");
        setMessageText("");
        setCategory("Booking Issue");
        setPriority("Low");
        fetchTickets();
        
        // Open chat for the created ticket (remove create hash before opening chat hash)
        if (res.data.ticket) {
          setTimeout(() => {
            setIsCreateOpen(false);
            if (window.location.hash === "#create-support") {
              window.history.back();
            }
            openTicketChat(res.data.ticket);
          }, 800);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit support ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeTicket) return;

    const text = chatInput.trim();
    setChatInput("");

    try {
      await api.post(`/support/tickets/${activeTicket._id}/messages`, {
        message: text,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>Open</span>;
      case "In Progress":
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Active</span>;
      case "Resolved":
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Resolved</span>;
      case "Closed":
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>Closed</span>;
      default:
        return null;
    }
  };

  const getPriorityStyle = (prio) => {
    switch (prio) {
      case "High":
        return "text-red-600 bg-red-50 border-red-100";
      case "Medium":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "Low":
        return "text-slate-500 bg-slate-50 border-slate-100";
      default:
        return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getAvatarInitials = (subject) => {
    if (!subject) return "S";
    return subject.trim().substring(0, 2).toUpperCase();
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = 
      ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "All" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-6 py-4 space-y-6 animate-fade-in">
      
      {/* 1. COMPACT TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-brand-green" />
            Support Center
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Browse active conversations or create a new support request.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-brand-green hover:bg-[#083d22] text-white px-5 py-2.5 rounded-2xl font-bold tracking-wide transition shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Request</span>
        </button>
      </div>

      {/* 2. CONVERSATION LIST & SEARCH FILTERS */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Search & Filter pills */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversations</span>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green font-medium w-full sm:w-44"
              />
            </div>

            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green text-slate-600 font-bold bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Conversation previews list */}
        <div className="space-y-3 pt-2">
          {loading ? (
            /* Skeleton list */
            [1, 2, 3].map((s) => (
              <div key={s} className="border border-slate-50 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-2/3">
                  <div className="w-10 h-10 rounded-2xl skeleton flex-shrink-0"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 skeleton w-24"></div>
                    <div className="h-3 skeleton w-3/4"></div>
                  </div>
                </div>
                <div className="h-4 skeleton w-12 flex-shrink-0"></div>
              </div>
            ))
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => openTicketChat(ticket)}
                className="border border-slate-50 hover:border-brand-green/20 rounded-2xl p-4 transition-all hover:bg-slate-50/40 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Category Initials Avatar */}
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50/50 border border-emerald-100/40 text-brand-green flex items-center justify-center font-black text-xs flex-shrink-0">
                    {getAvatarInitials(ticket.subject)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wide">{ticket.ticketId}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-500">
                        {ticket.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-xs mt-1 truncate">{ticket.subject}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate font-medium">
                      {ticket.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {formatRelativeTime(ticket.updatedAt)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${getPriorityStyle(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Beautiful empty state */
            <div className="py-16 text-center bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Inbox is empty</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-normal">
                No tickets or active support requests found. Click below to raise your first ticket.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-4 bg-brand-green hover:bg-[#083d22] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Support Request</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 3. NEW SUPPORT REQUEST MODAL (Centered Desktop / Fullscreen Mobile) */}
      {isCreateOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          {/* Modal Container card */}
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-[500px] sm:rounded-3xl flex flex-col overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Mobile Back arrow */}
                <button
                  type="button"
                  onClick={handleCloseCreate}
                  className="p-1.5 -ml-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition sm:hidden cursor-pointer flex-shrink-0"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src="/logonavbar.png"
                  alt="ShantaBai Logo"
                  className="h-8 w-auto object-contain flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-black text-slate-800 text-xs sm:text-sm truncate">New Request</h3>
                </div>
              </div>
              {/* Desktop Close button */}
              <button 
                type="button"
                onClick={handleCloseCreate}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition hidden sm:block cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTicket} className="flex-1 overflow-y-auto p-5 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-semibold">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Double charged on payment"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green text-xs bg-white text-slate-700"
                  >
                    <option value="Booking Issue">Booking Issue</option>
                    <option value="Payment">Payment</option>
                    <option value="Provider Issue">Provider Issue</option>
                    <option value="Food Quality">Food Quality</option>
                    <option value="Account">Account</option>
                    <option value="Technical Problem">Technical Problem</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-slate-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green text-xs bg-white text-slate-700"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Detailed Message</label>
                <textarea
                  required
                  placeholder="Provide complete details of your issue..."
                  rows={5}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full border border-slate-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green text-xs leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-green hover:bg-[#083d22] text-white py-3.5 rounded-2xl font-bold tracking-wide transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <span>{submitting ? "Submitting Request..." : "Submit Support Request"}</span>
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 4. CHAT CONVERSATION DETAILS (Centered Desktop Modal 75%w x 80%h / Fullscreen Mobile View) */}
      {activeTicket && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          {/* Modal Container */}
          <div className="bg-white w-full h-full sm:h-[80%] sm:w-[75%] sm:max-w-4xl sm:rounded-3xl flex flex-col overflow-hidden animate-scale-in">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={handleCloseChat}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-500 text-xs">{activeTicket.ticketId}</span>
                    {getStatusBadge(activeTicket.status)}
                  </div>
                  <h3 className="font-black text-slate-800 text-xs sm:text-sm mt-0.5 line-clamp-1 max-w-[160px] sm:max-w-[350px]">
                    {activeTicket.subject}
                  </h3>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-400 font-semibold flex-shrink-0">
                <span className="block">{activeTicket.category}</span>
                <span className="block mt-0.5 text-slate-300">Opened {new Date(activeTicket.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/20 space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.senderRole === "CUSTOMER";
                return (
                  <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-2xs ${
                      isOwn 
                        ? "bg-brand-green text-white rounded-tr-none" 
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                    }`}>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      <div className={`text-[8px] mt-1 ${isOwn ? "text-emerald-200" : "text-slate-400"} text-right font-medium`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Sticky Composer */}
            <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0">
              {activeTicket.status === "Closed" ? (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center gap-2 text-slate-400 text-xs font-bold">
                  <CheckCircle className="w-4.5 h-4.5 text-slate-300" />
                  <span>This ticket is closed. You can create a new support request if you need help.</span>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={1}
                    className="flex-1 border border-slate-200 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green resize-none text-xs leading-relaxed bg-slate-50/30"
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
                    className="bg-brand-green hover:bg-[#083d22] text-white p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center flex-shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default CustomerSupport;
