/**
 * Script simple de pruebas de rendimiento.
 * Ejecutar: npm run test:performance
 * Opcional: BASE_URL=http://localhost:3000 node tests/performance/run.mjs
 *
 * Mide tiempo de respuesta y solicitudes por segundo en rutas públicas.
 */
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const NUM_REQUESTS = 50;

async function measure(url, label) {
  const times = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const start = performance.now();
    try {
      const res = await fetch(url);
      await res.text();
    } catch (e) {
      times.push(-1);
      continue;
    }
    times.push(performance.now() - start);
  }
  const ok = times.filter((t) => t >= 0);
  const avg = ok.length ? ok.reduce((a, b) => a + b, 0) / ok.length : 0;
  const min = ok.length ? Math.min(...ok) : 0;
  const max = ok.length ? Math.max(...ok) : 0;
  const rps = avg > 0 ? (1000 / avg).toFixed(1) : 0;
  console.log(`\n${label} (${url})`);
  console.log(`  Peticiones: ${ok.length}/${NUM_REQUESTS}`);
  console.log(`  Tiempo avg: ${avg.toFixed(2)} ms | min: ${min.toFixed(2)} | max: ${max.toFixed(2)}`);
  console.log(`  Aprox. req/s: ${rps}`);
  return { avg, ok: ok.length };
}

async function main() {
  console.log("=== BioPulse - Pruebas de rendimiento ===");
  console.log("Base URL:", BASE_URL);
  console.log("Peticiones por ruta:", NUM_REQUESTS);

  await measure(`${BASE_URL}/api/status`, "GET /api/status");

  console.log("\n--- Fin ---");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
