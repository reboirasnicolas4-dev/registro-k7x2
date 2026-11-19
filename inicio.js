/* Pantalla de Inicio de Alas de Libertad: se ven las 4 apps (Internos, Bitácora, Médicos y Despensa) en barras.
   - La app "Alas de Libertad" (carpeta alas/) es una sola app instalada que abre las 4 adentro de la misma ventana.
   - Fuera de esa app (Internos u otra abierta aparte), Inicio ofrece instalar "Alas de Libertad".
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
  var EN_ALAS = ACTUAL === "alas";
  var RAIZ_INT = EN_INT ? "" : BASE + "registro-k7x2/";
  var URL_ALAS = BASE + "registro-k7x2/alas/";
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

  // App "Alas de Libertad": si se abre instalada, esta ventana es la de Alas (se recuerda mientras esté abierta)
  if (EN_ALAS) {
    if (comoApp()) { ssSet("alas-shell", "1"); lsSet("alas_inst", "1"); }
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); pedido = e; lsSet("alas_inst", null); pintar(); });
    window.addEventListener("appinstalled", function () { pedido = null; lsSet("alas_inst", "1"); pintar(); aviso("Listo, quedó instalada"); });
  }
  function enAlas() { return ssGet("alas-shell") === "1" && comoApp(); }
  function alasInstalada() { return lsGet("alas_inst") === "1"; }
  function instalada(a) { var v = lsGet(a.flag); return v === "\"1\"" || v === "1" || (a.id === ACTUAL && comoApp()); }

  var css = document.createElement("style");
  css.textContent =
    // Transición entre apps (Chrome): la app nueva sube suave; con Atrás, la anterior baja. Nunca una pantalla blanca en el medio.
    "@view-transition{navigation:auto}" +
    "::view-transition-old(root){animation:.28s ease both aiVtFuera}" +
    "::view-transition-new(root){animation:.4s cubic-bezier(.2,.8,.2,1) both aiVtSube}" +
    "html:active-view-transition-type(atras)::view-transition-old(root){animation:.32s ease-in both aiVtBaja;z-index:2}" +
    "html:active-view-transition-type(atras)::view-transition-new(root){animation:.32s ease both aiVtAparece}" +
    "@keyframes aiVtSube{from{transform:translateY(40px);opacity:0}}@keyframes aiVtFuera{to{opacity:0}}" +
    "@keyframes aiVtBaja{to{transform:translateY(40px);opacity:0}}@keyframes aiVtAparece{from{opacity:0}}" +
    // Inicio · Portada (siempre oscuro, igual en todas las apps)
    "#alasInicio{position:fixed;inset:0;z-index:2147482000;background:#16120e;color:#f0e8da;overflow-y:auto;font:400 15px/1.45 'Hanken Grotesk',system-ui,sans-serif;color-scheme:dark}" +
    "#alasInicio[hidden]{display:none}" +
    "#alasInicio.ai-abre{animation:aiAbre .34s ease both}@keyframes aiAbre{from{opacity:0}}" +
    "#alasInicio.ai-cierra{animation:aiCierra .26s ease-in both}@keyframes aiCierra{to{opacity:0}}" +
    "html.alas-inicio body{overflow:hidden}" +
    "html.alas-inicio #splash,html.alas-inicio #app{visibility:hidden!important}" +
    "#alasInicio .ai{min-height:100%;display:flex;flex-direction:column;max-width:560px;margin:0 auto}" +
    "#alasInicio .ai-hero{flex:1;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:calc(env(safe-area-inset-top,0px) + 34px) 20px 18px;background:radial-gradient(70% 55% at 50% 45%,#5a3410 0%,#2a1a0c 45%,#16120e 80%)}" +
    "#alasInicio .ai-ave{width:150px;height:150px;border-radius:50%;box-shadow:0 16px 50px rgba(247,168,35,.3);animation:aiFlota 4s ease-in-out infinite}@keyframes aiFlota{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}" +
    "#alasInicio .ai-hero h1{font:700 34px/1 Fraunces,Georgia,serif;margin:0}" +
    "#alasInicio .ai-sub{font-size:11.5px;letter-spacing:3px;text-transform:uppercase;color:#d9b98a}" +
    "#alasInicio .ai-me{position:absolute;top:calc(env(safe-area-inset-top,0px) + 16px);right:16px;width:44px;height:44px;border-radius:50%;border:1px solid #f7a823;background:#3a2a12;color:#f7a823;font:700 17px inherit;cursor:pointer}" +
    "#alasInicio .ai-panel{background:#211b15;border-top:1px solid #3a3027;border-radius:28px 28px 0 0;padding:20px 14px calc(env(safe-area-inset-bottom,0px) + 28px);display:flex;flex-direction:column;gap:16px;animation:aiPanel .45s cubic-bezier(.2,.8,.2,1) both}@keyframes aiPanel{from{transform:translateY(30px);opacity:0}}" +
    "#alasInicio .ai-elegi{font-size:13px;color:#b3a99b;text-align:center}" +
    "#alasInicio .ai-fila{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}" +
    "#alasInicio .ai-app{appearance:none;border:0;background:none;color:#f0e8da;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;padding:4px 0;font:600 13.5px inherit;transition:transform .12s}" +
    "#alasInicio .ai-app:active{transform:scale(.93)}" +
    "#alasInicio .ai-app .ai-ic{width:66px;height:66px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(0,0,0,.4)}" +
    "#alasInicio .ai-app .ai-ic img{width:66px;height:66px;flex:none}#alasInicio .ai-app .ai-ic img.z{width:92px;height:92px}" +
    "#alasInicio .ai-app.ai-aca .ai-ic{outline:2px solid #f7a823;outline-offset:3px}" +
    "#alasInicio .ai-falta{display:flex;align-items:center;gap:10px;border:1px solid #f7a823;border-radius:16px;padding:10px 12px;background:#2a1d0e;text-align:left;width:100%;box-sizing:border-box;max-width:420px}" +
    "#alasInicio .ai-falta b{display:block;font-size:14px}#alasInicio .ai-falta span{font-size:12px;color:#b3a99b}" +
    "#alasInicio .ai-inst{flex:none;height:40px;padding:0 14px;border-radius:11px;border:0;background:#f7a823;color:#281a08;font:700 13.5px inherit;cursor:pointer}" +
    // Pantalla de carga al entrar a una app (oscura, con el ícono latiendo)
    "#alasInicio .ai-carga{position:fixed;inset:0;background:#16120e;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;opacity:0;transition:opacity .25s ease;z-index:2}#alasInicio .ai-carga.ai-llega{opacity:1}" +
    "#alasInicio .ai-carga .ai-anillo{position:relative;width:120px;height:120px;display:flex;align-items:center;justify-content:center}" +
    "#alasInicio .ai-carga .ai-anillo:before{content:'';position:absolute;inset:0;border-radius:50%;border:3px solid #f7a823;animation:aiOla 1.4s ease-out infinite}@keyframes aiOla{0%{transform:scale(.9);opacity:.9}100%{transform:scale(1.45);opacity:0}}" +
    "#alasInicio .ai-carga .ai-ic{width:104px;height:104px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;animation:aiLate 1.4s ease-in-out infinite}@keyframes aiLate{50%{transform:scale(1.05)}}" +
    "#alasInicio .ai-carga .ai-ic img{width:104px;height:104px;flex:none}#alasInicio .ai-carga .ai-ic img.z{width:146px;height:146px}" +
    "#alasInicio .ai-carga:not(.ai-llega) .ai-anillo:before{animation:none;opacity:0}" +
    "#alasInicio .ai-carga.ai-llega .ai-ic{animation:aiParpa .5s ease-in-out 2,aiLate 1.4s ease-in-out 1s infinite}@keyframes aiParpa{0%,100%{filter:brightness(1);transform:scale(1)}50%{filter:brightness(1.55);transform:scale(1.08)}}" +
    "#alasInicio .ai-carga>b,#alasInicio .ai-carga>span{opacity:0}#alasInicio .ai-carga.ai-llega>b,#alasInicio .ai-carga.ai-llega>span{animation:aiTxt .4s ease .2s both}@keyframes aiTxt{from{opacity:0;transform:translateY(8px)}to{opacity:1}}" +
    // Globito: el ícono tocado sube bamboleándose con un hilito hasta el medio
    "#alasInicio.ai-volando .ai-hero,#alasInicio.ai-volando .ai-elegi{transition:opacity .9s ease,filter .9s ease;opacity:.18;filter:blur(1px)}" +
    "#alasInicio.ai-volando .ai-app{transition:transform .5s ease,opacity .5s ease;transform:translateY(10px) scale(.92);opacity:.45}" +
    "#alasInicio.ai-volando .ai-app.ai-vuela{opacity:0;transition:none}" +
    "#alasInicio .ai-globo{position:fixed;width:66px;height:66px;z-index:3;pointer-events:none;animation:aiGlobo 1.15s cubic-bezier(.33,0,.25,1) forwards;will-change:transform}" +
    "#alasInicio .ai-globo .ai-ic{position:absolute;inset:0;width:66px;height:66px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;animation:aiBrillo 1.15s ease forwards}" +
    "#alasInicio .ai-globo .ai-ic img{width:66px;height:66px;flex:none}#alasInicio .ai-globo .ai-ic img.z{width:92px;height:92px}" +
    "#alasInicio .ai-globo svg{position:absolute;left:18px;top:62px;transform-origin:15px 0;animation:aiHilo 1.15s ease forwards}" +
    "@keyframes aiGlobo{0%{transform:translate(0,0) scale(1)}12%{transform:translate(0,8px) scale(1.08,.86)}30%{transform:translate(calc(var(--dx)*.25 + 12px),calc(var(--dy)*.3)) scale(calc(1 + (var(--sc) - 1)*.2)) rotate(-7deg)}55%{transform:translate(calc(var(--dx)*.65 - 10px),calc(var(--dy)*.7)) scale(calc(1 + (var(--sc) - 1)*.6)) rotate(6deg)}80%{transform:translate(calc(var(--dx) + 4px),calc(var(--dy) - 14px)) scale(calc(var(--sc) + .03)) rotate(-3deg)}100%{transform:translate(var(--dx),var(--dy)) scale(var(--sc)) rotate(0)}}" +
    "@keyframes aiBrillo{0%{box-shadow:0 6px 16px rgba(0,0,0,.4)}60%{box-shadow:0 0 26px 6px rgba(247,168,35,.55)}100%{box-shadow:0 0 34px 10px rgba(247,168,35,.7)}}" +
    "@keyframes aiHilo{0%{opacity:0;transform:scaleY(.3)}20%{opacity:.9}35%{transform:rotate(10deg)}60%{transform:rotate(-12deg)}85%{opacity:.7;transform:rotate(6deg)}100%{opacity:0;transform:rotate(0) scaleY(.6)}}" +
    "#alasInicio .ai-carga>b{font:700 22px Fraunces,Georgia,serif}#alasInicio .ai-carga>span{font-size:13px;color:#b3a99b}" +
    "#alasInicio .ai-toast{position:fixed;left:50%;bottom:120px;transform:translateX(-50%);background:#f0e8da;color:#1b140d;padding:10px 16px;border-radius:12px;font-weight:600;max-width:90%;text-align:center}" +
    "#alasInicio .ai-hoja{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}" +
    "#alasInicio .ai-hoja>div{background:#211b15;border-top:1px solid #3a3027;border-radius:22px 22px 0 0;width:100%;max-width:560px;padding:18px 16px 26px;box-sizing:border-box}" +
    "#alasInicio .ai-hoja h2{margin:0 0 8px;font:700 20px Fraunces,Georgia,serif}#alasInicio .ai-hoja ol{margin:0 0 14px;padding-left:20px;line-height:1.6}" +
    "#alasInicio .ai-big{width:100%;height:50px;border:0;border-radius:14px;background:#f7a823;color:#281a08;font:700 16px inherit;cursor:pointer}" +
    "@media (prefers-reduced-motion:reduce){#alasInicio *,#alasInicio{animation:none!important}::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}";
  // Atrás del celular entre apps: la transición va "para abajo"
  window.addEventListener("pagereveal", function (e) {
    try { if (e.viewTransition && window.navigation && navigation.activation && navigation.activation.navigationType === "traverse") e.viewTransition.types.add("atras"); } catch (x) {}
  });
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

  function icono(a, clase) {
    return "<span class='ai-ic'><img src='" + esc(/^https?:/.test(a.icon) ? a.icon : RAIZ_INT + a.icon) + "' alt=''" + (a.id === "internos" ? "" : " class='z'") + "></span>";
  }
  function pintar() {
    if (!raiz || raiz.hidden || raiz.querySelector(".ai-carga")) return;
    var cartel = "";
    if (EN_ALAS && !comoApp()) cartel = "Instalá esta app en este aparato";
    else if (!EN_ALAS && !enAlas() && !alasInstalada()) cartel = "Instalá la app Alas de Libertad";
    var h = "<div class='ai'><div class='ai-hero'>" +
      (EN_INT ? "<button type='button' class='ai-me' data-ai='cuenta' aria-label='Tu cuenta'>" + esc(inicial()) + "</button>" : "") +
      "<img class='ai-ave' src='" + RAIZ_INT + "logo.png' alt='Logo de Alas de Libertad'>" +
      "<h1>Alas de Libertad</h1><div class='ai-sub'>Comunidad Terapéutica · San José</div>";
    if (cartel) h += "<div class='ai-falta'><div style='flex:1'><b>" + cartel + "</b><span>Las 4 apps en una sola, con su ícono</span></div><button type='button' class='ai-inst' data-ai='instalarAlas'>Instalar</button></div>";
    h += "</div><div class='ai-panel'><div class='ai-elegi'>Elegí la app</div><div class='ai-fila'>";
    APPS.forEach(function (a) {
      h += "<button type='button' class='ai-app" + (a.id === ACTUAL ? " ai-aca" : "") + "' data-ai='abrir' data-id='" + a.id + "'" + (a.id === ACTUAL ? " aria-label='" + esc(a.name) + " (donde estás)'" : "") + ">" + icono(a) + "<span>" + esc(a.name) + "</span></button>";
    });
    h += "</div></div></div>";
    raiz.innerHTML = h;
  }
  // Al tocar otra app: pantalla de carga oscura que sube, y recién ahí se cambia de app
  // Al tocar otra app: el ícono sube como un globito hasta el medio, brilla, parpadea y recién ahí se abre la app
  // (en total unos 2,6 segundos, para que se vea bien la animación). Devuelve los milisegundos que tarda.
  function cargando(a, boton) {
    var c = document.createElement("div"); c.className = "ai-carga"; c.setAttribute("role", "status");
    c.innerHTML = "<div class='ai-anillo'>" + icono(a) + "</div><b>" + esc(a.name) + "</b><span>Abriendo…</span>";
    raiz.appendChild(c);
    var quieto = false; try { quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    var origen = boton && boton.querySelector ? boton.querySelector(".ai-ic") : null;
    if (quieto || !origen) { c.classList.add("ai-llega"); return 700; }
    var r = origen.getBoundingClientRect(), dest = c.querySelector(".ai-ic").getBoundingClientRect();
    var sx = r.left + r.width / 2, sy = r.top + r.height / 2, tx = dest.left + dest.width / 2, ty = dest.top + dest.height / 2;
    var g = document.createElement("div"); g.className = "ai-globo";
    g.style.left = (sx - 33) + "px"; g.style.top = (sy - 33) + "px";
    g.style.setProperty("--dx", (tx - sx) + "px"); g.style.setProperty("--dy", (ty - sy) + "px"); g.style.setProperty("--sc", String(dest.width / 66));
    g.innerHTML = "<svg width='30' height='70' viewBox='0 0 30 70' fill='none' aria-hidden='true'><path d='M15 0 C 4 18, 26 34, 12 52 S 18 66, 15 70' stroke='#f3d9a8' stroke-width='1.6' stroke-linecap='round'/></svg>" + icono(a);
    boton.classList.add("ai-vuela"); raiz.classList.add("ai-volando"); raiz.appendChild(g);
    setTimeout(function () { c.classList.add("ai-llega"); setTimeout(function () { g.remove(); }, 260); }, 1150);
    return 2600;
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
  function abrir(a, boton) {
    if (a.id === ACTUAL) { cerrar(); return; }
    // Ir a Internos desde otra app: entra directo a Internos (sin volver a mostrar Inicio allá)
    ssSet(KOK, a.id === "internos" ? "1" : null); pasar();
    var espera = cargando(a, boton);
    setTimeout(function () {
      if (EN_ALAS) { location.href = a.url; return; } // desde Inicio de la app Alas: con Atrás se vuelve a Inicio
      irA(a.url);
    }, espera);
  }
  async function instalarAlas() {
    if (EN_ALAS) {
      if (pedido) { pedido.prompt(); try { await pedido.userChoice; } catch (e) {} pedido = null; return; }
      hoja("<h2>Instalar Alas de Libertad</h2><ol><li>Tocá los <b>tres puntitos ⋮</b> de Chrome, arriba a la derecha.</li><li>Elegí <b>Instalar app</b> o <b>Agregar a pantalla principal</b>.</li><li>Tocá <b>Instalar</b>.</li></ol><button type='button' class='ai-big' data-ai='cerrarhoja'>Entendido</button>");
      return;
    }
    pasar();
    var dest = URL_ALAS + "?instalar=1";
    // Desde una app instalada, la instalación la hace Chrome: se abre ahí la página de Alas con el botón Instalar
    if (android && comoApp()) {
      var u = new URL(dest);
      location.href = "intent://" + u.host + u.pathname + u.search + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + encodeURIComponent(dest) + ";end";
      return;
    }
    location.href = dest;
  }
  function alTocar(e) {
    var b = e.target.closest ? e.target.closest("[data-ai]") : null; if (!b) return;
    var q = b.getAttribute("data-ai");
    if (q === "instalarAlas") { e.stopPropagation(); instalarAlas(); return; }
    if (q === "abrir") { if (raiz.querySelector(".ai-carga")) return; abrir(app(b.getAttribute("data-id")), b); return; }
    if (q === "cuenta") { var m = document.getElementById("me"); if (m) m.click(); }
    if (q === "volver") cerrar();
  }
  document.addEventListener("keydown", function (e) {
    if (!raiz || raiz.hidden || (e.key !== "Enter" && e.key !== " ")) return;
    var b = document.activeElement; if (b && b.getAttribute && b.getAttribute("data-ai") === "abrir") { e.preventDefault(); abrir(app(b.getAttribute("data-id")), b); }
  });

  function mostrar() { nodo(); clearTimeout(raiz._t); raiz.classList.remove("ai-cierra"); raiz.hidden = false; raiz.classList.add("ai-abre"); document.documentElement.classList.add("alas-inicio"); pintar(); try { raiz.scrollTop = 0; } catch (e) {} }
  function cerrar() {
    if (EN_INT) ssSet(KOK, "1");
    document.documentElement.classList.remove("alas-inicio"); try { window.scrollTo(0, 0); } catch (e) {}
    if (!raiz) return;
    raiz.classList.remove("ai-abre"); raiz.classList.add("ai-cierra");
    raiz._t = setTimeout(function () { raiz.hidden = true; raiz.classList.remove("ai-cierra"); }, 260);
  }

  // Al volver a esta pantalla desde otra app (botón atrás), se actualiza lo instalado
  window.addEventListener("pageshow", function () { if (raiz) { raiz.querySelectorAll(".ai-carga,.ai-globo").forEach(function (x) { x.remove(); }); raiz.classList.remove("ai-volando"); } pintar(); });
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

  // En la app Alas, Inicio es la pantalla principal: se muestra siempre
  if (EN_ALAS) { if (document.body) mostrar(); else document.addEventListener("DOMContentLoaded", mostrar); }

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
