const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// RUTA PUENTE: Conecta con la API JSON limpia de CrazyGames
app.get('/api/juegos', (req, res) => {
    // API oficial y pública de CrazyGames para desarrolladores
    const url = 'https://api.crazygames.com/v3/en/homepage/game-list';

    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => { data += chunk; });

        apiRes.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                const juegos = [];

                // Validamos que la API traiga la lista de juegos
                if (jsonData && jsonData.games) {
                    // Tomamos los primeros 50 juegos del catálogo
                    const listaJuegos = jsonData.games.slice(0, 50);

                    listaJuegos.forEach(game => {
                        juegos.push({
                            id: game.id || '',
                            title: game.name || 'Juego Gratis',
                            thumb: game.images?.thumbnail || 'https://placehold.co/512x384/333/fff?text=Juego',
                            url: game.url || `https://www.crazygames.com/embed/${game.slug}`
                        });
                    });
                }

                res.json(juegos);

            } catch (error) {
                console.error('Error al procesar JSON de CrazyGames:', error.message);
                res.status(500).json({ error: 'Error interno en el procesamiento' });
            }
        });

    }).on('error', (err) => {
        console.error('Error de red con CrazyGames:', err.message);
        res.status(500).json({ error: 'Error de conexión' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`GamyGoGo versión CrazyGames activa en puerto ${PORT}`);
});
