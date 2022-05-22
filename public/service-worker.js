const APP_PREFIX = 'BudgetTracker-';     
const VERSION = 'version_02';
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
  "./index.html",
  "./css/styles.css",
  "./js/index.js",
  "./js/idb.js",
  "./icons/icon-192x192.png",
];

// Respond with cached resources
self.addEventListener('fetch', function (e) {
  console.log('fetch 888 request : ' + e.request.url)
  e.respondWith(
    caches.match(e.request).then(function (request) {
      return request || fetch(e.request)
    })
  )
})

// Cache resources
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME)
      console.log('caching :', FILES_TO_CACHE);
      return cache.addAll(FILES_TO_CACHE)
    })
  )
})

// Delete outdated caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      // `keyList` contains all cache names under your username.github.io
      // filter out ones that has this app prefix to create keeplist
      let cacheKeeplist = keyList.filter(function(key) {
        return key.indexOf(APP_PREFIX);
      });
      // add current cache name to keeplist
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function(key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log('deleting cache : ' + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});