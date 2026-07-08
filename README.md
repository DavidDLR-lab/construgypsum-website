# Sitio web propuesto — Construgypsum (versión 8/10+)

Sitio multipágina estático (HTML + CSS + JS puro, sin frameworks). Abre `index.html` en el navegador para verlo.

## Páginas

| Archivo | Rol |
|---|---|
| `index.html` | Portada: propuesta de valor, 8 líneas de producto, confianza, CTA |
| `productos.html` | Catálogo con búsqueda, filtro por marca y botón «+ Cotizar» |
| `producto-ejemplo.html` | **Plantilla** de ficha de producto (URL propia por producto = SEO) |
| `cotizacion.html` | Carrito de cotización + formulario de lead |
| `nosotros.html` | Historia, misión/visión/valores, línea de tiempo |
| `proyectos.html` | Casos de éxito con métricas y testimonios |
| `contacto.html` | Datos de contacto, mapa y formulario |
| `privacidad.html` | Aviso de privacidad |
| `robots.txt`, `sitemap.xml` | SEO técnico |

## Imágenes

Ninguna imagen fue inventada: cada bloque `.img-ph` es un marcador con una
etiqueta en cursiva que indica exactamente qué fotografía colocar.
Reemplazar cada marcador por `<img src="..." alt="...">` con foto real
(idealmente WebP, máx. ~200 KB).

## Integración con Odoo CRM

Todos los formularios llevan `data-lead-form` y se procesan en
`assets/js/main.js`. Configurar ahí `ODOO_LEAD_ENDPOINT` con una de estas rutas:

1. **Módulo website de Odoo**: `https://TU-ODOO/website/form/crm.lead` (rápido).
2. **Controlador propio en Odoo** que valide y cree el `crm.lead` (recomendado).
3. **Webhook intermedio** (Cloud Function / Make / Zapier) que llame a Odoo por JSON-RPC.

Mapeo de campos sugerido:

| Campo del formulario | Campo Odoo (crm.lead) |
|---|---|
| nombre | `contact_name` |
| empresa | `partner_name` |
| correo | `email_from` |
| telefono | `phone` |
| ciudad | `city` |
| tipo_cliente / tema | etiqueta (`tag_ids`) o equipo (`team_id`) |
| mensaje + detalle_pedido | `description` |
| utm_source/medium/campaign | `source_id` / `medium_id` / `campaign_id` |
| origen | `referred` |

Los UTM se capturan automáticamente de la URL y se adjuntan a cada envío.

## Qué lo lleva a 8/10+

- Captura de leads: carrito de cotización multi-producto, CTA por producto, WhatsApp flotante con mensaje precargado, formularios cortos con campos B2B (empresa, tipo de cliente) listos para Odoo.
- Catálogo: búsqueda, filtros por marca, ficha por producto con specs, disponibilidad y PDF técnico.
- SEO: una URL por página y por producto, title/description únicos, canonical, Schema.org (LocalBusiness + Product), robots.txt y sitemap.xml, og: correctos.
- Rendimiento: sin frameworks, un solo CSS y un solo JS (~15 KB), sin jQuery, sin dependencias externas salvo la fuente.
- Accesibilidad: zoom permitido, labels en todos los campos, navegación con aria, contraste AA.

## Pendientes al publicar

- [ ] Reemplazar todos los `.img-ph` por fotografías reales
- [ ] Completar datos reales de los casos en `proyectos.html` (marcados con [corchetes])
- [ ] Configurar `ODOO_LEAD_ENDPOINT` en `assets/js/main.js`
- [ ] Insertar iframe de Google Maps en `contacto.html`
- [ ] Añadir GA4 + Meta Pixel (snippet en `<head>` de todas las páginas)
- [ ] Generar una ficha por producto real a partir de `producto-ejemplo.html`
