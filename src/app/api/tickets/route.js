import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  const { fullName, email, title, description } = await request.json();

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '310720',
    database: 'ticket_system',
  });

  try {
    await connection.execute(
      'INSERT INTO tickets (full_name, email, title, description) VALUES (?, ?, ?, ?)',
      [fullName, email, title, description]
    );
    await connection.end();
    return NextResponse.json({ message: 'Zgłoszenie zapisane.' }, { status: 201 });
  } catch (error) {
    console.error(error);
    await connection.end();
    return NextResponse.json({ message: 'Błąd serwera.' }, { status: 500 });
  }
}

export async function GET() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '310720',
    database: 'ticket_system',
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM tickets ORDER BY created_at DESC');
    await connection.end();
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error(error);
    await connection.end();
    return NextResponse.json({ message: 'Błąd pobierania danych.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { id, status } = await request.json();

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'TWOJE_HASLO_MYSQL',
    database: 'NAZWA_TWOJEJ_BAZY',
  });

  try {
    await connection.execute(
      'UPDATE tickets SET status = ? WHERE id = ?',
      [status, id]
    );
    await connection.end();
    return NextResponse.json({ message: 'Status zgłoszenia zaktualizowany.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    await connection.end();
    return NextResponse.json({ message: 'Błąd serwera.' }, { status: 500 });
  }
}
