"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setEmail(payload.email);
    } catch (e) {
      console.error("Nieprawidłowy token JWT", e);
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div
      className="dashboard-container"
      style={{ backgroundImage: 'url("/bg.jpg")' }}
    >
      <button className="logout-btn" onClick={handleLogout}>
        Wyloguj się
      </button>

      <div className="user-panel">
        <h1 className="title">Panel Użytkownika</h1>
        <p>{email}</p>
      </div>

      <div className="tile-grid">
        <div className="tile" onClick={() => router.push("/dashboard/new-ticket")}>
          <h2 className="tile-title">Utwórz Ticket</h2>
          <p>Zgłoś nowy problem lub prośbę</p>
        </div>

        <div className="tile" onClick={() => router.push("/dashboard/tickets")}>
          <h2 className="tile-title">Przeglądaj Tickety</h2>
          <p>Sprawdź istniejące zgłoszenia</p>
        </div>
      </div>
    </div>
  );
}
