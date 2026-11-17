// Service worker: permite instalar la app y muestra los avisos (notificaciones) que manda el script.
// No guarda nada en caché, así los datos de los internos siempre vienen en vivo desde tu hoja de Google.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

// Aviso que llega desde Firebase (lo manda el script de la planilla)
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { try { d = { body: e.data.text() }; } catch (y) {} }
  const m = d.data || d, n = d.notification || {};
  const title = m.title || n.title || "Alas de Libertad";
  const body = m.body || n.body || "";
  e.waitUntil(self.registration.showNotification(title, {
    body, icon: "icon-alas-192.png", badge: "favicon-32.png",
    tag: m.tag || "alas", renotify: true, data: { url: m.url || "./" }
  }));
});
// Al tocar el aviso se abre (o se trae al frente) la app
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) if (c.url.startsWith(self.registration.scope) && "focus" in c) return c.focus();
    return self.clients.openWindow(url);
  }));
});
