document.addEventListener('DOMContentLoaded', async () => {
  // 1) Verifica sesión y obtén usuario
  const usuarioData = JSON.parse(localStorage.getItem('usuario'));
  if (!usuarioData?.id) {
    window.location.href = '/pages/login.html';
    return;
  }
  document.getElementById('nombreUsuario').textContent = usuarioData.nombre;

  // 2) Hacer el fetch y depurar la respuesta
  try {
   const url = `${API_BASE_URL}/reportes?usuario_id=${usuarioData.id}`;
    console.log('Solicitando reportes en:', url);
    const res = await fetch(url);

    console.log('Status:', res.status);
    if (!res.ok) {
      const text = await res.text();
      console.error('Respuesta no OK del servidor:', text);
      throw new Error(`HTTP ${res.status}`);
    }

    const reportes = await res.json();
    console.log('Reportes recibidos:', reportes);

    // 3) Obtener referencia al tbody
    const tbody = document.getElementById('reportes-tbody');
    if (!tbody) {
      console.error('No existe elemento con id "reportes-tbody" en el HTML');
      return;
    }
    tbody.innerHTML = '';

    // 4) Renderizar filas
    reportes.forEach((r, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-center">${idx + 1}</td>
        <td>${r.titulo}</td>
        <td><i class="bi bi-${iconoCategoria(r.categoria)} me-1"></i>${capitalize(r.categoria)}</td>
        <td>${r.direccion}</td>
        <td class="text-center">${badgeEstado(r.estado)}</td>
        <td>${new Date(r.enviado_en).toLocaleDateString()}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary ver-btn" data-id="${r.id}">
            <i class="bi bi-eye-fill"></i> Ver
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // 5) Listener para ver detalle
    tbody.addEventListener('click', e => {
      const btn = e.target.closest('.ver-btn');
      if (!btn) return;
      const id = btn.dataset.id;
      window.location.href = `/pages/reporteDetalle.html?id=${id}`;
    });

  } catch (err) {
    console.error('Error al cargar reportes:', err);
    alert('No se pudieron cargar tus reportes. Revisa la consola para más detalles.');
  }

  // Helpers
  function iconoCategoria(cat) {
    const icons = {
      agua: 'droplet-fill',
      electricidad: 'plug-fill',
      alumbrado: 'lightbulb-fill',
      seguridad: 'shield-lock-fill',
      bacheo: 'exclamation-triangle-fill',
      limpieza: 'basket-fill',
      parques: 'tree-fill',
      transito: 'traffic-front-fill',
      salud: 'heart-pulse-fill',
      obras: 'hammer-fill',
      iniciativas: 'stars',
      turismo: 'camera-fill'
    };
    return icons[cat] || 'file-earmark-text';
  }
  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function badgeEstado(estado) {
    const map = {
      pendiente: `<span class="badge bg-warning text-dark">Pendiente</span>`,
      atendido:  `<span class="badge bg-success">Atendido</span>`,
      cancelado: `<span class="badge bg-danger">Cancelado</span>`
    };
    return map[estado] || `<span class="badge bg-secondary">${estado}</span>`;
  }

  // Cerrar sesión
  document.getElementById('cerrarSesion').addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = '/pages/login.html';
  });
});
