'use client';
import { useState } from 'react';

export default function NewTicketPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    title: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert('Zgłoszenie zostało zapisane.');
      setFormData({
        fullName: '',
        email: '',
        title: '',
        description: ''
      });
    } else {
      const data = await response.json();
      alert(data.message);
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2>Nowe zgłoszenie</h2>
        <form onSubmit={handleSubmit}>
          <label>Imię i nazwisko:</label>
          <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />

          <label>Email:</label>
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />

          <label>Tytuł:</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />

          <label>Opis:</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />

          <button type="submit">Wyślij zgłoszenie</button>
        </form>
      </div>
    </div>
  );
}
