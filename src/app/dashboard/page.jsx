'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState({ first_name: '', last_name: '', email: '' });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/');
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email
      });
    } catch (e) {
      console.error('Nieprawidłowy token JWT', e);
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    minWidth: '200px'
  };

  const containerStyle = {
    display: 'grid',
    gap: '30px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    width: '95%',
    maxWidth: '1000px'
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: "url('/penguin.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '80px'
      }}
    >
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          cursor: 'pointer'
        }}
      >
        Wyloguj się
      </button>

      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '40px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          textAlign: 'center',
          width: '95%',
          maxWidth: '600px'
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{user.first_name} {user.last_name}</h1>
        <p style={{ color: '#555', fontSize: '14px' }}>{user.email}</p>
      </div>

      <div style={containerStyle}>
        <div style={cardStyle} onClick={() => router.push('/dashboard/new-ticket')}>
          <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>📝</span>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Utwórz Ticket</h2>
          <p style={{ color: '#555' }}>Zgłoś nowy problem lub prośbę</p>
        </div>

        <div style={cardStyle} onClick={() => router.push('/dashboard/tickets')}>
          <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>📋</span>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Przeglądaj Tickety</h2>
          <p style={{ color: '#555' }}>Sprawdź istniejące zgłoszenia</p>
        </div>

        <div style={cardStyle} onClick={() => router.push('/dashboard/archived-tickets')}>
          <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>📦</span>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Tickety archiwalne</h2>
          <p style={{ color: '#555' }}>Zamknięte zgłoszenia</p>
        </div>
      </div>
    </div>
  );
}
