'use client';
import { useEffect, useState } from 'react';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [confirmClose, setConfirmClose] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getDepartmentColor = (dept) => {
    if (!dept) return '#6b7280';
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
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/tickets', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  };

  const handleClose = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/tickets', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status: 'zamknięty' })
    });
    if (res.ok) {
      setConfirmClose(null);
      setSelectedTicket(null);
      showToast('Zgłoszenie zostało zamknięte.');
      fetchTickets();
    } else {
      showToast('Nie udało się zamknąć zgłoszenia.', 'error');
    }
  };

  const filteredTickets = tickets
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.description.toLowerCase().includes(search.toLowerCase()) ||
                t.full_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div style={{ maxWidth: '900px', margin: 'auto', padding: '40px 20px', position: 'relative' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Zgłoszenia</h2>

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
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              style={{ padding: '15px 20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <strong>{ticket.title}</strong><br />
                <span style={{ fontSize: '14px', color: '#555' }}>{ticket.full_name} ({ticket.email})</span>
              </div>
              <span style={{ backgroundColor: getDepartmentColor(ticket.department), color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' }}>{ticket.department?.toUpperCase()}</span>
            </div>
          ))
        )
      )}

      {selectedTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '600px', width: '100%', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginBottom: '10px' }}>{selectedTicket.title}</h3>
            <p>{selectedTicket.description}</p>
            <p><strong>Zgłosił:</strong> {selectedTicket.full_name} ({selectedTicket.email})</p>
            <p><strong>Dział:</strong> {selectedTicket.department}</p>
            {selectedTicket.attachment && (
              <div style={{ marginTop: '10px' }}>
                <strong>Załącznik:</strong><br />
                {selectedTicket.attachment.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={`/uploads/${selectedTicket.attachment}`} alt="Załącznik" style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '8px' }} />
                ) : (
                  <a href={`/uploads/${selectedTicket.attachment}`} download style={{ color: '#3b82f6', fontWeight: 'bold' }}>Pobierz załącznik</a>
                )}
              </div>
            )}
            <div style={{ marginTop: '20px' }}>
              <select
                value={selectedTicket.status}
                onChange={e => setSelectedTicket({ ...selectedTicket, status: e.target.value })}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="nowy">Nowy</option>
                <option value="rozpatrywany">Rozpatrywany</option>
                <option value="zamknięty">Zamknięty</option>
              </select>
              {selectedTicket.status === 'zamknięty' && (
                <button
                  onClick={() => setConfirmClose(selectedTicket.id)}
                  style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Zamknij zgłoszenie
                </button>
              )}
            </div>
            <button onClick={() => setSelectedTicket(null)} style={{ marginTop: '20px', padding: '8px 16px', borderRadius: '6px', background: '#ccc', border: 'none' }}>Zamknij</button>
          </div>
        </div>
      )}

      {confirmClose && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
            <p>Czy na pewno chcesz zamknąć to zgłoszenie?</p>
            <button onClick={() => handleClose(confirmClose)} style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '6px' }}>Tak</button>
            <button onClick={() => setConfirmClose(null)} style={{ padding: '8px 16px', backgroundColor: '#9ca3af', color: 'white', border: 'none', borderRadius: '6px' }}>Anuluj</button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: toast.type === 'error' ? '#dc2626' : '#22c55e', color: 'white', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 999 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
