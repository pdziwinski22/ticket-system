'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewTicketPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: 'it',
    title: '',
    description: '',
    attachment: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment') {
      const file = files[0];
      setForm(prev => ({ ...prev, attachment: file }));
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val) data.append(key, val);
    });

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: data
    });

    if (res.ok) {
      showToast('Zgłoszenie wysłane!');
      setTimeout(() => router.push('/dashboard'), 1200);
    } else {
      showToast('Błąd przy zapisie zgłoszenia', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '40px 20px', position: 'relative' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Nowe zgłoszenie</h2>

      <form onSubmit={handleSubmit}>
        <input name="first_name" placeholder="Imię" required value={form.first_name} onChange={handleChange} style={inputStyle} />
        <input name="last_name" placeholder="Nazwisko" required value={form.last_name} onChange={handleChange} style={inputStyle} />
        <input name="email" type="email" placeholder="E-mail" required value={form.email} onChange={handleChange} style={inputStyle} />

        <select name="department" value={form.department} onChange={handleChange} style={inputStyle}>
          <option value="it">IT</option>
          <option value="flota">Flota</option>
          <option value="kadry">Kadry</option>
          <option value="księgowość">Księgowość</option>
          <option value="rozliczenia">Rozliczenia</option>
        </select>

        <input name="title" placeholder="Temat zgłoszenia" required value={form.title} onChange={handleChange} style={inputStyle} />
        <textarea name="description" placeholder="Opis zgłoszenia" required value={form.description} onChange={handleChange} style={{ ...inputStyle, height: '120px' }} />
        <input type="file" name="attachment" accept=".jpg,.jpeg,.png,.pdf" onChange={handleChange} style={{ marginBottom: '10px' }} />

        {previewUrl && (
          <div style={{ marginBottom: '16px' }}>
            <img src={previewUrl} alt="Podgląd załącznika" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </div>
        )}

        <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>Wyślij zgłoszenie</button>
      </form>

      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: toast.type === 'error' ? '#dc2626' : '#22c55e', color: 'white', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 999 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '16px',
  borderRadius: '8px',
  border: '1px solid #ccc'
};
