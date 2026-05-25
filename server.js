const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// RUTA PUENTE ABSOLUTA: Lee el XML forzado de GameMonetize y lo convierte a formato limpio
app.get('/api/juegos', (req, res) => {
    // Usamos el enlace tal como te lo da la plataforma originalmente
    const url = 'https://gamemonetize.com/feed.php?format=0&num=50&page=1';

    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                const juegos = [];
                
                // Cortamos el XML en bloques por cada etiqueta <game>
                const gameMatches = data.match(/<game>([\s\S]*?)<\/game>/g);
                
                if (gameMatches) {
                    gameMatches.forEach(gameXml => {
                        // Extractor casero de etiquetas XML sin instalar nada extra
                        const getTag = (tag) => {
                            const regex = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\/${tag}>`);
                            const match = gameXml.match(regex);
                            return match ? match[1] : '';
                        };

                        const id = getTag('id');
                        // Si no hay URL directa, armamos el iframe estándar de ellos
                        const urlJuego = getTag('url') || `https://html5.gamemonetize.co/${id}/`;

                        juegos.push({
                            id: id,
                            title: getTag('name') || getTag('title') || 'Juego Gratis',
                            thumb: getTag('thumb') || getTag('image') || 'https://placehold.co/512x384/333/fff?text=Juego',
                            url: urlJuego
                        });
                    });
                }

                // Le mandamos la lista limpia y masticada al frontend
                res.json(juegos);

            } catch (error) {
                console.error('Error al procesar el feed XML:', error.message);
                res.status(500).json({ error: 'Error al digerir los juegos' });
            }
        });

    }).on('error', (err) => {
        console.error('Error de red con GameMonetize:', err.message);
        res.status(500).json({ error: 'Error de conexión' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`¡GamyGoGo blindado corriendo en el puerto ${PORT}!`);
});
