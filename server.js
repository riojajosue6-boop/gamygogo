const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// RUTA PUENTE CORREGIDA
app.get('/api/juegos', (req, res) => {
    // Usamos el feed de datos directo y optimizado de CrazyGames
    const url = 'https://api.crazygames.com/v2/en/homepage/featured-games';

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        }
    };

    https.get(url, options, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => { data += chunk; });

        apiRes.on('end', () => {
            try {
                // Si la respuesta no es un código exitoso, lanzamos error
                if (apiRes.statusCode !== 200) {
                    throw new Error(`Servidor respondió con código ${apiRes.statusCode}`);
                }

                const jsonData = JSON.parse(data);
                const juegos = [];

                // Mapeamos la estructura de CrazyGames a lo que tu HTML necesita
                if (jsonData && jsonData.games && jsonData.games.data) {
                    // Tomamos los primeros 50 juegos destacados
                    const listaJuegos = jsonData.games.data.slice(0, 50);

                    listaJuegos.forEach(game => {
                        juegos.push({
                            id: game.id || '',
                            title: game.name || 'Juego Gratis',
                            // Usamos la miniatura mediana o grande disponible
                            thumb: game.images?.thumbnail || game.images?.banner || 'https://placehold.co/512x384/333/fff?text=Juego',
                            // URL para el iframe
                            url: game.url || `https://www.crazygames.com/embed/${game.slug}`
                        });
                    });
                }

                res.json(juegos);

            } catch (error) {
                console.error('Error al procesar datos de CrazyGames:', error.message);
                res.status(500).json({ error: 'Error interno al procesar los juegos' });
            }
        });

    }).on('error', (err) => {
        console.error('Error de red con CrazyGames:', err.message);
        res.status(500).json({ error: 'Error de conexión con el proveedor' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`GamyGoGo versión CrazyGames estable en puerto ${PORT}`);
});
