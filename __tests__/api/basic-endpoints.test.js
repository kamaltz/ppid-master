require('dotenv').config({ path: '.env.local' });

describe('API Basic Tests', () => {
  test('GET /api/informasi should return informasi list', async () => {
    const response = await fetch('http://localhost:3000/api/informasi');
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('POST /api/auth/login should authenticate user', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.token).toBeDefined();
    expect(data.user).toBeDefined();
  });

  test('POST /api/auth/login should fail with wrong credentials', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong@email.com', password: 'wrong' })
    });
    
    expect(response.status).toBe(404);
  });

  test('GET /api/permintaan should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/permintaan');
    expect(response.status).toBe(401);
  });

  test('GET /api/keberatan should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/keberatan');
    expect(response.status).toBe(401);
  });

  test('POST /api/informasi should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/informasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        judul: 'Test',
        klasifikasi: 'Test',
        ringkasan_isi_informasi: 'Test'
      })
    });
    
    expect(response.status).toBe(401);
  });
});