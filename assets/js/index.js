document.addEventListener("DOMContentLoaded", () => {
    // 🔹 Si el usuario no está en localStorage, lo intentamos obtener desde el backend (autenticación con Google)
    if (!localStorage.getItem("usuario")) {
        fetch(`${API_BASE_URL}/auth/usuario`, {
    credentials: 'include'
})
.then(res => {
    if (!res.ok) throw new Error('No autenticado');
    return res.json();
})
.then(user => {
    if (user.autenticado) {
        localStorage.setItem("usuario", JSON.stringify(user.usuario));
        location.reload();
    }
})
.catch(() => {
    // No autenticado, no hacer nada
});
    }

    const usuarioGuardado = localStorage.getItem("usuario");

    const btnHero = document.querySelector("header.hero-gobierno a.btn");
    const btnLogin = document.querySelector(".btn-login");
    const dropdownContainer = document.getElementById("userDropdownContainer");
    const nombreUsuario = document.getElementById("nombreUsuario");
    const cerrarSesion = document.getElementById("cerrarSesion");

    if (usuarioGuardado) {
        try {
            const usuario = JSON.parse(usuarioGuardado);

            // Ocultar el botón de Hero (si existe)
            if (btnHero) {
                btnHero.style.display = "none";
            }

            // Ocultar botón de inicio de sesión
            if (btnLogin) {
                btnLogin.classList.add("d-none");
            }

            // Mostrar dropdown y establecer nombre
            if (dropdownContainer && nombreUsuario) {
                nombreUsuario.textContent = usuario.nombre;
                dropdownContainer.classList.remove("d-none");
            }

            // Evento de cerrar sesión con SweetAlert2
            if (cerrarSesion) {
                cerrarSesion.addEventListener("click", (e) => {
                    e.preventDefault();

                    // Notificación usando SweetAlert2
                    Swal.fire({
                        title: '¿Estás seguro?',
                        text: "Se cerrará tu sesión.",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',  // Color del botón "Aceptar"
                        cancelButtonColor: '#d33',      // Color del botón "Cancelar"
                        confirmButtonText: 'Sí, cerrar sesión',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // 🔹 Cerrar sesión en backend (para logout de Google también)
                            fetch(`${API_BASE_URL}/auth/logout`, { method: 'GET', credentials: 'include' })
                                .finally(() => {
                                    localStorage.removeItem("usuario");
                                    location.reload();
                                });
                        }
                    });
                });
            }

        } catch (error) {
            console.error("Error al leer usuario en localStorage:", error);
            localStorage.removeItem("usuario");
        }
    }

    // 🔸 NUEVO: Controlar acceso a reportes
    const enlacesReporte = document.querySelectorAll(".enlace-reporte");

    enlacesReporte.forEach((enlace) => {
        enlace.addEventListener("click", function (e) {
            if (!usuarioGuardado) {
                e.preventDefault();

                Swal.fire({
                    icon: 'warning',
                    title: 'Inicia sesión para continuar',
                    text: 'Debes iniciar sesión para generar un reporte.',
                    showCancelButton: true,
                    confirmButtonText: 'Iniciar sesión',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#0d6efd',
                    cancelButtonColor: '#6c757d'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "/pages/login.html";
                    }
                });
            }
        });
    });
});