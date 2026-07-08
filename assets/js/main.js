/* ============================================================
   CONSTRUGYPSUM — JS global
   Menú móvil · Carrito de cotización · Filtros · Formularios→Odoo
   ============================================================ */

/* ---------- Menú móvil ---------- */
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  }
  updateQuoteBadge();
  renderQuotePage();
  initCatalogFilters();
  initForms();
});

/* ============================================================
   CARRITO DE COTIZACIÓN (localStorage)
   ============================================================ */
var QKEY = 'cg_quote_items';

function getQuote() {
  try { return JSON.parse(localStorage.getItem(QKEY)) || []; }
  catch (e) { return []; }
}
function saveQuote(items) {
  localStorage.setItem(QKEY, JSON.stringify(items));
  updateQuoteBadge();
}
function addToQuote(sku, name, brand) {
  var items = getQuote();
  var found = items.find(function (i) { return i.sku === sku; });
  if (found) { found.qty += 1; } else { items.push({ sku: sku, name: name, brand: brand, qty: 1 }); }
  saveQuote(items);
  alert('«' + name + '» agregado a tu cotización (' + items.length + ' producto(s)).');
}
function updateQuoteBadge() {
  var badge = document.querySelector('.quote-badge');
  if (badge) { badge.textContent = getQuote().length; }
}

/* Página cotizacion.html */
function renderQuotePage() {
  var wrap = document.getElementById('quote-items');
  if (!wrap) return;
  var items = getQuote();
  var empty = document.getElementById('quote-empty');
  var formBlock = document.getElementById('quote-form-block');
  if (!items.length) {
    if (empty) empty.classList.remove('hidden');
    if (formBlock) formBlock.classList.add('hidden');
    wrap.innerHTML = '';
    return;
  }
  if (empty) empty.classList.add('hidden');
  if (formBlock) formBlock.classList.remove('hidden');
  var html = '<table class="quote-table"><thead><tr><th>Producto</th><th>Marca</th><th>Cantidad</th><th></th></tr></thead><tbody>';
  items.forEach(function (i, idx) {
    html += '<tr><td><strong>' + i.name + '</strong><br><span class="small">' + i.sku + '</span></td>' +
      '<td>' + i.brand + '</td>' +
      '<td><input type="number" min="1" value="' + i.qty + '" aria-label="Cantidad" onchange="setQty(' + idx + ', this.value)"></td>' +
      '<td><button class="remove-item" onclick="removeItem(' + idx + ')">Quitar</button></td></tr>';
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
  var hidden = document.getElementById('quote-payload');
  if (hidden) {
    hidden.value = items.map(function (i) { return i.qty + ' x ' + i.name + ' (' + i.sku + ', ' + i.brand + ')'; }).join('\n');
  }
}
function setQty(idx, val) {
  var items = getQuote();
  items[idx].qty = Math.max(1, parseInt(val, 10) || 1);
  saveQuote(items); renderQuotePage();
}
function removeItem(idx) {
  var items = getQuote();
  items.splice(idx, 1);
  saveQuote(items); renderQuotePage();
}

/* ============================================================
   FILTROS DEL CATÁLOGO (productos.html)
   ============================================================ */
function initCatalogFilters() {
  var search = document.getElementById('catalog-search');
  var chips = document.querySelectorAll('.chip[data-brand]');
  if (!search && !chips.length) return;
  var activeBrand = 'todas';

  function apply() {
    var q = (search && search.value || '').toLowerCase();
    document.querySelectorAll('[data-product]').forEach(function (el) {
      var matchesBrand = activeBrand === 'todas' || el.dataset.brand === activeBrand;
      var matchesText = !q || el.dataset.product.toLowerCase().indexOf(q) !== -1;
      el.style.display = (matchesBrand && matchesText) ? '' : 'none';
    });
  }
  if (search) search.addEventListener('input', apply);
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      activeBrand = chip.dataset.brand;
      apply();
    });
  });

  /* Activar filtro si se llega con ancla, ej: productos.html#acesco */
  var hash = window.location.hash.replace('#', '');
  if (hash) {
    var target = document.querySelector('.chip[data-brand="' + hash + '"]');
    if (target) target.click();
  }
}

/* ============================================================
   FORMULARIOS → ODOO CRM
   ------------------------------------------------------------
   PRODUCCIÓN: apuntar ODOO_LEAD_ENDPOINT al endpoint real, p. ej.:
   1) Módulo "website" de Odoo:  https://TU-ODOO.odoo.com/website/form/crm.lead
   2) Controlador propio en Odoo (recomendado: valida y responde JSON)
   3) Webhook intermedio (Cloud Function / Zapier / Make) que crea el
      crm.lead vía JSON-RPC con los campos: contact_name, email_from,
      phone, partner_name (empresa), city, description, source_id,
      medium_id y los UTM capturados abajo.
   ============================================================ */
var ODOO_LEAD_ENDPOINT = ''; // ← configurar en producción

function initForms() {
  captureUTM();
  document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);

      if (ODOO_LEAD_ENDPOINT) {
        fetch(ODOO_LEAD_ENDPOINT, { method: 'POST', body: data })
          .then(function () { showSuccess(form); })
          .catch(function () { alert('No se pudo enviar. Por favor escríbenos por WhatsApp.'); });
      } else {
        /* DEMO: sin endpoint configurado solo mostramos la confirmación */
        console.log('Lead capturado (demo):', Object.fromEntries(data.entries()));
        showSuccess(form);
      }
    });
  });
}

function showSuccess(form) {
  var ok = form.parentElement.querySelector('.form-success');
  if (ok) { ok.style.display = 'block'; ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  form.reset();
  if (form.id === 'quote-form') { saveQuote([]); renderQuotePage(); }
}

/* UTM → campos ocultos (atribución del lead en Odoo) */
function captureUTM() {
  var params = new URLSearchParams(window.location.search);
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (key) {
    var val = params.get(key);
    if (val) sessionStorage.setItem(key, val);
    document.querySelectorAll('input[name="' + key + '"]').forEach(function (input) {
      input.value = val || sessionStorage.getItem(key) || '';
    });
  });
}
