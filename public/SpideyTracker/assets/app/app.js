/* ============================================================
   SpideyTracker User System (Login / Report Sighting / My Records)
   Independent module: No modification to Astro compiled output
   - Login/Register (Email verification, local verification prints to console)
   - Report Sighting (Map picking + photo upload)
   - My Records (Favorites + History)
   - User pin rendering
   ============================================================ */
(function () {
  'use strict';

  /* ==================== CODEX ==================== */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function toast(msg) {
    document.dispatchEvent(new CustomEvent('app:toast', { detail: { message: msg } }));
  }

  // CODEX cookie CODEX API CODEX；body CODEX JSON
  function api(path, opts) {
    opts = opts || {};
    opts.credentials = 'same-origin';
    opts.cache = 'no-store'; // CODEX GET CODEX
    if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
      opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
      opts.body = JSON.stringify(opts.body);
    }
    return fetch(path, opts).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data && data.error ? data.error : 'Request failed (' + res.status + ')');
        return data;
      });
    });
  }

  /* ==================== CODEX（GCJ02 ↔ WGS84） ==================== */
  var PI = Math.PI, A = 6378245.0, EE = 0.00669342162296594323;
  function outOfChina(lng, lat) { return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55); }
  function tLat(x, y) {
    var r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
    r += (20 * Math.sin(y * PI) + 40 * Math.sin(y / 3 * PI)) * 2 / 3;
    r += (160 * Math.sin(y / 12 * PI) + 320 * Math.sin(y * PI / 30)) * 2 / 3;
    return r;
  }
  function tLng(x, y) {
    var r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
    r += (20 * Math.sin(x * PI) + 40 * Math.sin(x / 3 * PI)) * 2 / 3;
    r += (150 * Math.sin(x / 12 * PI) + 300 * Math.sin(x / 30 * PI)) * 2 / 3;
    return r;
  }
  // CODEX（GCJ02）→ CODEX WGS84
  function gcj02ToWgs84(lng, lat) {
    if (outOfChina(lng, lat)) return { lng: lng, lat: lat };
    var dLat = tLat(lng - 105, lat - 35), dLng = tLng(lng - 105, lat - 35);
    var radLat = lat / 180 * PI, magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180) / (A / sqrtMagic * Math.cos(radLat) * PI);
    return { lng: lng - dLng, lat: lat - dLat };
  }

  /* ==================== CODEX ==================== */
  var currentUser = null;
  var userPins = [];      // CODEX（apiToPin CODEX）
  var favIds = {};        // FavoritedCODEX：key = 'usr-N' CODEX pin_id
  var picking = false;    // CODEX
  var reportState = null; // CODEX

  /* ==================== CODEX ==================== */
  function createModal(title, wide) {
    var overlay = document.createElement('div');
    overlay.className = 'app-modal-overlay';
    // CODEX（images/frame 15 CODEX）：CODEX 36px + CODEX + CODEX 50px CODEX + 7px CODEX（CODEX row4+row5 CODEX）
    overlay.innerHTML =
      '<div class="app-modal' + (wide ? ' is-wide' : '') + '">' +
      '  <div class="app-fr app-fr--t-l" aria-hidden="true"></div>' +
      '  <div class="app-fr app-fr--t-c" aria-hidden="true"></div>' +
      '  <div class="app-fr app-fr--t-r" aria-hidden="true"></div>' +
      '  <div class="app-fr app-fr--m-l" aria-hidden="true"></div>' +
      '  <div class="app-modal__content">' +
      '    <div class="app-modal__logo"><img src="favicon.png" alt="SpideyTracker" aria-hidden="true"></div>' +
      '    <div class="app-modal__head">' +
      '      <h3 class="app-modal__title">' + esc(title) + '</h3>' +
      '      <button type="button" class="app-modal__close" aria-label="Close"></button>' +
      '    </div>' +
      '    <div class="app-modal__body"></div>' +
      '    <div class="app-modal__spidey" aria-hidden="true"></div>' +
      '  </div>' +
      '  <div class="app-fr app-fr--m-r" aria-hidden="true"></div>' +
      '  <div class="app-fr app-fr--b2-l" aria-hidden="true"></div>' +
      '  <div class="app-fr app-fr--b2-c" aria-hidden="true"></div>' +
      '  <div class="app-fr app-fr--b2-r" aria-hidden="true"></div>' +
      '  <div class="app-fr app-fr--b1-l" aria-hidden="true"></div>' +
      '  <div class="app-fr app-fr--b1-c" aria-hidden="true"></div>' +
      '  <div class="app-fr app-fr--b1-r" aria-hidden="true"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    var modal = $('.app-modal', overlay);
    var body = $('.app-modal__body', overlay);
    var close = function () {
      overlay.classList.remove('is-open');
      setTimeout(function () { overlay.remove(); }, 240);
      document.removeEventListener('keydown', escHandler);
    };
    var escHandler = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', escHandler);
    $('.app-modal__close', overlay).addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    return { overlay: overlay, modal: modal, body: body, close: close };
  }

  function closeAllAppModals() {
    $$('.app-modal-overlay').forEach(function (o) { o.remove(); });
    stopPicking();
  }

  /* ==================== CODEX and CODEX ==================== */
  function updateMenuState() {
    try {
      var items = window.siteInit && window.siteInit.general && window.siteInit.general.mainMenu && window.siteInit.general.mainMenu.items;
      if (items) {
        items.authLogin.show = !currentUser;
        items.userPanel.show = !!currentUser;
      }
    } catch (e) { /* siteInit CODEX */ }
    // CODEX"CODEX"CODEX CODEX+CODEX（CODEX）
    var userLink = document.querySelector('.main-menu__link[data-menu-key="userPanel"]');
    if (userLink) {
      userLink.innerHTML = currentUser
        ? '<img src="favicon.png" class="app-menu-avatar" alt="">' + esc(currentUser.username || currentUser.email)
        : 'User';
    }
    document.dispatchEvent(new CustomEvent('app:site-init-ready')); // Trigger MainMenu re-render
  }

  function checkAuth() { return Promise.resolve(); }
    function openUserPanel() {
    closeAllAppModals();
    if (!currentUser) {
      toast('Please log in first');
      openAuthModal('login', openUserPanel);
      return;
    }
    var h = createModal('User Center', false);
    var name = currentUser.username || currentUser.email || '';
    h.body.innerHTML =
      '<div class="app-user-panel">' +
      '  <div class="app-user-panel__avatar"><img src="favicon.png" alt="Spidey Avatar"></div>' +
      '  <div class="app-user-panel__name">' + esc(name) + '</div>' +
      '  <div class="app-user-panel__email">' + esc(currentUser.email || '') + '</div>' +
      '  <div class="app-user-panel__stats">' +
      '    <div class="app-user-panel__stat"><b data-stat-mine>…</b><span>Sightings</span></div>' +
      '    <div class="app-user-panel__stat"><b data-stat-fav>…</b><span>Favorites</span></div>' +
      '  </div>' +
      '  <div class="app-user-panel__actions">' +
      '    <button type="button" class="app-btn app-btn--primary" data-up-records>My Records</button>' +
      '    <button type="button" class="app-btn app-btn--ghost is-danger" data-up-logout>Logout</button>' +
      '  </div>' +
      '</div>';
    // Load stats
    api('/api/favorites').then(function (d) {
      var el = $('[data-stat-fav]', h.body);
      if (el) el.textContent = (d.favorites || []).length;
    }).catch(function () {});
    api('./api/sightings.json').then(function (d) {
      var n = (d.sightings || []).filter(function (s) { return s.author && s.author.id === currentUser.id; }).length;
      var el = $('[data-stat-mine]', h.body);
      if (el) el.textContent = n;
    }).catch(function () {});
    $('[data-up-records]', h.body).addEventListener('click', function () {
      h.close();
      openRecordsModal('favorites');
    });
    $('[data-up-logout]', h.body).addEventListener('click', function () {
      h.close();
      doLogout();
    });
  }

  function doLogout() {
    api('/api/auth/logout', { method: 'POST' }).catch(function () {});
    currentUser = null;
    favIds = {};
    updateMenuState();
    toast('CODEXLogin');
  }

  /* ==================== Login / RegisterCODEX ==================== */
  var authState = { onSuccess: null };

  function openAuthModal(mode, onSuccess) { }
    function renderAuth(h, mode) {
    var logged = currentUser && mode === 'login';
    h.body.innerHTML =
      '<div class="app-tabs">' +
      '  <button type="button" class="app-tab' + (mode === 'login' ? ' is-active' : '') + '" data-auth-tab="login">Login</button>' +
      '  <button type="button" class="app-tab' + (mode === 'register' ? ' is-active' : '') + '" data-auth-tab="register">Register</button>' +
      '</div>' +
      '<form data-auth-form="' + mode + '"></form>' +
      '<p class="app-error-msg" data-auth-error></p>' +
      '<p class="app-auth-hint">' +
      (mode === 'login'
        ? 'No account?<span class="app-auth-link" data-auth-switch="register">CODEXRegister</span>'
        : 'Already have an account?<span class="app-auth-link" data-auth-switch="login">CODEXLogin</span>') +
      '</p>';

    var form = $('[data-auth-form]', h.body);
    if (mode === 'login') {
      form.innerHTML =
        '<div class="app-field"><label class="app-field__label">Email</label>' +
        '  <input class="app-input" type="email" name="email" placeholder="you@example.com" autocomplete="email" required></div>' +
        '<div class="app-field"><label class="app-field__label">Password</label>' +
        '  <input class="app-input" type="password" name="password" placeholder="CODEX 6 CODEX" autocomplete="current-password" required></div>' +
        '<button type="submit" class="app-btn app-btn--primary app-btn--block">CODEX CODEX</button>';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitLogin(form);
      });
    } else {
      form.innerHTML =
        '<div class="app-field"><label class="app-field__label">Email</label>' +
        '  <input class="app-input" type="email" name="email" placeholder="you@example.com" required></div>' +
        '<div class="app-field"><label class="app-field__label">CODEX</label>' +
        '  <input class="app-input" type="text" name="username" placeholder="2 CODEX" required></div>' +
        '<div class="app-field"><label class="app-field__label">Password</label>' +
        '  <input class="app-input" type="password" name="password" placeholder="CODEX 6 CODEX" required></div>' +
        '<div class="app-field" data-code-field hidden>' +
        '  <label class="app-field__label">EmailCODEX（CODEX）</label>' +
        '  <div class="app-code-row"><input class="app-input" name="code" placeholder="6 CODEX" inputmode="numeric" maxlength="6">' +
        '  <button type="button" class="app-btn" data-resend>CODEX</button></div></div>' +
        '<button type="submit" class="app-btn app-btn--primary app-btn--block" data-submit>CODEX</button>';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitRegister(form);
      });
      $('[data-resend]', form).addEventListener('click', function () {
        submitRegister(form, true);
      });
    }

    $$('[data-auth-switch]', h.body).forEach(function (el) {
      el.addEventListener('click', function () { renderAuth(h, el.dataset.authSwitch); });
    });
    $$('.app-tab', h.body).forEach(function (el) {
      el.addEventListener('click', function () { renderAuth(h, el.dataset.authTab); });
    });
    if (!logged) $('input', form).focus();
  }

  function authError(h, msg) {
    var el = $('[data-auth-error]', h.body);
    el.textContent = msg || '';
  }

  function submitLogin(form) {
    var email = $('[name=email]', form).value.trim();
    var password = $('[name=password]', form).value;
    var btn = $('[type=submit]', form);
    btn.disabled = true;
    authError(form.closest('.app-modal'), '');
    api('/api/auth/login', { method: 'POST', body: { email: email, password: password } })
      .then(function (d) {
        currentUser = d.user;
        updateMenuState();
        loadFavIds();
        var cb = authState.onSuccess;
        form.closest('.app-modal-overlay').remove();
        toast('CODEX，' + (d.user.username || d.user.email) + '！');
        if (cb) cb();
      })
      .catch(function (err) {
        authError(form.closest('.app-modal'), err.message);
        btn.disabled = false;
      });
  }

  function submitRegister(form, resendOnly) {
    var email = $('[name=email]', form).value.trim();
    var username = $('[name=username]', form).value.trim();
    var password = $('[name=password]', form).value;
    var codeField = $('[data-code-field]', form);
    var btn = $('[data-submit]', form);
    var errorEl = $('[data-auth-error]', form.closest('.app-modal'));

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { errorEl.textContent = 'CODEXEmail'; return; }
    if (username.length < 2) { errorEl.textContent = 'CODEX 2 CODEX'; return; }
    if (password.length < 6) { errorEl.textContent = 'PasswordCODEX 6 CODEX'; return; }

    var finishStep = function () {
      // CODEX：Submit verify
      var code = $('[name=code]', form).value.trim();
      if (!/^\d{6}$/.test(code)) { errorEl.textContent = 'CODEX 6 CODEX'; return; }
      btn.disabled = true;
      errorEl.textContent = '';
      api('/api/auth/verify', { method: 'POST', body: { email: email, code: code, username: username, password: password } })
        .then(function (d) {
          currentUser = d.user;
          updateMenuState();
          loadFavIds();
          var cb = authState.onSuccess;
          form.closest('.app-modal-overlay').remove();
          toast('RegisterSuccess，CODEXLooking for Spidey！');
          if (cb) cb();
        })
        .catch(function (err) {
          errorEl.textContent = err.message;
          btn.disabled = false;
        });
    };

    if (!codeField.hidden && !resendOnly) { finishStep(); return; }

    btn.disabled = true;
    errorEl.textContent = '';
    api('/api/auth/register', { method: 'POST', body: { email: email, username: username, password: password } })
      .then(function (d) {
        codeField.hidden = false;
        btn.textContent = 'CODEXRegister';
        btn.disabled = false;
        toast(d.message || 'CODEX');
        $('[name=code]', form).focus();
      })
      .catch(function (err) {
        errorEl.textContent = err.message;
        btn.disabled = false;
      });
  }

  /* ==================== CODEX ==================== */
  function openReportModal() { }
    function submitReport(h) {
    var form = $('[data-report-form]', h.body);
    var title = $('[name=title]', form).value.trim();
    var description = $('[name=description]', form).value.trim();
    var lat = $('[name=lat]', form).value.trim();
    var lng = $('[name=lng]', form).value.trim();
    var address = $('[name=address]', form).value.trim();
    var pinTypeEl = $('[name=pin_type]:checked', form);
    var pinType = pinTypeEl ? pinTypeEl.value : 'rumored';
    var errorEl = $('[data-report-error]', h.body);
    var btn = $('[data-report-submit]', form);

    if (!title) { errorEl.textContent = 'Please fill in the title'; return; }
    var latN = Number(lat), lngN = Number(lng);
    if (!isFinite(latN) || !isFinite(lngN) || Math.abs(latN) > 90 || Math.abs(lngN) > 180) {
      errorEl.textContent = 'CODEX';
      return;
    }

    var fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('lat', String(latN));
    fd.append('lng', String(lngN));
    fd.append('address', address);
    fd.append('pin_type', pinType);
    (reportState.images || []).forEach(function (img) { fd.append('images', img.file); });

    btn.disabled = true;
    errorEl.textContent = '';
    api('./api/sightings.json', { method: 'POST', body: fd })
      .then(function (d) {
        h.close();
        reportState = null;
        stopPicking();
        toast(d.message || 'CODEX！');
        refreshUserPins();
      })
      .catch(function (err) {
        errorEl.textContent = err.message;
        btn.disabled = false;
      });
  }

  /* ---------- CODEX ---------- */
  // CODEX，CODEX；CODEX/CancelCODEX
  function startPicking() {
    picking = true;
    document.body.classList.add('app-picking');
    if (reportState && reportState.h && reportState.h.overlay.isConnected) {
      reportState.h.overlay.classList.add('is-picking');
    }
    var banner = ensurePickBanner();
    banner.classList.add('is-visible');
  }

  function stopPicking() {
    picking = false;
    document.body.classList.remove('app-picking');
    if (reportState && reportState.h && reportState.h.overlay.isConnected) {
      reportState.h.overlay.classList.remove('is-picking');
    }
    // CODEXNoticeCODEX DOM，CODEX
    var banner = $('#app-pick-banner');
    if (banner) banner.remove();
  }

  function ensurePickBanner() {
    var banner = $('#app-pick-banner');
    if (banner) return banner;
    banner = document.createElement('div');
    banner.id = 'app-pick-banner';
    banner.innerHTML =
      '<span>🕷️ CODEXLocation（CODEX，CODEX Esc Cancel）</span>' +
      '<button type="button" class="app-btn" data-cancel>Cancel</button>';
    document.body.appendChild(banner);
    $('[data-cancel]', banner).addEventListener('click', stopPicking);
    return banner;
  }

  // CODEX → GCJ02 CODEX（Web CODEX）
  function buildMapProjection() {
    var map = window.spideyMap;
    var container = $('#map-view');
    if (!map || !container) return null;
    var cRect = container.getBoundingClientRect();
    if (!cRect.width || !cRect.height) return null;
    var pins = (window.spideyPins || []).concat(userPins);
    var entries = [];
    for (var id in map.markersByPinId) {
      var el = map.markersByPinId[id];
      if (!el || !el.isConnected || el.style.display === 'none') continue;
      var pin = null;
      for (var i = 0; i < pins.length; i++) { if (pins[i].id === id) { pin = pins[i]; break; } }
      if (!pin) continue;
      var eRect = el.getBoundingClientRect();
      entries.push({ x: eRect.left - cRect.left + eRect.width / 2, y: eRect.top - cRect.top + eRect.height / 2, lng: Number(pin.lng), lat: Number(pin.lat) });
    }
    if (entries.length < 2) return null;
    var p1 = entries[0], p2 = entries[entries.length - 1];
    var dX = p2.x - p1.x;
    if (Math.abs(dX) < 2) return null;
    var r1 = p1.lng * PI / 180, r2 = p2.lng * PI / 180;
    var m1 = Math.log(Math.tan(PI / 4 + p1.lat * PI / 360));
    var m2 = Math.log(Math.tan(PI / 4 + p2.lat * PI / 360));
    var S = dX / (r2 - r1); // CODEX / CODEX
    if (!isFinite(S) || Math.abs(S) < 1e-9) return null;
    var lng0 = r1 - p1.x / S;
    var m0 = m1 - p1.y / S;
    return {
      toLatLng: function (px, py) {
        var lng = (lng0 + px / S) * 180 / PI;
        var m = m0 + py / S;
        var lat = (2 * Math.atan(Math.exp(m)) - PI / 2) * 180 / PI;
        return { lng: lng, lat: lat };
      }
    };
  }

  // CODEX → CODEX
  document.addEventListener('click', function (e) {
    if (!picking) return;
    var container = $('#map-view');
    if (!container) return;
    var cRect = container.getBoundingClientRect();
    if (!cRect.width || !cRect.height) {
      toast('CODEX，CODEX');
      return;
    }
    if (e.clientX < cRect.left || e.clientX > cRect.right || e.clientY < cRect.top || e.clientY > cRect.bottom) return;
    // CODEX、CODEX
    if (e.target.closest && (e.target.closest('.spidey-pin-wrap') || e.target.closest('.pin-card-wrap'))) return;
    var wgs = null;
    // CODEX API（CODEX）
    var amap = window.__amapMapInstance;
    if (amap && typeof amap.containerToLngLat === 'function') {
      try {
        var ll = amap.containerToLngLat([e.clientX - cRect.left, e.clientY - cRect.top]);
        if (ll) {
          var glng = typeof ll.getLng === 'function' ? ll.getLng() : ll.lng;
          var glat = typeof ll.getLat === 'function' ? ll.getLat() : ll.lat;
          if (isFinite(glng) && isFinite(glat)) wgs = gcj02ToWgs84(glng, glat);
        }
      } catch (err) { /* CODEX */ }
    }
    // CODEX：CODEX（CODEX）
    if (!wgs) {
      var proj = buildMapProjection();
      if (!proj) {
        toast('CODEX，CODEX');
        return;
      }
      var gcj = proj.toLatLng(e.clientX - cRect.left, e.clientY - cRect.top);
      wgs = gcj02ToWgs84(gcj.lng, gcj.lat);
    }
    if (reportState && reportState.h && reportState.h.overlay.isConnected) {
      reportState.picked = { lat: wgs.lat, lng: wgs.lng };
      setPickedInfo(reportState.h, reportState.picked);
      stopPicking();
      toast('CODEX！');
    } else {
      stopPicking();
      openReportModal();
      reportState.picked = { lat: wgs.lat, lng: wgs.lng };
      setPickedInfo(reportState.h, reportState.picked);
    }
  }, true);

  /* ==================== CODEX ==================== */
  function openRecordsModal(tab) {
    closeAllAppModals();
    if (!currentUser) {
      toast('CODEXLogin');
      openAuthModal('login', function () { openRecordsModal(tab); });
      return;
    }
    var h = createModal('CODEX', true);
    h.body.innerHTML =
      '<div class="app-tabs">' +
      '  <button type="button" class="app-tab" data-rec-tab="favorites">Favorites</button>' +
      '  <button type="button" class="app-tab" data-rec-tab="mine">CODEX</button>' +
      '</div>' +
      '<div data-rec-list><div class="app-loading">Loading</div></div>';
    $$('[data-rec-tab]', h.body).forEach(function (el) {
      el.addEventListener('click', function () { renderRecordsTab(h, el.dataset.recTab); });
    });
    renderRecordsTab(h, tab || 'favorites');
  }

  function renderRecordsTab(h, tab) {
    $$('[data-rec-tab]', h.body).forEach(function (el) { el.classList.toggle('is-active', el.dataset.recTab === tab); });
    var list = $('[data-rec-list]', h.body);
    list.innerHTML = '<div class="app-loading">Loading</div>';
    if (tab === 'favorites') renderFavorites(h, list);
    else renderMySightings(h, list);
  }

  function renderFavorites(h, list) {
    api('/api/favorites').then(function (d) {
      var favs = d.favorites || [];
      if (!favs.length) {
        list.innerHTML = '<div class="app-list-empty">CODEX —— CODEX，CODEX ★ CODEX</div>';
        return;
      }
      list.innerHTML = '<div class="app-list">' + favs.map(function (f) {
        var id = f.sighting_id ? 'usr-' + f.sighting_id : f.pin_id;
        return '<div class="app-list-item" data-fav-id="' + esc(id) + '" data-fav-row="' + f.id + '">' +
          '<div class="app-list-item__thumb" data-fav-go="' + esc(id) + '">' +
          (f.thumb ? '<img src="' + esc(f.thumb) + '" alt="" loading="lazy">' : '🗺️') +
          '</div>' +
          '<div class="app-list-item__body">' +
          '  <p class="app-list-item__title" data-fav-go="' + esc(id) + '">' + esc(f.title || 'CODEX') + '</p>' +
          '  <p class="app-list-item__meta">' + esc(Number(f.lat).toFixed(4) + ', ' + Number(f.lng).toFixed(4)) + ' · ' + esc(f.pin_type === 'rumored' ? 'CODEX' : 'CODEX') + '</p>' +
          '  <div class="app-list-item__actions">' +
          '    <button type="button" class="app-btn" data-fav-go="' + esc(id) + '">CODEX</button>' +
          '    <button type="button" class="app-btn" data-fav-del="' + f.id + '">CancelCODEX</button>' +
          '  </div>' +
          '</div></div>';
      }).join('') + '</div>';

      $$('[data-fav-del]', list).forEach(function (btn) {
        btn.addEventListener('click', function () {
          api('/api/favorites/' + btn.dataset.favDel, { method: 'DELETE' })
            .then(function () {
              delete favIds[btn.closest('[data-fav-row]').dataset.favId];
              toast('CODEXCancelCODEX');
              renderRecordsTab(h, 'favorites');
            })
            .catch(function (err) { toast(err.message); });
        });
      });
      $$('[data-fav-go]', list).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.dataset.favGo;
          var pin = null;
          if (id.indexOf('usr-') === 0) {
            for (var i = 0; i < userPins.length; i++) { if (userPins[i].id === id) { pin = userPins[i]; break; } }
          } else {
            for (var j = 0; j < (window.spideyPins || []).length; j++) { if (window.spideyPins[j].id === id) { pin = window.spideyPins[j]; break; } }
          }
          if (!pin) { toast('CODEX'); return; }
          h.close();
          document.dispatchEvent(new CustomEvent('app:fly-to-pin', { detail: { pin: pin } }));
        });
      });
    }).catch(function (err) {
      list.innerHTML = '<div class="app-list-empty">CODEXError：' + esc(err.message) + '</div>';
    });
  }

  function renderMySightings(h, list) {
    api('./api/sightings.json').then(function (d) {
      var mine = (d.sightings || []).filter(function (s) { return s.author && s.author.id === currentUser.id; });
      if (!mine.length) {
        list.innerHTML = '<div class="app-list-empty">CODEX —— CODEX"CODEX"CODEX！</div>';
        return;
      }
      list.innerHTML = '<div class="app-list">' + mine.map(function (s) {
        var idNum = String(s.id).replace('usr-', '');
        return '<div class="app-list-item" data-mine-id="' + esc(s.id) + '">' +
          '<div class="app-list-item__thumb" data-mine-go="' + esc(s.id) + '">' +
          (s.cardThumbImg ? '<img src="' + esc(s.cardThumbImg) + '" alt="" loading="lazy">' : '🕷️') +
          '</div>' +
          '<div class="app-list-item__body">' +
          '  <p class="app-list-item__title" data-mine-go="' + esc(s.id) + '">' + esc(s.title) + '</p>' +
          (s.description ? '<p class="app-list-item__desc">' + esc(s.description) + '</p>' : '') +
          '  <p class="app-list-item__meta">' + esc(new Date(s.createdAt).toLocaleString('en-US')) + ' · ' + esc(Number(s.lat).toFixed(4) + ', ' + Number(s.lng).toFixed(4)) + '</p>' +
          '  <div class="app-list-item__actions">' +
          '    <button type="button" class="app-btn" data-mine-go="' + esc(s.id) + '">CODEX</button>' +
          '    <button type="button" class="app-btn is-danger" data-mine-del="' + idNum + '">CODEX</button>' +
          '  </div>' +
          '</div></div>';
      }).join('') + '</div>';

      $$('[data-mine-del]', list).forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!window.confirm('CODEX？')) return;
          api('/api/sightings/' + btn.dataset.mineDel, { method: 'DELETE' })
            .then(function () {
              toast('CODEX');
              removeUserPinDom(btn.closest('[data-mine-id]').dataset.mineId);
              renderRecordsTab(h, 'mine');
              refreshUserPins();
            })
            .catch(function (err) { toast(err.message); });
        });
      });
      $$('[data-mine-go]', list).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.dataset.mineGo;
          var pin = null;
          for (var i = 0; i < userPins.length; i++) { if (userPins[i].id === id) { pin = userPins[i]; break; } }
          if (!pin) { toast('CODEX，CODEX'); return; }
          h.close();
          document.dispatchEvent(new CustomEvent('app:fly-to-pin', { detail: { pin: pin } }));
        });
      });
    }).catch(function (err) {
      list.innerHTML = '<div class="app-list-empty">CODEXError：' + esc(err.message) + '</div>';
    });
  }

  /* ==================== CODEX ==================== */
  function apiToPin(s) {
    var thumb = s.cardThumbImg || (s.images && s.images[0]) || '';
    return {
      id: s.id,                    // 'usr-N'
      pinType: s.pinType || 'rumored',
      title: s.title || 'CODEX',
      description: s.description || '',
      imageSrc: thumb,
      cardThumbImg: thumb,
      lat: Number(s.lat),
      lng: Number(s.lng),
      displayLocation: s.address || '',
      fanXHandle: s.author ? '@' + s.author.username : '',
      x_msg: s.description || '',
      images: s.images || [],
      // CODEXImage → CODEX MsgCenter CODEX image-gallery CODEX（CODEX+CODEX）
      lightboxImages: (s.images || []).filter(Boolean),
      author: s.author || null,
      createdAt: s.createdAt
    };
  }

  function refreshUserPins() {
    return api('./api/sightings.json').then(function (d) {
      var next = (d.sightings || []).map(apiToPin);
      
      // Inject new member pin
      next.push({
        id: 'new-member-1',
        pinType: 'confirmed',
        title: 'New Member: Alice Hacker',
        description: 'Just recruited to CODEX ITER as a core developer.',
        lat: 20.249870,
        lng: 85.806490,
        cardThumbImg: 'favicon.png',
        displayLocation: 'Bhubaneswar, Odisha',
        createdAt: new Date().toISOString()
      });
      // CODEX DOM
      var known = {};
      next.forEach(function (p) { known[p.id] = true; });
      userPins.forEach(function (old) {
        if (!known[old.id]) removeUserPinDom(old.id);
      });
      userPins = next;
      window.userPins = next; // CODEX and CODEX
      // CODEX mainData.spideyPins：EventCODEX
      try {
        if (window.mainData) window.mainData.spideyPins = next;
        if (window.spideyPins) window.spideyPins = next;
        document.dispatchEvent(new CustomEvent('app:activity-log-refresh'));
        refreshCommunityFeed();
      } catch (e) { /* CODEX */ }
      // CODEX；CODEX（CODEX），CODEX
      var attempt = 0;
      (function dispatch() {
        document.dispatchEvent(new CustomEvent('app:event-pins-ready', { detail: { pins: userPins } }));
        if (!window.spideyMap || !userPins.length || attempt >= 6) return;
        setTimeout(function () {
          var rendered = 0;
          userPins.forEach(function (p) {
            var el = document.querySelector('#map-view .spidey-pin-wrap[data-pin-id="' + p.id + '"]');
            if (el && el.style.display !== 'none') rendered++;
          });
          if (rendered < userPins.length) { attempt++; dispatch(); }
        }, 1500);
      })();
    }).catch(function (e) { console.warn('[app] CODEXError:', e); });
  }

  function removeUserPinDom(id) {
    // CODEX DOM CODEX（CODEX markersByPinId  and CODEX）
    try {
      document.querySelectorAll('#map-view .spidey-pin-wrap[data-pin-id="' + CSS.escape(id) + '"]').forEach(function (el) { el.remove(); });
    } catch (e) {}
    var map = window.spideyMap;
    if (map && map.markersByPinId) {
      var el = map.markersByPinId[id];
      if (el) { try { el.remove(); } catch (e2) {} delete map.markersByPinId[id]; }
    }
  }

  function waitForMap(cb, timeout) {
    var t0 = Date.now();
    (function check() {
      if (window.spideyMap) { cb(); return; }
      if (Date.now() - t0 > (timeout || 20000)) return;
      setTimeout(check, 300);
    })();
  }

  /* ==================== CODEX（CODEX / CODEX） ==================== */
  // CODEX：app:pin-click CODEX ★ CODEX + CODEXpicsCODEX（CODEX，CODEX）
  document.addEventListener('app:pin-click', function (e) {
    var pin = e.detail && e.detail.pin;
    if (!pin) return;
    setTimeout(function () {
      injectImgCountToCards(pin, 8);
    }, 300);
  });

  // CODEX：CODEXpicsCODEX
  function injectImgCountToCards(pin, tries) {
    var wraps = $$('.pin-card-wrap.is-visible');
    if (!wraps.length) {
      if (tries > 0) setTimeout(function () { injectImgCountToCards(pin, tries - 1); }, 500);
      return;
    }
    var wrap = wraps[wraps.length - 1];
    if ($('.app-img-count', wrap)) return;
    var imgs = (pin.images || []).filter(Boolean);
    if (imgs.length < 2) return; // CODEXpicsCODEX
    var imgBox = $('.pin-card-dyn__image', wrap);
    if (!imgBox) return;
    var badge = document.createElement('span');
    badge.className = 'app-img-count';
    badge.textContent = imgs.length + ' pics';
    imgBox.appendChild(badge);
  }

  // CODEX（MsgCenter CODEX）
  document.addEventListener('app:view-red-pin-sighting', function (e) {
    var pin = e.detail && e.detail.pin;
    if (!pin) return;
    setTimeout(function () {
      // CODEX：CODEX → Spider-Man logo；CODEX → CODEXpicsCODEX
      var left = $('.content-left');
      if (left) {
        // CODEX（CODEX）
        $$('[data-app-detail-logo], [data-app-detail-count]', left).forEach(function (el) { el.remove(); });
        left.classList.remove('app-no-media');
        var imgs = (pin.images || []).filter(Boolean);
        if (!imgs.length) {
          var logo = document.createElement('img');
          logo.className = 'app-detail-logo';
          logo.dataset.appDetailLogo = '1';
          logo.src = 'favicon.png';
          logo.alt = '';
          logo.loading = 'eager';
          left.appendChild(logo);
          left.classList.add('app-no-media'); // CODEX（CODEX）
        } else if (imgs.length > 1) {
          var badge = document.createElement('span');
          badge.className = 'app-img-count';
          badge.dataset.appDetailCount = '1';
          badge.textContent = imgs.length + ' pics';
          left.appendChild(badge);
        }
      }
    }, 120);
  });

  function pinKey(pin) {
    return String(pin.id).indexOf('usr-') === 0 ? pin.id : String(pin.id);
  }

  function toggleFavorite(pin, btn) {
    if (!currentUser) {
      toast('CODEXLogin');
      openAuthModal('login');
      return;
    }
    var key = pinKey(pin);
    var isUsr = key.indexOf('usr-') === 0;
    var body = isUsr
      ? { sighting_id: Number(key.slice(4)), title: pin.title, lat: pin.lat, lng: pin.lng, thumb: pin.cardThumbImg || '', pin_type: pin.pinType || 'rumored' }
      : { pin_id: key, title: pin.title, lat: pin.lat, lng: pin.lng, thumb: pin.cardThumbImg || pin.imageSrc || '', pin_type: pin.pinType || 'confirmed' };
    btn.disabled = true;
    api('/api/favorites', { method: 'POST', body: body })
      .then(function (d) {
        favIds[key] = true;
        btn.classList.add('is-faved');
        btn.innerHTML = '★';
        if (d.duplicated) toast('Already favoritedCODEX');
        else toast('Favorited ★');
        btn.disabled = false;
      })
      .catch(function (err) {
        toast(err.message);
        btn.disabled = false;
      });
  }

  /* ==================== CODEX ==================== */
  // CODEX（CODEX）CODEX"Post Sighting"CODEX → CODEX
  document.addEventListener('click', function (e) {
    var cta = e.target.closest ? e.target.closest('.x-feed__cta') : null;
    if (!cta) return;
    e.preventDefault();
    openReportModal();
  }, false);




  // CODEX（.ticker）：CODEX「CODEX」CODEX
  // CODEX（CODEX，CODEX）
  // pointerdown + click CODEX；CODEX ticker CODEX
  function tickerHitTest(e) {
    var t = e.target && e.target.closest ? e.target.closest('.ticker') : null;
    if (!t) {
      var ticker = document.querySelector('.ticker');
      if (ticker) {
        var r = ticker.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) t = ticker;
      }
    }
    return t;
  }
  function openCommunityFromTicker(e) {
    if (!tickerHitTest(e)) return;
    // CODEX（pre-map CODEX）：CODEX
    if (!window.__menuMapReady) return;
    e.preventDefault(); // CODEX pointerdown CODEX mouse CODEX → click CODEX
    document.dispatchEvent(new CustomEvent('menu-nav:open-x-feed'));
  }
  document.addEventListener('pointerdown', openCommunityFromTicker, false);
  document.addEventListener('click', openCommunityFromTicker, false);

  // CODEX ticker：CODEX「CODEX」CODEX（CODEX"Loading"CODEX）
  (function () {
    var track = document.querySelector('.ticker-track');
    if (!track) return;
    function refresh() {
      track.classList.toggle('is-share', track.textContent.indexOf('CODEX') !== -1);
    }
    refresh();
    new MutationObserver(refresh).observe(track, { childList: true, subtree: true, characterData: true });
  })();

  // CODEX（CODEX）
  function refreshCommunityFeed() {
    document.dispatchEvent(new CustomEvent('app:x-feed-refresh'));
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('.main-menu__link') : null;
    if (!link) return;
    var action = link.dataset.action;
    
    
    
  }, false);

  /* ==================== CODEX ==================== */
  function init() {
    checkAuth();
    // CODEX：CODEX/CODEX，CODEX（CODEX）CODEX
    refreshUserPins();
    // CODEX（app:map-2d-ready CODEX Map2D CODEXRegisterCODEX）→ CODEX
    // CODEX：CODEX（CODEX，CODEXRegisterCODEX）
    document.addEventListener('app:map-2d-ready', function () {
      refreshUserPins();
    });
    // CODEX：spideyMap CODEX
    waitForMap(function () {
      refreshUserPins();
      // CODEX 2D CODEX（3D CODEX）
      document.addEventListener('app:map-switched-2d', function () { refreshUserPins(); });
    });
    // CODEX：CODEX，CODEX
    // CODEX（CODEX）
    setTimeout(function ensurePinsOnMap() {
      if (!window.spideyMap) return; // CODEX，CODEX
      var rendered = !!document.querySelector('#map-view .spidey-pin-wrap[data-pin-id^="usr-"]');
      var hasPins = !!(window.spideyPins || []).length;
      if (!rendered && hasPins) {
        refreshUserPins(); // CODEX
        setTimeout(ensurePinsOnMap, 1200); // 1.2 CODEX
      }
    }, 4000); // 4 CODEX（CODEX）

    // CODEX：CODEX（CODEX）CODEX
    var __welcomeTriggered = false;
    function triggerWelcomePin() {
      if (__welcomeTriggered) return;
      var map = window.spideyMap || window.__amapMapInstance;
      if (!map) return;
      var pins = window.spideyPins || [];
      if (!pins.length) return;
      
      __welcomeTriggered = true; // CODEX
      var randomPin = pins.find(p => p.id === 'new-member-1') || pins[Math.floor(Math.random() * pins.length)];
      
      // Inject custom CSS for animations
      var style = document.createElement('style');
      style.innerHTML = `
        html, body { overflow: hidden !important; }
        @keyframes newMemberFoundBlink {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        .pin-blink-animation {
          animation: newMemberFoundBlink 1s infinite !important;
        }
        @keyframes slideDownFade {
          0% { top: -50px; opacity: 0; }
          10% { top: 60px; opacity: 1; }
          90% { top: 60px; opacity: 1; }
          100% { top: -50px; opacity: 0; }
        }
        .new-member-notification {
          position: fixed;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 153, 255, 0.9);
          color: #fff;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          font-family: monospace, sans-serif;
          font-size: 18px;
          text-transform: uppercase;
          box-shadow: 0 0 20px rgba(0, 153, 255, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.5);
          z-index: 999999;
          pointer-events: none;
          animation: slideDownFade 5s forwards;
          border: 2px solid #fff;
          letter-spacing: 2px;
          text-align: center;
        }
      `;
      document.head.appendChild(style);

      setTimeout(function() {
        try {
          if (typeof map.setZoom === 'function') map.setZoom(6); // Set a good zoom level
        } catch(e) {}
        document.dispatchEvent(new CustomEvent('app:fly-to-pin', { detail: { pin: randomPin } }));
        document.dispatchEvent(new CustomEvent('app:pin-click', { detail: { pin: randomPin } }));
        
        // Show custom animated notification
        var notif = document.createElement('div');
        notif.className = 'new-member-notification';
        notif.innerHTML = '⚠️ New Member Found! ⚠️';
        document.body.appendChild(notif);
        
        // Cleanup notification element after animation
        setTimeout(function() {
          if (notif.parentNode) notif.parentNode.removeChild(notif);
        }, 5500);

        // Make the pin blink
        setTimeout(function() {
          try {
            var pinEl = document.querySelector('#map-view .spidey-pin-wrap[data-pin-id="' + CSS.escape(randomPin.id) + '"]');
            if (pinEl) {
              pinEl.classList.add('pin-blink-animation');
              // Stop blinking after 10 seconds or keep it? Let's stop after 10s.
              setTimeout(function() { pinEl.classList.remove('pin-blink-animation'); }, 10000);
            }
          } catch(e) {}
        }, 500); // Give the DOM a moment to render the pin if it wasn't visible

      }, 1000);
    }
    document.addEventListener('app:map-2d-ready', triggerWelcomePin);
    document.addEventListener('app:pins-loaded', triggerWelcomePin);
    setInterval(triggerWelcomePin, 1000);
    // CODEX（5 CODEX，ConfirmCODEX）
    setTimeout(function () {
      var pins = window.spideyPins || [];
      var map = window.spideyMap || window.__amapMapInstance;
      var center = null, zoom = null;
      try {
        if (map && typeof map.getCenter === 'function') {
          var c = map.getCenter();
          if (c) { center = { lat: c.lat ? (typeof c.lat === 'function' ? c.lat() : c.lat) : null, lng: c.lng ? (typeof c.lng === 'function' ? c.lng() : c.lng) : null }; }
          if (typeof map.getZoom === 'function') zoom = map.getZoom();
        }
      } catch (e) { center = { err: e.message }; }
      var radar = document.getElementById('radar-canvas');
      var diag = {
        pinsCount: pins.length,
        pinsSample: pins.slice(0, 3).map(function (p) { return { id: p.id, type: p.pinType, lat: p.lat, lng: p.lng }; }),
        mapReady: !!map,
        center: center,
        zoom: zoom,
        radarCanvas: !!radar,
        radarSize: radar ? radar.width + 'x' + radar.height : 'missing'
      };
      // CODEX（ and CODEX）
      if (pins.length && center && center.lat != null) {
        var p = pins[0];
        var dLat = (p.lat - center.lat) * Math.PI / 180;
        var dLng = (p.lng - center.lng) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(center.lat * Math.PI / 180) * Math.cos(p.lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        diag.distKm = Math.round(km);
        // G() CODEX
        var e = Number.isFinite(zoom) ? zoom : 13;
        var r = 20000; // CODEX：zoom<=3 CODEX
        if (e > 3) {
          var o = window.__amapMapInstance && window.__amapMapInstance.getMinZoom ? window.__amapMapInstance.getMinZoom() : 2;
          var c = Math.max(0, 13 - e), i = Math.max(1, 13 - (Number.isFinite(o) ? o : 13)), s = Math.min(1, c / i);
          r = Math.max(25, 50 * Math.pow(2, s * i * 0.58));
        }
        diag.radarRadiusKm = Math.round(r);
        diag.wouldShow = km <= r;
      }
      console.log('[CODEX]', JSON.stringify(diag, null, 1));
    }, 5000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // CODEX window.spideyPins CODEX（CODEX spideyPins CODEX）
  // CODEX（app:pins-loaded）CODEX，CODEX
  document.addEventListener('app:pins-loaded', function () {
    if (window.userPins && window.userPins.length) {
      window.spideyPins = window.userPins;
      if (window.mainData) window.mainData.spideyPins = window.userPins;
    }
  });
  // CODEX：spideyPins CODEX
  setInterval(function () {
    var u = window.userPins;
    if (u && u.length && (!window.spideyPins || !window.spideyPins.length)) {
      window.spideyPins = u;
      if (window.mainData) window.mainData.spideyPins = u;
    }
  }, 2000);

  /* ==================== CODEX ==================== */
  // CODEX/CODEX，CODEX（CODEX and CODEX）
  (function cardFollowPin() {
    var currentPinId = null;
    document.addEventListener('app:pin-click', function (e) {
      var id = e.detail && (e.detail.id != null ? e.detail.id : (e.detail.pin && e.detail.pin.id));
      if (id != null) currentPinId = String(id);
      var cur = document.querySelector('.pin-card-wrap.is-visible');
      if (cur) cur.remove();

      var pin = e.detail && e.detail.pin;
      if (pin) {
        setTimeout(function() {
          document.dispatchEvent(new CustomEvent("app:view-red-pin-sighting", {detail: {pin: pin}}));
        }, 100);
      }
    });
    document.addEventListener('app:view-red-pin-sighting', function (e) {
      var pin = e.detail && e.detail.pin;
      if (pin && pin.id != null) currentPinId = String(pin.id);
    });

    function repositionCard() {
      if (!currentPinId) return;
      var card = document.querySelector('.pin-card-wrap.is-visible');
      if (!card) return;
      var container = document.querySelector('#map-view');
      if (!container) return;
      var pinEl;
      try { pinEl = document.querySelector('#map-view .spidey-pin-wrap[data-pin-id="' + CSS.escape(currentPinId) + '"]'); } catch (e) { return; }
      if (!pinEl) return;
      var o = pinEl.getBoundingClientRect();
      var M = container.getBoundingClientRect();
      var B = o.left - M.left + o.width / 2;
      var H = o.top - M.top;
      var C = card.offsetWidth || 220;
      var h = card.offsetHeight || 170;
      // CODEX：CODEX（CODEX overflow visible CODEX），CODEX
      var left = B - C / 2;
      var top = H - h - 10;
      var vw = window.innerWidth, vh = window.innerHeight;
      if (M.left + left < 24) left = 24 - M.left;
      if (M.left + left + C > vw - 24) left = vw - 24 - M.left - C;
      if (M.top + top < 24) {
        top = H + 10; // CODEX → CODEX
        card.classList.add('is-below');
      } else {
        card.classList.remove('is-below');
      }
      if (M.top + top + h > vh - 24) top = Math.max(24 - M.top, vh - 24 - M.top - h);
      card.style.left = left + 'px';
      card.style.top = top + 'px';
    }

    function bindMapEvents() {
      var map = window.__amapMapInstance;
      if (!map || map.__appCardFollow) return;
      map.__appCardFollow = true;
      ['moveend', 'zoomend', 'dragend', 'resize'].forEach(function (evt) {
        try { map.on(evt, repositionCard); } catch (e) { /* CODEX */ }
      });
      // CODEX/CODEX
      try { map.on('move', repositionCard); map.on('zooming', repositionCard); } catch (e) { /* CODEX */ }
    }
    document.addEventListener('app:map-2d-ready', bindMapEvents);
    setTimeout(bindMapEvents, 6000); // CODEX：CODEX
    setInterval(function () {
      if (!window.__amapMapInstance || !window.__amapMapInstance.__appCardFollow) bindMapEvents();
    }, 3000);

    // CODEX：CODEX（rumored CODEX z-index CODEX），
    // CODEX「CODEX」CODEX——CODEX
    document.addEventListener('click', function (e) {
      if (!e.target || !e.target.closest) return;
      var card = e.target.closest('.pin-card-wrap');
      if (!card || !card.classList.contains('is-visible')) return;
      // CODEX（View Sighting/CODEX）CODEX，CODEX
      if (e.target.closest('.pin-card-dyn__cta') || e.target.closest('.app-fav-btn')) return;
      var closestPin = null, minDist = 40; // 40px CODEX
      var pins = document.querySelectorAll('#map-view .spidey-pin-wrap');
      for (var i = 0; i < pins.length; i++) {
        var r = pins[i].getBoundingClientRect();
        if (r.width <= 0) continue;
        var cx = r.x + r.width / 2, cy = r.y + r.height / 2;
        var d = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
        if (d < minDist) { minDist = d; closestPin = pins[i]; }
      }
      if (closestPin) {
        e.preventDefault();
        e.stopPropagation(); // CODEX Map2D CODEX
        try { closestPin.click(); } catch (err) { /* CODEX */ } // CODEX → CODEX
      }
    }, true); // CODEX：CODEX Map2D CODEX click CODEX
  })();

  // CODEX
  window.spideyApp = {
    openAuth: openAuthModal,
    openReport: openReportModal,
    openRecords: openRecordsModal,
    refreshUserPins: refreshUserPins,
    getCurrentUser: function () { return currentUser; }
  };
})();

// Repurpose sound-toggle-btn to open the Community Updates sidebar
(function () {
  var btn = document.getElementById('sound-toggle-btn');
  if (!btn) return;
  btn.removeAttribute('data-action');
  btn.setAttribute('title', 'Community Updates');
  btn.setAttribute('aria-label', 'Open Community Updates');
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    document.dispatchEvent(new CustomEvent('app:open-x-feed'));
  });
})();

// Aarambh — CODEX Orientation Event: purple star via existing pin engine
(function () {
  // Purple star SVG as a data URI for the CSS content rule
  var purpleStarSVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56' width='56' height='56'%3E%3Cdefs%3E%3CradialGradient id='ag' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23e879f9'/%3E%3Cstop offset='100%25' stop-color='%237e22ce'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cpolygon points='28,4 34,20 52,20 38,31 43,48 28,38 13,48 18,31 4,20 22,20' fill='url(%23ag)' stroke='%23f0abfc' stroke-width='1.5'/%3E%3C/svg%3E";

  // Inject CSS for the custom pin type once
  if (!document.getElementById('aarambh-style')) {
    var s = document.createElement('style');
    s.id = 'aarambh-style';
    s.textContent = [
      '#map-vector-layer .pin-aarambh { content: url("' + purpleStarSVG + '"); width: 44px !important; }',
      '@keyframes aarambh-glow {',
      '  0%,100% { filter: drop-shadow(0 0 4px #c084fc) drop-shadow(0 0 10px #a855f7); transform: scale(1); }',
      '  50% { filter: drop-shadow(0 0 12px #e879f9) drop-shadow(0 0 24px #c026d3); transform: scale(1.15); }',
      '}',
      '#map-vector-layer .pin-aarambh { animation: aarambh-glow 2s ease-in-out infinite; }'
    ].join('\n');
    document.head.appendChild(s);
  }

  var AARAMBH_PIN = {
    id: 'aarambh-codex-2026',
    pinType: 'event',
    pinTypeOverride: 'aarambh',
    lat: 20.24919,
    lng: 85.80163,
    title: 'Aarambh — The CODEX Orientation Event',
    x_msg: 'Live orientation event at ITER Campus, Bhubaneswar. Welcome to CODEX!',
    highlighted: false,
    cardThumbImg: '',
    images: [],
    address: 'ITER Campus, Bhubaneswar'
  };

  // Dispatch via the existing event-pins-ready channel which Map2D listens to
  function dispatchPin() {
    document.dispatchEvent(new CustomEvent('app:event-pins-ready', {
      detail: { pins: [AARAMBH_PIN] }
    }));
  }

  // Map2D listens for app:event-pins-ready after app:map-2d-ready
  document.addEventListener('app:map-2d-ready', function () {
    // Small delay to ensure Map2D's listener is registered first
    setTimeout(dispatchPin, 100);
  });
})();