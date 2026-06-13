import React, { useState, useEffect } from "react";
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  MessageSquare, 
  Eye, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Inbox,
  Users
} from "lucide-react";
import api from "../../../services/api";
import TicketDetailsModal from "./TicketDetailsModal";

const SupportTicketsPage = ({ showToast, formatDateTime }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/support/admin/tickets");
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error("Error fetching admin support tickets:", err);
      showToast("error", "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Listen to real-time notification alerts to reload the list
    const handleNotificationAlert = () => {
      fetchTickets();
    };

    window.addEventListener("support_notification_alert", handleNotificationAlert);
    return () => {
      window.removeEventListener("support_notification_alert", handleNotificationAlert);
    };
  }, []);

  const handleOpenModal = (ticketId) => {
    setSelectedTicketId(ticketId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicketId(null);
  };

  // Helper: Get user initials
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

  // Stats Counters
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

  // Search and Filter logic
  const filteredTickets = tickets.filter((ticket) => {
    const custName = ticket.customerId?.name || ticket.customerName || "";
    const custEmail = ticket.customerId?.email || ticket.customerEmail || "";
    
    const matchesSearch = 
      ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === "All" || ticket.category === categoryFilter;
    const matchesPriority = priorityFilter === "All" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-indigo-600 animate-pulse" />
            Support Tickets
          </h1>
          <p className="text-slate-500 text-xs mt-1">Manage and resolve customer support queries in real-time.</p>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", count: totalCount, icon: Inbox, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
          { label: "Open Tickets", count: openCount, icon: AlertCircle, color: "text-sky-600 bg-sky-50 border-sky-100" },
          { label: "In Progress", count: inProgressCount, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Resolved / Closed", count: resolvedCount, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs font-semibold">{stat.label}</span>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{stat.count}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by ID, Subject, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 font-bold"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 font-bold"
            >
              <option value="All">All Categories</option>
              <option value="Booking Issue">Booking Issue</option>
              <option value="Payment">Payment</option>
              <option value="Provider Issue">Provider Issue</option>
              <option value="Food Quality">Food Quality</option>
              <option value="Account">Account</option>
              <option value="Technical Problem">Technical Problem</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 font-bold"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table / List */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          /* Loading skeletons */
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3 w-1/3">
                  <div className="w-10 h-10 rounded-full skeleton flex-shrink-0"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 skeleton w-24"></div>
                    <div className="h-3 skeleton w-32"></div>
                  </div>
                </div>
                <div className="h-4 skeleton w-1/4"></div>
                <div className="h-4 skeleton w-12"></div>
                <div className="h-8 skeleton w-16"></div>
              </div>
            ))}
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Ticket ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Subject / Category</th>
                  <th className="py-4 px-6 text-center">Priority</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Last Updated</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredTickets.map((ticket) => {
                  const custName = ticket.customerId?.name || ticket.customerName;
                  const custEmail = ticket.customerId?.email || ticket.customerEmail;
                  const profileImage = ticket.customerId?.profileImage;

                  return (
                    <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Ticket ID */}
                      <td className="py-4 px-6 font-bold text-slate-500">
                        {ticket.ticketId}
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt={custName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-100"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                              {getInitials(custName)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-800 block">{custName}</span>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{custEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Subject and Category */}
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-slate-800 block line-clamp-1 max-w-[250px]">{ticket.subject}</span>
                          <span className="inline-block bg-slate-50 border border-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1">
                            {ticket.category}
                          </span>
                        </div>
                      </td>

                      {/* Priority Badge */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadgeStyle(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-6 text-slate-400 font-medium whitespace-nowrap">
                        {formatDateTime(ticket.updatedAt)}
                      </td>

                      {/* View Action */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleOpenModal(ticket._id)}
                          className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 mx-auto border border-indigo-100 hover:border-transparent cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty state */
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <LifeBuoy className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No tickets found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              Adjust your search query or filters to find what you are looking for.
            </p>
          </div>
        )}
      </div>

      {/* Center Details Modal */}
      {isModalOpen && selectedTicketId && (
        <TicketDetailsModal
          ticketId={selectedTicketId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          showToast={showToast}
          formatDateTime={formatDateTime}
          onTicketUpdated={fetchTickets}
        />
      )}
    </div>
  );
};

export default SupportTicketsPage;
