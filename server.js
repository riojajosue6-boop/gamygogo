const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir tus archivos estáticos
app.use(express.static(__dirname));

// RUTA PUENTE SEGURA: Rompe el bloqueo de CORS jalando los datos desde el servidor
app.get('/api/juegos', (req, res) => {
    // URL oficial forzando el formato JSON y pidiendo 50 juegos
    const url = 'https://gamemonetize.com/feed.php?format=json&num=50&page=1';

    https.get(url, (apiRes) => {
        let rawData = '';

        apiRes.on('data', (chunk) => {
            rawData += chunk;
        });

        apiRes.on('end', () => {
            try {
                // Parseamos los datos que llegaron
                const juegos = JSON.parse(rawData);
                
                // GameMonetize a veces los envuelve, nos aseguramos de mandar el Array limpio
                const listaFinal = Array.isArray(juegos) ? juegos : (juegos.juegos || Object.values(juegos));
                
                // Respondemos con éxito al navegador
                res.json(listaFinal);
            } catch (e) {
                console.error("Error al procesar JSON:", e.message);
                res.status(500).json({ error: "Error al procesar el catálogo de juegos" });
            }
        });
    }).on('error', (err) => {
        console.error("Error en petición HTTPS:", err.message);
        res.status(500).json({ error: "No se pudo conectar con el proveedor de juegos" });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor GamyGoGo activo en el puerto ${PORT}`);
});
