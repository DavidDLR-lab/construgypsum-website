# Construgypsum · Sitio web v2 (propuesta 07-10-2026)

Abre `index.html` en Google Chrome para ver el sitio completo. Es HTML + CSS + JS puro, sin frameworks ni servidor.

## Páginas
- `index.html` · portada con cotización rápida, muro de 29 marcas (12 principales en grande), soluciones, proceso, segmentos, Departamento de Proyectos, proyectos, testimonios, FAQ.
- `productos.html` · catálogo con los 1.985 productos del listado (sin precios ni stock): búsqueda, filtro por marca y solución, "+ Cotizar".
- `cotizacion.html` · lista de cotización (se guarda en el navegador) con envío por WhatsApp o formulario.
- `nosotros.html`, `proyectos.html`, `contacto.html`, `producto-ejemplo.html` (plantilla de ficha), `privacidad.html`.

## Logos de marca
Coloca cada logo en `assets/img/marcas/<slug>.png` (ver `assets/img/marcas/LEEME.txt`). El sitio lo detecta solo y reemplaza el marcador con el nombre.

## Datos
- `assets/js/brands.js` · las 29 marcas en orden de prioridad (editar aquí nombre, fabricante, descripción, categoría).
- `assets/js/catalog.js` · catálogo generado desde "2026-09-23 Listado Productos Proyectos.xlsx" (código, nombre, marca).

## Formularios
Siguen apuntando a `ODOO_LEAD_ENDPOINT` en `assets/js/main.js` (vacío = modo demo, solo muestra confirmación).

## Pendientes de contenido
Fotografías (marcados con etiqueta en cursiva), testimonios y casos reales (marcados con [corchetes]).
