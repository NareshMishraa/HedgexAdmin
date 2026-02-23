const TicketFilter = ({ status, setStatus }) => {
  const filters = ["all", "open", "closed"];

  return (
    <div className="flex gap-3 mb-4">
      {filters.map((item) => (
        <button
          key={item}
          onClick={() => setStatus(item)}
          className={`px-4 py-2 rounded-md text-sm font-medium border
            ${
              status === item
                ? "bg-emerald-500 text-black border-emerald-500"
                : "bg-transparent text-gray-300 border-gray-700 hover:border-emerald-500"
            }`}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default TicketFilter;
