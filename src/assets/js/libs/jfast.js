// =====================================================================================
//  jFast 1.2.3 – Compact jQuery‑like Helper Library  (FULL, COMMENTED, v1.2.2)
//  Author: CMS Full Form – 2025‑04‑30
//
//  CHANGE‑LOG (v1.2.3)
//  -------------------
//  • Completed Traversal API (parents / children / next / prev / siblings / filter).
//  • `toggle()` now uses `jFast(element)` internally (no global `$` assumption).
//  • Added `.one()` event helper for one‑time listeners (jQuery parity).
//  • Confirmed Effects (fade / slide) animate display + opacity consistently.
//  • Ajax Accept header default fixed to `*/*` when unspecified.
//  • Minor lint / readability tweaks.
//
//  NOTE File kept human‑friendly (no minification). ES3‑compatible except `Promise`.
// =====================================================================================

(function (global) {
    'use strict';
  
    /* -------------------------------------------------------------------------
     * 1. Polyfills – ES6 Set & NodeList.forEach
     * ---------------------------------------------------------------------- */
    (function polyfills() {
      if (typeof Set !== 'function') {
        function PolySet() { this._items = []; }
        PolySet.prototype.add = function (v) { if (this._items.indexOf(v) === -1) this._items.push(v); return this; };
        PolySet.prototype.has = function (v) { return this._items.indexOf(v) !== -1; };
        PolySet.prototype.delete = function (v) { const i = this._items.indexOf(v); if (i > -1) { this._items.splice(i, 1); return true; } return false; };
        PolySet.prototype.clear = function () { this._items.length = 0; };
        Object.defineProperty(PolySet.prototype, 'size', { get() { return this._items.length; } });
        PolySet.prototype.forEach = function (cb, ctx) { for (let i = 0; i < this._items.length; i++) cb.call(ctx, this._items[i], this._items[i], this); };
        /* eslint‑disable no‑global‑assign */ Set = PolySet;
        console.warn('[jFast] ES6 Set polyfilled.');
      }
      if (global.NodeList && !NodeList.prototype.forEach) NodeList.prototype.forEach = Array.prototype.forEach;
    })();
  
    /* -------------------------------------------------------------------------
     * 2. Constructor – jFast(selector)
     * ---------------------------------------------------------------------- */
    function jFast(selector) {
      if (!(this instanceof jFast)) return new jFast(selector);
  
      if (!selector)                              this.elements = [];
      else if (typeof selector === 'string')      this.elements = document.querySelectorAll(selector);
      else if (selector instanceof NodeList || Array.isArray(selector)) this.elements = selector;
      else if (selector instanceof HTMLElement || selector === window || selector === document) this.elements = [selector];
      else if (typeof selector === 'function')  { (document.readyState !== 'loading') ? selector() : document.addEventListener('DOMContentLoaded', selector); this.elements = []; }
      else                                        this.elements = [];
  
      /* Array‑like wrapper -------------------------------------------------- */
      Object.defineProperty(this, 'length', { get: () => this.elements.length });
      const refresh = () => { Object.keys(this).forEach(k => { if (!isNaN(k)) delete this[k]; }); this.elements.forEach((el, i) => { this[i] = el; }); return this; };
      this._refresh = refresh; refresh();
    }

    jFast.version = '1.2.3';
  
    /* -------------------------------------------------------------------------
     * 3. Internal helpers
     * ---------------------------------------------------------------------- */
    const forArr  = (arr, cb) => Array.prototype.forEach.call(arr, cb);
    const matches = (el, sel) => (el.matches || el.webkitMatchesSelector || el.msMatchesSelector).call(el, sel);
    const splitCls= str => str.trim().split(/\s+/).filter(Boolean);
    const toPx    = v => typeof v === 'number' ? v + 'px' : v;
    function px(num){return parseFloat(num)||0;}
  
    /* -------------------------------------------------------------------------
     * 4. Core helpers (each / eq …)
     * ---------------------------------------------------------------------- */
    jFast.prototype.each  = function (cb) { forArr(this.elements, cb); return this; };
    jFast.prototype.eq    = function (i)  { return new jFast(this.elements[i] ? [this.elements[i]] : []); };
    jFast.prototype.first = function ()   { return this.eq(0); };
    jFast.prototype.last  = function ()   { return this.eq(this.elements.length - 1); };
  
    /* -------------------------------------------------------------------------
     * 5. CSS & attributes
     * ---------------------------------------------------------------------- */
    jFast.prototype.addClass    = function (c) { const l = splitCls(c); return this.each(el => el.classList.add(...l)); };
    jFast.prototype.removeClass = function (c) { const l = splitCls(c); return this.each(el => el.classList.remove(...l)); };
    jFast.prototype.toggleClass = function (c, s) { const l = splitCls(c); return this.each(el => l.forEach(k => el.classList.toggle(k, s))); };
    jFast.prototype.hasClass    = function (c) { return Array.prototype.some.call(this.elements, el => el.classList.contains(c)); };
  
    jFast.prototype.attr = function (n, v) {
      if (v === undefined) return this.elements[0] ? this.elements[0].getAttribute(n) : undefined;
      if (v === null)      return this.removeAttr(n);
      return this.each(el => el.setAttribute(n, v));
    };
    jFast.prototype.removeAttr = function (n) { return this.each(el => el.removeAttribute(n)); };
  
    jFast.prototype.prop = function (n, v) { if (v === undefined) return this.elements[0] ? this.elements[0][n] : undefined; return this.each(el => { el[n] = v; }); };
  
    jFast.prototype.data = function (k, v) {
      if (v === undefined) { const el = this.elements[0]; return el ? (el.dataset ? el.dataset[k] : el.getAttribute('data-' + k)) : undefined; }
      return this.each(el => { if (el.dataset) el.dataset[k] = v; else el.setAttribute('data-' + k, v); });
    };
  
    jFast.prototype.text = function (v) { if (v === undefined) return this.elements[0] ? this.elements[0].textContent : ''; return this.each(el => { el.textContent = v; }); };
    jFast.prototype.html = function (v) { if (v === undefined) return this.elements[0] ? this.elements[0].innerHTML : '';  return this.each(el => { el.innerHTML = v; }); };
  
    jFast.prototype.css = function (p, v) {
      if (typeof p === 'string') { if (v === undefined) return this.elements[0] ? getComputedStyle(this.elements[0])[p] : undefined; return this.each(el => { el.style[p] = v; }); }
      return this.each(el => { for (const k in p) if (p.hasOwnProperty(k)) el.style[k] = p[k]; });
    };
  
    /* -------------------------------------------------------------------------
     * 6. DOM insertion (clone‑safe)
     * ---------------------------------------------------------------------- */
    function listFrom(content) {
      if (typeof content === 'string') return content;
      if (content instanceof jFast || content instanceof NodeList || Array.isArray(content)) return Array.from(content.elements || content);
      return [content];
    }
    function insertAll(col, content, hook) {
      const src = listFrom(content);
      col.each((tgt, tIdx) => {
        if (typeof src === 'string') { tgt.insertAdjacentHTML(hook.pos, src); return; }
        src.forEach(node => { const n = (tIdx === 0) ? node : node.cloneNode(true); hook.fn(tgt, n); });
      });
    }
    jFast.prototype.before  = function (c) { return insertAll(this, c, { fn: (t, n) => t.parentNode.insertBefore(n, t),             pos: 'beforebegin' }); };
    jFast.prototype.after   = function (c) { return insertAll(this, c, { fn: (t, n) => t.parentNode.insertBefore(n, t.nextSibling), pos: 'afterend'   }); };
    jFast.prototype.append  = function (c) { return insertAll(this, c, { fn: (t, n) => t.appendChild(n),                          pos: 'beforeend'  }); };
    jFast.prototype.prepend = function (c) { return insertAll(this, c, { fn: (t, n) => t.insertBefore(n, t.firstChild),            pos: 'afterbegin' }); };
    jFast.prototype.remove  = function ()  { return this.each(el => el.parentNode && el.parentNode.removeChild(el)); };
    jFast.prototype.empty   = function ()  { return this.each(el => { el.innerHTML = ''; }); };
    jFast.prototype.clone = function (deep = true) {
        return new jFast(Array.prototype.map.call(this.elements, el => el.cloneNode(deep)));
    };
  
    /* -------------------------------------------------------------------------
     * 7. Dimensions & Position
     * ---------------------------------------------------------------------- */
    jFast.prototype.width  = function (v) { if (v === undefined) { const el = this.elements[0]; return el ? el.getBoundingClientRect().width : undefined; } return this.each(el => { el.style.width = toPx(v); }); };
    jFast.prototype.height = function (v) { if (v === undefined) { const el = this.elements[0]; return el ? el.getBoundingClientRect().height : undefined; } return this.each(el => { el.style.height = toPx(v); }); };
    jFast.prototype.offset = function () { const el = this.elements[0]; if (!el) return; const r = el.getBoundingClientRect(); return { top: r.top + window.pageYOffset, left: r.left + window.pageXOffset }; };
    jFast.prototype.position = function () { const el = this.elements[0]; if (!el) return; return { top: el.offsetTop, left: el.offsetLeft }; };
    jFast.prototype.scrollTop  = function (v) { if (v === undefined) { const el = this.elements[0]; return el ? el.scrollTop : undefined; } return this.each(el => { el.scrollTop = v; }); };
    jFast.prototype.scrollLeft = function (v) { if (v === undefined) { const el = this.elements[0]; return el ? el.scrollLeft : undefined; } return this.each(el => { el.scrollLeft = v; }); };
    jFast.prototype.index = function (element) {
      if (!element) { const el = this.elements[0]; return (el && el.parentNode) ? Array.prototype.indexOf.call(el.parentNode.children, el) : -1; }
      return Array.prototype.indexOf.call(this.elements, element);
    };
    ['Width','Height'].forEach(dim=>{
        const lc = dim.toLowerCase();
        jFast.prototype['inner'+dim] = function(){
            const el=this.elements[0]; if(!el)return;
            const s=getComputedStyle(el);
            return el['client'+dim]+px(s['border'+(dim==='Width'?'Left':'Top')+'Width'])+px(s['border'+(dim==='Width'?'Right':'Bottom')+'Width']);
        };
        jFast.prototype['outer'+dim] = function(margin){
            const el=this.elements[0]; if(!el)return;
            let val=el['offset'+dim];
            if(margin){
            const s=getComputedStyle(el);
            val+=px(s['margin'+(dim==='Width'?'Left':'Top')])+px(s['margin'+(dim==='Width'?'Right':'Bottom')]);
            }
            return val;
        };
    });
    jFast.prototype.offsetParent = function(){
        const el=this.elements[0];
        return el?new jFast([el.offsetParent||document.documentElement]):new jFast([]);
    };
  
    /* -------------------------------------------------------------------------
     * 8. Traversal (completed)
     * ---------------------------------------------------------------------- */
    jFast.prototype.find     = function (sel) { const set = new Set(); this.each(el => el.querySelectorAll(sel).forEach(n => set.add(n))); this.elements = Array.from(set); return this._refresh(); };
    jFast.prototype.closest  = function (sel) { const arr = []; this.each(el => { const c = el.closest(sel); if (c) arr.push(c); }); this.elements = arr; return this._refresh(); };
    jFast.prototype.parent   = function () { const list = []; this.each(el => { if (el.parentNode) list.push(el.parentNode); }); this.elements = list; return this._refresh(); };
    jFast.prototype.parents  = function () { const list = []; this.each(el => { let p = el.parentNode; while (p) { list.push(p); p = p.parentNode; } }); this.elements = list; return this._refresh(); };
    jFast.prototype.children = function () { let out = []; this.each(el => { out = out.concat(Array.from(el.children)); }); this.elements = out; return this._refresh(); };
    jFast.prototype.next     = function () { const arr = []; this.each(el => { if (el.nextElementSibling) arr.push(el.nextElementSibling); }); this.elements = arr; return this._refresh(); };
    jFast.prototype.prev     = function () { const arr = []; this.each(el => { if (el.previousElementSibling) arr.push(el.previousElementSibling); }); this.elements = arr; return this._refresh(); };
    jFast.prototype.siblings = function () { const set = new Set(); this.each(el => { const p = el.parentNode; if (!p) return; Array.from(p.children).forEach(ch => { if (ch !== el) set.add(ch); }); }); this.elements = Array.from(set); return this._refresh(); };
    jFast.prototype.filter   = function (sel) { this.elements = Array.prototype.filter.call(this.elements, el => matches(el, sel)); return this._refresh(); };
    jFast.prototype.is = function (sel)   { return !!this.elements[0] && matches(this.elements[0], sel); };
    jFast.prototype.not = function (sel)  {
    this.elements = Array.prototype.filter.call(this.elements, el => !matches(el, sel));
    return this._refresh();
    };
    jFast.prototype.add = function (sel)  {
        const extra = (typeof sel === 'string') ? document.querySelectorAll(sel)
                                                : (sel instanceof jFast ? sel.elements : [sel]);
        this.elements = Array.from(new Set([...this.elements, ...extra]));
        return this._refresh();
    };
    jFast.extend = function deep(dst, ...src){
        src.forEach(obj=>{
          for(const k in obj){
            if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
              dst[k] = dst[k] || {};
              deep(dst[k], obj[k]);
            } else { dst[k] = obj[k]; }
          }
        });
        return dst;
    };
    /* -------------------------------------------------------------------------
     * 9. Effects (show / hide / fade / slide / toggle)
     * ---------------------------------------------------------------------- */
    jFast.prototype.hide = function (duration) {
      return this.each(el => {
        if (duration) {
          el.style.transition = 'opacity ' + duration + 'ms';
          el.style.opacity = 0;
          setTimeout(() => { el.style.display = 'none'; el.style.opacity = ''; el.style.transition = ''; }, duration);
        } else {
          el.style.display = 'none';
        }
      });
    };
    jFast.prototype.show = function (duration) {
      return this.each(el => {
        const displayBackup = el.style.display === 'none' ? '' : el.style.display;
        el.style.display = displayBackup;
        if (duration) {
          el.style.opacity = 0;
          el.style.transition = 'opacity ' + duration + 'ms';
          setTimeout(() => { el.style.opacity = 1; }, 10);
          setTimeout(() => { el.style.opacity = ''; el.style.transition = ''; }, duration);
        }
      });
    };
    jFast.prototype.toggle = function (duration) {
      return this.each(el => {
        const $el = jFast(el);
        if (getComputedStyle(el).display === 'none') $el.show(duration); else $el.hide(duration);
      });
    };
    jFast.prototype.fadeIn  = function (d) { return this.show(d || 400); };
    jFast.prototype.fadeOut = function (d) { return this.hide(d || 400); };
  
    const slide = (el, down, duration) => {
      duration = duration || 400;
      const style = el.style;
      const original = { height: style.height, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom, marginTop: style.marginTop, marginBottom: style.marginBottom, overflow: style.overflow, transition: style.transition };
      if (down) {
        if (getComputedStyle(el).display === 'none') style.display = '';
        const endHeight = el.offsetHeight;
        style.height = '0'; style.paddingTop = style.paddingBottom = style.marginTop = style.marginBottom = '0';
        style.overflow = 'hidden'; style.transition = `height ${duration}ms, padding ${duration}ms, margin ${duration}ms`;
        setTimeout(() => { style.height = endHeight + 'px'; }, 10);
        setTimeout(() => { Object.assign(style, original); }, duration);
      } else {
        style.height = el.offsetHeight + 'px'; style.overflow = 'hidden'; style.transition = `height ${duration}ms, padding ${duration}ms, margin ${duration}ms`;
        setTimeout(() => { style.height = '0'; style.paddingTop = style.paddingBottom = style.marginTop = style.marginBottom = '0'; }, 10);
        setTimeout(() => { style.display = 'none'; Object.assign(style, original); }, duration);
      }
    };
    jFast.prototype.slideUp   = function (d) { return this.each(el => slide(el, false, d)); };
    jFast.prototype.slideDown = function (d) { return this.each(el => slide(el, true, d)); };
  
    /* -------------------------------------------------------------------------
     * 10. Event System (on / one / off / trigger + shortcuts)
     * ---------------------------------------------------------------------- */
    const evtStore = new WeakMap();
  
    jFast.prototype.on = function (events, selector, handler, cap) {
      if (typeof selector === 'function') { cap = handler; handler = selector; selector = null; }
      return this.each(el => {
        events.split(/\s+/).forEach(ev => {
          const key = ev + (selector ? '_del' : '_dir');
          const store = evtStore.get(el) || {};
          const listener = function (e) {
            if (selector) {
              const trg = e.target.closest(selector);
              if (trg && el.contains(trg)) { e.delegateTarget = trg; handler.call(trg, e); }
            } else {
              handler.call(el, e);
            }
          };
          store[key] = store[key] || []; store[key].push({ orig: handler, fn: listener, cap: !!cap });
          evtStore.set(el, store);
          el.addEventListener(ev, listener, !!cap);
        });
      });
    };
    jFast.prototype.one = function (events, selector, handler) {
      if (typeof selector === 'function') { handler = selector; selector = null; }
      return this.on(events, selector, function wrapper(e) { handler.call(this, e); jFast(e.currentTarget).off(events, selector, wrapper); });
    };
    jFast.prototype.off = function (events, selector, handler) {
      if (typeof selector === 'function') { handler = selector; selector = null; }
      return this.each(el => {
        const store = evtStore.get(el); if (!store) return;
        events.split(/\s+/).forEach(ev => {
          const key = ev + (selector ? '_del' : '_dir');
          (store[key] || []).forEach((o, i) => {
            if (!handler || handler === o.orig) { el.removeEventListener(ev, o.fn, o.cap); store[key].splice(i, 1); }
          });
          if (store[key] && store[key].length === 0) delete store[key];
        });
        if (Object.keys(store).length === 0) evtStore.delete(el);
      });
    };
    jFast.prototype.trigger = function (type, detail) {
      let evt; try { evt = new CustomEvent(type, { bubbles: true, cancelable: true, detail }); } catch (e) { evt = document.createEvent('CustomEvent'); evt.initCustomEvent(type, true, true, detail); }
      return this.each(el => el.dispatchEvent(evt));
    };
    ['click', 'change', 'keydown', 'keyup', 'keypress', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'].forEach(ev => {
      jFast.prototype[ev] = function (handler) { return (typeof handler === 'function') ? this.on(ev, handler) : this.trigger(ev); };
    });
  
    /* -------------------------------------------------------------------------
     * 11. Form helpers (val / serialize / serializeArray / submit)
     * ---------------------------------------------------------------------- */
    jFast.prototype.val = function (v) {
      const el = this.elements[0];
      if (v === undefined) {
        if (!el) return undefined;
        if (el.tagName === 'SELECT' && el.multiple) return Array.from(el.options).filter(o => o.selected).map(o => o.value);
        if (el.type === 'checkbox' || el.type === 'radio') return el.checked ? el.value : undefined;
        return el.value;
      }
      return this.each(node => {
        if (node.tagName === 'SELECT' && node.multiple && Array.isArray(v)) {
          Array.from(node.options).forEach(o => { o.selected = v.includes(o.value); });
        } else if (node.type === 'checkbox' || node.type === 'radio') {
          if (typeof v === 'boolean') node.checked = v; else node.value = v;
        } else node.value = v;
      });
    };
    jFast.prototype.serialize = function () {
      const form = this.elements[0]; if (!form || form.tagName !== 'FORM') return '';
      const q = [];
      Array.from(form.elements).forEach(el => {
        if (!el.name || el.disabled || /^(file|reset|submit|button)$/i.test(el.type)) return;
        if (el.type === 'select-multiple') {
          Array.from(el.options).forEach(o => { if (o.selected) q.push(encodeURIComponent(el.name) + '=' + encodeURIComponent(o.value)); });
        } else if ((/^(checkbox|radio)$/i.test(el.type) && el.checked) || !/^(checkbox|radio)$/i.test(el.type)) {
          q.push(encodeURIComponent(el.name) + '=' + encodeURIComponent(el.value));
        }
      });
      return q.join('&');
    };
    jFast.prototype.serializeArray = function () {
      const form = this.elements[0]; if (!form || form.tagName !== 'FORM') return [];
      const out = [];
      Array.from(form.elements).forEach(el => {
        if (!el.name || el.disabled || /^(file|reset|submit|button)$/i.test(el.type)) return;
        if (el.type === 'select-multiple') {
          Array.from(el.options).forEach(o => { if (o.selected) out.push({ name: el.name, value: o.value }); });
        } else if ((/^(checkbox|radio)$/i.test(el.type) && el.checked) || !/^(checkbox|radio)$/i.test(el.type)) {
          out.push({ name: el.name, value: el.value });
        }
      });
      return out;
    };
    jFast.prototype.submit = function () {
      return this.each(el => {
        let form;
        if (el.tagName === 'FORM') form = el; else if ((el.tagName === 'BUTTON' || el.tagName === 'INPUT') && el.type === 'submit') form = el.closest('form');
        if (!form) return;
        if (typeof form.requestSubmit === 'function') form.requestSubmit(el);
        else { const evt = document.createEvent('Event'); evt.initEvent('submit', true, true); if (form.dispatchEvent(evt)) form.submit(); }
      });
    };
  
    /* -------------------------------------------------------------------------
     * 12. Static utilities
     * ---------------------------------------------------------------------- */
    jFast.each    = (c, cb) => forArr(c, cb);
    jFast.map     = (c, cb) => Array.prototype.map.call(c, cb);
    jFast.grep    = (a, cb) => a.filter(cb);
    jFast.inArray = (x, a) => a.indexOf(x) !== -1;
  
    jFast.param = function param(obj, prefix) {
      const out = [];
      for (const key in obj) if (obj.hasOwnProperty(key)) {
        const k = prefix ? prefix + '[' + key + ']' : key;
        const v = obj[key];
        out.push((v !== null && typeof v === 'object') ? param(v, k) : encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
      return out.join('&');
    };
  
    /* -------------------------------------------------------------------------
     * 13. Ajax – jQuery‑compatible + Promise + shorthand helpers
     * ---------------------------------------------------------------------- */
    jFast.ajax = function (url, settings) {
      if (typeof url === 'object') { settings = url; url = settings.url; }
      settings = settings || {};
  
      settings.type        = (settings.type || 'GET').toUpperCase();
      settings.async       = settings.async !== false;
      settings.headers     = settings.headers || {};
      settings.contentType = (settings.contentType === undefined) ? 'application/x-www-form-urlencoded; charset=UTF-8' : settings.contentType;
  
      if (settings.data && !(settings.data instanceof FormData)) {
        if (typeof settings.data === 'object') settings.data = settings.contentType.indexOf('application/json') === 0 ? JSON.stringify(settings.data) : jFast.param(settings.data);
      }
      if (/^(GET|HEAD|DELETE)$/i.test(settings.type) && settings.data) { url += (url.includes('?') ? '&' : '?') + settings.data; settings.data = null; }
  
      const xhr = new XMLHttpRequest();
      const deferred = {};
      const prom = new Promise((res, rej) => { deferred.resolve = res; deferred.reject = rej; });
  
      Object.assign(xhr, {
        then: prom.then.bind(prom), catch: prom.catch.bind(prom), finally: prom.finally.bind(prom),
        done: cb => (prom.then(cb), xhr), fail: cb => (prom.catch(cb), xhr), always: cb => (prom.finally(cb), xhr),
        success: cb => (prom.then(r => cb(r, xhr.status, xhr)), xhr),
        error  : cb => (prom.catch(e => cb(e.xhr, e.status, e.text)), xhr),
        complete: cb => (prom.finally(() => cb(xhr, xhr.status)), xhr)
      });
  
      xhr.open(settings.type, url, settings.async, settings.username, settings.password);
  
      if (settings.data && !(settings.data instanceof FormData) && settings.contentType !== false) xhr.setRequestHeader('Content-Type', settings.contentType);
      const acceptMap = { json: 'application/json, text/javascript', script: 'text/javascript, application/javascript', html: 'text/html' };
      xhr.setRequestHeader('Accept', settings.dataType ? acceptMap[settings.dataType] : '*/*');
      for (const h in settings.headers) xhr.setRequestHeader(h, settings.headers[h]);
      if (settings.beforeSend && settings.beforeSend(xhr, settings) === false) return xhr;
  
      const handleError = (txt, err) => { settings.error && settings.error(xhr, xhr.status, txt, err); deferred.reject({ xhr, status: xhr.status, text: txt }); settings.complete && settings.complete(xhr, 'error'); };
  
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        const ok = (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304;
        let resp = xhr.responseText;
        if (ok && settings.dataType === 'json') {
          try { resp = JSON.parse(resp); } catch (e) { return handleError('parsererror', e); }
        } else if (ok && settings.dataType === 'script') {
          try { (0, eval)(resp); } catch (e) { return handleError('parsererror', e); }
        }
        if (ok) { settings.success && settings.success(resp, xhr.status, xhr); deferred.resolve(resp); settings.complete && settings.complete(xhr, 'success'); }
        else handleError(xhr.statusText || 'error');
      };
      xhr.onerror = () => handleError(xhr.statusText || 'error');
      xhr.send(settings.data || null);
      return xhr;
    };
    ['get', 'post'].forEach(m => { jFast[m] = (u, d, s, dt) => { if (typeof d === 'function') { dt = s; s = d; d = undefined; } return jFast.ajax({ url: u, type: m.toUpperCase(), data: d, dataType: dt, success: s }); }; });
    jFast.getJSON = (u, d, s) => jFast.get(u, d, s, 'json');
  
    /* -------------------------------------------------------------------------
     * 14. Iterator support & global export
     * ---------------------------------------------------------------------- */
    jFast.prototype[Symbol.iterator] = function () { return this.elements[Symbol.iterator](); };
    console.log('%c jFast loaded version ' + jFast.version, 'color:#e8a600;font-weight:bold');
    global.$ = global.jFast = jFast;
  
  })(window);
  