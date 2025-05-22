let map;
let marker;

document.addEventListener("DOMContentLoaded", () => {
  // Verificar si hay sesión iniciada
  const usuario = localStorage.getItem("usuario");
  if (!usuario) {
    Swal.fire({
      icon: "warning",
      title: "Sesión no iniciada",
      text: "Debes iniciar sesión para enviar un reporte",
      confirmButtonText: "Ir al login"
    }).then(() => {
      window.location.href = "/pages/login.html";
    });
    return;
  }

  // Obtener categoría desde la URL
  const categoria = new URLSearchParams(window.location.search).get("categoria");

  // Escuchar el envío del formulario
  const form = document.getElementById("form-reporte");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const usuarioData = JSON.parse(localStorage.getItem("usuario"));

      if (usuarioData?.id) {
        formData.append("usuario_id", usuarioData.id);
      }

      // Agregar la categoría a los datos del formulario
      formData.append("categoria", categoria);

      // Enviar los datos al backend usando fetch
try {
  const response = await fetch(`${API_BASE_URL}/reportes`, {
    method: "POST",
    body: formData,
  });


        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Reporte enviado",
            text: "Tu reporte ha sido registrado correctamente.",
          }).then(() => {
            form.reset();
            // Opcional: redirigir a otra página
            window.location.href = "/";
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error al enviar",
            text: data.message || "No se pudo registrar el reporte.",
          });
        }
      } catch (error) {
        console.error("Error al enviar el reporte:", error);
        Swal.fire({
          icon: "error",
          title: "Error de red",
          text: "No se pudo conectar con el servidor.",
        });
      }
    });
  }
});

// Función global para inicializar el mapa (Google Maps la llamará)
window.initMap = function () {
  const defaultLocation = { lat: 19.4326, lng: -99.1332 }; // CDMX

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 14,
    gestureHandling: "greedy",
    disableDefaultUI: false
  });

  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");
  const direccionInput = document.getElementById("direccion");

  marker = new google.maps.Marker({
    position: defaultLocation,
    map: map,
    draggable: true,
    title: "Arrástrame para seleccionar la ubicación"
  });

  // Establecer valores iniciales
  if (latInput && lngInput) {
    latInput.value = defaultLocation.lat;
    lngInput.value = defaultLocation.lng;
  }

  // Función de geocodificación inversa
  function updateAddress(lat, lng) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0] && direccionInput) {
        direccionInput.value = results[0].formatted_address;
      }
    });
  }

  // Evento: arrastrar marcador
  marker.addListener("dragend", () => {
    const position = marker.getPosition();
    const lat = position.lat();
    const lng = position.lng();

    if (latInput && lngInput) {
      latInput.value = lat;
      lngInput.value = lng;
      updateAddress(lat, lng);
    }
  });

  // Evento: clic en el mapa
  map.addListener("click", (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    marker.setPosition(event.latLng);
    if (latInput && lngInput) {
      latInput.value = lat;
      lngInput.value = lng;
      updateAddress(lat, lng);
    }
  });

  // Geolocalización del usuario
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(userLocation);
        marker.setPosition(userLocation);
        if (latInput && lngInput) {
          latInput.value = userLocation.lat;
          lngInput.value = userLocation.lng;
          updateAddress(userLocation.lat, userLocation.lng);
        }
      },
      (error) => {
        console.warn("Geolocalización no permitida o fallida:", error.message);
      },
      { timeout: 5000 }
    );
  }
};

// Manejo global de error por API de Google
window.gm_authFailure = function () {
  Swal.fire({
    icon: "error",
    title: "Error de autenticación",
    text: "No se pudo cargar el mapa de Google. Verifica tu clave API.",
  });
};
