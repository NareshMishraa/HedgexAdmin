import { useState, useMemo } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import TicketChatModal from "./TicketChatModal";
import { useGetAllTicketsForAdminQuery } from "../../api/authApi";

const PAGE_SIZE = 10;

const TicketTable = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // ✅ Fetch real API data
  const { data, error, isLoading } = useGetAllTicketsForAdminQuery({
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const tickets = data?.tickets || [];

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const text = `${t.id} ${t.user_id} ${t.subject}`.toLowerCase();
      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ? true : t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, search, statusFilter]);

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const updateTicketStatus = (ticketId, newStatus) => {
    setSelectedTicket((prev) =>
      prev ? { ...prev, status: newStatus } : prev
    );
  };

  if (isLoading)
    return (
      <div className="text-center text-slate-400 py-10">Loading tickets...</div>
    );

  if (error)
    return (
      <div className="text-center text-red-400 py-10">
        Error loading tickets
      </div>
    );

  return (
    <>
      <div
        className="bg-gradient-to-br from-[#0b1220] to-[#060b14]
                   border border-emerald-500/20
                   rounded-2xl
                   p-4 sm:p-5 lg:p-6
                   lg:rounded-none lg:border-x-0"
      >
        {/* TOP BAR */}
        <div className="flex flex-col sm:grid sm:grid-cols-8 gap-3 mb-6">
          <input
            placeholder="Search by Ticket ID, User or Subject"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="sm:col-span-6 px-4 py-2 rounded-lg
                       bg-[#0e1627] border border-slate-700
                       text-white focus:outline-none
                       focus:border-emerald-500"
          />

          <div className="relative sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full px-4 py-2 rounded-lg
                         bg-[#0e1627] border border-slate-700
                         text-white focus:outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block">
          <div
            className="grid grid-cols-7 px-6 py-4 text-xs uppercase
                        tracking-wider font-semibold text-slate-300
                        bg-[#0e1627] border-b border-emerald-500/20"
          >
            <div>Ticket ID</div>
            <div>User ID</div>
            <div>Subject</div>
            <div>Status</div>
            <div>Resolved</div>
            <div>Created</div>
            <div className="text-right">Action</div>
          </div>

          {paginatedTickets.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-7 px-6 py-4 text-sm
                         text-slate-200 border-b border-slate-800
                         hover:bg-white/5 transition"
            >
              <div>{t.id}</div>
              <div>{t.user_id || "—"}</div>
              <div className="truncate">{t.subject}</div>

              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    t.status === "active"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {t.status || "active"}
                </span>
              </div>

              <div>{t.resolved_date ? t.resolved_date.split("T")[0] : "-"}</div>
              <div>{t.created_at?.split("T")[0] || "-"}</div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedTicket(t)}
                  className="flex items-center gap-2 px-3 py-1.5
                             bg-emerald-500/15 text-emerald-400
                             border border-emerald-500/30 rounded-lg
                             hover:bg-emerald-500/25 transition"
                >
                  <MessageCircle size={16} />
                  Open Chat
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= MOBILE / TABLET CARDS ================= */}
        <div className="md:hidden space-y-4">
          {paginatedTickets.map((t) => (
            <div
              key={t.id}
              className="bg-[#0e1627] border border-slate-700
                         rounded-xl p-4 space-y-2"
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">{t.id}</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    t.status === "active"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {t.status || "active"}
                </span>
              </div>

              <p className="text-sm text-slate-300">{t.subject}</p>

              <div className="flex justify-between text-xs text-slate-500">
                <span>Created: {t.created_at?.split("T")[0] || "-"}</span>
                <span>Resolved: {t.resolved_date || "-"}</span>
              </div>

              <button
                onClick={() => setSelectedTicket(t)}
                className="w-full mt-2 py-2 rounded-lg
                           bg-emerald-600 text-white
                           hover:bg-emerald-700 transition"
              >
                Open Chat
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedTicket && (
        <TicketChatModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onStatusChange={updateTicketStatus}
        />
      )}
    </>
  );
};

export default TicketTable;