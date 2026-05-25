const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// RUTA PUENTE CORREGIDA: Desempaqueta el formato de GameMonetize correctamente
app.get('/api/juegos', (req, res) => {
    const url = 'https://gamemonetize.com/feed.php?format=json&page=1';

    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                const respuestaRaw = JSON.parse(data);
                
                // DETECTAR Y DESEMPAQUETAR:
                // Si la respuesta ya es una lista, la usamos. Si viene envuelta, extraemos la lista.
                let listaJuegos = Array.isArray(respuestaRaw) ? respuestaRaw : [];
                
                if (!Array.isArray(respuestaRaw) && respuestaRaw.juegos) {
                    listaJuegos = respuestaRaw.juegos;
                } else if (!Array.isArray(respuestaRaw) && typeof respuestaRaw === 'object') {
                    // Si viene como objeto con claves numéricas o propiedades, lo convertimos a Array
                    listaJuegos = Object.values(respuestaRaw);
                }

                // Asegurar que solo mandamos elementos que tengan url y título válidos
                const juegosLimpios = listaJuegos.filter(j => j && (j.url || j.id));

                res.json(juegosLimpios);
            } catch (error) {
                console.error('Error al procesar el JSON de GameMonetize:', error);
                res.status(500).json({ error: 'Formato de datos inválido' });
            }
        });

    }).on('error', (err) => {
        console.error('Error en la conexión con GameMonetize:', err.message);
        res.status(500).json({ error: 'No se pudo conectar con el proveedor' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`¡GamyGoGo corriendo en piloto automático en el puerto ${PORT}!`);
});
