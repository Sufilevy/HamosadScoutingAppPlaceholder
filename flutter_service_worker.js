'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "android-icon-144x144.png": "c1ac291f9fb5e68c2f1dc251e10dc4ce",
"android-icon-192x192.png": "e7073ae37dee201c808965f90eceb658",
"android-icon-36x36.png": "741a6810d072964c6f6bdd938906f459",
"android-icon-48x48.png": "a40df3020908ae83d93f506c6d434f9e",
"android-icon-72x72.png": "ceebe9ffe7b37d755381948fef748b89",
"android-icon-96x96.png": "8b8481614bf7f1d8251be3ee3f71d59a",
"apple-icon-114x114.png": "5a2d1266273782dc508ab84e569fcff8",
"apple-icon-120x120.png": "6e3f6c3f492511db95789cf4d35f31ec",
"apple-icon-144x144.png": "c1ac291f9fb5e68c2f1dc251e10dc4ce",
"apple-icon-152x152.png": "75a47cd41436f22480a0abd41ff8e644",
"apple-icon-180x180.png": "61b8b63b164e5c3cf3947427df6db580",
"apple-icon-57x57.png": "0a860f5f26764d493ce451f57a813b9f",
"apple-icon-60x60.png": "97de8e4cc1b33c85db720f577b2eaf73",
"apple-icon-72x72.png": "ceebe9ffe7b37d755381948fef748b89",
"apple-icon-76x76.png": "fdfbf179ce48aeb273bf2c3057b5c94b",
"apple-icon-precomposed.png": "957cc93b5363e973639897d464df690e",
"apple-icon.png": "957cc93b5363e973639897d464df690e",
"assets/AssetManifest.json": "462ce76c3702a62eefc501dad72c4813",
"assets/assets/Courgette-Regular.ttf": "cbd252f5c26cd61243888be1891f9921",
"assets/assets/logo.png": "bc7de6978d70bffcdb37bf0aa678975c",
"assets/FontManifest.json": "f045e43eaabdc39ee0e2fc807fd9a04a",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/NOTICES": "2d7236aca695ba4cd213a3478e55d740",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"browserconfig.xml": "653d077300a12f09a69caeea7a8947f8",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"favicon-16x16.png": "b029a8d4703b17c52acb516e14c6048f",
"favicon-32x32.png": "94ac4955cc01e2f2a0b521ab1a78dfef",
"favicon-96x96.png": "8b8481614bf7f1d8251be3ee3f71d59a",
"favicon.ico": "60daef8a232459034b3adfd547eb19e9",
"flutter.js": "eb2682e33f25cd8f1fc59011497c35f8",
"index.html": "eafb5d8ac18708a4e46a7ffa5e2421af",
"/": "eafb5d8ac18708a4e46a7ffa5e2421af",
"main.dart.js": "d892f8fb5023bfe77fbeb35260ca5489",
"manifest.json": "7fa6eac301098b4e9ab98c0314d17ddf",
"ms-icon-144x144.png": "c1ac291f9fb5e68c2f1dc251e10dc4ce",
"ms-icon-150x150.png": "39ffdabfa429bcdb8774ee50559f7034",
"ms-icon-310x310.png": "8c538a7348e243b413f76589b6865465",
"ms-icon-70x70.png": "c5a4e748d7655c92ac8c54ae82da46a6",
"version.json": "6d7918a5d91d891b9cf59ddec84b7f83"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
