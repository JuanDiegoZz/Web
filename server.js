import express from 'express';
import path from 'path';

const app = express();
const PORT = 4000;

// Servir carpeta raíz (para index.html)
app.use(express.static(path.join(process.cwd())));

// Servir carpeta 'pages' para las demás páginas
app.use(express.static(path.join(process.cwd(), 'pages')));

// Servir assets
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

app.listen(PORT, () => {
  console.log(`Servidor frontend corriendo en http://localhost:${PORT}`);
});
