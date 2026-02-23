import { X, Send, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  useGetTicketMessagesForAdminQuery,
  useReplyTicketMessageAdminMutation,
  useUpdateTicketStatusByAdminMutation,
} from "../../api/authApi";

const TicketChatModal = ({ ticket, onClose, onStatusChange }) => {
  const [statusOpen, setStatusOpen] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [message, setMessage] = useState("");
  const chatEndRef = useRef(null);

  // ✅ Fetch messages
  const {
    data,
    isLoading,
    error,
    refetch: refetchMessages,
  } = useGetTicketMessagesForAdminQuery(ticket.id);

  // ✅ Mutations
  const [sendMessage, { isLoading: sending }] =
    useReplyTicketMessageAdminMutation();
const [updateStatus, { isLoading: updating, error: updateError }] =
  useUpdateTicketStatusByAdminMutation();

  // ✅ Messages sorted oldest → newest
  const messages =
    data?.messages?.slice()?.sort((a, b) => a.id - b.id) || [];

  const isResolved = status === "resolved";

  // ✅ Sync status when parent ticket updates
  useEffect(() => {
    setStatus(ticket.status);
  }, [ticket.status]);

  // ✅ Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ Send new message
  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      await sendMessage({
        ticket_id: ticket.id,
        message: message.trim(),
      }).unwrap();
      setMessage("");
      refetchMessages();
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // ✅ Update ticket status
const handleStatusChange = async (newStatus) => {
  console.log("Updating status to:", newStatus);
  try {
    const res = await updateStatus({
      ticket_id: ticket.id,
      status: newStatus,
    }).unwrap();
    console.log("✅ Update response:", res);
    setStatus(newStatus);
    onStatusChange(ticket.id, newStatus);
    setStatusOpen(false);
  } catch (err) {
    console.error("❌ Status update error:", err);
  }
};

  // ✅ Send message on Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start sm:items-center
                    px-2 sm:px-4 pt-10 sm:pt-0 bg-black/60 backdrop-blur-sm sm:backdrop-blur-0">
      <div className="w-full max-w-lg max-h-[85vh] bg-[#0b1220]
                      border border-emerald-500/30 rounded-2xl shadow-xl flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-3 relative">
            <div>
              <p className="text-white font-semibold">Ticket #{ticket.id}</p>
              <p className="text-xs text-slate-400">
                {ticket.user_name || "User #" + ticket.user_id}
              </p>
            </div>

            {/* STATUS DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setStatusOpen(!statusOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-full border ${
                  isResolved
                    ? "border-emerald-500 text-emerald-400"
                    : "border-yellow-500 text-yellow-400"
                }`}
              >
                {status}
                <ChevronDown size={14} />
              </button>

              {statusOpen && (
                <div className="absolute mt-2 w-28 bg-[#0e1627]
                                border border-slate-700 rounded-lg shadow-lg z-50">
                  {["active", "resolved"].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleStatusChange(item)}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-800"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button onClick={onClose}>
            <X className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* CHAT BODY */}
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto text-sm">
          {isLoading && (
            <div className="text-center text-slate-500">Loading messages...</div>
          )}
          {error && (
            <div className="text-center text-red-400">
              Error loading messages
            </div>
          )}

          {!isLoading &&
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 sm:p-4 rounded-lg max-w-[80%] ${
                  msg.role === "admin"
                    ? "bg-emerald-500/20 ml-auto text-right"
                    : "bg-slate-800/60 text-left"
                }`}
              >
                <p className="text-sm text-white leading-relaxed">
                  {msg.message}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            ))}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT + SEND */}
        <div className="border-t border-slate-800 px-4 py-3 flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isResolved || sending}
            placeholder={
              isResolved
                ? "Ticket resolved. Messaging disabled."
                : "Type a message..."
            }
            className={`flex-1 px-3 py-2 rounded-lg bg-[#0e1627]
                        border border-slate-700 text-white focus:outline-none ${
                          isResolved
                            ? "opacity-50 cursor-not-allowed"
                            : "focus:border-emerald-500"
                        }`}
          />

          <button
            onClick={handleSend}
            disabled={isResolved || sending}
            className={`px-4 rounded-lg text-white flex items-center justify-center ${
              isResolved || sending
                ? "bg-slate-700 opacity-50 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketChatModal;