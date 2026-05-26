const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// RUTA PUENTE ACTUALIZADA Y ESTABLE
app.get('/api/juegos', (req, res) => {
    // Feed oficial de exportación de CrazyGames (JSON limpio)
    const url = 'https://api.crazygames.com/v2/en/homepage/game-list';

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
                if (apiRes.statusCode !== 200) {
                    throw new Error(`CrazyGames respondió con código ${apiRes.statusCode}`);
                }

                const jsonData = JSON.parse(data);
                const juegos = [];

                // Validamos la estructura del JSON de CrazyGames
                if (jsonData && jsonData.games) {
                    // Tomamos los primeros 50 juegos del catálogo
                    const listaJuegos = jsonData.games.slice(0, 50);

                    listaJuegos.forEach(game => {
                        juegos.push({
                            id: game.id || '',
                            title: game.name || 'Juego Gratis',
                            // Obtenemos la miniatura de la imagen
                            thumb: game.images?.thumbnail || 'https://placehold.co/512x384/333/fff?text=Juego',
                            // Construimos la URL limpia para el iframe embed de CrazyGames
                            url: game.slug ? `https://www.crazygames.com/embed/${game.slug}` : (game.url || '')
                        });
                    });
                }

                res.json(juegos);

            } catch (error) {
                console.error('Error al procesar datos:', error.message);
                res.status(500).json({ error: 'Error interno al procesar los juegos' });
            }
        });

    }).on('error', (err) => {
        console.error('Error de red:', err.message);
        res.status(500).json({ error: 'Error de conexión con el proveedor' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`GamyGoGo versión CrazyGames estable en puerto ${PORT}`);
});
