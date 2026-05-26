const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// RUTA ESPÍA: Te va a mostrar el XML crudo en la pantalla
app.get('/api/juegos', (req, res) => {
    const url = 'https://gamemonetize.com/feed.php?format=0&num=50&page=1';

    https.get(url, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => { data += chunk; });
        apiRes.on('end', () => {
            // Ponemos que el servidor devuelva el texto plano original para auditarlo
            res.setHeader('Content-Type', 'text/xml; charset=utf-8');
            res.send(data);
        });
    }).on('error', (err) => {
        res.status(500).send("Error de red");
    });
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
app.listen(PORT, () => { console.log(`Espía corriendo en puerto ${PORT}`); });
