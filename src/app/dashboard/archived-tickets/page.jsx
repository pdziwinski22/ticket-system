'use client';
import { useEffect, useState } from 'react';

export default function ArchivedTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const getDepartmentColor = (dept) => {
    if (!dept) return '#6b7280'; // domyślny kolor
    switch (dept.toLowerCase()) {
      case 'it': return '#3b82f6';
      case 'flota': return '#10b981';
      case 'kadry': return '#f59e0b';
      case 'księgowość': return '#8b5cf6';
      case 'rozliczenia': return '#ef4444';
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tickets?archived=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTickets(data);
      setLoading(false);
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.description.toLowerCase().includes(search.toLowerCase()) ||
                t.full_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '40px 20px' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Zamknięte zgłoszenia</h2>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Szukaj po tytule, opisie lub nazwisku"
        style={{ marginBottom: '20px', padding: '10px', width: '100%', borderRadius: '8px', border: '1px solid #ccc' }}
      />

      {loading ? <p>Wczytywanie...</p> : (
        filteredTickets.length === 0 ? <p>Brak wyników.</p> : (
          filteredTickets.map(ticket => (
            <div key={ticket.id} style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{ticket.title}</h3>
              <p>{ticket.description}</p>
              <p><strong>Zgłosił:</strong> {ticket.full_name} ({ticket.email})</p>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ backgroundColor: getDepartmentColor(ticket.department), color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '14px' }}>
                  {ticket.department}
                </span>
              </div>

              {ticket.attachment && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Załącznik:</strong><br />
                  {ticket.attachment.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img src={`/uploads/${ticket.attachment}`} alt="Załącznik" style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '8px' }} />
                  ) : (
                    <a href={`/uploads/${ticket.attachment}`} download style={{ color: '#3b82f6', fontWeight: 'bold' }}>Pobierz załącznik</a>
                  )}
                </div>
              )}
            </div>
          ))
        )
      )}
    </div>
  );
}
