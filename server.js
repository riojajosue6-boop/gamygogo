const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/api/juegos', (req, res) => {
    // Feed oficial en XML (format=0) con 50 juegos
    const url = 'https://gamemonetize.com/feed.php?format=0&num=50&page=1';

    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                const juegos = [];
                
                // Cortamos por cada bloque de juego
                const gameMatches = data.match(/<game>([\s\S]*?)<\/game>/g);
                
                if (gameMatches) {
                    gameMatches.forEach(gameXml => {
                        // Extractor que busca las etiquetas exactas en español de GameMonetize
                        const extract = (tag) => {
                            const regex = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\/${tag}>`, 'i');
                            const match = gameXml.match(regex);
                            return match ? match[1].trim() : '';
                        };

                        // Mapeo directo usando la documentación oficial
                        const id = extract('id');
                        const title = extract('título') || extract('name') || 'Juego Gratis';
                        const thumb = extract('miniatura') || extract('thumb') || 'https://placehold.co/512x384/333/fff?text=Juego';
                        const urlJuego = extract('url') || `https://html5.gamemonetize.co/${id}/`;

                        if (id || urlJuego) {
                            juegos.push({ id, title, thumb, url: urlJuego });
                        }
                    });
                }

                // Si fallara por completo, dejamos el de respaldo, pero con las nuevas etiquetas ya no hará falta
                if (juegos.length === 0) {
                    juegos.push({
                        id: "cihth2bbe2a0ntw3ylj8srfz268e4nty",
                        title: "Carrera de Reliquias (Respaldo)",
                        thumb: "https://img.gamemonetize.com/cihth2bbe2a0ntw3ylj8srfz268e4nty/512x384.jpg",
                        url: "https://html5.gamemonetize.co/cihth2bbe2a0ntw3ylj8srfz268e4nty/"
                    });
                }

                res.json(juegos);

            } catch (error) {
                console.error('Error procesando XML:', error.message);
                res.status(500).json({ error: 'Error interno al procesar catálogo' });
            }
        });

    }).on('error', (err) => {
        console.error('Error de red:', err.message);
        res.status(500).json({ error: 'Error de conexión' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`GamyGoGo corriendo en puerto ${PORT}`);
});
