function TicketReplyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#0b1220] border border-gray-800 rounded-lg w-full max-w-lg p-6">
        <h2 className="text-white text-lg font-semibold mb-4">
          Reply to Ticket
        </h2>

        <textarea
          rows="5"
          placeholder="Type your reply here..."
          className="w-full bg-black border border-gray-700 rounded-md p-3 text-gray-200 focus:outline-none focus:border-emerald-500"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-600 text-gray-300"
          >
            Cancel
          </button>
          <button className="px-4 py-2 rounded-md bg-emerald-500 text-black">
            Send Reply
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketReplyModal;
