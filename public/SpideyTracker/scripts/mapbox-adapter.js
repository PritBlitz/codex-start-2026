/* SpideyTracker Mapbox GL JS Adapter
 * Simulates a small subset of the google.maps API using Mapbox GL JS,
 * allowing existing code (Map2D, flyToLocation, Radar) to run unmodified.
 * Coordinate System: WGS84 (native to Mapbox).
 */
(function () {
  'use strict';
  if (window.__mapboxAdapterLoaded) return;
  window.__mapboxAdapterLoaded = true;

  // Ensure mapboxgl is loaded
  if (!window.mapboxgl) {
    console.warn('Mapbox GL JS is not loaded yet.');
  }

  // ---------- Utils ----------
  function toLngLat(center) {
    // center: {lat,lng} or [lng,lat] or AMap/Google LngLat -> WGS84 {lat,lng}
    if (!center) return null;
    if (typeof center.lat === 'number' && typeof center.lng === 'number') return { lat: center.lat, lng: center.lng };
    if (Array.isArray(center) && center.length >= 2) return { lat: center[1], lng: center[0] };
    if (center.getLat && center.getLng) return { lat: center.getLat(), lng: center.getLng() };
    if (typeof center.lat === 'function' && typeof center.lng === 'function') return { lat: center.lat(), lng: center.lng() };
    return null;
  }

  function bindOnce(obj, type, cb) {
    if (!obj) { cb && cb(); return; }
    try {
      obj.once(type, cb);
    } catch (e) { cb && cb(); }
  }

  // ---------- google.maps.Map Adapter ----------
  function MapboxMapAdapter(el, opts) {
    opts = opts || {};
    var center = toLngLat(opts.center) || { lat: 40, lng: -73 };
    
    // Set Mapbox Access Token. In a real scenario, this should be set globally before init.
    // Try to get it from a global variable if user set it, else use a placeholder
    mapboxgl.accessToken = window.MAPBOX_TOKEN || window.MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN';

    var mapOpts = {
      container: el,
      center: [center.lng, center.lat],
      zoom: typeof opts.zoom === 'number' ? opts.zoom : 4,
      style: 'mapbox://styles/mapbox/dark-v11', // Mapbox dark theme
      dragPan: true,
      scrollZoom: true,
      doubleClickZoom: true,
      keyboard: false, // matches AMap adapter behavior
      pitchWithRotate: false
    };
    if (typeof opts.minZoom === 'number') mapOpts.minZoom = opts.minZoom;
    if (opts.maxZoom) mapOpts.maxZoom = opts.maxZoom;
    
    this._map = new mapboxgl.Map(mapOpts);
    window.__mapboxMapInstance = this._map;
    
    var self = this;
    this._completed = false;
    this._map.once('load', function () { 
      self._completed = true;
      self._map.resize(); // Ensure canvas is sized correctly
    });
    
    this._el = el;
  }

  MapboxMapAdapter.prototype = {
    addListener: function (type, cb) {
      var self = this;
      var evtType = type;
      if (type === 'complete' || type === 'idle') evtType = 'load';
      
      var handler = function (e) {
        var evt = e || {};
        var ll = e && e.lngLat ? { lat: e.lngLat.lat, lng: e.lngLat.lng } : null;
        evt.latLng = ll ? { 
          lat: ll.lat, 
          lng: ll.lng, 
          latFn: function () { return ll.lat; }, 
          lngFn: function () { return ll.lng; } 
        } : null;
        if (evt.latLng) { 
          evt.latLng.lat = function () { return ll.lat; }; 
          evt.latLng.lng = function () { return ll.lng; }; 
        }
        cb && cb(evt);
      };
      
      this._map.on(evtType, handler);
      return { remove: function () { self._map.off(evtType, handler); } };
    },
    on: function (type, cb) { this._map.on(type, cb); return this; },
    once: function (type, cb) { this._map.once(type, cb); return this; },
    off: function (type, cb) { this._map.off(type, cb); return this; },
    getCenter: function () {
      var c = this._map.getCenter();
      if (!c) return null;
      var res = { 
        lat: function () { return c.lat; }, 
        lng: function () { return c.lng; }, 
        latv: c.lat, 
        lngv: c.lng 
      };
      return res;
    },
    getZoom: function () { return this._map.getZoom(); },
    getDiv: function () { return this._el; },
    get: function (key) {
      if (key === 'minZoom') return this._map.getMinZoom();
      if (key === 'maxZoom') return this._map.getMaxZoom();
      return undefined;
    },
    setCenter: function (center) {
      var ll = toLngLat(center);
      if (!ll) return this;
      this._map.setCenter([ll.lng, ll.lat]);
      return this;
    },
    setZoom: function (z) { this._map.setZoom(z); return this; },
    panTo: function (center) { 
      var ll = toLngLat(center);
      if (ll) this._map.panTo([ll.lng, ll.lat]); 
      return this; 
    },
    setOptions: function (o) { return this; },
    moveCamera: function (o) {
      if (!o) return this;
      var ll = toLngLat(o.center);
      if (ll) {
        if (typeof o.zoom === 'number') {
          this._map.jumpTo({ center: [ll.lng, ll.lat], zoom: o.zoom });
        } else {
          this._map.setCenter([ll.lng, ll.lat]);
        }
      } else if (typeof o.zoom === 'number') {
        this._map.setZoom(o.zoom);
      }
      return this;
    },
    fitBounds: function (b) { 
      // b is [[w, s], [e, n]] roughly
      try { 
        if (b && this._map.fitBounds) this._map.fitBounds(b); 
      } catch (e) {} 
      return this; 
    }
  };

  // ---------- AdvancedMarkerElement Adapter ----------
  function MapboxMarkerAdapter(opts) {
    opts = opts || {};
    var ll = toLngLat(opts.position) || { lat: 0, lng: 0 };
    
    var markerOpts = { anchor: 'bottom' };
    if (opts.content) {
      markerOpts.element = opts.content;
    }
    
    this._marker = new mapboxgl.Marker(markerOpts);
    this._marker.setLngLat([ll.lng, ll.lat]);
    
    this.content = opts.content || null;
    this.map = null;
    
    if (opts.map) this.setMap(opts.map);
  }

  MapboxMarkerAdapter.prototype = {
    setMap: function (map) {
      if (map && map._map) { 
        this._marker.addTo(map._map); 
        this.map = map; 
      } else if (map === null || map === undefined) { 
        this._marker.remove(); 
        this.map = null; 
      }
      return this;
    },
    setPosition: function (pos) {
      var ll = toLngLat(pos);
      if (ll) { this._marker.setLngLat([ll.lng, ll.lat]); }
      return this;
    },
    getPosition: function () {
      var p = this._marker.getLngLat();
      if (!p) return null;
      return { lat: p.lat, lng: p.lng };
    },
    addListener: function (type, cb) {
      var el = this._marker.getElement();
      var evtType = type;
      if (type === 'gmp-click') evtType = 'click';
      if (type === 'gmp-pointerdown') evtType = 'mousedown';
      if (type === 'pointerdown') evtType = 'mousedown';
      
      el.addEventListener(evtType, function(e) {
        var evt = e || {};
        var p = this._marker && this._marker.getLngLat();
        evt.latLng = p ? { lat: p.lat, lng: p.lng } : null;
        evt.stop = function () { e.stopPropagation(); };
        cb && cb(evt);
      }.bind(this));
      return this;
    },
    addEventListener: function (type, cb) {
      return this.addListener(type, cb);
    },
    removeEventListener: function (type) {
      // Simplification: In a full adapter we'd keep track of handlers to remove them.
      return this;
    },
    setCenter: function (pos) { return this.setPosition(pos); },
    remove: function () { this._marker.remove(); return this; },
    setVisible: function (v) { 
      var el = this._marker.getElement();
      if (el) el.style.display = v ? '' : 'none'; 
      return this; 
    }
  };

  // ---------- importLibrary ----------
  function importLibrary(name) {
    if (name === 'marker') {
      return Promise.resolve({ AdvancedMarkerElement: MapboxMarkerAdapter, Marker: MapboxMarkerAdapter });
    }
    return Promise.reject(new Error('Library "' + name + '" is not supported in Mapbox adapter'));
  }

  // ---------- google.maps.event ----------
  var eventApi = {
    addListenerOnce: function (obj, type, cb) {
      if (!obj) { cb && cb(); return { remove: function () {} }; }
      if (obj._map) {
        var target = obj._map;
        var evtType = type === 'idle' ? 'load' : type;
        var done = false;
        var handler = function () {
          if (done) return;
          done = true;
          try { target.off(evtType, handler); } catch (e) {}
          cb && cb();
        };
        if (obj._completed) { handler(); return { remove: handler }; }
        try { target.once(evtType, handler); } catch (e) { handler(); }
        setTimeout(handler, 2000); // fallback
        return { remove: handler };
      }
      return { remove: function () {} };
    },
    addListener: function (obj, type, cb) {
      if (!obj) return { remove: function () {} };
      if (obj._map) return obj.addListener(type, cb);
      return { remove: function () {} };
    },
    removeListener: function (l) { try { l && l.remove && l.remove(); } catch (e) {} },
    trigger: function (obj, type) { 
      // Custom event trigger not strictly mapped in GL JS natively this way, but we can do:
      try { obj && obj._map && obj._map.fire(type); } catch (e) {} 
    }
  };

  // Setup google.maps global
  window.google = window.google || {};
  window.google.maps = {
    Map: MapboxMapAdapter,
    importLibrary: importLibrary,
    event: eventApi,
    LatLng: function (lat, lng) { this.lat = lat; this.lng = lng; this.latv = lat; this.lngv = lng; },
    Marker: MapboxMarkerAdapter,
    AdvancedMarkerElement: MapboxMarkerAdapter
  };

  window.__mapboxReady = function () {
    window.__initMapsCalled = true;
    if (typeof window.initMaps === 'function') {
      try { window.initMaps(); } catch (e) { console.warn('[Mapbox] initMaps error:', e); }
    }
  };

  var _mapboxInterval = setInterval(function () {
    if (window.mapboxgl) {
      clearInterval(_mapboxInterval);
      if (window.__initMapsCalled) return;
      window.__mapboxReady();
    }
  }, 100);
})();
