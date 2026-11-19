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
    "#alasInicio .ai-hero{flex:1;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:calc(env(safe-area-inset-top,0px) + 34px) 20px 18px;overflow:hidden}" +
    "#alasInicio .ai-ave{width:150px;height:150px;border-radius:50%;box-shadow:0 16px 50px rgba(247,168,35,.3);animation:aiFlota 4s ease-in-out infinite}@keyframes aiFlota{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}" +
    "#alasInicio .ai-hero h1{font:700 34px/1.1 Fraunces,Georgia,serif;margin:0;background:linear-gradient(100deg,#f0e8da 0%,#f0e8da 42%,#ffd38a 50%,#f0e8da 58%,#f0e8da 100%);background-size:300% 100%;background-position:0 0;-webkit-background-clip:text;background-clip:text;color:transparent}" +
    // Entrada "Amanecer": brillo que sube, chispitas, aro que se dibuja, pájaro, título con destello y panel que sube
    "#alasInicio .ai-amanecer{position:absolute;inset:0;background:radial-gradient(70% 55% at 50% 45%,#5a3410 0%,#2a1a0c 45%,#16120e 80%)}" +
    "#alasInicio .ai-hero>*:not(.ai-amanecer):not(.ai-chispa){position:relative}" +
    "#alasInicio .ai-logo{width:170px;height:170px;display:flex;align-items:center;justify-content:center}" +
    "#alasInicio .ai-aro{position:absolute;inset:0;opacity:0}" +
    "#alasInicio .ai-chispa{position:absolute;bottom:-8px;width:4px;height:4px;border-radius:50%;background:#ffb43a;box-shadow:0 0 8px 2px rgba(247,168,35,.6);opacity:0;animation:aiChispa 3.6s linear infinite}" +
    "@keyframes aiChispa{0%{opacity:0;transform:translate(0,0)}15%{opacity:.9}100%{opacity:0;transform:translate(var(--dx),-520px)}}" +
    "#alasInicio.ai-intro .ai-amanecer{animation:aiAmanece 1.4s ease .55s both}@keyframes aiAmanece{from{opacity:0;transform:translateY(25%) scale(.8)}to{opacity:1;transform:none}}" +
    "#alasInicio.ai-intro .ai-aro{opacity:1;animation:aiAroSe .9s ease 1.95s both}#alasInicio.ai-intro .ai-aro circle{animation:aiAro .9s cubic-bezier(.6,0,.2,1) 1.05s both}" +
    "@keyframes aiAro{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}@keyframes aiAroSe{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.35)}}" +
    "#alasInicio.ai-intro .ai-ave{animation:aiDesdeSplash 1.1s cubic-bezier(.5,0,.2,1) both,aiFlota 4s ease-in-out 2.4s infinite}" +
    // arranca igual que la pantalla que pone Android (pajarito quieto en el medio) y sube a su lugar
    "@keyframes aiDesdeSplash{0%,45%{transform:translateY(var(--sy,130px)) scale(var(--ss,1.6));clip-path:circle(33.3% at 50% 50%);box-shadow:none}100%{transform:none;clip-path:circle(50% at 50% 50%);box-shadow:0 16px 50px rgba(247,168,35,.3)}}" +
    "@keyframes aiAveSale{0%{opacity:0;transform:scale(.8) rotate(-8deg)}70%{opacity:1;transform:scale(1.05) rotate(2deg)}100%{opacity:1;transform:none}}" +
    "#alasInicio.ai-intro .ai-hero h1{background-position:100% 0;animation:aiCorte .8s cubic-bezier(.2,.8,.2,1) 1.7s both,aiDestello 1.1s ease 2.5s forwards}" +
    "@keyframes aiCorte{from{clip-path:inset(0 100% 0 0);transform:translateY(6px)}to{clip-path:inset(0 0 0 0);transform:none}}@keyframes aiDestello{from{background-position:100% 0}to{background-position:0 0}}" +
    "#alasInicio.ai-intro .ai-sub,#alasInicio.ai-intro .ai-falta{animation:aiSubIn .6s ease 2.3s both}@keyframes aiSubIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}" +
    "#alasInicio.ai-intro .ai-me{animation:aiSubIn .6s ease 2.75s both}" +
    "#alasInicio.ai-intro .ai-chispa{animation-delay:1s}" +
    "#alasInicio.ai-intro .ai-panel{animation:aiPanelIn .6s cubic-bezier(.2,.8,.2,1) 2.75s both}@keyframes aiPanelIn{from{transform:translateY(110%)}to{transform:none}}" +
    "#alasInicio.ai-intro .ai-app{animation:aiPop .5s cubic-bezier(.3,1.6,.5,1) both}@keyframes aiPop{from{opacity:0;transform:translateY(40px) scale(.6)}to{opacity:1;transform:none}}" +
    "#alasInicio.ai-intro .ai-app:nth-child(1){animation-delay:3.1s}#alasInicio.ai-intro .ai-app:nth-child(2){animation-delay:3.2s}#alasInicio.ai-intro .ai-app:nth-child(3){animation-delay:3.3s}#alasInicio.ai-intro .ai-app:nth-child(4){animation-delay:3.4s}" +
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
    // Botoncito ‹ al lado del logo de cada app, para volver a Inicio (como en la Ficha de ingreso)
    ".ai-atras{flex:none;display:inline-flex;align-items:center;justify-content:center;width:36px;height:44px;margin-right:0;border-radius:12px;border:1px solid var(--line,#3a3027);background:var(--card,#211b15);color:var(--ink,#f0e8da);cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent;transition:transform .12s,background .15s}" +
    ".ai-atras:active{transform:scale(.92)}.ai-atras svg{width:20px;height:20px}" +
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
    if (!raiz || raiz.hidden || raiz.querySelector(".ai-carga") || raiz.classList.contains("ai-intro")) return;
    var cartel = "";
    if (EN_ALAS && !comoApp()) cartel = "Instalá esta app en este aparato";
    else if (!EN_ALAS && !enAlas() && !alasInstalada()) cartel = "Instalá la app Alas de Libertad";
    var chispas = "";
    [8, 18, 30, 41, 52, 60, 71, 80, 88, 95].forEach(function (x, i) {
      chispas += "<span class='ai-chispa' aria-hidden='true' style='left:" + x + "%;--dx:" + ((i % 2 ? 1 : -1) * (10 + (i * 7) % 25)) + "px;animation-delay:" + (1.0 + (i * 0.37) % 3.2).toFixed(2) + "s'></span>";
    });
    var h = "<div class='ai'><div class='ai-hero'><div class='ai-amanecer' aria-hidden='true'></div>" + chispas +
      (EN_INT ? "<button type='button' class='ai-me' data-ai='cuenta' aria-label='Tu cuenta'>" + esc(inicial()) + "</button>" : "") +
      "<div class='ai-logo'><svg class='ai-aro' width='170' height='170' viewBox='0 0 170 170' aria-hidden='true'><circle cx='85' cy='85' r='80' fill='none' stroke='#f7a823' stroke-width='2.5' stroke-linecap='round' pathLength='100' stroke-dasharray='100' transform='rotate(-90 85 85)'/></svg>" +
      "<img class='ai-ave' src='" + RAIZ_INT + "logo.png' alt='Logo de Alas de Libertad'></div>" +
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
    if (a.id === ACTUAL) {
      // La misma app en la que estás (por ejemplo Internos): también sube el globito y después se muestra la app
      var t = cargando(a, boton);
      setTimeout(function () { cerrar(); setTimeout(limpiar, 300); }, t);
      return;
    }
    // Ir a Internos desde otra app: entra directo a Internos (sin volver a mostrar Inicio allá)
    ssSet(KOK, a.id === "internos" ? "1" : null); pasar();
    var espera = cargando(a, boton);
    setTimeout(function () {
      if (EN_ALAS) { location.href = a.url; return; } // desde Inicio de la app Alas: con Atrás se vuelve a Inicio
      irA(a.url);
    }, espera);
  }
  // Pasos para instalar a mano, según el aparato y el navegador (cuando Chrome no ofrece el botón directo)
  function pasosInstalar() {
    var ua = navigator.userAgent, ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var dentro = /FBAN|FBAV|Instagram|WhatsApp|Line\/|; wv\)/i.test(ua), edge = /Edg\//.test(ua), pc = !android && !ios;
    var link = URL_ALAS, t = "<h2>Instalar Alas de Libertad</h2>";
    var copiar = "<button type='button' class='ai-big' data-ai='copiarlink' style='margin-bottom:8px'>Copiar el link</button>";
    if (dentro) return t + "<p>Este link se abrió adentro de otra app (como WhatsApp) y desde ahí no se puede instalar.</p><ol><li>Tocá los <b>tres puntitos ⋮</b> arriba a la derecha.</li><li>Elegí <b>Abrir en Chrome</b>" + (ios ? " (o en Safari)" : "") + ".</li><li>Ahí tocá <b>Instalar</b>.</li></ol>" +
      (android ? "<button type='button' class='ai-big' data-ai='abrirchrome' style='margin-bottom:8px'>Abrir en Chrome</button>" : copiar) + "<button type='button' class='ai-big' data-ai='cerrarhoja' style='background:#2b241d;color:#f0e8da'>Cerrar</button>";
    if (ios) return t + "<p>En iPhone se instala desde <b>Safari</b>:</p><ol><li>Tocá <b>Compartir</b> (el cuadrado con la flechita hacia arriba).</li><li>Bajá y elegí <b>Agregar a inicio</b>.</li><li>Tocá <b>Agregar</b>.</li></ol><button type='button' class='ai-big' data-ai='cerrarhoja'>Entendido</button>";
    if (pc && edge) return t + "<p>En la computadora, con <b>Edge</b>:</p><ol><li>Arriba a la derecha tocá los <b>tres puntitos …</b></li><li>Entrá a <b>Aplicaciones</b>.</li><li>Elegí <b>Instalar este sitio como aplicación</b> y tocá <b>Instalar</b>.</li></ol><button type='button' class='ai-big' data-ai='cerrarhoja'>Entendido</button>";
    if (pc) return t + "<p>En la computadora, con <b>Chrome</b>:</p><ol><li>Mirá a la derecha de la barra donde está la dirección: si hay un ícono de una <b>pantallita con una flecha</b>, tocalo y después <b>Instalar</b>.</li><li>Si no está: tocá los <b>tres puntitos ⋮</b> arriba a la derecha → <b>Transmitir, guardar y compartir</b> → <b>Instalar página como aplicación</b> (o <b>Instalar Alas de Libertad</b>).</li><li>Tocá <b>Instalar</b>. Queda en el escritorio y en el menú Inicio de Windows.</li></ol>" +
      "<p style='font-size:13px;color:#b3a99b'>Si ya tenés instalada la app Internos o alguna de las otras en esta computadora, primero desinstalala (abrila, tocá los tres puntitos de su ventana → <b>Desinstalar</b>) y después instalá esta.</p><button type='button' class='ai-big' data-ai='cerrarhoja'>Entendido</button>";
    return t + "<ol><li>Tocá los <b>tres puntitos ⋮</b> de Chrome, arriba a la derecha.</li><li>Elegí <b>Instalar app</b> o <b>Agregar a pantalla principal</b>.</li><li>Tocá <b>Instalar</b>.</li></ol><button type='button' class='ai-big' data-ai='cerrarhoja'>Entendido</button>";
  }
  async function instalarAlas() {
    if (EN_ALAS) {
      if (pedido) { pedido.prompt(); try { await pedido.userChoice; } catch (e) {} pedido = null; return; }
      hoja(pasosInstalar());
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
    if (q === "copiarlink") { e.stopPropagation(); try { navigator.clipboard.writeText(URL_ALAS); aviso("Link copiado: pegalo en Chrome"); } catch (x) { aviso(URL_ALAS); } return; }
    if (q === "abrirchrome") { e.stopPropagation(); var u = new URL(URL_ALAS); location.href = "intent://" + u.host + u.pathname + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + encodeURIComponent(URL_ALAS) + ";end"; return; }
    if (q === "abrir") { if (raiz.querySelector(".ai-carga")) return; abrir(app(b.getAttribute("data-id")), b); return; }
    if (q === "cuenta") { var m = document.getElementById("me"); if (m) m.click(); }
    if (q === "volver") cerrar();
  }
  document.addEventListener("keydown", function (e) {
    if (!raiz || raiz.hidden || (e.key !== "Enter" && e.key !== " ")) return;
    var b = document.activeElement; if (b && b.getAttribute && b.getAttribute("data-ai") === "abrir") { e.preventDefault(); abrir(app(b.getAttribute("data-id")), b); }
  });

  var introHecha = false;
  function mostrar(conEntrada) {
    nodo();
    if (!raiz.hidden && !raiz.classList.contains("ai-cierra")) return; // ya está a la vista: no reiniciar nada
    clearTimeout(raiz._t); limpiar(); raiz.classList.remove("ai-cierra", "ai-intro"); raiz.hidden = false;
    document.documentElement.classList.add("alas-inicio");
    var quieto = false; try { quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    if (conEntrada === true && !introHecha && !quieto) {
      introHecha = true; raiz.classList.remove("ai-abre"); pintar();
      // el pájaro arranca en el medio de la pantalla (donde lo dibuja Android) y del tamaño de ese pajarito
      // Android (12 o más nuevo) dibuja el ícono de 240 de ancho recortado en un círculo de 160, en el medio de TODA la pantalla
      try { var av = raiz.querySelector(".ai-ave"), r = av.getBoundingClientRect();
        var dif = Math.max(0, screen.height - window.innerHeight), arriba = (android && comoApp()) ? (dif <= 50 ? dif : Math.max(0, dif - 48)) : 0;
        var medio = android && comoApp() ? screen.height / 2 - arriba : window.innerHeight / 2;
        raiz.style.setProperty("--sy", Math.round(medio - (r.top + r.height / 2)) + "px");
        raiz.style.setProperty("--ss", (240 / r.width).toFixed(3)); } catch (e) {}
      raiz.classList.add("ai-intro");
      clearTimeout(raiz._i); raiz._i = setTimeout(function () { raiz.classList.remove("ai-intro"); }, 4100);
    } else { raiz.classList.add("ai-abre"); pintar(); }
    try { raiz.scrollTop = 0; } catch (e) {}
  }
  function cerrar() {
    if (EN_INT) ssSet(KOK, "1");
    document.documentElement.classList.remove("alas-inicio"); try { window.scrollTo(0, 0); } catch (e) {}
    if (!raiz) return;
    raiz.classList.remove("ai-abre"); raiz.classList.add("ai-cierra");
    raiz._t = setTimeout(function () { raiz.hidden = true; raiz.classList.remove("ai-cierra"); }, 260);
  }

  // Al volver a esta pantalla desde otra app (botón atrás), se actualiza lo instalado
  function limpiar() { if (raiz) { raiz.querySelectorAll(".ai-carga,.ai-globo").forEach(function (x) { x.remove(); }); raiz.classList.remove("ai-volando"); } }
  window.addEventListener("pageshow", function () { limpiar(); pintar(); });
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
    var temprano = function () { mostrar(true); setTimeout(revisar, 0); try { new MutationObserver(revisar).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] }); } catch (e) {} };
    if (document.body) temprano(); else document.addEventListener("DOMContentLoaded", temprano);
  }

  // Botoncito ‹ al lado del logo en cada app (el logo sigue igual de grande y también vuelve a Inicio)
  var LOGOS = { internos: ".appbar .alogo", bitacora: ".top a[data-pasa]", medicos: ".top a.logo", despensa: ".top a.logo" };
  function ponerAtras() {
    var sel = LOGOS[ACTUAL]; if (!sel) return;
    document.querySelectorAll(sel).forEach(function (logo) {
      if (logo.previousElementSibling && logo.previousElementSibling.classList.contains("ai-atras")) return;
      var b = document.createElement("button"); b.type = "button"; b.className = "ai-atras";
      b.setAttribute("aria-label", "Volver al inicio"); b.title = "Volver al inicio";
      b.innerHTML = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M15 6l-6 6 6 6'/></svg>";
      b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); mostrar(); });
      logo.parentNode.insertBefore(b, logo);
    });
  }
  if (!EN_ALAS) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ponerAtras); else ponerAtras(); }

  // En la app Alas, Inicio es la pantalla principal: se muestra siempre
  if (EN_ALAS) { if (document.body) mostrar(true); else document.addEventListener("DOMContentLoaded", function () { mostrar(true); }); }

  window.AlasInicio = {
    // lo llama la app cada vez que cambia de pantalla (entrar, salir, etc.)
    alMostrar: function (cual) {
      if (!EN_INT) return;
      if (cual !== "app") { ocultar(); return; }
      if (ssGet(KOK) !== "1") mostrar(true);
    },
    // tocar el logo: abre Inicio
    abrir: function () { mostrar(); },
    cerrar: cerrar
  };
})();
