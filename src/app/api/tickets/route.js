import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = join(process.cwd(), 'public', 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

async function dbConnect() {
  return await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '310720',
    database: 'ticket_system',
    charset: 'utf8mb4_general_ci',
  });
}

// GET zgłoszeń
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const archived = request.nextUrl.searchParams.get('archived');

    if (!token) {
      return NextResponse.json({ message: 'Brak autoryzacji.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const connection = await dbConnect();

    const [rows] = await connection.execute(
      `SELECT * FROM tickets WHERE user_id = ? AND status ${archived === 'true' ? '= "zamknięty"' : '!= "zamknięty"'} ORDER BY created_at DESC`,
      [decoded.id]
    );

    await connection.end();
    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error('[API ERROR GET]', error);
    return NextResponse.json({ message: 'Błąd pobierania zgłoszeń.' }, { status: 500 });
  }
}

// POST nowego zgłoszenia
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ message: 'Brak autoryzacji.' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const department = formData.get('department');
    const file = formData.get('attachment');

    let filename = null;
    if (file && file.size > 0) {
      const ext = file.name.split('.').pop();
      filename = `${Date.now()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(join(uploadDir, filename), buffer);
    }

    const connection = await dbConnect();

    await connection.execute(
      `INSERT INTO tickets (user_id, full_name, email, department, title, description, attachment, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        decoded.id,
        `${decoded.first_name} ${decoded.last_name}`,
        decoded.email,
        department,
        title,
        description,
        filename,
        'nowy'
      ]
    );

    await connection.end();
    return NextResponse.json({ message: 'Zgłoszenie zapisane.' }, { status: 201 });

  } catch (error) {
    console.error('[API ERROR POST]', error);
    return NextResponse.json({ message: 'Błąd zapisu zgłoszenia.' }, { status: 500 });
  }
}

// PATCH zmiana statusu
export async function PATCH(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ message: 'Brak autoryzacji.' }, { status: 401 });

    jwt.verify(token, process.env.JWT_SECRET);
    const { id, status } = await request.json();

    const connection = await dbConnect();
    await connection.execute(
      `UPDATE tickets SET status = ? WHERE id = ?`,
      [status, id]
    );
    await connection.end();

    return NextResponse.json({ message: 'Status zaktualizowany.' }, { status: 200 });

  } catch (error) {
    console.error('[API ERROR PATCH]', error);
    return NextResponse.json({ message: 'Błąd aktualizacji statusu.' }, { status: 500 });
  }
}
