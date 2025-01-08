const CACHE_NAME = 'productos-cache-v3'; // Incrementa la versión para forzar la actualización
const urlsToCache = [
    './', // Si el archivo está en el mismo directorio
    './index.html',
     './precios.html',
    './manifest.json',
    './styles.css',
    './productos.json',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Archivos en caché durante la instalación');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting(); // Activa inmediatamente el nuevo SW
});

// Manejo de solicitudes de red con "Network First" y control de actualización
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la respuesta es válida, actualiza el recurso en la caché
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red, busca en la caché
                return caches.match(event.request);
            })
    );
});

// Activación del Service Worker: Limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activando...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`[Service Worker] Eliminando caché antigua: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Control inmediato de las páginas abiertas
});