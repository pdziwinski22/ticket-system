'use client';

import { useEffect, useState } from 'react';

const statuses = ['nowy', 'realizowany', 'zamknięty'];

export default function TicketList() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch('/api/tickets');
    const data = await res.json();
    setTickets(data);
  };

  const updateStatus = async (id, status) => {
    await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchTickets();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Zgłoszenia</h1>
      {tickets.length === 0 ? (
        <p>Brak zgłoszeń.</p>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded shadow p-4">
              <h2 className="text-xl font-bold">{ticket.title}</h2>
              <p className="text-gray-700 mt-2">{ticket.description}</p>
              <label className="block mt-3">
                Status:
                <select
                  value={ticket.status}
                  onChange={(e) => updateStatus(ticket.id, e.target.value)}
                  className="ml-2 border px-2 py-1 rounded"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
