'use client';
import { useEffect, useState } from 'react';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/tickets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          setError('Nie udało się pobrać ticketów.');
          return;
        }

        const data = await res.json();
        setTickets(data);
      } catch (err) {
        console.error(err);
        setError('Wystąpił błąd podczas ładowania danych.');
      }
    };

    fetchTickets();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status })
      });
      setTickets(tickets.map(ticket => ticket.id === id ? { ...ticket, status } : ticket));
    } catch (err) {
      console.error(err);
      setError('Nie udało się zaktualizować statusu.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <h2>Zgłoszenia</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {Array.isArray(tickets) && tickets.map(ticket => (
        <div key={ticket.id} style={{
          background: '#f4f4f4',
          padding: '15px',
          marginBottom: '10px',
          borderRadius: '8px'
        }}>
          <strong>{ticket.title}</strong>
          <p>{ticket.description}</p>
          <p><strong>Zgłosił:</strong> {ticket.full_name} ({ticket.email})</p>
          <select
            value={ticket.status}
            onChange={(e) => updateStatus(ticket.id, e.target.value)}
            style={{ padding: '5px', marginTop: '10px' }}
          >
            <option value="nowy">Nowy</option>
            <option value="realizowany">Realizowany</option>
            <option value="zamknięty">Zamknięty</option>
          </select>
        </div>
      ))}
    </div>
  );
}
