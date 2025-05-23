let pieChart = null;
let lineChart = null;
let barChart = null;

// Función para asignar color por estado
const getColorPorEstado = (estado) => {
  switch (estado.toLowerCase()) {
    case 'resuelto':
      return '#4caf50'; // Verde
    case 'proceso':
      return '#2196f3'; // Azul
    case 'pendiente':
      return '#f44336'; // Rojo
    default:
      return '#' + Math.floor(Math.random() * 16777215).toString(16); // Color aleatorio
  }
};

async function cargarGraficas(fechaInicio = null, fechaFin = null) {
  try {
    let queryParams = '';
    if (fechaInicio && fechaFin) {
      queryParams = `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    }

    // === Datos por estado ===
    const resEstados = await fetch(`${API_BASE_URL}/estadisticas/por-estado${queryParams}`);
    const estados = await resEstados.json();

    // === Datos por fecha ===
    const resFechas = await fetch(`${API_BASE_URL}/estadisticas/por-fecha${queryParams}`);
    const fechas = await resFechas.json();

    // === Destruir charts anteriores ===
    if (pieChart) pieChart.destroy();
    if (lineChart) lineChart.destroy();

    // === Gráfica de Pastel (por estado) ===
    const labelsPastel = estados.map(e => e.estado);
    const dataPastel = estados.map(e => parseInt(e.cantidad));

    pieChart = new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: {
        labels: labelsPastel,
        datasets: [{
          label: 'Reportes por estado',
          data: dataPastel,
          backgroundColor: [
            '#4caf50', '#f44336', '#2196f3', '#ff9800',
            '#9c27b0', '#03a9f4', '#e91e63', '#cddc39'
          ]
        }]
      }
    });

    // === Gráfica de Línea (por fecha) ===
    const fechasUnicas = [...new Set(fechas.map(f => f.fecha))];
    const estadosUnicos = [...new Set(fechas.map(f => f.estado))];

    const datasets = estadosUnicos.map(estado => {
      return {
        label: estado,
        data: fechasUnicas.map(fecha => {
          const entrada = fechas.find(f => f.fecha === fecha && f.estado === estado);
          return entrada ? parseInt(entrada.cantidad) : 0;
        }),
        fill: false,
        borderColor: getColorPorEstado(estado),
        tension: 0.2
      };
    });

    lineChart = new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: {
        labels: fechasUnicas,
        datasets: datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // === Cargar gráfica de barras por tipo ===
    await cargarBarChart(fechaInicio, fechaFin);

  } catch (error) {
    console.error('Error al cargar las gráficas:', error);
  }
}

// === Gráfica de barras por tipo ===
async function cargarBarChart(fechaInicio = null, fechaFin = null) {
  try {
    let queryParams = '';
    if (fechaInicio && fechaFin) {
      queryParams = `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    }

    const res = await fetch(`${API_BASE_URL}/estadisticas/por-tipo${queryParams}`);
    const data = await res.json();

    if (barChart) barChart.destroy();

    const labels = data.map(item => item.categoria);
    const valores = data.map(item => parseInt(item.cantidad));

    barChart = new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cantidad por tipo de reporte',
          data: valores,
          backgroundColor: '#42a5f5'
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y', // Cambia a 'x' si prefieres vertical
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

  } catch (error) {
    console.error('Error al cargar gráfica de tipo de reporte:', error);
  }
}

// === Botón actualizar ===
document.getElementById('btnActualizar').addEventListener('click', () => {
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;

  if (!fechaInicio || !fechaFin) {
    Swal.fire({
      icon: 'warning',
      title: '¡Atención!',
      text: 'Por favor selecciona ambas fechas',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Ok'
    });
    return;
  }

  cargarGraficas(fechaInicio, fechaFin);
});

// === Navegación entre gráficas ===
const chartIds = ['chartEstado', 'chartFecha', 'chartTipo'];
let currentChartIndex = 0;

function mostrarGrafica(index) {
  chartIds.forEach((id, i) => {
    const el = document.getElementById(id);
    el.style.display = (i === index) ? 'block' : 'none';
  });
}

// Mostrar la gráfica inicial
mostrarGrafica(currentChartIndex);

// Botones prev y next
document.getElementById('prevBtn').addEventListener('click', () => {
  currentChartIndex = (currentChartIndex - 1 + chartIds.length) % chartIds.length;
  mostrarGrafica(currentChartIndex);
});

document.getElementById('nextBtn').addEventListener('click', () => {
  currentChartIndex = (currentChartIndex + 1) % chartIds.length;
  mostrarGrafica(currentChartIndex);
});

// === Carga inicial ===
cargarGraficas();
document.getElementById('btnDescargarPDF').addEventListener('click', async () => {
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;

  if (!fechaInicio || !fechaFin) {
    Swal.fire({
      icon: 'warning',
      title: '¡Atención!',
      text: 'Por favor selecciona ambas fechas para generar el PDF',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Ok'
    });
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let queryParams = `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;

  // === Por Estado ===
  const resEstado = await fetch(`${API_BASE_URL}/estadisticas/por-estado${queryParams}`);
  const datosEstado = await resEstado.json();

  doc.setFontSize(14);
  doc.text('Cantidad de reportes por estado', 14, 20);
  doc.autoTable({
    startY: 25,
    head: [['Estado', 'Cantidad']],
    body: datosEstado.map(d => [d.estado, d.cantidad.toString()])
  });

  doc.addPage();

  // === Por Fecha ===
  const resFecha = await fetch(`${API_BASE_URL}/estadisticas/por-fecha${queryParams}`);
  const datosFecha = await resFecha.json();

  const fechasUnicas = [...new Set(datosFecha.map(f => f.fecha))];
  const estadosUnicos = [...new Set(datosFecha.map(f => f.estado))];

  const tablaFechas = fechasUnicas.map(fecha => {
    const fila = [fecha];
    estadosUnicos.forEach(estado => {
      const item = datosFecha.find(f => f.fecha === fecha && f.estado === estado);
      fila.push(item ? item.cantidad : '0');
    });
    return fila;
  });

  doc.text('Cantidad de reportes por fecha', 14, 20);
  doc.autoTable({
    startY: 25,
    head: [['Fecha', ...estadosUnicos]],
    body: tablaFechas
  });

  doc.addPage();

  // === Por Tipo ===
  const resTipo = await fetch(`${API_BASE_URL}/estadisticas/por-tipo${queryParams}`);
  const datosTipo = await resTipo.json();

  doc.text('Cantidad de reportes por tipo', 14, 20);
  doc.autoTable({
    startY: 25,
    head: [['Tipo', 'Cantidad']],
    body: datosTipo.map(d => [d.categoria, d.cantidad.toString()])
  });

  doc.save(`reporte_${fechaInicio}_a_${fechaFin}.pdf`);
});
