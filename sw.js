self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open('PigeonTD').then(function(cache) {
      return fetch(event.request).then(function(response) {
        cache.put(event.request, response.clone());
        return response;
      }).catch(function() {
        return caches.match(event.request);
      });
    })
  );
});
