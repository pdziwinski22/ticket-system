import jwt from 'jsonwebtoken';

export async function verifyToken(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Brak tokena' });
    return null;
  }

  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch {
    res.status(401).json({ error: 'Nieprawidłowy token' });
    return null;
  }
}
