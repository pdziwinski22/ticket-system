import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: "Podaj e-mail i hasło." }, { status: 400 });
        }

        // Pobranie użytkownika z bazy
        const [user] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);

        if (!user || user.length === 0) {
            return NextResponse.json({ message: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
        }

        // Sprawdzenie poprawności hasła
        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return NextResponse.json({ message: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
        }

        // Sprawdzenie, czy konto jest aktywowane
        if (user[0].is_active === 0) {
            return NextResponse.json({ message: "Konto nie zostało aktywowane." }, { status: 403 });
        }

        // **Bezpieczne pobranie klucza JWT z .env**
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            console.error("Błąd: Brak klucza JWT w zmiennych środowiskowych.");
            return NextResponse.json({ message: "Błąd serwera." }, { status: 500 });
        }

        // **Generowanie tokena JWT**
        const token = jwt.sign(
            { id: user[0].id, email: user[0].email },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return NextResponse.json({ message: "Zalogowano pomyślnie!", token }, { status: 200 });

    } catch (error) {
        console.error("Błąd logowania:", error);
        return NextResponse.json({ message: "Błąd serwera." }, { status: 500 });
    }
}
