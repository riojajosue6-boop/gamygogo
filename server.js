const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/api/juegos', (req, res) => {
    // Usamos el feed original XML de GameMonetize tal como te lo genera el panel
    const url = 'https://gamemonetize.com/feed.php?format=0&num=50&page=1';

    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => { data += chunk; });

        apiRes.on('end', () => {
            try {
                const juegos = [];

                // 🪄 TRUCO DE CORTE: Cortamos el XML separando cada bloque por la etiqueta de cierre </game>
                const bloques = data.split(/<\/game>/i);

                bloques.forEach(bloqueXml => {
                    if (!bloqueXml || bloqueXml.trim() === '') return;

                    // Función ultra-flexible que extrae lo que esté dentro de una etiqueta ignorando acentos y mayúsculas
                    const extractTagContent = (tagName) => {
                        // Creamos una búsqueda permisiva por si la etiqueta viene con tildes extrañas
                        let cleanTagName = tagName;
                        if (tagName === 'titulo') cleanTagName = 't.tulo'; // El punto reemplaza cualquier caracter con tilde
                        
                        const regex = new RegExp(`<${cleanTagName}>(?:<!\\[CDATA\\[)?([\s\S]*?)(?:\\]\\]>)?<\/${cleanTagName}>`, 'i');
                        const match = bloqueXml.match(regex);
                        return match ? match[1].trim() : '';
                    };

                    // Extraemos los campos basados exactamente en tu captura de pantalla
                    const id = extractTagContent('id');
                    
                    // Si el bloque no tiene un ID válido, no es un juego real (puede ser el encabezado del archivo), lo saltamos
                    if (!id || id.includes('?xml')) return;

                    const title = extractTagContent('titulo') || extractTagContent('name') || 'Juego Gratis';
                    const thumb = extractTagContent('miniatura') || extractTagContent('thumb') || 'https://placehold.co/512x384/333/fff?text=Juego';
                    
                    // Aseguramos la URL. Si no viene en el XML, la armamos dinámicamente
                    let urlJuego = extractTagContent('url');
                    if (!urlJuego) {
                        urlJuego = `https://html5.gamemonetize.co/${id}/`;
                    }

                    juegos.push({ id, title, thumb, url: urlJuego });
                });

                // Si por alguna razón el XML fallara en el procesamiento, dejamos una lista manual para que tu web NUNCA quede vacía
                if (juegos.length === 0) {
                    juegos.push(
                        { id: "cihth2bbe2a0ntw3ylj8srfz268e4nty", title: "Carrera de Reliquias", thumb: "https://img.gamemonetize.com/cihth2bbe2a0ntw3ylj8srfz268e4nty/512x384.jpg", url: "https://html5.gamemonetize.co/cihth2bbe2a0ntw3ylj8srfz268e4nty/" },
                        { id: "wvwfdzfjv7jj4ikopq3fkpq1lwi6as3o", title: "Maquillaje Mágico", thumb: "https://img.gamemonetize.com/wvwfdzfjv7jj4ikopq3fkpq1lwi6as3o/512x384.jpg", url: "https://html5.gamemonetize.co/wvwfdzfjv7jj4ikopq3fkpq1lwi6as3o/" },
                        { id: "l2z8hylz6j68hna8feme59e1kwu1qpty", title: "Camino Infinito", thumb: "https://img.gamemonetize.com/l2z8hylz6j68hna8feme59e1kwu1qpty/512x384.jpg", url: "https://html5.gamemonetize.co/l2z8hylz6j68hna8feme59e1kwu1qpty/" }
                    );
                }

                res.json(juegos);

            } catch (error) {
                console.error('Error procesando catálogo:', error.message);
                res.status(500).json({ error: 'Error en el procesamiento del servidor' });
            }
        });

    }).on('error', (err) => {
        console.error('Error de conexión:', err.message);
        res.status(500).json({ error: 'Error de red' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`GamyGoGo activo en el puerto ${PORT}`);
});
