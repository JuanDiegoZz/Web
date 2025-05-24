document.addEventListener("DOMContentLoaded", function () {
    const togglePassword = document.getElementById("togglePassword");
    const passwordField = document.getElementById("password");
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordField) {
        togglePassword.addEventListener("click", function () {
            const type = passwordField.type === "password" ? "text" : "password";
            passwordField.type = type;

            const icon = togglePassword.querySelector("i");
            icon.classList.toggle("bi-eye-slash", type !== "password");
            icon.classList.toggle("bi-eye", type === "password");
        });
    }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor, ingresa tu correo y contraseña.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ correo: email, contraseña: password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Guardar usuario y token en localStorage
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                localStorage.setItem('token', data.token);  // <-- Aquí guardas el token JWT
                window.location.href = '../index.html';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de autenticación',
                    text: data.error || 'Hubo un error en el inicio de sesión',
                    confirmButtonColor: '#d33'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: 'Hubo un problema al conectar con el servidor.',
                confirmButtonColor: '#d33'
            });
        });
    });

    console.log("El script de login está funcionando correctamente");
});
