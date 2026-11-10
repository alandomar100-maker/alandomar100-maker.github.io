/* هاوڕێگە — service worker: offline cache + Firebase Cloud Messaging */
try{importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js","https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js")}catch(e){}
try{
  if(typeof firebase!=="undefined"){
    firebase.initializeApp({apiKey:"AIzaSyBLH-wW-s3SJvMoILOySgUuHd2eyV9zvbc",authDomain:"hawrega.firebaseapp.com",projectId:"hawrega",storageBucket:"hawrega.firebasestorage.app",messagingSenderId:"991365015814",appId:"1:991365015814:web:4c923be330b19472771687"});
    var messaging=firebase.messaging();
    // the server sends data-only messages, so we show the notification ourselves
    messaging.onBackgroundMessage(function(p){
      var d=p.data||{};
      var tg=d.tag||d.type||"hawrega";return self.registration.getNotifications({tag:tg}).then(function(l){return self.registration.showNotification(d.title||"هاوڕێگە",{body:d.body||"",icon:"icon-192.png",badge:"badge-96.png",tag:tg,renotify:!(l.length&&/^due-/.test(tg)),requireInteraction:true,silent:false,vibrate:[250,120,250],timestamp:Date.now(),dir:"auto",data:{url:"./"}})});
    });
  }
}catch(e){}
self.addEventListener("install",function(){self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim())});
self.addEventListener("fetch",function(e){
  var rq=e.request;
  if(rq.method!=="GET")return;
  var u=new URL(rq.url);
  if(u.origin!==location.origin)return; // never touch Firebase / map / API requests
  e.respondWith(fetch(rq).then(function(r){
    if(r&&r.ok){var c=r.clone();caches.open("hr-v3").then(function(k){k.put(rq,c)})}
    return r;
  }).catch(function(){return caches.match(rq).then(function(m){return m||caches.match("./")})}));
});
self.addEventListener("notificationclick",function(e){
  e.notification.close();
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(function(l){
    if(l.length)return l[0].focus();
    return clients.openWindow("./");
  }));
});
