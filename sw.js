/* 옥타 앱 웹판 — 인터넷이 없어도 열리게 앱 파일을 기기에 담아 둔다. 판이 바뀌면 이 파일의 V가 바뀌어 새 판을 받아 둔다(다음에 열 때 적용).
   담는 것은 이 폴더의 파일뿐이다. 밖으로 나가는 요청은 만들지 않는다. */
var V = 'v1.1-046ddc88ed';
var C = 'octa-' + V;
var SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(C).then(function(c){ return c.addAll(SHELL.map(function(u){ return new Request(u, { cache:'reload' }); })); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k.indexOf('octa-') === 0 && k !== C; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;
  if (/\/(sw\.js|version\.json)$/.test(u.pathname)) return;          // 판을 알아보는 파일은 늘 새로 받는다
  var key = r.mode === 'navigate' ? './' : r;
  e.respondWith(caches.open(C).then(function(c){
    return c.match(key, { ignoreSearch:true }).then(function(hit){
      return hit || fetch(r).then(function(res){ if (res && res.ok) c.put(key, res.clone()); return res; });
    });
  }));
});
