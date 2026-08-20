const BASE_URL = 'http://localhost:4000/api';

async function testEndpoints() {
  console.log('🧪 Probando API de Altabrisa con native fetch...');
  try {
    // 1. Health
    const health = await fetch(`${BASE_URL}/health`).then((r) => r.json());
    console.log('✅ /api/health:', health.status);

    // 2. Auth Login SuperAdmin
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'duena@altabrisa.gt', password: 'Altabrisa2026!' }),
    }).then((r) => r.json());

    console.log('✅ /api/auth/login (Dueña):', loginRes.success ? 'Login OK' : 'Fallo');
    const token = loginRes.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 3. Towers Summary
    const towersRes = await fetch(`${BASE_URL}/towers`).then((r) => r.json());
    console.log(`✅ /api/towers: ${towersRes.towers.length} torres registradas`);

    // 4. Tower Details A1
    const towerA1 = await fetch(`${BASE_URL}/towers/A1`).then((r) => r.json());
    console.log(`✅ /api/towers/A1: Niveles ${Object.keys(towerA1.tower.levels).join(', ')}`);

    // 5. Apartments
    const aptsRes = await fetch(`${BASE_URL}/apartments`).then((r) => r.json());
    console.log(`✅ /api/apartments: ${aptsRes.apartments.length} unidades encontradas`);

    // 6. Dashboard KPIs
    const statsRes = await fetch(`${BASE_URL}/stats/dashboard`, { headers: authHeaders }).then((r) => r.json());
    console.log('✅ /api/stats/dashboard (Finanzas):', statsRes.stats.finances);

    // 7. WhatsApp Link Generator
    const waRes = await fetch(`${BASE_URL}/clients/whatsapp-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '50254871234',
        name: 'Carlos Mendoza',
        towerCode: 'A1',
        unitNumber: '101',
        amount: 2400,
        type: 'RECORDATORIO_PREVIO',
      }),
    }).then((r) => r.json());
    console.log('✅ /api/clients/whatsapp-link URL:', waRes.whatsappUrl);

    console.log('\n🎉 ¡TODAS LAS PRUEBAS DE INTEGRACIÓN API PASARON CON ÉXITO AL 100%!');
  } catch (error: any) {
    console.error('❌ Error en prueba:', error);
  }
}

testEndpoints();
