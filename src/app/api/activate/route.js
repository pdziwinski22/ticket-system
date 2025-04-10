import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const token = req.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.json({ message: "Brak tokena aktywacyjnego." }, { status: 400 });
        }

        // Sprawdzenie, czy token istnieje w bazie
        const [user] = await pool.query(`SELECT id FROM users WHERE activation_token = ?`, [token]);

        if (!user || user.length === 0) {
            return NextResponse.json({ message: "Nieprawidłowy token aktywacyjny." }, { status: 400 });
        }

        // Rozpoczęcie transakcji
        await pool.query("START TRANSACTION");

        // Aktywacja konta
        await pool.query(`UPDATE users SET is_active = 1, activation_token = NULL WHERE id = ?`, [user[0].id]);

        // Potwierdzenie transakcji
        await pool.query("COMMIT");

        return NextResponse.json({ message: "Konto zostało pomyślnie aktywowane! Możesz teraz się zalogować." }, { status: 200 });

    } catch (error) {
        console.error("Błąd aktywacji konta:", error);

        // W razie błędu - wycofanie transakcji
        await pool.query("ROLLBACK");

        return NextResponse.json({ message: "Błąd serwera podczas aktywacji konta." }, { status: 500 });
    }
}
