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

    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ message: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ message: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
    }

    if (user.is_active === 0) {
      return NextResponse.json({ message: "Konto nie zostało aktywowane." }, { status: 403 });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("Brak JWT_SECRET w zmiennych środowiskowych");
      return NextResponse.json({ message: "Błąd serwera." }, { status: 500 });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ message: "Zalogowano pomyślnie!", token }, { status: 200 });

  } catch (error) {
    console.error("Błąd logowania:", error);
    return NextResponse.json({ message: "Błąd serwera." }, { status: 500 });
  }
}
