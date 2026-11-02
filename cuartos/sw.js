// Service worker mínimo: permite instalar la app. No guarda nada en caché,
// así los datos de los internos siempre vienen en vivo desde tu hoja de Google.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
