document.addEventListener('DOMContentLoaded', async () => {
  // 1) Leer id de la query string
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    document.getElementById('detalle-container').innerHTML =
      '<div class="alert alert-danger">ID de reporte no especificado.</div>';
    return;
  }

  try {
    // 2) Fetch al endpoint
    const res = await fetch(`${API_BASE_URL}/reportes/${id}`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const r = await res.json();

    // 3) Renderizar
    const cont = document.getElementById('detalle-container');
    cont.innerHTML = `
      <div class="card shadow-sm">
       ${r.imagen ? `<img src="${r.imagen}" class="card-img-top imagen-reporte" alt="Evidencia">` : ''}

        <div class="card-body">
          <h4 class="card-title">${r.titulo}</h4>
          <p><strong>Categoría:</strong> ${capitalize(r.categoria)}</p>
          <p><strong>Descripción:</strong><br>${r.descripcion}</p>
          <p><strong>Dirección:</strong> ${r.direccion}</p>
          <p><strong>Coordenadas:</strong> ${r.latitud.toFixed(5)}, ${r.longitud.toFixed(5)}</p>
          <p><strong>Estado:</strong> ${badgeEstado(r.estado)}</p>
          <p><strong>Enviado en:</strong> ${new Date(r.enviado_en).toLocaleString()}</p>
          <p><strong>Última actualización:</strong> ${new Date(r.actualizado_en).toLocaleString()}</p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    document.getElementById('detalle-container').innerHTML =
      '<div class="alert alert-danger">No se pudo cargar el detalle del reporte.</div>';
  }

  // Helpers
  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function badgeEstado(e) {
    const map = {
      pendiente: `<span class="badge bg-warning text-dark">Pendiente</span>`,
      atendido:  `<span class="badge bg-success">Atendido</span>`,
      cancelado: `<span class="badge bg-danger">Cancelado</span>`
    };
    return map[e] || `<span class="badge bg-secondary">${e}</span>`;
  }
});
