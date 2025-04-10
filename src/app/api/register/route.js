import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { first_name, last_name, email, phone, password } = await req.json();

        if (!first_name || !last_name || !email || !phone || !password) {
            return NextResponse.json({ message: "Wszystkie pola są wymagane." }, { status: 400 });
        }

        // Sprawdzenie, czy użytkownik już istnieje
        const [existingUser] = await pool.query(`SELECT id FROM users WHERE email = ?`, [email]);
        if (existingUser.length > 0) {
            return NextResponse.json({ message: "Użytkownik z tym e-mailem już istnieje." }, { status: 400 });
        }

        // Hashowanie hasła
        const hashedPassword = await bcrypt.hash(password, 10);
        const activationToken = crypto.randomBytes(32).toString('hex');

        // Start transakcji
        await pool.query("START TRANSACTION");

        // Zapis do bazy danych
        await pool.query(
            `INSERT INTO users (first_name, last_name, email, phone, password, activation_token) VALUES (?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, phone, hashedPassword, activationToken]
        );

        // Link aktywacyjny
        const activationLink = `https://wrx81843.online/api/activate?token=${activationToken}`;

        // Konfiguracja SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === "true", // true dla SSL, false dla STARTTLS
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Wysłanie e-maila
        await transporter.sendMail({
            from: `"System Ticketowy" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Aktywacja konta",
            text: `Witaj ${first_name},\n\nKliknij w poniższy link, aby aktywować swoje konto:\n${activationLink}\n\nPozdrawiamy,\nZespół Systemu Ticketowego`,
            html: `<p>Witaj ${first_name},</p><p>Kliknij w poniższy link, aby aktywować swoje konto:</p><p><a href="${activationLink}">${activationLink}</a></p><p>Pozdrawiamy,<br>Zespół Systemu Ticketowego</p>`,
        });

        // Zatwierdzenie transakcji
        await pool.query("COMMIT");

        return NextResponse.json({ message: "Rejestracja zakończona sukcesem! Sprawdź e-mail w celu aktywacji konta." }, { status: 200 });

    } catch (error) {
        console.error("Błąd podczas rejestracji:", error);

        // W razie błędu - wycofanie transakcji
        await pool.query("ROLLBACK");

        return NextResponse.json({ message: "Błąd serwera." }, { status: 500 });
    }
}
