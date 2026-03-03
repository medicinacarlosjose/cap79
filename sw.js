const CACHE_NAME = "capital79-v10";
const urlsToCache = [
  "./",
  "./index.html",
  "./app.css",
  "./styles.js",
  "sua-foto-v2.jpg",
  "./icon-192.png",
  "./icon-512.png",

  // músicas
  "./berlim.mp3",
  "./coracao-valente.mp3",
  "./falcao-o-campeao-dos-campeoes.mp3",
  "./karate-kid.mp3",
  "./the-power-of-love.mp3",
  "./titanic.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if(key !== CACHE_NAME){
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});