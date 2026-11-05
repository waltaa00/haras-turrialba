# Haras Turrialba

Sitio estático en español. Para verlo localmente, ejecutá `python3 -m http.server 8000` desde la raíz y abrí http://localhost:8000. En un hosting estático, publicá la raíz sin comando de compilación.

## Contenido

- Cambiá las rutas y los textos alternativos en `data/imagenes.json`. Podés colocar fotos WebP en `assets/` y sustituir las ilustraciones de muestra sin editar HTML.
- En `data/carta.json` podés añadir platos, descripciones, precios y el enlace a la carta oficial. Mientras el enlace esté vacío, el botón permite pedir el menú por WhatsApp.
- La dirección y los horarios de temporada están en `index.html`. El botón de ruta usa el enlace del catálogo turístico municipal. La reseña histórica toma como referencia el reportaje de La Teja sobre los inicios de Haras en 2011.
