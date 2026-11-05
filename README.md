# Haras Turrialba

Sitio estático en español. Para verlo localmente, ejecutá `python3 -m http.server 8000` desde la raíz y abrí http://localhost:8000. En un hosting estático, publicá la raíz sin comando de compilación.

## Contenido

- Cambiá las rutas y los textos alternativos en `data/imagenes.json`. Podés colocar fotos WebP en `assets/` y sustituir las ilustraciones de muestra sin editar HTML.
- En `data/carta.json` podés añadir platos, descripciones, precios y el enlace a la carta oficial. Mientras el enlace esté vacío, «Ver menú completo» lleva a las categorías de la carta dentro de la página.
- La dirección y el horario regular están en `index.html`. El botón de ruta usa el enlace del catálogo turístico municipal. La reseña histórica toma como referencia el reportaje de La Teja sobre los inicios de Haras en 2011.


La página de eventos está en `eventos.html`. Las fotografías iniciales de la finca, cabalgata, recepción y pista de baile provienen de la ficha de Haras en el [catálogo turístico municipal, página 5](https://www.muniturrialba.go.cr/docs/turismo/Catalogo%20Tour%20Operador%20Turrialba.pdf). Para pantallas grandes se pueden sustituir por los originales de mayor resolución en `data/imagenes.json`.
