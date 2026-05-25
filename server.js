const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir tus archivos estáticos (HTML, CSS, JS) automáticamente
app.use(express.static(__dirname));

// RUTA PUENTE CORREGIDA: Obtiene el feed de GameMonetize de forma nativa sin librerías externas
app.get('/api/juegos', (req, res) => {
    const url = 'https://gamemonetize.com/feed.php?format=json&page=1';

    https.get(url, (apiRes) => {
        let data = '';

        // Ir acumulando los fragmentos de información
        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        // Cuando termine de recibir todo, procesarlo y mandarlo al cliente
        apiRes.on('end', () => {
            try {
                const juegos = JSON.parse(data);
                res.json(juegos);
            } catch (error) {
                console.error('Error al procesar el JSON de GameMonetize:', error);
                res.status(500).json({ error: 'Formato de datos inválido' });
            }
        });

    }).on('error', (err) => {
        console.error('Error en la conexión con GameMonetize:', err.message);
        res.status(500).json({ error: 'No se pudo conectar con el proveedor de juegos' });
    });
});

// Ruta principal para cargar tu portada de GamyGoGo
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`¡GamyGoGo corriendo en piloto automático sin base de datos en el puerto ${PORT}!`);
});
