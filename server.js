const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// RUTA PUENTE: Ahora sí jala JSON real y solo 50 juegos para no estresarse
app.get('/api/juegos', (req, res) => {
    // 🔥 CORRECCIÓN CRUCIAL: format=json & num=50
    const url = 'https://gamemonetize.com/feed.php?format=json&num=50&page=1';

    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                // Ahora que viene en JSON real, el servidor lo procesa en milisegundos
                const juegos = JSON.parse(data);
                
                // GameMonetize a veces manda la lista directa o metida en una propiedad
                const listaFinal = Array.isArray(juegos) ? juegos : (juegos.juegos || Object.values(juegos));
                
                res.json(listaFinal);
            } catch (error) {
                console.error('Error al procesar el JSON real:', error);
                res.status(500).json({ error: 'El proveedor no devolvió el formato esperado.' });
            }
        });

    }).on('error', (err) => {
        res.status(500).json({ error: 'Error de conexión con GameMonetize' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`GamyGoGo activo en puerto ${PORT}`);
});
