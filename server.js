const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// RUTA DIAGNÓSTICO: Nos va a mostrar el JSON real en pantalla
app.get('/api/juegos', (req, res) => {
    // Forzamos el formato JSON directo en la API de GameMonetize
    const url = 'https://gamemonetize.com/feed.php?format=json&page=1';

    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                // Mandamos el texto crudo tal como llega de GameMonetize para analizarlo
                const jsonParseado = JSON.parse(data);
                
                // Si es un Array directo, genial. Si no, mandamos el objeto para ver sus nombres
                res.json(jsonParseado);
            } catch (error) {
                // Si ni siquiera es un JSON válido, mostramos el texto plano roto
                res.status(500).send({ 
                    error: "GameMonetize no mandó un JSON válido", 
                    loQueLlego: data.substring(0, 500) 
                });
            }
        });

    }).on('error', (err) => {
        res.status(500).json({ error: 'Error de conexión', detalle: err.message });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor GamyGoGo escuchando en puerto ${PORT}`);
});
