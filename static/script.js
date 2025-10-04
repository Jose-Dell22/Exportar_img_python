const FLASK_BASE_URL = 'http://127.0.0.1:5000';

document.getElementById("formDatosFoto").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id_persona = document.getElementById("id_persona").value;
  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value;
  const foto = document.getElementById("foto").files[0];

  if (!foto) {
    alert("Selecciona una foto antes de enviar.");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async () => {
    const fotoBase64 = reader.result; // dejamos el dataURL completo

    const datos = { 
      id: id_persona,     // 👈 usa "id" porque en Flask tienes data['id']
      nombre, 
      apellido, 
      foto: fotoBase64    // 👈 usa "foto" porque en Flask tienes data['foto']
    };

    const resp = await fetch(`${FLASK_BASE_URL}/upload`, {  // 👈 ruta corregida
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    const res = await resp.json();

    if (resp.ok) {
      alert("✅ Persona guardada correctamente.\nID MongoDB: " + res.foto_id);
    } else {
      alert("❌ Error: " + res.error);
    }
  };

  reader.readAsDataURL(foto); // 👈 dejamos el dataURL porque tu Flask espera separar con split(",")[1]
});

document.getElementById("btnCargarDatos").addEventListener("click", async () => {
  const resp = await fetch(`${FLASK_BASE_URL}/personas`);  // 👈 ruta corregida
  const data = await resp.json();

  const contenedor = document.getElementById("contenedorDatos");
  contenedor.innerHTML = "";

  data.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("tarjeta");

    // ⚠️ Tu Flask devuelve "foto_id", no "fotoBase64".
    // Si quieres mostrar la foto, tendrás que hacer otra ruta en Flask para devolverla desde MongoDB.
    div.innerHTML = `
      <p><b>ID:</b> ${p.id_persona}</p>
      <p><b>Nombre:</b> ${p.nombre}</p>
      <p><b>Apellido:</b> ${p.apellido}</p>
      <p><b>Foto ID en Mongo:</b> ${p.foto_id}</p>
    `;
    contenedor.appendChild(div);
  });
});

document.getElementById("btnVerFoto").addEventListener("click", async () => {
  const mongo_id = document.getElementById("mongo_id").value.trim();
  if (!mongo_id) {
    alert("⚠️ Ingresa un ID de MongoDB");
    return;
  }

  const contenedor = document.getElementById("mostrarFoto");
  contenedor.innerHTML = `<p>Cargando foto...</p>`;

  try {
   const resp = await fetch(`${FLASK_BASE_URL}/ver_foto/${mongo_id}`);

    if (!resp.ok) throw new Error("No se encontró la foto");

    const blob = await resp.blob();
    const imgURL = URL.createObjectURL(blob);

    contenedor.innerHTML = `<img src="${imgURL}" width="300" style="border-radius:8px;">`;
  } catch (err) {
    contenedor.innerHTML = `<p style="color:red;">❌ ${err.message}</p>`;
  }
});
