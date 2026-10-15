/* ============================================================
   CONSTRUGYPSUM — JS global v2
   Header · Drawer móvil · Toasts · Carrito de cotización ·
   Catálogo (búsqueda + filtros) · Logos de marca · Formularios → Odoo
   Sin dependencias externas.
   ============================================================ */
(function () {
  'use strict';

  var WA_NUMBER = '593996144904';
  var QKEY = 'cg_quote_items';
  var BRANDS = window.CG_BRANDS || [];
  var BRAND_BY_SLUG = {};
  BRANDS.forEach(function (b) { BRAND_BY_SLUG[b.slug] = b; });

  /* ---------- Utilidades ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  function waLink(text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }

  /* ---------- Toast ---------- */
  var toastWrap;
  function toast(msg, linkText, linkHref) {
    if (!toastWrap) { toastWrap = document.createElement('div'); toastWrap.className = 'toast-wrap'; toastWrap.setAttribute('aria-live', 'polite'); document.body.appendChild(toastWrap); }
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>' + msg + '</span>' + (linkText ? '<a href="' + linkHref + '">' + linkText + '</a>' : '');
    toastWrap.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 260); }, 3200);
  }

  /* ---------- Header ---------- */
  function initHeader() {
    var header = $('.site-header');
    var toTop = $('.to-top');
    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-scrolled', y > 8);
      if (toTop) toTop.classList.toggle('show', y > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /* Drawer móvil */
    var toggle = $('.nav-toggle'), drawer = $('.drawer');
    if (toggle && drawer) {
      var open = function () { drawer.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; };
      var close = function () { drawer.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
      toggle.addEventListener('click', open);
      $$('.drawer-close, .drawer-backdrop', drawer).forEach(function (el) { el.addEventListener('click', close); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }

    /* Buscador del header → productos.html?q= */
    $$('form[data-site-search]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var q = (f.querySelector('input').value || '').trim();
        window.location.href = 'productos.html' + (q ? '?q=' + encodeURIComponent(q) : '');
      });
    });
  }

  /* ---------- Carrito de cotización ---------- */
  function getQuote() { try { return JSON.parse(localStorage.getItem(QKEY)) || []; } catch (e) { return []; } }
  function saveQuote(items) { try { localStorage.setItem(QKEY, JSON.stringify(items)); } catch (e) {} updateQuoteBadge(true); }
  function updateQuoteBadge(bump) {
    var n = getQuote().reduce(function (a, i) { return a + (i.qty || 1); }, 0);
    $$('.quote-badge').forEach(function (b) {
      b.textContent = n;
      if (bump) { b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump'); }
    });
  }
  function addToQuote(sku, name, brand, qty) {
    var items = getQuote();
    var found = null;
    for (var i = 0; i < items.length; i++) { if (items[i].sku === sku) { found = items[i]; break; } }
    if (found) { found.qty += (qty || 1); } else { items.push({ sku: sku, name: name, brand: brand, qty: qty || 1 }); }
    saveQuote(items);
    if ($('#quote-items')) { renderQuotePage(); toast('«' + esc(name) + '» agregado a tu lista'); }
    else { toast('«' + esc(name) + '» agregado a tu cotización', 'Ver lista', 'cotizacion.html'); }
  }
  window.addToQuote = addToQuote;

  function brandLabel(slug) { if (slug === 'otro') return 'Otro'; var b = BRAND_BY_SLUG[slug]; return b ? b.name : slug; }
  function brandHue(slug) { var b = BRAND_BY_SLUG[slug]; return b ? b.hue : 215; }

  function quoteText(items, extra) {
    var lines = ['Hola Construgypsum, quiero cotizar:'];
    items.forEach(function (i) { lines.push('• ' + i.qty + ' × ' + i.name + ' (' + i.sku + ' · ' + brandLabel(i.brand) + ')'); });
    if (extra) lines.push('', extra);
    return lines.join('\n');
  }

  /* Página cotizacion.html */
  function renderQuotePage() {
    var wrap = $('#quote-items');
    if (!wrap) return;
    var items = getQuote();
    var empty = $('#quote-empty'), layout = $('#quote-layout'), count = $('#quote-count'), lines = $('#quote-lines'), payload = $('#quote-payload'), waBtn = $('#quote-wa');
    if (!items.length) {
      if (empty) empty.classList.remove('hidden');
      if (layout) layout.classList.add('hidden');
      wrap.innerHTML = '';
      return;
    }
    if (empty) empty.classList.add('hidden');
    if (layout) layout.classList.remove('hidden');
    var html = '<div class="ql-head"><span>Producto</span><span>Cantidad</span><span></span></div>';
    items.forEach(function (i, idx) {
      html += '<div class="quote-row" style="--hue:' + brandHue(i.brand) + '">' +
        '<div><div class="qr-name">' + esc(i.name) + '</div><div class="qr-meta"><span>' + esc(brandLabel(i.brand)) + '</span> · Cód. ' + esc(i.sku) + '</div></div>' +
        '<div class="qty"><button type="button" aria-label="Menos" data-dec="' + idx + '">−</button><input type="number" min="1" value="' + i.qty + '" aria-label="Cantidad" data-qty="' + idx + '"><button type="button" aria-label="Más" data-inc="' + idx + '">+</button></div>' +
        '<button type="button" class="remove-item" aria-label="Quitar" data-rm="' + idx + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>' +
        '</div>';
    });
    wrap.innerHTML = html;
    var total = items.reduce(function (a, i) { return a + i.qty; }, 0);
    if (count) count.textContent = items.length;
    if (lines) lines.textContent = total;
    if (payload) payload.value = items.map(function (i) { return i.qty + ' x ' + i.name + ' (' + i.sku + ', ' + brandLabel(i.brand) + ')'; }).join('\n');
    if (waBtn) waBtn.href = waLink(quoteText(items));

    wrap.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var items = getQuote();
      if (b.dataset.rm != null) { items.splice(+b.dataset.rm, 1); }
      else if (b.dataset.inc != null) { items[+b.dataset.inc].qty += 1; }
      else if (b.dataset.dec != null) { items[+b.dataset.dec].qty = Math.max(1, items[+b.dataset.dec].qty - 1); }
      saveQuote(items); renderQuotePage();
    };
    wrap.onchange = function (e) {
      var inp = e.target.closest('input[data-qty]'); if (!inp) return;
      var items = getQuote();
      items[+inp.dataset.qty].qty = Math.max(1, parseInt(inp.value, 10) || 1);
      saveQuote(items); renderQuotePage();
    };

    /* Agregar un ítem libre (texto) */
    var addForm = $('#quote-add-form');
    if (addForm && !addForm.dataset.bound) {
      addForm.dataset.bound = '1';
      addForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var inp = addForm.querySelector('input'); var v = (inp.value || '').trim(); if (!v) return;
        addToQuote('LIBRE-' + Date.now().toString(36), v, 'otro', 1); inp.value = ''; renderQuotePage();
      });
    }
  }
  var emptyAdd = null;

  /* Cotización rápida del hero → WhatsApp o formulario */
  function initQuickQuote() {
    var box = $('[data-quick-quote]'); if (!box) return;
    var ta = box.querySelector('textarea'), name = box.querySelector('input[name="nombre"]'), tel = box.querySelector('input[name="telefono"]');
    var wa = box.querySelector('[data-qq-wa]'), send = box.querySelector('[data-qq-send]');
    function text() {
      var t = 'Hola Construgypsum, quiero cotizar:\n' + (ta.value || '').trim();
      if (name && name.value) t += '\n\nNombre: ' + name.value;
      if (tel && tel.value) t += '\nTeléfono: ' + tel.value;
      return t;
    }
    if (wa) wa.addEventListener('click', function (e) {
      if (!(ta.value || '').trim()) { e.preventDefault(); ta.focus(); toast('Escribe primero los materiales que necesitas'); return; }
      wa.href = waLink(text());
    });
    if (send) send.addEventListener('click', function () {
      var list = (ta.value || '').trim();
      if (!list) { ta.focus(); toast('Escribe primero los materiales que necesitas'); return; }
      list.split(/\n+/).forEach(function (line, i) {
        line = line.replace(/^[-•*]\s*/, '').trim(); if (!line) return;
        var m = line.match(/^(\d+)\s*(?:x|×|und|unidades)?\s+(.+)$/i);
        var q = m ? parseInt(m[1], 10) : 1, n = m ? m[2] : line;
        var items = getQuote(); items.push({ sku: 'LIBRE-' + Date.now().toString(36) + i, name: n, brand: 'otro', qty: q }); saveQuote(items);
      });
      try { sessionStorage.setItem('cg_qq_name', name ? name.value : ''); sessionStorage.setItem('cg_qq_tel', tel ? tel.value : ''); } catch (e) {}
      window.location.href = 'cotizacion.html';
    });
  }

  /* ---------- Catálogo ---------- */
  function initCatalog() {
    var grid = $('#product-grid'); if (!grid) return;
    var CAT = window.CG_CATALOG || [];
    var CATS = window.CG_CATEGORIES || {};
    var state = { q: '', brand: '', cat: '', sort: 'rel', shown: 48 };
    var PAGE = 48;

    /* Estado inicial desde URL: ?q= , #marca */
    var params = new URLSearchParams(window.location.search);
    state.q = params.get('q') || '';
    var hash = (window.location.hash || '').replace('#', '');
    if (hash && BRAND_BY_SLUG[hash]) state.brand = hash;
    else if (hash && CATS[hash]) state.cat = hash;
    if (params.get('marca') && BRAND_BY_SLUG[params.get('marca')]) state.brand = params.get('marca');
    if (params.get('cat') && CATS[params.get('cat')]) state.cat = params.get('cat');

    var search = $('#catalog-search'), sort = $('#catalog-sort'), brandList = $('#brand-filter'), catList = $('#cat-filter'),
        bar = $('#results-bar'), more = $('#catalog-more'), empty = $('#catalog-empty'), active = $('#active-filters'),
        side = $('.catalog-side'), ftoggle = $('.filters-toggle');
    if (search) search.value = state.q;

    /* Listas de filtros */
    function brandButton(b) {
      return '<li><button type="button" data-brand="' + b.slug + '"' + (state.brand === b.slug ? ' class="active"' : '') + '><span>' + esc(b.name) + (b.tier === 1 ? '<span class="top">TOP</span>' : '') + '</span><span class="n">' + b.count + '</span></button></li>';
    }
    function renderFilters() {
      if (brandList) {
        var h = '<li><button type="button" data-brand=""' + (!state.brand ? ' class="active"' : '') + '><span>Todas las marcas</span><span class="n">' + CAT.length + '</span></button></li>';
        h += '<li class="sep">Marcas principales</li>' + BRANDS.filter(function (b) { return b.tier === 1; }).map(brandButton).join('');
        h += '<li class="sep">Más marcas</li>' + BRANDS.filter(function (b) { return b.tier === 2; }).map(brandButton).join('');
        brandList.innerHTML = h;
      }
      if (catList) {
        var c = '<li><button type="button" data-cat=""' + (!state.cat ? ' class="active"' : '') + '><span>Todas las soluciones</span></button></li>';
        Object.keys(CATS).forEach(function (k) {
          c += '<li><button type="button" data-cat="' + k + '"' + (state.cat === k ? ' class="active"' : '') + '><span>' + esc(CATS[k][0]) + '</span></button></li>';
        });
        catList.innerHTML = c;
      }
    }

    function filtered() {
      var q = norm(state.q).trim(); var terms = q ? q.split(/\s+/) : [];
      var brandCats = {};
      BRANDS.forEach(function (b) { brandCats[b.slug] = b.cat; });
      var out = CAT.filter(function (p) {
        if (state.brand && p.b !== state.brand) return false;
        if (state.cat && brandCats[p.b] !== state.cat) return false;
        if (terms.length) {
          var hay = norm(p.n) + ' ' + norm(p.c) + ' ' + norm(brandLabel(p.b));
          for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) === -1) return false;
        }
        return true;
      });
      if (state.sort === 'az') out.sort(function (a, b) { return a.n.localeCompare(b.n, 'es'); });
      else if (state.sort === 'brand') { var rank = {}; BRANDS.forEach(function (b) { rank[b.slug] = b.rank; }); out.sort(function (a, b) { return (rank[a.b] || 99) - (rank[b.b] || 99) || a.n.localeCompare(b.n, 'es'); }); }
      return out;
    }

    function card(p) {
      var hue = brandHue(p.b);
      return '<article class="product" style="--hue:' + hue + '">' +
        '<div class="p-brand"><span>' + esc(brandLabel(p.b)) + '</span><span class="p-code">Cód. ' + esc(p.c) + '</span></div>' +
        '<h3>' + esc(p.n) + '</h3>' +
        '<div class="p-foot"><span class="note">Precio por volumen</span>' +
        '<button type="button" class="p-add" data-sku="' + esc(p.c) + '" data-name="' + esc(p.n) + '" data-brand="' + esc(p.b) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Cotizar</button></div>' +
        '</article>';
    }

    function render(reset) {
      if (reset) state.shown = PAGE;
      var list = filtered();
      var slice = list.slice(0, state.shown);
      grid.innerHTML = slice.map(card).join('');
      if (empty) empty.classList.toggle('hidden', list.length > 0);
      if (more) more.classList.toggle('hidden', list.length <= state.shown);
      if (bar) {
        var what = state.brand ? ' de <strong>' + esc(brandLabel(state.brand)) + '</strong>' : (state.cat ? ' en <strong>' + esc(CATS[state.cat][0]) + '</strong>' : '');
        bar.innerHTML = 'Mostrando <strong>' + Math.min(state.shown, list.length) + '</strong> de <strong>' + list.length + '</strong> productos' + what + (state.q ? ' para «<strong>' + esc(state.q) + '</strong>»' : '');
      }
      if (active) {
        var chips = '';
        if (state.brand) chips += '<button type="button" class="af" data-clear="brand">' + esc(brandLabel(state.brand)) + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>';
        if (state.cat) chips += '<button type="button" class="af" data-clear="cat">' + esc(CATS[state.cat][0]) + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>';
        if (state.q) chips += '<button type="button" class="af" data-clear="q">«' + esc(state.q) + '» <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>';
        active.innerHTML = chips;
      }
      var intro = $('#brand-intro');
      if (intro) {
        var b = BRAND_BY_SLUG[state.brand];
        if (b) {
          intro.classList.remove('hidden');
          intro.style.setProperty('--hue', b.hue);
          intro.innerHTML = '<div class="brand-logo" data-logo="assets/img/marcas/' + b.slug + '.png"><div class="brand-wordmark">' + esc(b.name) + '</div></div>' +
            '<div><span class="tag tag--navy">Marca #' + b.rank + ' · ' + esc(b.maker) + '</span><h2>' + esc(b.name) + '</h2><p>' + esc(b.desc) + '</p></div>';
          loadBrandLogos(intro);
        } else { intro.classList.add('hidden'); intro.innerHTML = ''; }
      }
      /* Sincronizar URL (sin recargar) */
      try {
        var u = new URL(window.location.href); u.search = ''; u.hash = '';
        if (state.q) u.searchParams.set('q', state.q);
        if (state.brand) u.hash = state.brand; else if (state.cat) u.hash = state.cat;
        history.replaceState(null, '', u.toString());
      } catch (e) {}
    }

    /* Eventos */
    if (search) search.addEventListener('input', debounce(function () { state.q = search.value; render(true); }, 160));
    if (sort) sort.addEventListener('change', function () { state.sort = sort.value; render(true); });
    if (brandList) brandList.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-brand]'); if (!b) return;
      state.brand = b.dataset.brand; state.cat = ''; renderFilters(); render(true);
      if (side && side.classList.contains('open')) { side.classList.remove('open'); }
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    if (catList) catList.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-cat]'); if (!b) return;
      state.cat = b.dataset.cat; state.brand = ''; renderFilters(); render(true);
    });
    if (active) active.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-clear]'); if (!b) return;
      state[b.dataset.clear] = ''; if (b.dataset.clear === 'q' && search) search.value = '';
      renderFilters(); render(true);
    });
    if (more) more.querySelector('button').addEventListener('click', function () { state.shown += PAGE; render(false); });
    if (ftoggle && side) ftoggle.addEventListener('click', function () { side.classList.toggle('open'); });
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('.p-add'); if (!b) return;
      addToQuote(b.dataset.sku, b.dataset.name, b.dataset.brand, 1);
      b.classList.add('is-added'); b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Agregado';
      setTimeout(function () { b.classList.remove('is-added'); b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Cotizar'; }, 1400);
    });
    var clearAll = $('#clear-filters');
    if (clearAll) clearAll.addEventListener('click', function () { state.q = ''; state.brand = ''; state.cat = ''; if (search) search.value = ''; renderFilters(); render(true); });

    renderFilters(); render(true);
  }

  /* ---------- Logos de marca: carga automática si existe el archivo ----------
     Cada .brand-logo[data-logo] intenta cargar assets/img/marcas/<slug>.png (o .svg).
     Si el archivo existe, reemplaza el marcador tipográfico. Si no, queda el marcador. */
  function loadBrandLogos(ctx) {
    $$('.brand-logo[data-logo]', ctx).forEach(function (el) {
      if (el.dataset.tried) return; el.dataset.tried = '1';
      var src = el.dataset.logo;
      var tryLoad = function (url, next) {
        var img = new Image();
        img.onload = function () { el.classList.add('has-img'); img.alt = el.textContent.trim(); el.appendChild(img); };
        img.onerror = function () { if (next) next(); };
        img.src = url;
      };
      tryLoad(src, null);
    });
  }

  /* ---------- Animación de aparición ---------- */
  function initReveal() {
    if (!('IntersectionObserver' in window)) { $$('.reveal, .reveal-stagger').forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal, .reveal-stagger').forEach(function (el) { io.observe(el); });
    /* Antes de imprimir o tras 2.5 s sin interacción, mostrar todo (PDF, lectores, capturas) */
    var revealAll = function () { $$('.reveal, .reveal-stagger').forEach(function (el) { el.classList.add('in'); }); };
    window.addEventListener('beforeprint', revealAll);
    setTimeout(revealAll, 2500);

    /* Contadores */
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return; cio.unobserve(en.target);
        var el = en.target, end = parseFloat(el.dataset.count), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', dur = 1100, t0 = null;
        function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / dur); var e = 1 - Math.pow(1 - p, 3); el.textContent = pre + Math.round(end * e).toLocaleString('es-EC') + suf; if (p < 1) requestAnimationFrame(step); }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Formularios → Odoo CRM ----------
     PRODUCCIÓN: apuntar ODOO_LEAD_ENDPOINT al endpoint real, p. ej.:
     1) Módulo "website" de Odoo:  https://TU-ODOO/website/form/crm.lead
     2) Controlador propio en Odoo (recomendado: valida y responde JSON)
     3) Webhook intermedio (Cloud Function / Make / n8n) que crea el crm.lead vía JSON-RPC
        con: contact_name, email_from, phone, partner_name, city, description, source_id, medium_id, campaign_id. */
  var ODOO_LEAD_ENDPOINT = '';

  function initForms() {
    captureUTM();
    /* Prellenar desde la cotización rápida */
    try {
      var n = sessionStorage.getItem('cg_qq_name'), t = sessionStorage.getItem('cg_qq_tel');
      if (n && $('#q-nombre')) $('#q-nombre').value = n;
      if (t && $('#q-telefono')) $('#q-telefono').value = t;
    } catch (e) {}

    $$('form[data-lead-form]').forEach(function (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var data = new FormData(form);
        var btn = form.querySelector('[type="submit"]'); if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Enviando…'; }
        var done = function () { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; } showSuccess(form); };
        if (ODOO_LEAD_ENDPOINT) {
          fetch(ODOO_LEAD_ENDPOINT, { method: 'POST', body: data }).then(done).catch(function () {
            if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
            toast('No se pudo enviar. Escríbenos por WhatsApp.', 'Abrir WhatsApp', waLink('Hola, no pude enviar el formulario de la web'));
          });
        } else {
          /* DEMO: sin endpoint configurado solo mostramos la confirmación */
          if (window.console) console.log('Lead capturado (demo):', Object.fromEntries(data.entries()));
          setTimeout(done, 500);
        }
      });
    });
  }
  function showSuccess(form) {
    var ok = form.parentElement.querySelector('.form-success') || $('.form-success');
    if (ok) { ok.style.display = 'block'; ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    form.reset();
    if (form.id === 'quote-form') { saveQuote([]); renderQuotePage(); }
  }
  function captureUTM() {
    var params = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (key) {
      var val = params.get(key);
      try { if (val) sessionStorage.setItem(key, val); } catch (e) {}
      $$('input[name="' + key + '"]').forEach(function (input) { var s = ''; try { s = sessionStorage.getItem(key) || ''; } catch (e) {} input.value = val || s; });
    });
  }

  /* ---------- Marquee: duplicar contenido para loop continuo ---------- */
  function initMarquee() {
    $$('.brand-marquee .track').forEach(function (t) { t.innerHTML += t.innerHTML; });
  }

  /* ---------- Año del footer ---------- */
  function initYear() { $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); }); }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader(); updateQuoteBadge(false); renderQuotePage(); initQuickQuote(); initCatalog(); loadBrandLogos(document); initReveal(); initForms(); initMarquee(); initYear();
  });
})();
