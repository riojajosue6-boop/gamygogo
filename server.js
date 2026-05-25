const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir tus archivos estáticos (HTML, CSS, JS) automáticamente
app.use(express.static(__dirname));

// RUTA PUENTE: Obtiene el feed de GameMonetize en tiempo real, lo limpia y lo manda a tu web
app.get('/api/juegos', async (req, res) => {
    try {
        // Importación dinámica de node-fetch (para evitar errores en Node moderno)
        const { default: fetch } = await import('node-fetch');
        
        // Tu feed oficial convertido a formato JSON
        const response = await fetch('https://gamemonetize.com/feed.php?format=json&page=1');
        const juegos = await response.json();
        
        // Le mandamos la lista completa de juegos directamente a tu frontend
        res.json(juegos);
    } catch (error) {
        console.error('Error al obtener el feed:', error);
        res.status(500).json({ error: 'No se pudo cargar el catálogo de juegos' });
    }
});

// Ruta principal para que al entrar al dominio limpio cargue tu portada
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`¡GamyGoGo corriendo en piloto automático en el puerto ${PORT}!`);
});
