import TicketTable from "../../components/tickets/TicketTable";

const dummyTickets = [
  {
    ticket_id: "TCK-001",
    user_id: "USR-12",
    description: "Unable to withdraw funds",
    status: "active",
    resolved_date: "",
    created_at: "2024-02-01",
  },
  {
    ticket_id: "TCK-002",
    user_id: "USR-45",
    description: "Wallet not connecting",
    status: "resolved",
    resolved_date: "2024-02-03",
    created_at: "2024-01-30",
  },
  {
    ticket_id: "TCK-003",
    user_id: "USR-77",
    description: "Transaction pending",
    status: "active",
    resolved_date: "",
    created_at: "2024-02-05",
  },
];

const Tickets = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-2xl font-semibold mb-6">🎫 Support Tickets</h2>
      <TicketTable tickets={dummyTickets} />
    </div>
  );
};

export default Tickets;
