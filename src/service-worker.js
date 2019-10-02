var appCacheFiles = [
	'/'
], 
// The name of the Cache Storage
appCache = 'tapestry-bot-v2.1';

/**
 * The install event is fired when the service worker 
 * is installed.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
addEventListener('install', (event) => {
	console.log('Tapestry Bot Install Event', event)
	event.waitUntil(
    	caches.open(appCache).then(function(cache) {
	      return cache.addAll([appCacheFiles].map(url => new Request(url, {credentials: 'same-origin'})));
    	})
  	);
})

/**
 * The activate vent is fired when the  service worker is activated
 * and added to the home screen.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
addEventListener('activate', (event) => {
	console.log('Tapestry Bot Activate Event ', event)
	
	//remove outdated cache
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
		  return Promise.all(
			cacheNames.filter(function(cacheName) {
			  // Return true if you want to remove this cache,
			  // but remember that caches are shared across
			  // the whole origin
			}).map(function(cacheName) {
			  return caches.delete(cacheName);
			})
		  );
		})
	  );
})

/**
 * The fetch event is fired for every network request. It is also dependent
 * on the scope of which your service worker was registered.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
addEventListener('fetch', function(event) {
	//return fetch(event.request);
	console.log('Tapestry Bot Fetch: ', event);
	let url = new URL(event.request.url);
		//url.pathname
	event.respondWith(
		caches.match(event.request).then(function(resp) {
			return resp || fetch(event.request).then(function(response) {
				return caches.open(appCache).then(function(cache) {
				if (event.request.method === 'GET') {
					cache.put(event.request, response.clone());
				}
				return response;
				});
			});
		})
	);
  });         


/**
 * The message will receive messages sent from the application.
 * This can be useful for updating a service worker or messaging
 * other clients (browser restrictions currently exist)
 * https://developer.mozilla.org/en-US/docs/Web/API/Client/postMessage
 */
addEventListener('message', (event) => {
	console.log('Tapestry Bot Message Event: ', event.data)
})

/**
 * Listen for incoming Push events
 */
addEventListener('push', (event) => {
	console.log('Tapestry Bot Push Received.');
	console.log(`Tapestry Bot Push had this data: "${event.data.text()}"`);

	if (!(self.Notification && self.Notification.permission === 'granted'))
		return;
		
	var data = {};
  if (event.data)
    data = event.data.json();

	var title = data.title || "Web Push Notification";
	var message = data.message || "New Push Notification Received";
	var icon = "images/icons/icon-72x72.png";
	var badge = 'images/icons/icon-72x72.png';
	var options = {
		body: message,
		icon: icon,
		badge: badge
	};
	event.waitUntil(self.registration.showNotification(title,options));
});

/**
 * Handle a notification click
 */
addEventListener('notificationclick', (event) => {
	console.log('Tapestry Bot Notification click: ', event);
	event.notification.close();
	event.waitUntil(
		clients.openWindow('http://bit.ly/tapestrybot')
	);
});

importScripts("https://unpkg.com/service-worker-updatefound-refresh-dialog@1.1.0/dist/service-worker-updatefound-refresh-dialog.umd.js");