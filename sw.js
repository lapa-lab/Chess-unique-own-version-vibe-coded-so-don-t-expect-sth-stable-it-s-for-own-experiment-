// Название нашего кэша
const CACHE_NAME = 'chess-v1';

// Файлы, которые нужно закэшировать.
// '.' - это start_url из манифеста
// 'chess_game.html' - сам файл игры
const FILES_TO_CACHE = [
  '.',
  'index.html'
];

// 1. Событие 'install' (установка)
// Срабатывает, когда Service Worker устанавливается
self.addEventListener('install', (event) => {
  console.log('[SW] Установка Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Кэширование основных файлов...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Активируем SW немедленно
  );
});

// 2. Событие 'activate' (активация)
// Очищает старые кэши, если они есть
self.addEventListener('activate', (event) => {
  console.log('[SW] Активация Service Worker...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Удаление старого кэша:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim(); // Захватываем контроль над страницей
});

// 3. Событие 'fetch' (перехват запросов)
// Срабатывает каждый раз, когда страница делает сетевой запрос
self.addEventListener('fetch', (event) => {
  console.log('[SW] Перехват запроса:', event.request.url);
  event.respondWith(
    // Стратегия "Сначала кэш, потом сеть"
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('[SW] Загрузка из кэша:', event.request.url);
          return response; // Отдаем из кэша, если нашли
        }
        
        console.log('[SW] Загрузка из сети:', event.request.url);
        return fetch(event.request); // Иначе идем в сеть
      })
  );
});
