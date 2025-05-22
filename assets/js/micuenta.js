document.addEventListener('DOMContentLoaded', async () => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const userId  = usuario.id;
  if (!userId) return console.error('No hay ID de usuario en localStorage');

  try {
    const resp = await fetch(`${API_BASE_URL}/usuarios/${userId}`);
    if (!resp.ok) {
      return console.error('Error al obtener usuario');
    }
    const data = await resp.json();

    ['nombre','apellido','localidad','telefono','correo'].forEach(c => {
      document.getElementById('span-' + c).textContent = data[c] || 'No disponible';
      document.getElementById('input-' + c).value      = data[c] || '';
    });
  } catch (error) {
    console.error('Error al conectar con la API:', error);
  }
});
