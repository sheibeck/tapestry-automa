var appCacheFiles = [
	'/',
	'/index.html',
	'/app.bundle.js'
], 
// The name of the Cache Storage
appCache = 'tapestry-bot-v1';

/**
 * The install event is fired when the service worker 
 * is installed.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
addEventListener('install', (event) => {
	console.log('Tapestry Bot Install Event', event)
	event.waitUntil(
    	caches.open(appCache).then(function(cache) {
	      return cache.addAll(appCacheFiles);
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
})

/**
 * The fetch event is fired for every network request. It is also dependent
 * on the scope of which your service worker was registered.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */
addEventListener('fetch', function(event) {
	event.respondWith(
	  caches.match(event.request)
		.then(function(response) {
		  if (response) {
			return response;     // if valid response is found in cache return it
		  } else {
			return fetch(event.request)     //fetch from internet
			  .then(function(res) {
				return caches.open(CACHE_DYNAMIC_NAME)
				  .then(function(cache) {
					cache.put(event.request.url, res.clone());    //save the response for future
					return res;   // return the fetched data
				  })
			  })
			  .catch(function(err) {       // fallback mechanism
				return caches.open(CACHE_CONTAINING_ERROR_MESSAGES)
				  .then(function(cache) {
					return cache.match('/offline.html');
				  });
			  });
		  }
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