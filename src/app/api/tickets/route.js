import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

async function dbConnect() {
  return mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '310720',
    database: 'ticket_system',
  });
}

// Pobieranie ticketów
export async function GET(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ message: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    const connection = await dbConnect();
    const [rows] = await connection.execute(
      'SELECT * FROM tickets ORDER BY created_at DESC'
    );
    await connection.end();

    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Błąd serwera lub nieprawidłowy token.' }, { status: 401 });
  }
}

// Tworzenie nowego ticketu
export async function POST(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ message: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { fullName, email, title, description } = await request.json();

    const connection = await dbConnect();
    await connection.execute(
      'INSERT INTO tickets (user_id, full_name, email, title, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, fullName, email, title, description, 'nowy']
    );
    await connection.end();

    return NextResponse.json({ message: 'Zgłoszenie zapisane.' }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Błąd serwera lub nieprawidłowy token.' }, { status: 500 });
  }
}

// Aktualizacja statusu ticketu
export async function PATCH(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ message: 'Brak autoryzacji.' }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    const { id, status } = await request.json();

    const connection = await dbConnect();
    await connection.execute(
      'UPDATE tickets SET status = ? WHERE id = ?',
      [status, id]
    );
    await connection.end();

    return NextResponse.json({ message: 'Status zgłoszenia zaktualizowany.' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Błąd serwera lub nieprawidłowy token.' }, { status: 401 });
  }
}
