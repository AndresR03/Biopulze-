document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const totalEl = document.getElementById("totalEquipos");
  const operativosEl = document.getElementById("equiposOperativos");
  const mantenimientoEl = document.getElementById("equiposMantenimiento");
  const fueraEl = document.getElementById("equiposFueraServicio");
  const listaProximosEl = document.getElementById("listaProximos");
  const mensajeProximosEl = document.getElementById("mensajeProximos");
  const detalleEquipoEl = document.getElementById("detalleEquipo");

  // Si el HTML aún no tiene los IDs, evitamos romper la página
  if (!totalEl || !operativosEl || !mantenimientoEl || !fueraEl) return;

  try {
    const res = await fetch("/equipos", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (sesionExpirada(res)) return;
    if (!res.ok) return;

    const equipos = await res.json();

    const total = Array.isArray(equipos) ? equipos.length : 0;
    const operativos = (equipos || []).filter((e) => e.estado === "Operativo").length;
    const mantenimiento = (equipos || []).filter((e) => e.estado === "Mantenimiento").length;
    const fuera = (equipos || []).filter((e) => e.estado === "Fuera de Servicio").length;

    totalEl.textContent = String(total);
    operativosEl.textContent = String(operativos);
    mantenimientoEl.textContent = String(mantenimiento);
    fueraEl.textContent = String(fuera);

    if (listaProximosEl && mensajeProximosEl && detalleEquipoEl) {
      // ordenar por fecha de próximo mantenimiento
      const proximos = (equipos || [])
        .filter((e) => e.proximo_mantenimiento)
        .sort((a, b) => new Date(a.proximo_mantenimiento) - new Date(b.proximo_mantenimiento))
        .slice(0, 10);

      listaProximosEl.innerHTML = "";

      if (proximos.length === 0) {
        mensajeProximosEl.textContent = "No hay mantenimientos programados.";
      } else {
        mensajeProximosEl.textContent = "";
        proximos.forEach((eq) => {
          const li = document.createElement("li");
          li.textContent = `${eq.nombre} - ${String(eq.proximo_mantenimiento).slice(0, 10)}`;
          li.style.cursor = "pointer";
          li.addEventListener("click", () => {
            detalleEquipoEl.innerHTML = `
              <p><strong>Equipo:</strong> ${eq.nombre}</p>
              <p><strong>Marca:</strong> ${eq.marca || "-"}</p>
              <p><strong>Modelo:</strong> ${eq.modelo || "-"}</p>
              <p><strong>Ubicación:</strong> ${eq.ubicacion || "-"}</p>
              <p><strong>Estado:</strong> ${eq.estado}</p>
              <p><strong>Próximo mantenimiento:</strong> ${eq.proximo_mantenimiento ? String(eq.proximo_mantenimiento).slice(0, 10) : "-"}</p>
              <p><strong>Último mantenimiento:</strong> ${eq.ultimo_mantenimiento_fecha ? String(eq.ultimo_mantenimiento_fecha).slice(0, 10) : "-"}</p>
              <p><strong>Técnico:</strong> ${eq.ultimo_mantenimiento_tecnico || "-"}</p>
              <p><strong>Tipo mantenimiento:</strong> ${eq.ultimo_mantenimiento_tipo || "-"}</p>
            `;
          });
          listaProximosEl.appendChild(li);
        });
      }
    }
  } catch (e) {
    // Silencioso: el dashboard queda con 0 si falla la API
  }
});