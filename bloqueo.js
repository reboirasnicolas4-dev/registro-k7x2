/* Bloqueo con PIN (y huella) para las apps de Alas de Libertad: Internos, Cuartos y Ficha de ingreso.
   - Cada usuario elige si lo activa (Más → Seguridad). El PIN se guarda solo en este celular, cifrado.
   - Se bloquea al abrir la app o al volver si pasó el tiempo elegido sin usarla (5 minutos por defecto).
   - Con 5 PIN equivocados, o con "Olvidé el PIN", se cierra la sesión y se entra con la contraseña de siempre.
   - La huella usa el lector del celular (WebAuthn): no sale nada del celular. */
(function () {
  "use strict";
  var K = "alas-pin", KULT = "alas-pin-ult", KNUEVO = "alas-pin-nuevo", KOFRECIDO = "alas-pin-ofrecido";
  function leer() { try { return JSON.parse(localStorage.getItem(K) || "null"); } catch (e) { return null; } }
  function grabar(c) { try { if (c) localStorage.setItem(K, JSON.stringify(c)); else localStorage.removeItem(K); } catch (e) {} }
  function ult() { try { return Number(localStorage.getItem(KULT) || 0); } catch (e) { return 0; } }
  function marcarUso() { try { localStorage.setItem(KULT, String(Date.now())); } catch (e) {} }
  function logueadoAlmacen() {
    try {
      if (localStorage.getItem("alas-token")) return true;
      var p = JSON.parse(sessionStorage.getItem("alas-paso") || "null"); return !!(p && p.token);
    } catch (e) { return false; }
  }
  function logueado() { try { if (window.AlasBloqueo && typeof window.AlasBloqueo.logueado === "function") return !!window.AlasBloqueo.logueado(); } catch (e) {} return logueadoAlmacen(); }
  function vencido(c) { return Date.now() - ult() > (c.min || 5) * 60000; }

  // Antes de que se vea nada: si corresponde, se tapa la pantalla
  var cfg0 = leer();
  var tapar = !!(cfg0 && cfg0.h && logueadoAlmacen() && vencido(cfg0));
  var css = document.createElement("style");
  css.textContent =
    "html.alas-bloq body>*:not(#alasLock):not(#alasSheet){visibility:hidden!important}" +
    "#alasLock,#alasSheet{position:fixed;inset:0;z-index:2147483000;font:15px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#f3ead9}" +
    "#alasLock{background:#1d1712;display:flex;align-items:center;justify-content:center;padding:20px}" +
    "#alasSheet{background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center;z-index:2147483001}" +
    "#alasLock[hidden],#alasSheet[hidden]{display:none}" +
    ".alk{width:100%;max-width:320px;text-align:center}" +
    ".alk .cand{width:56px;height:56px;border-radius:50%;background:#f7a823;color:#1d1712;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:26px}" +
    ".alk .tit{font:700 20px Georgia,serif}" +
    ".alk .msg{font-size:14px;color:#b9a98f;min-height:21px}.alk .msg.mal{color:#f09595}" +
    ".alk .dots{margin:20px 0 24px}.alk .dot{width:15px;height:15px;border-radius:50%;border:2px solid #f7a823;display:inline-block;margin:0 8px}.alk .dot.on{background:#f7a823}" +
    ".alk .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:12px 0}" +
    ".alk .k{width:66px;height:66px;border-radius:50%;border:0;background:#2c231b;color:#f3ead9;font-size:26px;margin:auto;cursor:pointer;font-family:inherit}.alk .k:active{background:#3a2e23}" +
    ".alk .lnk{background:none;border:0;color:#f7a823;font:500 14px inherit;cursor:pointer;padding:8px}.alk .lnk.g{color:#b9a98f}" +
    ".ash{background:#2c231b;width:100%;max-width:440px;border-radius:18px 18px 0 0;padding:18px 16px 24px;max-height:92vh;overflow:auto}" +
    ".ash h4{margin:0 0 6px;font-size:17px}.ash .nota{font-size:12.5px;color:#b9a98f;line-height:1.5}" +
    ".ash .fila{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid #3a2e23}.ash .fila:last-of-type{border:0}" +
    ".ash .sw{width:46px;height:26px;border-radius:13px;background:#3a2e23;position:relative;border:0;cursor:pointer;flex:none}" +
    ".ash .sw:after{content:'';position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#b9a98f;transition:.15s}" +
    ".ash .sw.on{background:#f7a823}.ash .sw.on:after{left:23px;background:#1d1712}" +
    ".ash select{background:#3a2e23;color:#f7a823;border:0;border-radius:8px;padding:7px 8px;font:500 14px inherit}" +
    ".ash .btn{background:#f7a823;color:#1d1712;border:0;border-radius:12px;padding:13px 16px;font:600 15px inherit;width:100%;cursor:pointer;margin-top:10px}" +
    ".ash .btn2{background:transparent;color:#f3ead9;border:1px solid #3a2e23;border-radius:12px;padding:10px 14px;font:500 14px inherit;cursor:pointer}" +
    ".ash .alk{max-width:none}";
  document.head.appendChild(css);
  if (tapar) document.documentElement.classList.add("alas-bloq");

  function h(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  var lock, sheet, bloqueada = false, malos = 0;
  function asegurarNodos() {
    if (lock) return;
    lock = h("div", { id: "alasLock", hidden: "" }); sheet = h("div", { id: "alasSheet", hidden: "" });
    sheet.addEventListener("click", function (e) { if (e.target === sheet) cerrarHoja(); });
    document.body.appendChild(lock); document.body.appendChild(sheet);
  }
  function hoja(html) { asegurarNodos(); sheet.innerHTML = "<div class='ash'>" + html + "</div>"; sheet.hidden = false; return sheet.firstChild; }
  function cerrarHoja() { if (sheet) { sheet.hidden = true; sheet.innerHTML = ""; } }

  async function huella(pin, sal) {
    var b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("alas-pin|" + sal + "|" + pin));
    return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
  }
  function azar(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return a; }
  function b64(a) { return btoa(String.fromCharCode.apply(null, new Uint8Array(a))); }
  function deb64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  async function hayLector() { try { return !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); } catch (e) { return false; } }

  // Teclado de 4 números
  function teclado(cont, alCompletar) {
    var v = "", dots = cont.querySelector(".dots"), pad = cont.querySelector(".pad");
    dots.innerHTML = "<span class='dot'></span><span class='dot'></span><span class='dot'></span><span class='dot'></span>";
    function pinta() { Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle("on", i < v.length); }); }
    pad.innerHTML = "";
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].forEach(function (t) {
      var b = h("button", { type: "button", "class": "k", "aria-label": t === "⌫" ? "Borrar" : t }, t);
      if (!t) b.style.visibility = "hidden";
      b.onclick = function () {
        if (t === "⌫") { v = v.slice(0, -1); pinta(); return; }
        if (v.length >= 4) return; v += t; pinta();
        if (v.length === 4) { var val = v; setTimeout(function () { v = ""; pinta(); alCompletar(val); }, 160); }
      };
      pad.appendChild(b);
    });
  }
  function bloquePin(titulo, nota) {
    return "<div class='alk'><div class='tit' style='font:600 17px inherit'>" + titulo + "</div><div class='msg'>" + (nota || "") + "</div><div class='dots'></div><div class='pad'></div>" +
      "<button type='button' class='lnk g' data-x='1' style='margin-top:10px'>Cancelar</button></div>";
  }
  function msg(el, t, mal) { var m = el.querySelector(".msg"); m.textContent = t; m.className = "msg" + (mal ? " mal" : ""); }

  // ---- Elegir PIN nuevo ----
  function elegirPin(alTerminar) {
    var el = hoja(bloquePin("Elegí un PIN de 4 números", "No uses tu fecha de nacimiento ni 1234"));
    el.querySelector("[data-x]").onclick = cerrarHoja;
    teclado(el, function (p1) {
      if (/^(\d)\1{3}$/.test(p1) || p1 === "1234" || p1 === "4321") { msg(el, "Ese PIN es muy fácil, probá otro", true); return; }
      el = hoja(bloquePin("Repetilo para confirmar"));
      el.querySelector("[data-x]").onclick = cerrarHoja;
      teclado(el, async function (p2) {
        if (p1 !== p2) { msg(el, "No coinciden. Empezá de nuevo.", true); setTimeout(function () { elegirPin(alTerminar); }, 1100); return; }
        var c = leer() || { min: 5 }, sal = b64(azar(12));
        c.sal = sal; c.h = await huella(p1, sal); grabar(c); marcarUso();
        cerrarHoja(); if (alTerminar) alTerminar();
        if (!c.cred && await hayLector()) {
          var s = hoja("<h4>¿Usar también la huella?</h4><div class='nota'>Así no tenés que poner el PIN cada vez: apoyás el dedo y listo.</div>" +
            "<button type='button' class='btn' data-si='1'>Sí, usar huella</button><button type='button' class='btn2' data-no='1' style='width:100%;margin-top:8px'>Ahora no</button>");
          s.querySelector("[data-si]").onclick = function () { activarHuella().then(function () { cerrarHoja(); if (alTerminar) alTerminar(); }); };
          s.querySelector("[data-no]").onclick = cerrarHoja;
        }
      });
    });
  }
  async function activarHuella() {
    try {
      var c = leer(); if (!c || !c.h) return false;
      var cred = await navigator.credentials.create({ publicKey: {
        challenge: azar(32), rp: { name: "Alas de Libertad" },
        user: { id: azar(16), name: "alas-" + Date.now(), displayName: "Alas de Libertad" },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged" },
        timeout: 60000 } });
      c.cred = b64(cred.rawId); grabar(c); return true;
    } catch (e) { return false; }
  }
  async function pedirHuella() {
    var c = leer(); if (!c || !c.cred) return false;
    try {
      await navigator.credentials.get({ publicKey: { challenge: azar(32), allowCredentials: [{ type: "public-key", id: deb64(c.cred) }], userVerification: "required", timeout: 60000 } });
      return true;
    } catch (e) { return false; }
  }

  // ---- Pantalla de bloqueo ----
  function bloquear() {
    var c = leer(); if (!c || !c.h || bloqueada) return;
    asegurarNodos(); bloqueada = true; malos = 0; cerrarHoja();
    document.documentElement.classList.add("alas-bloq");
    lock.innerHTML = "<div class='alk'><div class='cand'>🔒</div><div class='tit'>Alas de Libertad</div><div class='msg'>Poné tu PIN</div><div class='dots'></div><div class='pad'></div>" +
      "<div style='display:flex;justify-content:space-between;margin-top:16px'>" +
      (c.cred ? "<button type='button' class='lnk' data-h='1'>☝ Usar huella</button>" : "<span></span>") +
      "<button type='button' class='lnk g' data-o='1'>Olvidé el PIN</button></div></div>";
    lock.hidden = false;
    var cont = lock.firstChild;
    teclado(cont, async function (p) {
      var cc = leer(); if (!cc) { desbloquear(); return; }
      if (await huella(p, cc.sal) === cc.h) { desbloquear(); return; }
      malos++;
      if (malos >= 5) { salirConContraseña("Pusiste 5 veces un PIN equivocado. Por seguridad hay que entrar de nuevo con tu contraseña."); return; }
      msg(cont, "PIN equivocado · te quedan " + (5 - malos) + " intentos", true);
    });
    var bh = cont.querySelector("[data-h]");
    if (bh) { bh.onclick = intentarHuella; setTimeout(intentarHuella, 400); }
    cont.querySelector("[data-o]").onclick = function () {
      var s = hoja("<h4>¿Olvidaste el PIN?</h4><div class='nota'>Se cierra la sesión en este celular y entrás con tu correo y contraseña de siempre. Después elegís un PIN nuevo. No se pierde nada de lo marcado.</div>" +
        "<button type='button' class='btn' data-s='1'>Entrar con mi contraseña</button><button type='button' class='btn2' data-c='1' style='width:100%;margin-top:8px'>Cancelar</button>");
      s.querySelector("[data-s]").onclick = function () { salirConContraseña(""); };
      s.querySelector("[data-c]").onclick = cerrarHoja;
    };
    async function intentarHuella() { msg(cont, "Apoyá el dedo en el lector…"); if (await pedirHuella()) desbloquear(); else msg(cont, "Poné tu PIN"); }
  }
  function desbloquear() {
    bloqueada = false; marcarUso();
    if (lock) { lock.hidden = true; lock.innerHTML = ""; }
    document.documentElement.classList.remove("alas-bloq");
    // al desbloquear, la app se pone al día (versión nueva, fecha de hoy y datos)
    try { var A = window.AlasBloqueo; if (A && typeof A.alDesbloquear === "function") setTimeout(A.alDesbloquear, 50); } catch (e) {}
  }
  function salirConContraseña(txt) {
    grabar(null);
    try { localStorage.setItem(KNUEVO, "1"); } catch (e) {}
    if (txt) { try { sessionStorage.setItem("alas-pin-msg", txt); } catch (e) {} }
    var A = window.AlasBloqueo;
    if (A && typeof A.salir === "function") { try { desbloquear(); A.salir(); return; } catch (e) {} }
    try { localStorage.removeItem("alas-token"); sessionStorage.removeItem("alas-paso"); } catch (e) {}
    var raiz = location.pathname.replace(/(cuartos|ficha)\/?.*$/, "");
    location.href = raiz;
  }

  // ---- Configuración (Más → Seguridad) ----
  async function configurar() {
    var c = leer() || { min: 5 }, lector = await hayLector();
    var opciones = [[1, "1 minuto"], [5, "5 minutos"], [15, "15 minutos"], [30, "30 minutos"], [60, "1 hora"]];
    var s = hoja("<h4>Seguridad</h4>" +
      "<div class='fila'><span>Pedir PIN al abrir la app</span><button type='button' class='sw" + (c.h ? " on" : "") + "' data-pin='1' aria-label='Pedir PIN'></button></div>" +
      (lector ? "<div class='fila'><span>Desbloquear con huella</span><button type='button' class='sw" + (c.cred ? " on" : "") + "' data-hu='1' aria-label='Huella'></button></div>" : "") +
      "<div class='fila'><span>Bloquear si no se usa por</span><select data-min='1'>" + opciones.map(function (o) { return "<option value='" + o[0] + "'" + (+c.min === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></div>" +
      (c.h ? "<div class='fila'><span>Cambiar PIN</span><button type='button' class='btn2' data-cam='1'>Cambiar</button></div>" : "") +
      "<div class='nota' style='margin-top:10px'>El PIN se guarda solo en este celular, cifrado. Vale para Internos, Cuartos y la Ficha de ingreso. Con 5 PIN equivocados se cierra la sesión y se entra con la contraseña de siempre. Al tocar Salir se borra.</div>" +
      "<button type='button' class='btn2' data-ok='1' style='width:100%;margin-top:14px'>Listo</button>");
    s.querySelector("[data-ok]").onclick = cerrarHoja;
    s.querySelector("[data-min]").onchange = function (e) { var cc = leer() || {}; cc.min = +e.target.value; grabar(cc.h ? cc : (cc.min ? cc : null)); c.min = cc.min; };
    s.querySelector("[data-pin]").onclick = function () {
      if (c.h) {
        var el = hoja(bloquePin("Para sacar el PIN, poné el actual"));
        el.querySelector("[data-x]").onclick = configurar;
        teclado(el, async function (p) { var cc = leer(); if (cc && await huella(p, cc.sal) === cc.h) { grabar(null); configurar(); } else msg(el, "PIN equivocado", true); });
      } else elegirPin(configurar);
    };
    var hu = s.querySelector("[data-hu]");
    if (hu) hu.onclick = async function () {
      var cc = leer(); if (!cc || !cc.h) { elegirPin(configurar); return; }
      if (cc.cred) { delete cc.cred; grabar(cc); configurar(); return; }
      if (await activarHuella()) configurar();
    };
    var cam = s.querySelector("[data-cam]");
    if (cam) cam.onclick = function () {
      var el = hoja(bloquePin("Poné el PIN actual"));
      el.querySelector("[data-x]").onclick = configurar;
      teclado(el, async function (p) { var cc = leer(); if (cc && await huella(p, cc.sal) === cc.h) elegirPin(configurar); else msg(el, "PIN equivocado", true); });
    };
  }
  // Después de entrar: si se olvidó el PIN, elegir uno nuevo; si nunca lo vio, ofrecerlo una sola vez
  function despuesDeEntrar() {
    var c = leer(); if (c && c.h) return;
    var nuevo = false, ofrecido = false, m = "";
    try { nuevo = localStorage.getItem(KNUEVO) === "1"; ofrecido = localStorage.getItem(KOFRECIDO) === "1"; m = sessionStorage.getItem("alas-pin-msg") || ""; } catch (e) {}
    if (!nuevo && ofrecido) return;
    try { localStorage.removeItem(KNUEVO); localStorage.setItem(KOFRECIDO, "1"); sessionStorage.removeItem("alas-pin-msg"); } catch (e) {}
    var s = hoja("<h4>🔒 " + (nuevo ? "Elegí un PIN nuevo" : "Protegé la app con un PIN") + "</h4><div class='nota'>" + (m ? m + "<br><br>" : "") +
      "La app tiene datos de salud de los residentes. Con un PIN, si alguien agarra tu celular no puede verla. Lo podés cambiar cuando quieras en Más → Seguridad.</div>" +
      "<button type='button' class='btn' data-a='1'>Activar PIN</button><button type='button' class='btn2' data-n='1' style='width:100%;margin-top:8px'>Ahora no</button>");
    s.querySelector("[data-a]").onclick = function () { elegirPin(null); };
    s.querySelector("[data-n]").onclick = cerrarHoja;
  }
  function olvidar() { grabar(null); try { localStorage.removeItem(KULT); } catch (e) {} desbloquear(); }

  // Cuándo se bloquea
  var tUso = 0;
  ["pointerdown", "keydown", "touchstart", "scroll"].forEach(function (ev) {
    addEventListener(ev, function () { if (!bloqueada && Date.now() - tUso > 10000) { tUso = Date.now(); marcarUso(); } }, { passive: true, capture: true });
  });
  function revisar() { var c = leer(); if (c && c.h && !bloqueada && logueado() && vencido(c)) bloquear(); }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") { if (!bloqueada) marcarUso(); }
    else revisar();
  });
  setInterval(function () { if (document.visibilityState === "visible") revisar(); }, 5000);
  function arrancar() { asegurarNodos(); if (tapar) bloquear(); else if (cfg0 && cfg0.h) marcarUso(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar); else arrancar();

  window.AlasBloqueo = Object.assign(window.AlasBloqueo || {}, { configurar: configurar, bloquear: bloquear, olvidar: olvidar, despuesDeEntrar: despuesDeEntrar, activo: function () { var c = leer(); return !!(c && c.h); } });
})();
