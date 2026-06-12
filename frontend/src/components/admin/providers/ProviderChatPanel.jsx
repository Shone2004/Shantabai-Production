import React from "react";
import { Trash2, MessageSquare, Send } from "lucide-react";

export default function ProviderChatPanel({
  selectedProvider,
  providerChats,
  chatInput,
  setChatInput,
  chatEndRef,
  handleSendMessage,
  handleClearChat,
  defaultMessages
}) {
  if (!selectedProvider) return null;

  const messages = providerChats[selectedProvider._id] !== undefined
    ? providerChats[selectedProvider._id]
    : defaultMessages;

  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col h-[400px] overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💬</span>
            <span className="font-black text-xs text-slate-700 uppercase tracking-wider">Admin Communication</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Internal conversation with this provider
          </p>
        </div>
        <button
          onClick={handleClearChat}
          className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          title="Clear Chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-350 mb-2 border border-slate-100">
              <MessageSquare className="w-6 h-6 text-slate-300" />
            </div>
            <h4 className="text-xs font-bold text-slate-700">No Messages Yet</h4>
            <p className="text-[10px] text-slate-400 max-w-[180px] mt-1 leading-normal">
              Start the conversation by typing a message below.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.sender === "Admin";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase">
                    {msg.sender}
                  </span>
                  <span className="text-[9px] text-slate-350">•</span>
                  <span className="text-[9px] text-slate-400">
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs font-medium leading-relaxed shadow-sm transition-all break-words ${
                    isAdmin
                      ? "bg-indigo-650 text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-800 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-100 bg-slate-50/50 flex gap-2 items-center"
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type a message to the provider..."
          className="flex-1 min-w-0 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs font-semibold rounded-full px-4 py-2.5 outline-none transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!chatInput.trim()}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-sm ${
            chatInput.trim()
              ? "bg-indigo-650 hover:bg-indigo-750 text-white shadow-indigo-600/10"
              : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
