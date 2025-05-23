document.addEventListener('DOMContentLoaded', async () => {
  const usuarioData = JSON.parse(localStorage.getItem('usuario'));
  if (!usuarioData?.id) {
    window.location.href = '/pages/login.html';
    return;
  }
  document.getElementById('nombreUsuario').textContent = usuarioData.nombre;

  const tbody = document.getElementById('reportes-tbody');
  if (!tbody) {
    console.error('No existe elemento con id "reportes-tbody" en el HTML');
    return;
  }

  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'mt-3 d-flex justify-content-center gap-2';
  document.querySelector('.card-principal').appendChild(paginationContainer);

  let reportesGlobal = [];
  let currentPage = 1;
  const limit = 7; // reportes por página

  try {
    const url = `${API_BASE_URL}/reportes?usuario_id=${usuarioData.id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    reportesGlobal = await res.json();

    // Función para renderizar una página
    function renderPage(page) {
      tbody.innerHTML = '';
      const start = (page - 1) * limit;
      const end = start + limit;
      const pageItems = reportesGlobal.slice(start, end);

      pageItems.forEach((r, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="text-center">${start + idx + 1}</td>
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

      // Actualizar botones paginación
      paginationContainer.innerHTML = '';
      const totalPages = Math.ceil(reportesGlobal.length / limit);
      if (totalPages <= 1) return; // no mostrar paginación si hay 1 o menos páginas

      if (page > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Anterior';
        prevBtn.className = 'btn btn-outline-secondary btn-sm';
        prevBtn.onclick = () => {
          currentPage--;
          renderPage(currentPage);
        };
        paginationContainer.appendChild(prevBtn);
      }

      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = 'btn btn-sm ' + (i === page ? 'btn-primary' : 'btn-outline-primary');
        pageBtn.onclick = () => {
          currentPage = i;
          renderPage(currentPage);
        };
        paginationContainer.appendChild(pageBtn);
      }

      if (page < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Siguiente';
        nextBtn.className = 'btn btn-outline-secondary btn-sm';
        nextBtn.onclick = () => {
          currentPage++;
          renderPage(currentPage);
        };
        paginationContainer.appendChild(nextBtn);
      }

      // Re-attach ver-btn listeners
      tbody.querySelectorAll('.ver-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.id;
          window.location.href = `/pages/reporteDetalle.html?id=${id}`;
        };
      });
    }

    // Renderizar primera página
    renderPage(currentPage);

  } catch (err) {
    console.error('Error al cargar reportes:', err);
    alert('No se pudieron cargar tus reportes. Revisa la consola para más detalles.');
  }

  // Helpers (copiar tal cual de tu código)
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
