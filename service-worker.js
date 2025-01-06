const CACHE_NAME = 'productos-cache-v2'; // Incrementa la versión cuando cambies recursos
const urlsToCache = [
    './', // Si el archivo está en el mismo directorio
    './index.html',
    './manifest.json',
    './style.css',
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
    self.skipWaiting(); // Activa inmediatamente el nuevo Service Worker
});

// Manejo de solicitudes de red con "Network First"
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la respuesta es válida, actualizar la caché
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response; // Devuelve la respuesta de la red
            })
            .catch(() => {
                // Si la red falla, intenta obtener los datos de la caché
                return caches.match(event.request);
            })
    );
});

// Activación del Service Worker y limpieza de cachés antiguas
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
