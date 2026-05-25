const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/api/juegos', (req, res) => {
    // Usamos el feed original en XML (format=0) con 50 juegos
    const url = 'https://gamemonetize.com/feed.php?format=0&num=50&page=1';

    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                const juegos = [];
                
                // Cortamos por cada bloque de juego (<game> ... </game>)
                const gameMatches = data.match(/<game>([\s\S]*?)<\/game>/g);
                
                if (gameMatches) {
                    gameMatches.forEach(gameXml => {
                        // Extractor mejorado que busca variaciones de etiquetas comunes en XML
                        const extract = (tags) => {
                            for (let tag of tags) {
                                const regex = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\/${tag}>`, 'i');
                                const match = gameXml.match(regex);
                                if (match && match[1].trim()) return match[1].trim();
                            }
                            return '';
                        };

                        // Extraemos los datos buscando nombres alternativos de etiquetas
                        const id = extract(['id', 'code']);
                        const title = extract(['name', 'title', 'heading']) || 'Juego Gratis';
                        const thumb = extract(['thumb', 'image', 'picture']) || 'https://placehold.co/512x384/333/fff?text=Juego';
                        
                        // Si no viene la URL del juego, la armamos dinámicamente con su ID
                        let urlJuego = extract(['url', 'link']);
                        if (!urlJuego && id) {
                            urlJuego = `https://html5.gamemonetize.co/${id}/`;
                        }

                        // Solo agregamos el juego si logramos rescatar un ID o una URL válida
                        if (id || urlJuego) {
                            juegos.push({ id, title, thumb, url: urlJuego });
                        }
                    });
                }

                // Mandamos la lista final (si por alguna razón está vacía, mandamos un juego de respaldo para comprobar)
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
