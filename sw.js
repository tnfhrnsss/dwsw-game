const CACHE_NAME = 'hangul-game-v1';

// 절대적으로 필요한 핵심 파일만 초기 캐시
const urlsToCache = [
  '/',
  '/manifest.json',
];

// 설치 이벤트: 캐시에 파일 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch 이벤트: 캐시 우선 전략
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          return response;
        }

        // 없으면 네트워크에서 가져오고 캐시에 저장
        return fetch(event.request).then((response) => {
          // 유효한 응답인지 확인
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // 응답을 복제 (한 번만 사용 가능하므로)
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // 오프라인이고 캐시에도 없으면 기본 페이지 반환
          return caches.match('/index.html');
        });
      })
  );
});

// Activate 이벤트: 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
