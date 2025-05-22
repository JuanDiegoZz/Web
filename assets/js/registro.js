document.addEventListener("DOMContentLoaded", function () {
    console.log("El script está funcionando");

    const form = document.querySelector('form');
    const togglePassword = document.getElementById("togglePassword");
    const passwordField = document.getElementById("password");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const apellido = document.getElementById('apellido').value.trim();
            const localidad = document.getElementById('localidad').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const correo = document.getElementById('email').value.trim();
            const contraseña = passwordField.value.trim();

            if (!nombre || !apellido || !localidad || !correo || !telefono || !contraseña) {
                Swal.fire({
                    icon: 'error',
                    title: 'Campos incompletos',
                    text: 'Por favor, completa todos los campos.'
                });
                return;
            }

            const telefonoRegex = /^\d{10}$/;
            if (!telefonoRegex.test(telefono)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Número inválido',
                    text: 'El número de teléfono debe tener 10 dígitos y ser numérico.'
                });
                return;
            }

            const contraseñaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
            if (!contraseñaRegex.test(contraseña)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Contraseña insegura',
                    html: `
                        La contraseña debe contener al menos:
                        <ul style="text-align: left;">
                            <li>8 caracteres</li>
                            <li>1 letra mayúscula</li>
                            <li>1 letra minúscula</li>
                            <li>1 número</li>
                        </ul>
                    `
                });
                return;
            }

            const body = { nombre, apellido, localidad, telefono, correo, contraseña };

            try {
                const res = await fetch(`${API_BASE_URL}/auth/registro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                const data = await res.json();

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro exitoso!',
                        text: 'Usuario registrado correctamente.',
                        confirmButtonText: 'Iniciar sesión',
                    }).then(() => {
                        window.location.href = '/pages/login.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en el registro',
                        text: data.mensaje || 'Hubo un error al registrar el usuario.'
                    });
                }
            } catch (err) {
                console.error('Error al enviar el formulario:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error del servidor',
                    text: 'Inténtalo más tarde.'
                });
            }
        });
    }

    if (togglePassword && passwordField) {
        togglePassword.addEventListener("click", function () {
            const type = passwordField.type === "password" ? "text" : "password";
            passwordField.type = type;

            const icon = togglePassword.querySelector("i");
            icon.classList.toggle("bi-eye-slash", type !== "password");
            icon.classList.toggle("bi-eye", type === "password");
        });
    }
});
