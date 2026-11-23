/* هاوڕێگە — plus.js
   Optional phone helpers · Contacts (chat + calls) · Trip ratings & suspensions · Feedback
   Loaded after the main script in index.html. Needs Firestore rules from FIREBASE-RULES-ADD.txt */
(function(){
"use strict";

/* ---------- settings ---------- */
var ADMIN_EMAIL="alandomar100@gmail.com";           // only this account can read the feedback
var BAD_LIMIT=5;                                     // bad ratings before a suspension
var ICE=[{urls:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302"]}];
/* for calls over mobile data add a TURN server, e.g.:
   ICE.push({urls:"turn:YOUR_TURN_HOST:3478",username:"USER",credential:"PASS"}); */

/* ---------- strings: [ckb, en, ar, bdn, bdl] ---------- */
var LG=["ckb","en","ar","bdn","bdl"];
var S={
no_val:["نییە","None","لا يوجد","نینە","Nîne"],
ph_opt:["ئارەزوومەندانە","optional","اختياري","ب ئارەزووی خۆ","bi daxwaza xwe"],
tab_chats:["پەیوەندیەکان","Contacts","الاتصالات","پەیوەندی","Têkilî"],
tab_fb:["ڕەخنە و پێشنیار","Feedback","ملاحظات واقتراحات","ڕەخنە و پێشنیار","Rexne û pêşniyar"],
fbwarn:[
"ئاگادار بە تۆی شۆفێر یان سەرنشین دەتوانی ئاست دابنێیت بۆ شۆفێر یان سەرنشینەکان (باش یان خراپ) وە تۆش ئاستت بۆ دادەنرێت لەلایەن ئەوانەوە. ئەگەر 5 جار ئاستی خراپت پێدرا ئەوا ڕووبەڕووی سزا دەبیتەوە بە بێبەشبوون لە بەکارهێنانی وێبسایتەکە بۆ ماوەی یەک هەفتە، وە ئەگەر ئەمە دووبارە بووەوە ماوەی سزاکە زیاد دەکات بۆ دوو هەفتە، پاشان بۆ مانگێک، پاشان بۆ هەر جارێکی تر مانگێک زیاد دەکرێت. بۆیە تکایە باش بە لە بەکارهێنان و هەڵسوکەوتت.",
"Heads up: whether you are a driver or a passenger, you can rate drivers and passengers (good or bad), and they will rate you too. If you receive 5 bad ratings, you will be suspended from using the website for one week. If this happens again, the suspension grows to two weeks, then one month, and after that one more month is added each time. So please be considerate in how you use the website and how you behave.",
"تنبيه: يمكنك، سواء كنت سائقًا أو راكبًا، تقييم السائقين أو الركاب (جيد أو سيئ)، وسيقيّمك هؤلاء أيضًا. إذا حصلت على 5 تقييمات سيئة فستتعرض لعقوبة الحرمان من استخدام الموقع لمدة أسبوع واحد، وإذا تكرر ذلك تزداد مدة العقوبة إلى أسبوعين ثم إلى شهر، ثم يُضاف شهر في كل مرة بعد ذلك. لذا نرجو منك حسن الاستخدام وحسن التعامل.",
"ئاگەهدار بە، تو یێ شوفێر یان سەرنشین دشێی ئاستەکێ (باش یان خراپ) بۆ شوفێر یان سەرنشینان دانێی، و ئەو ژی ئاستەکێ بۆ تە دانیتن. ئەگەر 5 جاران ئاستێ خراپ دایە تە، دێ ڕووبەڕووی سزایێ بی ب بێبەشبوونا ژ بکارئینانا ڤی مالپەری بۆ ماوەیا هەفتیەکێ؛ و ئەگەر ئەڤە دووبارە بوو، ماوەیا سزایێ دێ بیتە دوو هەفتی، پاشی هەیڤەک، پاشی بۆ هەر جارەکا دی هەیڤەک دێ هێتە زێدەکرن. ژ بەر هندێ ژ کەرەما خۆ د بکارئینان و هەلسوکەوتا خۆ دا باش بە.",
"Agahdar be, tu yê şofêr an sernişîn dikarî astekê (baş an xirab) ji bo şofêr an sernişînan deynî, û ew jî dê astekê ji bo te deynin. Heke 5 caran astê xirab dane te, dê rûbirûyê cezayê bî bi bêparbûna ji bikaranîna vê malperê ji bo heftiyekê; û heke ev dubare bû, dê dema cezayê bibe du hefti, paşê heyvek, paşê ji bo her carekê din heyvek dê were zêdekirin. Ji ber vê yekê ji kerema xwe di bikaranîn û tevgera xwe de baş be."],
ch_btn:["پەیوەندیکردن","Contact","تواصل","پەیوەندی","Têkilî"],
ch_empty:["هێشتا هیچ گفتوگۆیەکت نییە. دوای قبوڵکردنی داواکاری، دەتوانیت لێرە پەیوەندی بە شۆفێر یان سەرنشینەکەوە بکەیت.","No conversations yet. Once a request is accepted, you can contact the driver or passenger here.","لا توجد محادثات بعد. بعد قبول الطلب يمكنك التواصل مع السائق أو الراكب من هنا.","هێشتا چ گفتوگۆ نینن. پشتی قبوولکرنا داخوازێ، تو دشێی ل ڤێرە پەیوەندیێ ب شوفێری یان سەرنشینی ڤە بکەی.","Hê tu axaftin tune ne. Piştî qebûlkirina daxwazê, tu dikarî li vir bi şofêr an sernişînê re têkiliyê deynî."],
ch_ph:["نامە بنووسە...","Type a message…","اكتب رسالة…","نامەیەکێ بنڤێسە...","Peyamekê binivîse…"],
ch_img:["وێنە","Photo","صورة","وێنە","Wêne"],
ch_vid:["ڤیدیۆ","Video","فيديو","ڤیدیۆ","Vîdyo"],
ch_voice:["نامەی دەنگی","Voice message","رسالة صوتية","نامەیا دەنگی","Peyama deng"],
ch_acall:["پەیوەندی دەنگی","Audio call","مكالمة صوتية","پەیوەندیا دەنگی","Têkiliya deng"],
ch_vcall:["پەیوەندی ڤیدیۆیی","Video call","مكالمة فيديو","پەیوەندیا ڤیدیۆیی","Têkiliya vîdyoyî"],
ch_in_a:["پەیوەندی دەنگی دێت","Incoming audio call","مكالمة صوتية واردة","پەیوەندیەکا دەنگی دهێت","Têkiliyeke dengî tê"],
ch_in_v:["پەیوەندی ڤیدیۆیی دێت","Incoming video call","مكالمة فيديو واردة","پەیوەندیەکا ڤیدیۆیی دهێت","Têkiliyeke vîdyoyî tê"],
ch_ring:["دەنگ دەدرێت...","Calling…","جارٍ الاتصال…","دهێتە لێدان...","Tê lêdan…"],
ch_conn:["پەیوەندی بەستراوە","Connected","متصل","گرێدایە","Girêdayî ye"],
ch_accept:["وەڵامدانەوە","Answer","رد","وەڵامدان","Bersiv bide"],
ch_decline:["ڕەتکردنەوە","Decline","رفض","ڕەتکرن","Red bike"],
ch_end:["کۆتایی","End","إنهاء","دوماهی","Biqedîne"],
ch_mute:["بێدەنگ","Mute","كتم","بێدەنگ","Bêdeng"],
ch_noperm:["ڕێگەپێدان بە مایک/کامێرا نەدرا","Microphone/camera access was denied","تم رفض الوصول إلى الميكروفون/الكاميرا","ڕێپێدان بۆ مایک/کامێرایێ نەهاتە دان","Destûra mîkrofon/kamerayê nehat dayîn"],
ch_nocall:["ئەم ئامێرە/وێبگەڕە پشتگیری ئەمە ناکات","This device/browser doesn't support this","هذا الجهاز/المتصفح لا يدعم ذلك","ئەڤ ئامێر/وێبگەڕ پشتگیریا ڤێ ناکەت","Ev amûr/gerok vê nepşteşt dike"],
ch_miss:["پەیوەندی بێوەڵام","Missed call","مكالمة فائتة","پەیوەندیا بێ وەڵام","Têkiliya bê bersiv"],
ch_dec:["پەیوەندی ڕەتکرایەوە","Call declined","مكالمة مرفوضة","پەیوەندی هاتە ڕەتکرن","Têkilî hat redkirin"],
ch_big:["فایلەکە زۆر گەورەیە","The file is too large","الملف كبير جدًا","فایل گەلەک مەزنە","Pel pir mezin e"],
ch_rec:["تۆماردەکرێت...","Recording…","جارٍ التسجيل…","تۆمار دبیت...","Tomar dibe…"],
ch_novid:["ناردنی ڤیدیۆ نەکرا (Firebase Storage چالاک نییە)","Couldn't send the video (Firebase Storage isn't enabled)","تعذر إرسال الفيديو (Firebase Storage غير مفعّل)","هنارتنا ڤیدیۆیێ نەهات (Firebase Storage چالاک نینە)","Şandina vîdyoyê nehat kirin (Firebase Storage çalak nîne)"],
ch_busy:["ئەو کەسە مژوولە","The other person is busy","الطرف الآخر مشغول","ئەو کەس ب کارەکێ ڤە مژوولە","Kesê din mijûl e"],
rt_end:["گەشتەکە تەواو بوو","End trip","إنهاء الرحلة","گەشت ب دوماهی هات","Rêwîtî qediya"],
rt_ended:["گەشتەکە تەواو بوو","Trip ended","انتهت الرحلة","گەشت ب دوماهی هات","Rêwîtî qediya"],
rt_t:["ئاستی گەشتەکە دابنێ","Rate this trip","قيّم هذه الرحلة","ئاستێ گەشتێ دانە","Astê rêwîtiyê deyne"],
rt_s:["ئاستی هەر کەسێک دیاری بکە: باش یان خراپ.","Rate each person: good or bad.","قيّم كل شخص: جيد أو سيئ.","ئاستێ هەر کەسەکی دیار بکە: باش یان خراپ.","Astê her kesî diyar bike: baş an xirab."],
rt_good:["باش","Good","جيد","باش","Baş"],
rt_bad:["خراپ","Bad","سيئ","خراپ","Xirab"],
rt_send:["ناردنی ئاست","Submit ratings","إرسال التقييم","هنارتنا ئاستی","Şandina astê"],
rt_later:["دواتر","Later","لاحقًا","پاشی","Paşê"],
rt_done:["سوپاس، ئاستەکان نێردران ✅","Thanks, your ratings were sent ✅","شكرًا، تم إرسال التقييم ✅","سوپاس، ئاست هاتنە هنارتن ✅","Spas, astên te hatin şandin ✅"],
rt_need:["ئاستی هەموو کەسێک دیاری بکە","Rate everyone first","قيّم الجميع أولًا","ئاستێ هەمی کەسان دیار بکە","Astê hemû kesan diyar bike"],
n_bad_rate:[
"⚠️ بۆ {n} جار ئاستی خراپت پێدرا. ئاگادار بە ئەگەر بگات بە 5 جار ڕووبەڕووی سزا دەبیتەوە بە بێبەشبوون لە بەکارهێنانی ئەم وێبسایتە بۆ ماوەی یەک هەفتە، وە ئەگەر ئەمە دووبارە بووەوە ماوەی سزاکە زیاد دەکات بۆ دوو هەفتە، پاشان بۆ مانگێک، پاشان بۆ هەر جارێکی تر مانگێک زیاد دەکرێت. بۆیە تکایە خۆت باش بکە.",
"⚠️ You have received a bad rating {n} time(s). Be careful: if it reaches 5, you will be suspended from using this website for one week. If this happens again, the suspension grows to two weeks, then one month, and then one more month each further time. So please improve your behavior.",
"⚠️ حصلت على تقييم سيئ {n} مرة. انتبه: إذا وصل العدد إلى 5 فستتعرض لعقوبة الحرمان من استخدام هذا الموقع لمدة أسبوع، وإذا تكرر ذلك تزداد المدة إلى أسبوعين ثم شهر، ثم يُضاف شهر في كل مرة بعد ذلك. لذا نرجو منك تحسين سلوكك.",
"⚠️ بۆ {n} جاران ئاستێ خراپ دایە تە. ئاگەهدار بە ئەگەر گەهشتە 5 جاران، دێ ڕووبەڕووی سزایێ بی ب بێبەشبوونا ژ بکارئینانا ڤی مالپەری بۆ ماوەیا هەفتیەکێ؛ و ئەگەر ئەڤە دووبارە بوو، ماوەیا سزایێ دێ بیتە دوو هەفتی، پاشی هەیڤەک، پاشی بۆ هەر جارەکا دی هەیڤەک دێ هێتە زێدەکرن. ژ کەرەما خۆ خۆ باش بکە.",
"⚠️ Ji bo {n} caran astê xirab dane te. Agahdar be heke gihîşt 5 caran, dê rûbirûyê cezayê bî bi bêparbûna ji bikaranîna vê malperê ji bo heftiyekê; û heke ev dubare bû, dê dema cezayê bibe du hefti, paşê heyvek, paşê ji bo her carekê din heyvek dê were zêdekirin. Ji kerema xwe xwe baş bike."],
bn_t:["ئەژمارەکەت ڕاگیراوە","Your account is suspended","تم إيقاف حسابك","ئەژمارا تە هاتیە ڕاگرتن","Hesabê te hatiye rawestandin"],
bn_s:["بەهۆی وەرگرتنی 5 ئاستی خراپ، ناتوانیت وێبسایتەکە بەکاربهێنیت تا: {d}","Because of 5 bad ratings, you can't use the website until: {d}","بسبب الحصول على 5 تقييمات سيئة، لا يمكنك استخدام الموقع حتى: {d}","ژ بەر وەرگرتنا 5 ئاستێن خراپ، تو نەشێی مالپەری بکاربینی هەتا: {d}","Ji ber wergirtina 5 astên xirab, tu nikarî malperê bi kar bînî heta: {d}"],
fb_top:["تکایە ئەگەر هەر ڕەخنە و پێشنیارێکتان هەیە دەربارەی ئەم وێبسایتە بینووسن و بێرنێرن بۆم پێخۆشحاڵ دەبم","If you have any criticism or suggestion about this website, please write and send it to me — I would be happy to hear it.","إذا كانت لديكم أي ملاحظة أو اقتراح حول هذا الموقع، فيرجى كتابتها وإرسالها لي، وسأكون سعيدًا بذلك.","ژ کەرەما خۆ ئەگەر هەوە چ ڕەخنە و پێشنیار هەبن دەربارەی ڤی مالپەری، بنڤێسن و بۆ من بهنێرن، دێ ب دلخۆش بم.","Ji kerema xwe heke rexne û pêşniyarên we hebin derbarê vê malperê, binivîsin û ji min re bişînin, ez ê kêfxweş bim."],
fb_ph:["ڕەخنە یان پێشنیارەکەت لێرە بنووسە...","Write your feedback here…","اكتب ملاحظتك هنا…","ڕەخنە یان پێشنیارا خۆ ل ڤێرە بنڤێسە...","Rexne an pêşniyara xwe li vir binivîse…"],
fb_sent:["سوپاس، نێردرا ✅","Thank you, it was sent ✅","شكرًا، تم الإرسال ✅","سوپاس، هاتە هنارتن ✅","Spas, hat şandin ✅"],
fb_empty:["سەرەتا شتێک بنووسە","Write something first","اكتب شيئًا أولًا","ب دەستپێکێ تشتەکی بنڤێسە","Pêşî tiştekî binivîse"],
fb_in:["ڕەخنە و پێشنیارە هاتووەکان (تەنها تۆ دەیانبینیت)","Received feedback (only you can see this)","الملاحظات الواردة (أنت فقط ترى هذا)","ڕەخنە و پێشنیارێن هاتی (تنێ تو دبینی)","Rexne û pêşniyarên hatî (tenê tu dibînî)"],
fb_none:["هێشتا هیچ ڕەخنەیەک نەهاتووە","No feedback yet","لا توجد ملاحظات بعد","هێشتا چ ڕەخنە نەهاتینە","Hê tu rexne nehatine"],
off_need:["ئەم بەشە تەنها کاتێک کار دەکات کە بە ئەژمارەوە چووبیتە ژوورەوە و ئینتەرنێت هەبێت","This section needs an account and an internet connection","يتطلب هذا القسم حسابًا واتصالًا بالإنترنت","ڤی بەشی پێدڤی ب ئەژمارەکێ و ئینتەرنێتێ هەیە","Ev beş hewceyî hesabek û înternetê ye"]
};
LG.forEach(function(l,i){var o={};Object.keys(S).forEach(function(k){o[k]=S[k][i]});Object.assign(T[l],o)});
LG.forEach(function(l){if(window.ABOUT&&ABOUT[l])ABOUT[l].warn2=T[l].fbwarn});

/* ---------- helpers ---------- */
function $(i){return document.getElementById(i)}
function cloudOK(){return !!(cloud&&FB&&UID&&!GUEST)}
function myName(){return String(state.me||"").trim()||"—"}
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function pad(n){return n<10?"0"+n:""+n}
function fdate(ts){var d=new Date(ts);return d.getFullYear()+"/"+pad(d.getMonth()+1)+"/"+pad(d.getDate())+" "+pad(d.getHours())+":"+pad(d.getMinutes())}
function fts(ts){if(!ts)return"";var d=new Date(ts);return d.toDateString()===new Date().toDateString()?hhmm(ts):(d.getMonth()+1)+"/"+d.getDate()}
function dur(s){s=Math.round(s||0);return pad(Math.floor(s/60))+":"+pad(s%60)}
function isAdmin(){return !!(UEMAIL&&UEMAIL.toLowerCase()===ADMIN_EMAIL)}
var IC={
 phone:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
 video:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="m15.5 10.5 6-3.5v10l-6-3.5"/></svg>',
 img:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 8"/></svg>',
 mic:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
 send:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>',
 back:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
 trash:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>'
};

/* ---------- state ---------- */
var PEN={bad:0,pn:0,until:0,total:0},RATED={},ratedReady=false,rtSkip={},unsubs2=[];
var CH={list:[],cur:null,unL:null,unM:null,msgs:[],ready:false},FBL=[],fbLast=0;

/* ================= trip end + ratings ================= */
function endBtn(r){
  if(!cloudOK()||!r||!r.mine)return "";
  if(r.tripEnd===r.tripDay)return '<span class="st accepted">🏁 '+esc(t("rt_ended"))+'</span>';
  return '<button type="button" class="btn" data-endtrip="'+esc(r.id)+'">🏁 '+esc(t("rt_end"))+'</button>';
}
function hwEnd(rid){
  var r=state.routes.find(function(x){return x.id===rid});
  if(!r||!r.mine||!cloudOK()||!r.tripDay||r.tripEnd===r.tripDay)return;
  var up={tripEnd:r.tripDay,tripEndAt:Date.now()};
  FB.db.collection("rides").doc(rid).update(up).then(function(){
    r.tripEnd=up.tripEnd;r.tripEndAt=up.tripEndAt;
    try{liveStop(true)}catch(e){}
    doRender();setTimeout(checkRate,150);
  },fail);
}
function tripOver(r){
  if(!r||!r.tripDay)return false;
  if(r.tripEnd===r.tripDay)return true;
  var at=+r.tripAt||0;
  return !!at&&Date.now()>at+(+r.dur>0?+r.dur:120)*60000;
}
function pendingRate(){
  if(!cloudOK()||!ridesLoaded||!ratedReady||PEN.until>Date.now())return null;
  for(var i=0;i<state.routes.length;i++){
    var r=state.routes[i],key=r.id+"|"+r.tripDay;
    if(!r.tripDay||r.cancelled||!tripOver(r)||RATED[key]||rtSkip[key])continue;
    if(Date.now()-(+r.tripEndAt||+r.tripAt||0)>2*864e5)continue;
    var acc=state.requests.filter(function(q){return q.rid===r.id&&q.status==="accepted"});
    if(r.mine?acc.length:acc.some(function(q){return q.mine}))return r;
  }
  return null;
}
function checkRate(){
  if($("rtbg")||$("bnbg")||$("clbg"))return;
  var r=pendingRate();if(r)openRate(r);
}
function openRate(r){
  var day=r.tripDay,tg=[];
  if(r.mine)state.requests.forEach(function(q){if(q.rid===r.id&&q.status==="accepted")tg.push({u:q.passenger,n:q.name||"—",role:"p"})});
  else tg.push({u:r.owner,n:r.driver||"—",role:"d"});
  if(!tg.length)return;
  var bg=document.createElement("div");bg.className="tmbg rtbg";bg.id="rtbg";
  var h='<div class="tmbox"><div class="tmico">⭐</div><h2>'+esc(t("rt_t"))+'</h2><p class="maphint" style="text-align:center">'+esc(rv(r,"from"))+' '+arr()+' '+esc(rv(r,"to"))+'</p><p class="maphint" style="text-align:center">'+esc(t("rt_s"))+'</p>';
  tg.forEach(function(x,i){
    h+='<div class="rtrow"><b>'+(x.role==="d"?'🚗 ':'🧳 ')+esc(x.n)+'</b><div class="rtbtns"><button type="button" class="rtb good" data-rt="'+i+':1" aria-pressed="false">👍 '+esc(t("rt_good"))+'</button><button type="button" class="rtb bad" data-rt="'+i+':-1" aria-pressed="false">👎 '+esc(t("rt_bad"))+'</button></div></div>';
  });
  h+='<button type="button" class="btn" id="rtsend" style="width:100%;margin-top:14px">✅ '+esc(t("rt_send"))+'</button><button type="button" class="btn sec" id="rtlater" style="width:100%;margin-top:8px">'+esc(t("rt_later"))+'</button></div>';
  bg.innerHTML=h;document.body.appendChild(bg);
  bg._d={r:r,key:r.id+"|"+day,day:day,tg:tg,v:{}};
}
function submitRate(){
  var bg=$("rtbg"),d=bg&&bg._d;if(!d)return;
  if(d.tg.some(function(x,i){return !d.v[i]})){toast(t("rt_need"));return}
  var b=FB.db.batch(),now=Date.now(),btn=$("rtsend");
  d.tg.forEach(function(x,i){
    b.set(FB.db.collection("ratings").doc(d.r.id+"_"+d.day+"_"+UID+"_"+x.u),
      {rid:d.r.id,day:d.day,rater:UID,target:x.u,role:x.role,v:d.v[i]>0?1:-1,ts:now,rn:myName()});
  });
  if(btn)btn.disabled=true;
  b.commit().then(function(){RATED[d.key]=1;bg.remove();toast(t("rt_done"),3000)},function(e){if(btn)btn.disabled=false;fail(e)});
}

/* ================= bad ratings -> warnings -> suspension ================= */
function penDays(n){return n<=1?7:n===2?14:30*(n-2)}      // 1 week, 2 weeks, 1 month, then +1 month each time
function calcPen(list){
  var tr={};
  list.forEach(function(x){
    var k=x.rid+"|"+x.day,o=tr[k]||(tr[k]={role:x.role,g:0,b:0,ts:0});
    if(x.v>0)o.g++;else o.b++;
    if((x.ts||0)>o.ts)o.ts=x.ts||0;
  });
  var ev=[];
  Object.keys(tr).forEach(function(k){
    var o=tr[k];
    if(o.role==="d"){if(o.b>o.g)ev.push(o.ts)}           // driver: more bad than good votes => one bad (a tie counts as good)
    else for(var i=0;i<o.b;i++)ev.push(o.ts);             // passenger: each bad vote
  });
  ev.sort(function(a,b){return a-b});
  var c=0,pn=0,until=0;
  ev.forEach(function(ts){c++;if(c>=BAD_LIMIT){pn++;until=ts+penDays(pn)*864e5;c=0}});
  return {bad:c,pn:pn,until:until,total:ev.length};
}
function showBan(){
  var b=$("bnbg"),u=PEN.until;
  if(!(u>Date.now())){if(b)b.remove();return}
  if(!b){b=document.createElement("div");b.className="tmbg bnbg";b.id="bnbg";document.body.appendChild(b)}
  var h='<div class="tmbox"><div class="tmico">⛔</div><h2>'+esc(t("bn_t"))+'</h2><p class="maphint" style="text-align:center">'+esc(t("bn_s",{d:fdate(u)}))+'</p><button type="button" class="btn no" id="aclogout" style="width:100%">🚪 '+esc(t("logout"))+'</button></div>';
  if(b._h!==h){b._h=h;b.innerHTML=h}
}

/* ================= feedback ================= */
function fbItems(){
  if(!FBL.length)return '<div class="empty">'+esc(t("fb_none"))+'</div>';
  return FBL.map(function(x){
    return '<div class="panel fbitem"><div class="fbmeta"><b>'+esc(x.name||"—")+'</b><small dir="ltr">'+esc(x.email||"")+'</small><small>'+fdate(x.ts||0)+'</small></div><p>'+esc(x.text||"")+'</p><button type="button" class="btn no" data-fbdel="'+esc(x.id)+'">🗑 '+esc(t("del_btn"))+'</button></div>';
  }).join("");
}
function viewFeedback(){
  if(GUEST)return guestWall();
  var on=cloudOK();
  var h='<h2>✍️ '+esc(t("tab_fb"))+'</h2><div class="panel fbp"><p class="fbtop">'+esc(t("fb_top"))+'</p><textarea id="fbtxt" rows="6" maxlength="2000" placeholder="'+esc(t("fb_ph"))+'"></textarea><button type="button" class="btn" id="fbsend" style="width:100%;margin-top:12px"'+(on?'':' disabled')+'>📨 '+esc(t("rq_send"))+'</button></div>';
  if(!on)h+='<div class="empty">'+esc(t("off_need"))+'</div>';
  if(isAdmin())h+='<h3 class="fbh">'+esc(t("fb_in"))+'</h3><div id="fbin">'+fbItems()+'</div>';
  return h;
}
function sendFb(){
  var ta=$("fbtxt");if(!ta||!cloudOK())return;
  var tx=ta.value.trim();if(!tx){toast(t("fb_empty"));return}
  if(Date.now()-fbLast<8000)return;fbLast=Date.now();
  FB.db.collection("feedback").add({uid:UID,name:myName(),email:UEMAIL||"",text:tx.slice(0,2000),ts:Date.now(),lang:lang})
    .then(function(){ta.value="";toast(t("fb_sent"),3000)},fail);
}

/* ================= contacts (chat) ================= */
function cidOf(a,b){return a<b?a+"_"+b:b+"_"+a}
function oth(c){var o=(c.members||[]).filter(function(x){return x!==UID})[0]||"";return {u:o,n:(c.names&&c.names[o])||"—"}}
function unread(c){return !!(c.lastFrom&&c.lastFrom!==UID&&(c.lastTs||0)>((c.rd&&c.rd[UID])||0))}
function prev(c){
  var k=c.lastK;
  if(k==="i")return "📷 "+t("ch_img");
  if(k==="a")return "🎤 "+t("ch_voice");
  if(k==="v")return "🎬 "+t("ch_vid");
  if(k==="c")return "📞 "+t(c.last==="miss"?"ch_miss":c.last==="dec"?"ch_dec":"ch_acall");
  return c.last||"";
}
function badge(){
  var n=CH.list.filter(unread).length,b=$("chBd");if(!b)return;
  b.textContent=n>9?"9+":n;b.classList.toggle("hide",!n);
}
function chBtn(u,n){
  if(!cloudOK()||!u||u===UID)return "";
  return '<button type="button" class="btn chbtn" data-chat="'+esc(u)+'" data-chname="'+esc(n||"")+'">💬 '+esc(t("ch_btn"))+'</button>';
}
function viewChats(){
  if(GUEST)return guestWall();
  var h='<h2>💬 '+esc(t("tab_chats"))+'</h2>';
  if(!cloudOK())return h+'<div class="empty">'+esc(t("off_need"))+'</div>';
  var L=CH.list.filter(function(c){return c.lastTs});          // hide conversations that have no message yet
  if(!L.length)return h+'<div class="empty">'+esc(t("ch_empty"))+'</div>';
  L.forEach(function(c){
    var o=oth(c),un=unread(c);
    h+='<button type="button" class="chrow'+(un?' unread':'')+'" data-chat="'+esc(o.u)+'" data-chname="'+esc(o.n)+'"><span class="chava">'+esc(o.n.charAt(0))+'</span><span class="chmid"><b>'+esc(o.n)+'</b><small>'+esc(prev(c))+'</small></span><span class="chmeta"><i>'+fts(c.lastTs)+'</i>'+(un?'<b class="tbd">●</b>':'')+'</span></button>';
  });
  return h;
}
var permShown=false;
function permOnce(e){if(permShown)return;permShown=true;fail(e)}
function watchChats(){
  CH.unL=FB.db.collection("chats").where("members","array-contains",UID).onSnapshot(function(sn){
    var first=!CH.ready;
    CH.list=sn.docs.map(function(d){var x=d.data();x.id=d.id;return x}).sort(function(a,b){return (b.lastTs||0)-(a.lastTs||0)});
    if(!first)sn.docChanges().forEach(function(c){
      if(c.type==="removed")return;
      var x=c.doc.data();
      if(x.lastFrom&&x.lastFrom!==UID&&!c.doc.metadata.hasPendingWrites&&unread(x)&&(!CH.cur||CH.cur.cid!==c.doc.id||document.hidden)){
        var m="💬 "+((x.names&&x.names[x.lastFrom])||"")+": "+prev(x);
        toast(m,3500);try{sysNotify(m,"chat-"+c.doc.id)}catch(e){}
      }
    });
    CH.ready=true;badge();
    if(state.tab==="chats"&&!CH.cur&&!document.querySelector("#cfbg,#ntbg"))doRender();
  },permOnce);
}
function openChat(u,n){
  if(GUEST){guestNeed();return}
  if(!cloudOK()||!u||u===UID)return;
  if(PEN.until>Date.now())return;
  var id=cidOf(UID,u),names={};names[UID]=myName();names[u]=n||"—";
  FB.db.collection("chats").doc(id).set({members:[UID,u].sort(),names:names},{merge:true}).then(function(){showChat(id,u,n||"—")},fail);
}
function showChat(id,u,n){
  closeChat(true);
  var bg=document.createElement("div");bg.className="chbg";bg.id="chbg";
  bg.innerHTML='<div class="chtop"><button type="button" class="chic chback" id="chx" aria-label="back">'+IC.back+'</button><span class="chava">'+esc(n.charAt(0))+'</span><div class="chnm"><b>'+esc(n)+'</b></div><button type="button" class="chic" data-call="a" aria-label="'+esc(t("ch_acall"))+'">'+IC.phone+'</button><button type="button" class="chic" data-call="v" aria-label="'+esc(t("ch_vcall"))+'">'+IC.video+'</button></div><div class="chmsgs" id="chmsgs"></div><div class="chbar" id="chbar"></div><input type="file" id="chfi" accept="image/*" hidden><input type="file" id="chfv" accept="video/*" hidden>';
  document.body.appendChild(bg);
  CH.cur={cid:id,u:u,n:n};CH.msgs=[];paintBar();
  CH.unM=FB.db.collection("chats").doc(id).collection("msgs").orderBy("ts").limitToLast(150).onSnapshot(function(sn){
    CH.msgs=sn.docs.map(function(d){var x=d.data();x.id=d.id;return x});paintMsgs();
    var last=CH.msgs[CH.msgs.length-1];if(last&&last.from!==UID&&!sn.metadata.hasPendingWrites)markRead();
  },fail);
}
function closeChat(quiet){
  if(REC)recStop(true);
  if(CH.unM){try{CH.unM()}catch(e){}CH.unM=null}
  CH.cur=null;CH.msgs=[];
  var b=$("chbg");if(b)b.remove();
  if(!quiet){badge();if(state.tab==="chats")doRender()}
}
var OKD=/^data:(image|audio)\/[a-z0-9.+-]+(;[a-z0-9=.+-]+)*;base64,[A-Za-z0-9+\/=]+$/i;
function bub(m){
  if(m.k==="c"){
    var tx=m.st==="miss"?t("ch_miss"):m.st==="dec"?t("ch_dec"):(t(m.ck==="v"?"ch_vcall":"ch_acall")+(m.dur?" • "+dur(m.dur):""));
    return '<div class="mcall">'+esc((m.ck==="v"?"🎥 ":"📞 ")+tx)+' <small>'+hhmm(m.ts)+'</small></div>';
  }
  var body="";
  if(m.k==="t")body='<span class="mt">'+esc(m.txt||"")+'</span>';
  else if(m.k==="i"&&OKD.test(m.d||""))body='<img class="mimg" data-lb="1" alt="" src="'+m.d+'">';
  else if(m.k==="a"&&OKD.test(m.d||""))body='<audio controls preload="metadata" src="'+m.d+'"></audio>';
  else if(m.k==="v"&&/^https:\/\//.test(m.u||""))body='<video controls playsinline preload="metadata" src="'+esc(m.u)+'"></video>';
  else return "";
  return '<div class="m '+(m.from===UID?"me":"he")+'">'+body+'<small>'+hhmm(m.ts)+'</small></div>';
}
function paintMsgs(){
  var e=$("chmsgs");if(!e)return;
  var near=!e._ids||e.scrollHeight-e.scrollTop-e.clientHeight<160,add="";
  e._ids=e._ids||{};
  CH.msgs.forEach(function(m){if(!e._ids[m.id]){e._ids[m.id]=1;add+=bub(m)}});
  if(add){e.insertAdjacentHTML("beforeend",add);if(near)e.scrollTop=e.scrollHeight}
}
function markRead(){
  var c=CH.cur;if(!c||document.hidden)return;
  var up={};up["rd."+UID]=Date.now();
  FB.db.collection("chats").doc(c.cid).update(up).catch(function(){});
}
function sendMsg(m){
  var c=CH.cur;if(!c)return Promise.resolve();
  m.from=UID;m.ts=Date.now();
  var ref=FB.db.collection("chats").doc(c.cid),up={last:m.k==="t"?m.txt.slice(0,80):"",lastK:m.k,lastFrom:UID,lastTs:m.ts};
  up["rd."+UID]=m.ts;
  return ref.collection("msgs").add(m).then(function(){return ref.update(up)}).catch(fail);
}
function sendText(){
  var i=$("chin");if(!i)return;
  var tx=i.value.trim();if(!tx)return;
  i.value="";syncGo();
  sendMsg({k:"t",txt:tx.slice(0,1500)});
}
function imgData(f,max,q){
  return new Promise(function(ok,no){
    var fr=new FileReader();
    fr.onload=function(){var im=new Image();im.onload=function(){
      var s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");
      c.width=Math.max(1,Math.round(im.width*s));c.height=Math.max(1,Math.round(im.height*s));
      c.getContext("2d").drawImage(im,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",q))};
      im.onerror=no;im.src=fr.result};
    fr.onerror=no;fr.readAsDataURL(f);
  });
}
function sendImage(f){
  imgData(f,1024,.62).then(function(d){
    if(d.length>800000)return imgData(f,720,.5);
    return d;
  }).then(function(d){
    if(d.length>900000){toast(t("ch_big"));return}
    sendMsg({k:"i",d:d});
  }).catch(function(){toast(t("ch_big"))});
}
function sendVideo(f){
  if(f.size>25*1048576){toast(t("ch_big"));return}
  var c=CH.cur;if(!c)return;
  if(!FB.st){toast(t("ch_novid"),3500);return}
  var ext=/mp4|quicktime|mov/i.test(f.type)?"mp4":"webm",ref=FB.st.ref("chat/"+c.cid+"/"+Date.now()+"_"+UID+"."+ext);
  toast("⏫ "+t("ch_vid")+"…",2500);
  ref.put(f,{contentType:f.type||"video/mp4"}).then(function(){return ref.getDownloadURL()}).then(function(u){return sendMsg({k:"v",u:u})})
    .catch(function(e){try{console.log(e)}catch(x){}toast(t("ch_novid"),4000)});
}
/* voice messages */
var REC=null;
function paintBar(){
  var b=$("chbar");if(!b)return;
  if(REC){
    b.className="chbar rec";
    b.innerHTML='<button type="button" class="chic" id="chrc" aria-label="cancel">'+IC.trash+'</button><span class="recdot"></span><b id="rect">00:00</b><span class="recl">'+esc(t("ch_rec"))+'</span><button type="button" class="chic chsend" id="chrs" aria-label="send">'+IC.send+'</button>';
    return;
  }
  b.className="chbar";
  b.innerHTML='<button type="button" class="chic" id="chimg" aria-label="'+esc(t("ch_img"))+'">'+IC.img+'</button><button type="button" class="chic" id="chvid" aria-label="'+esc(t("ch_vid"))+'">'+IC.video+'</button><input id="chin" autocomplete="off" enterkeyhint="send" placeholder="'+esc(t("ch_ph"))+'"><button type="button" class="chic chsend" id="chgo" aria-label="send">'+IC.mic+'</button>';
}
function syncGo(){var i=$("chin"),g=$("chgo");if(!i||!g)return;g.innerHTML=i.value.trim()?IC.send:IC.mic}
function recTick(){
  if(!REC)return;
  var s=Math.round((Date.now()-REC.t0)/1000),e=$("rect");if(e)e.textContent=dur(s);
  if(s>=60)recStop(false);
}
function recStart(){
  if(REC)return;
  if(!navigator.mediaDevices||!window.MediaRecorder){toast(t("ch_nocall"));return}
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){
    var mt=["audio/mp4;codecs=mp4a.40.2","audio/mp4","audio/webm;codecs=opus","audio/webm"].filter(function(x){return MediaRecorder.isTypeSupported(x)})[0]||"";
    var mr,ch=[];
    try{mr=new MediaRecorder(st,mt?{mimeType:mt,audioBitsPerSecond:32000}:undefined)}catch(e){mr=new MediaRecorder(st)}
    var t0=Date.now();
    mr.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data)};
    mr.onstop=function(){
      st.getTracks().forEach(function(tr){tr.stop()});
      var cancel=REC&&REC.cancel;clearInterval(REC&&REC.iv);REC=null;paintBar();
      if(cancel)return;
      var secs=Math.round((Date.now()-t0)/1000);if(secs<1)return;
      var fr=new FileReader();
      fr.onload=function(){
        var d=String(fr.result);
        if(d.length>900000||!OKD.test(d)){toast(t("ch_big"));return}
        sendMsg({k:"a",d:d,dur:secs});
      };
      fr.readAsDataURL(new Blob(ch,{type:(mr.mimeType||mt||"audio/webm").split(";")[0]}));
    };
    REC={mr:mr,t0:t0,cancel:false,iv:setInterval(recTick,250)};
    mr.start();paintBar();
  }).catch(function(){toast(t("ch_noperm"))});
}
function recStop(cancel){
  if(!REC)return;
  REC.cancel=!!cancel;
  try{REC.mr.stop()}catch(e){clearInterval(REC.iv);REC=null;paintBar()}
}
function lightbox(src){
  var d=document.createElement("div");d.className="chlb";d.innerHTML='<img alt="" src="'+src+'">';
  d.onclick=function(){d.remove()};document.body.appendChild(d);
}

/* ================= audio / video calls (WebRTC, signalling through Firestore) ================= */
var CALL=null,INC=null,callU=null,AC=null,ringT=null;
function getMedia(kind){
  return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:kind==="v"?{facingMode:"user",width:{ideal:640},height:{ideal:480}}:false});
}
function callStatus(s){var e=$("clst");if(e)e.textContent=s||""}
function callUI(n,kind){
  var o=$("clbg");if(o)o.remove();
  o=document.createElement("div");o.id="clbg";o.className="clbg"+(kind==="v"?" vid":"");
  o.innerHTML='<video id="clrv" class="clrv" autoplay playsinline></video><video id="cllv" class="cllv" autoplay playsinline muted></video><div class="clmid"><span class="chava big">'+esc((n||"?").charAt(0))+'</span><h2>'+esc(n||"—")+'</h2><p id="clst"></p></div><div class="clbtns" id="clbtns"></div>';
  document.body.appendChild(o);
  var lv=$("cllv");if(lv&&CALL&&CALL.st)lv.srcObject=CALL.st;
}
function callBtns(inc){
  var b=$("clbtns");if(!b)return;
  if(inc)b.innerHTML='<button type="button" class="clb dec" id="cldec">'+IC.phone+'<span>'+esc(t("ch_decline"))+'</span></button><button type="button" class="clb acc" id="clacc">'+IC.phone+'<span>'+esc(t("ch_accept"))+'</span></button>';
  else b.innerHTML='<button type="button" class="clb" id="clmute" aria-pressed="false">'+IC.mic+'<span>'+esc(t("ch_mute"))+'</span></button>'+(CALL&&CALL.kind==="v"?'<button type="button" class="clb" id="clcam" aria-pressed="false">'+IC.video+'<span>'+esc(t("ch_vid"))+'</span></button>':'')+'<button type="button" class="clb dec" id="clend">'+IC.phone+'<span>'+esc(t("ch_end"))+'</span></button>';
}
function mkPc(){
  var pc=new RTCPeerConnection({iceServers:ICE});
  pc.ontrack=function(e){var v=$("clrv");if(v&&e.streams&&e.streams[0]){v.srcObject=e.streams[0];try{var p=v.play();if(p&&p.catch)p.catch(function(){})}catch(x){}}};
  pc.onconnectionstatechange=function(){
    if(!CALL||CALL.pc!==pc)return;
    var s=pc.connectionState;
    if(s==="connected"&&!CALL.t0){
      CALL.t0=Date.now();clearTimeout(CALL.to);callStatus(t("ch_conn"));{var cb=$("clbg");if(cb)cb.classList.add("live")}
      CALL.iv=setInterval(function(){if(CALL&&CALL.t0)callStatus(dur((Date.now()-CALL.t0)/1000))},1000);
    }
    if(s==="failed"||s==="closed")endCall(CALL.t0?"ok":"miss");
  };
  return pc;
}
function addCand(d){
  if(!CALL||!d)return;
  var pc=CALL.pc;
  if(pc.remoteDescription&&pc.remoteDescription.type){try{pc.addIceCandidate(new RTCIceCandidate(d)).catch(function(){})}catch(e){}}
  else CALL.q.push(d);
}
function flushQ(){if(!CALL)return;CALL.q.splice(0).forEach(addCand)}
function startCall(kind){
  var c=CH.cur;if(!c||CALL||INC||!cloudOK())return;
  if(!navigator.mediaDevices||!window.RTCPeerConnection){toast(t("ch_nocall"));return}
  getMedia(kind).then(function(st){
    var ref=FB.db.collection("calls").doc(),pc=mkPc(),ready=false,pend=[];
    CALL={id:ref.id,ref:ref,pc:pc,kind:kind,role:"c",u:c.u,n:c.n,cid:c.cid,st:st,uns:[],t0:0,done:false,q:[]};
    st.getTracks().forEach(function(tr){pc.addTrack(tr,st)});
    callUI(c.n,kind);callBtns(false);callStatus(t("ch_ring"));if(kind==="v")$("clbg").classList.add("lv");
    var push=function(cd){ref.collection("ca").add(cd.toJSON())};
    pc.onicecandidate=function(e){if(!e.candidate)return;if(ready)push(e.candidate);else pend.push(e.candidate)};
    pc.createOffer().then(function(o){return pc.setLocalDescription(o)}).then(function(){
      return ref.set({from:UID,fname:myName(),to:c.u,kind:kind,state:"ring",ts:Date.now(),offer:{type:pc.localDescription.type,sdp:pc.localDescription.sdp}});
    }).then(function(){
      ready=true;pend.splice(0).forEach(push);
      if(!CALL||CALL.id!==ref.id)return;
      CALL.uns.push(ref.onSnapshot(function(sn){
        var d=sn.data();if(!d||!CALL||CALL.id!==ref.id)return;
        if(d.answer&&!pc.remoteDescription){pc.setRemoteDescription(new RTCSessionDescription(d.answer)).then(flushQ).catch(function(){})}
        if(d.state==="declined")endCall("dec",true);
        else if(d.state==="ended"||d.state==="missed")endCall(CALL.t0?"ok":"miss",true);
      }));
      CALL.uns.push(ref.collection("ce").onSnapshot(function(sn){sn.docChanges().forEach(function(ch){if(ch.type==="added")addCand(ch.doc.data())})}));
      CALL.to=setTimeout(function(){if(CALL&&!CALL.t0)endCall("miss")},45000);
    }).catch(function(e){try{console.log(e)}catch(x){}toast(t("ch_nocall"));endCall("err",true)});
  }).catch(function(){toast(t("ch_noperm"))});
}
function logCall(C,st,secs){
  var ref=FB.db.collection("chats").doc(C.cid),ts=Date.now(),up={last:st,lastK:"c",lastFrom:UID,lastTs:ts};
  up["rd."+UID]=ts;
  ref.collection("msgs").add({from:UID,k:"c",ck:C.kind,st:st,dur:secs,ts:ts}).then(function(){return ref.update(up)}).catch(function(){});
}
function endCall(reason,remote){
  var C=CALL;if(!C||C.done)return;
  C.done=true;clearTimeout(C.to);clearInterval(C.iv);
  C.uns.forEach(function(u){try{u()}catch(e){}});
  try{C.pc.close()}catch(e){}
  try{C.st.getTracks().forEach(function(tr){tr.stop()})}catch(e){}
  var secs=C.t0?Math.round((Date.now()-C.t0)/1000):0;
  if(!remote)C.ref.update({state:reason==="dec"?"declined":(C.t0?"ended":"missed"),by:UID}).catch(function(){});
  if(C.role==="c"&&reason!=="err")logCall(C,reason==="ok"?"ok":reason==="dec"?"dec":"miss",secs);
  CALL=null;
  var o=$("clbg");if(o)o.remove();
}
function endCallLocal(){if(CALL)endCall("miss");closeIncoming()}
function startRing(){
  stopRing();
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.resume)AC.resume();
    var beep=function(){var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=480;g.gain.value=.07;o.connect(g);g.connect(AC.destination);o.start();setTimeout(function(){try{o.stop()}catch(e){}},380)};
    beep();ringT=setInterval(function(){beep();try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}},1800);
  }catch(e){}
  try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}
}
function stopRing(){clearInterval(ringT);ringT=null;try{navigator.vibrate&&navigator.vibrate(0)}catch(e){}}
function closeIncoming(){stopRing();if(INC){INC=null;var o=$("clbg");if(o)o.remove()}}
function showIncoming(id,d){
  INC={id:id,d:d,ref:FB.db.collection("calls").doc(id),acc:false};
  callUI(d.fname,d.kind);callBtns(true);callStatus(t(d.kind==="v"?"ch_in_v":"ch_in_a"));
  startRing();
  try{sysNotify("📞 "+(d.fname||"")+" — "+t(d.kind==="v"?"ch_in_v":"ch_in_a"),"call-"+id)}catch(e){}
}
function declineCall(){
  var I=INC;if(!I)return;
  I.ref.update({state:"declined"}).catch(function(){});
  closeIncoming();
}
function acceptCall(){
  var I=INC;if(!I||I.acc)return;
  I.acc=true;stopRing();
  getMedia(I.d.kind).then(function(st){
    var pc=mkPc(),ref=I.ref;
    CALL={id:I.id,ref:ref,pc:pc,kind:I.d.kind,role:"r",u:I.d.from,n:I.d.fname,st:st,uns:[],t0:0,done:false,q:[]};
    INC=null;
    st.getTracks().forEach(function(tr){pc.addTrack(tr,st)});
    var lv=$("cllv");if(lv)lv.srcObject=st;
    callBtns(false);callStatus(t("ch_ring"));{var cb=$("clbg");if(cb&&I.d.kind==="v")cb.classList.add("lv")}
    pc.onicecandidate=function(e){if(e.candidate)ref.collection("ce").add(e.candidate.toJSON())};
    pc.setRemoteDescription(new RTCSessionDescription(I.d.offer)).then(function(){return pc.createAnswer()}).then(function(a){return pc.setLocalDescription(a)}).then(function(){
      return ref.update({answer:{type:pc.localDescription.type,sdp:pc.localDescription.sdp},state:"active"});
    }).then(function(){
      if(!CALL||CALL.id!==I.id)return;
      CALL.uns.push(ref.collection("ca").onSnapshot(function(sn){sn.docChanges().forEach(function(ch){if(ch.type==="added")addCand(ch.doc.data())})}));
      CALL.uns.push(ref.onSnapshot(function(sn){var d=sn.data();if(d&&(d.state==="ended"||d.state==="missed"))endCall("ok",true)}));
      flushQ();
    }).catch(function(e){try{console.log(e)}catch(x){}endCall("err")});
  }).catch(function(){toast(t("ch_noperm"));declineCall()});
}
function watchCalls(){
  callU=FB.db.collection("calls").where("to","==",UID).where("state","==","ring").onSnapshot(function(sn){
    sn.docChanges().forEach(function(ch){
      if(ch.type==="removed"){if(INC&&INC.id===ch.doc.id&&!INC.acc)closeIncoming();return}
      var d=ch.doc.data();
      if(ch.type!=="added"||Date.now()-(d.ts||0)>40000)return;
      if(CALL||INC||PEN.until>Date.now()){ch.doc.ref.update({state:"declined"}).catch(function(){});return}
      showIncoming(ch.doc.id,d);
    });
  },permOnce);
}
function stopCallWatch(){if(callU){try{callU()}catch(e){}callU=null}}

/* ================= wiring ================= */
function plusStop(){
  unsubs2.forEach(function(u){try{u()}catch(e){}});unsubs2=[];
  if(CH.unL){try{CH.unL()}catch(e){}CH.unL=null}
  stopCallWatch();endCallLocal();closeChat(true);
  CH.list=[];CH.ready=false;PEN={bad:0,pn:0,until:0,total:0};RATED={};ratedReady=false;FBL=[];
  ["bnbg","rtbg"].forEach(function(i){var b=$(i);if(b)b.remove()});
  badge();
}
function plusStart(){
  plusStop();
  if(!cloudOK())return;
  try{FB.st=firebase.storage()}catch(e){FB.st=null}
  var db=FB.db;
  unsubs2.push(db.collection("ratings").where("target","==",UID).onSnapshot(function(sn){
    PEN=calcPen(sn.docs.map(function(d){return d.data()}));
    var key="hw_bs_"+UID,seen=+(lsGet(key)||0);
    if(PEN.total>seen){lsSet(key,String(PEN.total));if(PEN.bad>0)DB.notifySelf("p","bad_rate",{name:PEN.bad})}
    else if(PEN.total<seen)lsSet(key,String(PEN.total));
    showBan();
  },permOnce));
  unsubs2.push(db.collection("ratings").where("rater","==",UID).onSnapshot(function(sn){
    RATED={};sn.docs.forEach(function(d){var x=d.data();RATED[x.rid+"|"+x.day]=1});
    ratedReady=true;checkRate();
  },function(){}));
  watchChats();watchCalls();
  if(isAdmin())unsubs2.push(db.collection("feedback").orderBy("ts","desc").limit(100).onSnapshot(function(sn){
    FBL=sn.docs.map(function(d){var x=d.data();x.id=d.id;return x});
    var e=$("fbin");if(e&&state.tab==="fb")e.innerHTML=fbItems();
  },function(){}));
}
var _ss=window.startSync,_sp=window.stopSync;
window.startSync=function(){_ss.apply(this,arguments);try{plusStart()}catch(e){try{console.log(e)}catch(x){}}};
window.stopSync=function(){_sp.apply(this,arguments);try{plusStop()}catch(e){}};

/* the main script calls these by name */
window.chBtn=chBtn;window.viewChats=viewChats;window.viewFeedback=viewFeedback;window.endBtn=endBtn;window.hwEnd=hwEnd;

/* one click handler for everything new */
document.addEventListener("click",function(e){
  var tg=e.target,lb=tg.closest&&tg.closest("[data-lb]");
  if(lb){lightbox(lb.src);return}
  var b=tg.closest&&tg.closest("button");if(!b)return;
  var d=b.dataset,id=b.id;
  if(d.chat!==undefined){openChat(d.chat,d.chname);return}
  if(d.call){startCall(d.call);return}
  if(d.endtrip){var rid=d.endtrip;askConfirm("🏁",t("rt_end"),routeName(rid),"✅ "+t("rt_end"),function(){hwEnd(rid)});return}
  if(d.fbdel){FB.db.collection("feedback").doc(d.fbdel).delete().catch(fail);return}
  if(d.rt){
    var bg=$("rtbg");if(!bg||!bg._d)return;
    var p=d.rt.split(":"),i=+p[0];bg._d.v[i]=+p[1];
    bg.querySelectorAll('[data-rt^="'+i+':"]').forEach(function(x){x.setAttribute("aria-pressed",x===b)});
    return;
  }
  if(id==="rtsend"){submitRate();return}
  if(id==="rtlater"){var r=$("rtbg");if(r){if(r._d)rtSkip[r._d.key]=1;r.remove()}return}
  if(id==="fbsend"){sendFb();return}
  if(id==="chx"){closeChat();return}
  if(id==="chimg"){var fi=$("chfi");if(fi)fi.click();return}
  if(id==="chvid"){var fv=$("chfv");if(fv)fv.click();return}
  if(id==="chgo"){var ci=$("chin");if(ci&&ci.value.trim())sendText();else recStart();return}
  if(id==="chrc"){recStop(true);return}
  if(id==="chrs"){recStop(false);return}
  if(id==="clacc"){acceptCall();return}
  if(id==="cldec"){declineCall();return}
  if(id==="clend"){endCall(CALL&&CALL.t0?"ok":"miss");return}
  if(id==="clmute"&&CALL){var a=CALL.st.getAudioTracks()[0];if(a){a.enabled=!a.enabled;b.setAttribute("aria-pressed",!a.enabled)}return}
  if(id==="clcam"&&CALL){var v=CALL.st.getVideoTracks()[0];if(v){v.enabled=!v.enabled;b.setAttribute("aria-pressed",!v.enabled)}return}
});
document.addEventListener("input",function(e){if(e.target.id==="chin")syncGo()});
document.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey&&e.target.id==="chin"){e.preventDefault();sendText()}});
document.addEventListener("change",function(e){
  var f=e.target.files&&e.target.files[0];if(!f)return;
  if(e.target.id==="chfi"){e.target.value="";sendImage(f)}
  else if(e.target.id==="chfv"){e.target.value="";sendVideo(f)}
});
document.addEventListener("visibilitychange",function(){if(!document.hidden)markRead()});
setInterval(function(){try{showBan();checkRate()}catch(e){}},5000);

/* make the new tab labels appear, and start if we are already signed in */
try{applyLang()}catch(e){}
if(cloudOK()){try{plusStart()}catch(e){}}
})();
