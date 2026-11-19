/* Pantalla de Inicio de Alas de Libertad: al abrir la app se ven las 4 apps (Internos, Bitácora, Médicos y Despensa)
   en barras. Las que no están instaladas en este celular muestran "Instalar"; las instaladas solo se tocan y se abren.
   - Se muestra al abrir la app (después de entrar o del PIN). Al tocar Internos se sigue en esta misma app como siempre.
   - Tocar el logo de arriba en Internos vuelve a esta pantalla.
   - La sesión es la misma para las 4 apps (misma dirección), así que no hay que volver a entrar en cada una.
   - Cada app marca en el celular si está instalada (desp_inst, med_inst, bit_inst, int_inst). */
(function () {
  "use strict";
  var BASE = "https://reboirasnicolas4-dev.github.io/";
  // En qué app está cargado este archivo (Internos por defecto; las otras lo cargan con data-app="bitacora" / "medicos" / "despensa")
  var ACTUAL = (document.currentScript && document.currentScript.getAttribute("data-app")) || "internos";
  var EN_INT = ACTUAL === "internos";
  var RAIZ_INT = EN_INT ? "" : BASE + "registro-k7x2/";
  var KOK = "alas-inicio-ok"; // en esta sesión ya eligió Internos: no volver a tapar la app al recargar o al volver de la ficha
  var APPS = [
    { id: "internos", name: "Internos", desc: "Ingresos, fichas y tiempos", icon: "logo.png", flag: "int_inst", url: BASE + "registro-k7x2/" },
    { id: "bitacora", name: "Bitácora", desc: "Cómo le va a cada interno", icon: "icon-bitacora-192.png", flag: "bit_inst", url: BASE + "bitacora-m5w8/" },
    { id: "medicos", name: "Médicos", desc: "Turnos y viáticos", icon: BASE + "turnos-m4p8/icon-192.png", flag: "med_inst", url: BASE + "turnos-m4p8/" },
    { id: "despensa", name: "Despensa", desc: "Stock y pedido del sábado", icon: BASE + "despensa-q3n7/icon-192.png", flag: "desp_inst", url: BASE + "despensa-q3n7/" }
  ];
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} }
  // Viene desde el logo de otra app (?inicio=1): mostrar Inicio aunque antes se haya elegido Internos
  if (EN_INT && /[?&]inicio=1/.test(location.search)) { ssSet(KOK, null); try { var uu = new URL(location.href); uu.searchParams.delete("inicio"); history.replaceState(null, "", uu.toString()); } catch (e) {} }
  var comoApp = function () { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; };
  var android = /Android/i.test(navigator.userAgent);

  // Internos: si se abre como app instalada, queda marcada; si Chrome ofrece instalarla, es que no está
  var pedido = null;
  if (EN_INT) {
    if (comoApp()) lsSet("int_inst", "\"1\"");
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); pedido = e; lsSet("int_inst", null); pintar(); });
    window.addEventListener("appinstalled", function () { pedido = null; lsSet("int_inst", "\"1\""); pintar(); aviso("Listo, quedó instalada"); });
  }

  function instalada(a) { var v = lsGet(a.flag); return v === "\"1\"" || v === "1" || (a.id === ACTUAL && comoApp()); }

  var css = document.createElement("style");
  css.textContent =
    "#alasInicio{position:fixed;inset:0;z-index:2147482000;background:var(--bg,#16120e);color:var(--ink,#f0e8da);overflow-y:auto;font:400 15px/1.45 'Hanken Grotesk',system-ui,sans-serif}" +
    "#alasInicio[hidden]{display:none}" +
    "html.alas-inicio body{overflow:hidden}" +
    "html.alas-inicio #splash,html.alas-inicio #app{visibility:hidden!important}" +
    "#alasInicio .ai{max-width:560px;margin:0 auto;padding:calc(env(safe-area-inset-top,0px) + 26px) 16px 28px;display:flex;flex-direction:column;gap:14px;min-height:100%;box-sizing:border-box}" +
    "#alasInicio .ai-top{display:flex;align-items:center;gap:12px}" +
    "#alasInicio .ai-top img{width:46px;height:46px;border-radius:50%}" +
    "#alasInicio .ai-top h1{font:700 26px/1 Fraunces,Georgia,serif;margin:0}" +
    "#alasInicio .ai-top small{display:block;color:var(--mut,#b3a99b);font-size:12.5px;margin-top:4px}" +
    "#alasInicio .ai-me{margin-left:auto;width:44px;height:44px;border-radius:50%;border:1px solid var(--acc,#f7a823);background:color-mix(in srgb,var(--acc,#f7a823) 18%,var(--card,#211b15));color:var(--acc,#f7a823);font:700 17px inherit;cursor:pointer;flex:none}" +
    "#alasInicio .ai-falta{display:flex;align-items:center;gap:10px;border:1px solid var(--acc,#f7a823);border-radius:16px;padding:10px 12px;background:color-mix(in srgb,var(--acc,#f7a823) 12%,var(--card,#211b15))}" +
    "#alasInicio .ai-falta b{display:block;font-size:14.5px}#alasInicio .ai-falta span{font-size:12.5px;color:var(--mut,#b3a99b)}" +
    "#alasInicio .ai-lista{display:flex;flex-direction:column;gap:10px}" +
    "#alasInicio .ai-barra{display:flex;align-items:center;gap:12px;background:var(--card,#211b15);border:1px solid var(--line,#3a3027);border-radius:18px;padding:12px;min-height:78px;box-sizing:border-box;width:100%;text-align:left;color:inherit;font:inherit;cursor:pointer;transition:transform .12s}" +
    "#alasInicio .ai-barra:active{transform:scale(.98)}" +
    "#alasInicio .ai-ic{width:54px;height:54px;border-radius:50%;overflow:hidden;flex:none;display:flex;align-items:center;justify-content:center}#alasInicio .ai-ic img{width:54px;height:54px;flex:none}#alasInicio .ai-ic img.z{width:76px;height:76px}" +
    "#alasInicio .ai-tx{flex:1;min-width:0}#alasInicio .ai-tx b{display:block;font:700 18.5px Fraunces,Georgia,serif}#alasInicio .ai-tx span{font-size:13px;color:var(--mut,#b3a99b)}" +
    "#alasInicio .ai-inst{flex:none;height:40px;padding:0 14px;border-radius:11px;border:0;background:var(--acc,#f7a823);color:var(--accx,#281a08);font:700 13.5px inherit;cursor:pointer}" +
    "#alasInicio .ai-flecha{flex:none;width:22px;height:22px;color:var(--mut,#b3a99b)}" +
    "#alasInicio .ai-toast{position:fixed;left:50%;bottom:120px;transform:translateX(-50%);background:#f0e8da;color:#1b140d;padding:10px 16px;border-radius:12px;font-weight:600;max-width:90%;text-align:center}" +
    "#alasInicio .ai-hoja{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}" +
    "#alasInicio .ai-hoja>div{background:var(--card,#211b15);border-top:1px solid var(--line,#3a3027);border-radius:22px 22px 0 0;width:100%;max-width:560px;padding:18px 16px 26px;box-sizing:border-box}" +
    "#alasInicio .ai-hoja h2{margin:0 0 8px;font:700 20px Fraunces,Georgia,serif}#alasInicio .ai-hoja ol{margin:0 0 14px;padding-left:20px;line-height:1.6}" +
    "#alasInicio .ai-big{width:100%;height:50px;border:0;border-radius:14px;background:var(--acc,#f7a823);color:var(--accx,#281a08);font:700 16px inherit;cursor:pointer}";
  document.head.appendChild(css);

  var raiz = null;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function nodo() {
    if (raiz) return raiz;
    raiz = document.createElement("div"); raiz.id = "alasInicio"; raiz.hidden = true;
    raiz.setAttribute("role", "dialog"); raiz.setAttribute("aria-label", "Inicio: elegí la app");
    raiz.addEventListener("click", alTocar);
    document.body.appendChild(raiz);
    return raiz;
  }
  function haySesion() {
    try { var t = JSON.parse(lsGet("alas-token") || "null"); if (t && t.token) return String(t.email || "?");
      var p = JSON.parse(ssGet("alas-paso") || "null"); if (p && p.token && Date.now() - p.t < 60000) return String(p.email || "?"); } catch (e) {}
    return "";
  }
  var correoIni = haySesion();
  function inicial() { try { if (typeof email === "string" && email) return email[0].toUpperCase(); } catch (e) {} return correoIni ? correoIni[0].toUpperCase() : "?"; }

  function pintar() {
    if (!raiz || raiz.hidden) return;
    var faltan = APPS.filter(function (a) { return !instalada(a); }).length;
    var h = "<div class='ai'><div class='ai-top'><img src='" + RAIZ_INT + "logo.png' alt=''><div><h1>Alas de Libertad</h1><small>Elegí la app que querés usar</small></div>" +
      (EN_INT ? "<button type='button' class='ai-me' data-ai='cuenta' aria-label='Tu cuenta'>" + esc(inicial()) + "</button>" : "<button type='button' class='ai-me' data-ai='volver' aria-label='Volver a la app'>✕</button>") + "</div>";
    if (faltan) h += "<div class='ai-falta'><svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='color:var(--acc,#f7a823);flex:none' aria-hidden='true'><path d='M12 3v12'/><path d='M7 10l5 5 5-5'/><path d='M5 21h14'/></svg><div><b>" +
      (faltan === APPS.length ? "Todavía no tenés ninguna instalada" : faltan === 1 ? "Te falta instalar 1 app" : "Te faltan instalar " + faltan + " apps") +
      "</b><span>Tocá Instalar: quedan con su ícono, como WhatsApp</span></div></div>";
    h += "<div class='ai-lista'>";
    APPS.forEach(function (a) {
      var ok = instalada(a);
      h += "<div class='ai-barra' role='button' tabindex='0' data-ai='abrir' data-id='" + a.id + "'><span class='ai-ic'><img src='" + esc(/^https?:/.test(a.icon) ? a.icon : RAIZ_INT + a.icon) + "' alt=''" + (a.id === "internos" ? "" : " class='z'") + "></span>" +
        "<div class='ai-tx'><b>" + esc(a.name) + "</b><span>" + esc(a.desc) + "</span></div>" +
        (ok ? "<svg class='ai-flecha' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M9 6l6 6-6 6'/></svg>"
            : "<button type='button' class='ai-inst' data-ai='instalar' data-id='" + a.id + "'>Instalar</button>") + "</div>";
    });
    h += "</div></div>";
    raiz.innerHTML = h;
  }
  function aviso(t) {
    if (!raiz) return; var d = document.createElement("div"); d.className = "ai-toast"; d.setAttribute("role", "status"); d.textContent = t;
    raiz.appendChild(d); setTimeout(function () { d.remove(); }, 2200);
  }
  function hoja(html) { var d = document.createElement("div"); d.className = "ai-hoja"; d.innerHTML = "<div>" + html + "</div>"; raiz.appendChild(d);
    d.addEventListener("click", function (e) { if (e.target === d || (e.target.closest && e.target.closest("[data-ai=cerrarhoja]"))) d.remove(); }); }
  function app(id) { for (var i = 0; i < APPS.length; i++) if (APPS[i].id === id) return APPS[i]; return null; }
  function pasar() { try { if (typeof pasarSesion === "function") pasarSesion(); else if (typeof irInicio === "function") irInicio(); } catch (e) {} }

  // Pasar a otra app reemplazando la actual (con Atrás no se vuelve a la anterior).
  // Si la otra app instalada se abre en su propia ventana (el celular o la PC la "capturan"), esta ventana
  // queda atrás sin uso: en ese caso se cierra sola para que quede abierta solo la app con la que se trabaja.
  function irA(url) {
    location.replace(url);
    setTimeout(function () {
      if (document.visibilityState === "hidden" || !document.hasFocus()) { if (raiz) raiz.hidden = true; try { window.close(); } catch (e) {} }
    }, 1500);
  }
  function abrir(a) {
    if (a.id === ACTUAL) { cerrar(); return; }
    // Ir a Internos desde otra app: entra directo a Internos (sin volver a mostrar Inicio allá)
    ssSet(KOK, a.id === "internos" ? "1" : null); pasar();
    irA(a.url);
  }
  async function instalar(a) {
    if (a.id === "internos" && EN_INT) {
      if (pedido) { pedido.prompt(); try { await pedido.userChoice; } catch (e) {} pedido = null; return; }
      hoja("<h2>Instalar Internos</h2><ol><li>Tocá los <b>tres puntitos ⋮</b> de Chrome, arriba a la derecha.</li><li>Elegí <b>Instalar app</b> o <b>Agregar a pantalla principal</b>.</li><li>Tocá <b>Instalar</b>.</li></ol><button type='button' class='ai-big' data-ai='cerrarhoja'>Entendido</button>");
      return;
    }
    ssSet(KOK, null); pasar();
    var dest = a.url + "?instalar=1";
    // Desde la app instalada, la instalación de otra app la hace Chrome: se abre ahí con el botón Instalar
    if (android && comoApp()) {
      var u = new URL(dest);
      location.href = "intent://" + u.host + u.pathname + u.search + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + encodeURIComponent(dest) + ";end";
      return;
    }
    irA(dest);
  }
  function alTocar(e) {
    var b = e.target.closest ? e.target.closest("[data-ai]") : null; if (!b) return;
    var q = b.getAttribute("data-ai");
    if (q === "instalar") { e.stopPropagation(); instalar(app(b.getAttribute("data-id"))); return; }
    if (q === "abrir") { abrir(app(b.getAttribute("data-id"))); return; }
    if (q === "cuenta") { var m = document.getElementById("me"); if (m) m.click(); }
    if (q === "volver") cerrar();
  }
  document.addEventListener("keydown", function (e) {
    if (!raiz || raiz.hidden || (e.key !== "Enter" && e.key !== " ")) return;
    var b = document.activeElement; if (b && b.getAttribute && b.getAttribute("data-ai") === "abrir") { e.preventDefault(); abrir(app(b.getAttribute("data-id"))); }
  });

  function mostrar() { nodo(); raiz.hidden = false; document.documentElement.classList.add("alas-inicio"); pintar(); try { raiz.scrollTop = 0; } catch (e) {} }
  function cerrar() { if (EN_INT) ssSet(KOK, "1"); if (raiz) raiz.hidden = true; document.documentElement.classList.remove("alas-inicio"); try { window.scrollTo(0, 0); } catch (e) {} }

  // Al volver a esta pantalla desde otra app (botón atrás), se actualiza lo instalado
  window.addEventListener("pageshow", function () { pintar(); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") pintar(); });

  // Si hay sesión, Inicio aparece apenas abre la página (sin que se vea antes la pantalla de carga ni Internos).
  // Si al final no se puede entrar (sesión vencida o sin internet), se saca para que se vea la pantalla de entrar.
  function ocultar() { if (raiz) raiz.hidden = true; document.documentElement.classList.remove("alas-inicio"); }
  function revisar() {
    var ap = document.getElementById("app");
    if (raiz && !raiz.hidden && ap && ap.hidden && !document.documentElement.classList.contains("cargando")) ocultar();
  }
  if (EN_INT && correoIni && ssGet(KOK) !== "1") {
    document.documentElement.classList.add("alas-inicio");
    var temprano = function () { mostrar(); setTimeout(revisar, 0); try { new MutationObserver(revisar).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] }); } catch (e) {} };
    if (document.body) temprano(); else document.addEventListener("DOMContentLoaded", temprano);
  }

  window.AlasInicio = {
    // lo llama la app cada vez que cambia de pantalla (entrar, salir, etc.)
    alMostrar: function (cual) {
      if (!EN_INT) return;
      if (cual !== "app") { ocultar(); return; }
      if (ssGet(KOK) !== "1") mostrar();
    },
    // tocar el logo: abre Inicio
    abrir: mostrar,
    cerrar: cerrar
  };
})();
