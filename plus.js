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
tab_chats:["پەیوەندییەکان","Contacts","الاتصالات","پەیوەندی","Têkilî"],
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
off_need:["ئەم بەشە تەنها کاتێک کار دەکات کە بە ئەژمارەوە چووبیتە ژوورەوە و ئینتەرنێت هەبێت","This section needs an account and an internet connection","يتطلب هذا القسم حسابًا واتصالًا بالإنترنت","ڤی بەشی پێدڤی ب ئەژمارەکێ و ئینتەرنێتێ هەیە","Ev beş hewceyî hesabek û înternetê ye"],
tab_set:["ڕێکخستنەکان","Settings","الإعدادات","ڕێکخستن","Rêkxistin"],
ms_loc:["شوێنی ئێستام","My location","موقعي الحالي","جهێ من یێ نوکە","Cihê min yê niha"],
ms_locating:["دیاریکردنی شوێن...","Locating…","جارٍ تحديد الموقع…","دیارکرنا جهی...","Cih tê diyarkirin…"],
loc_denied:["ڕێگەپێدان بە شوێن (GPS) نەدرا. لە ڕێکخستنەکانی وێبگەڕەکەت چالاکی بکە","Location permission was denied. Allow it in your browser settings","تم رفض إذن الموقع. اسمح به من إعدادات المتصفح","ڕێپێدان بۆ جهی (GPS) نەهاتە دان. ل ڕێکخستنێن وێبگەڕێ چالاک بکە","Destûra cihê (GPS) nehat dayîn. Di mîhengên gerokê de çalak bike"],
loc_fail:["نەتوانرا شوێنەکەت دیاری بکرێت، دووبارە هەوڵ بدەرەوە","Couldn't get your location, please try again","تعذر تحديد موقعك، حاول مرة أخرى","نەشیا جهێ تە دیار بکەت، دووبارە هەول بدە","Cihê te nehat diyarkirin, dîsa biceribîne"],
ch_pt:["ڕێگەپێدان بە مایک/کامێرا نییە","Microphone/camera access is blocked","الوصول إلى الميكروفون/الكاميرا محظور","ڕێپێدان بۆ مایک/کامێرایێ نینە","Destûra mîkrofon/kamerayê tune"],
ch_ph_i:["ئایفۆن: وێبسایتەکە لە Safari بکەرەوە (نەک لە ناو Telegram، Instagram یان Facebook)، پاشان:","iPhone: open the site in Safari (not inside Telegram, Instagram or Facebook), then:","آيفون: افتح الموقع في Safari (وليس داخل Telegram أو Instagram أو Facebook)، ثم:","ئایفۆن: مالپەرێ د Safari دا ڤەکە (نە د ناڤ Telegram، Instagram یان Facebook دا)، پاشی:","iPhone: malperê di Safari de veke (ne di nav Telegram, Instagram an Facebook de), paşê:"],
ch_ph_a:["ئەندرۆید:","Android:","أندرويد:","ئەندرۆید:","Android:"],
ch_ph_end:["پاشان پەڕەکە نوێ بکەرەوە و دووبارە هەوڵ بدە.","Then reload the page and try again.","ثم أعد تحميل الصفحة وحاول مرة أخرى.","پاشی لاپەڕێ نوی بکە و دووبارە هەول بدە.","Paşê rûpelê nû bike û dîsa biceribîne."],
ch_inapp:["تێبینی: ئێستا لە ناو بەرنامەیەکی تر (وەک Telegram یان Instagram) کراوەتەوە و ئەمە ڕێگە بە مایک و کامێرا نادات. لە Safari بیکەرەوە.","Note: the site is open inside another app (like Telegram or Instagram), which blocks the microphone and camera. Open it in Safari.","ملاحظة: الموقع مفتوح داخل تطبيق آخر (مثل Telegram أو Instagram) وهذا يمنع الميكروفون والكاميرا. افتحه في Safari.","تێبینی: ئەڤ مالپەر د ناڤ ئەپەکێ دی دا (وەک Telegram یان Instagram) ڤەبوویە و ئەڤە ڕێ ب مایک و کامێرایێ نادەت. د Safari دا ڤەکە.","Têbînî: ev malper di nav sepaneke din de (wekî Telegram an Instagram) vebûye û ev rê nade mîkrofon û kamerayê. Di Safari de veke."],
ch_nodev:["مایک یان کامێرا نەدۆزرایەوە","No microphone or camera was found","لم يتم العثور على ميكروفون أو كاميرا","مایک یان کامێرا نەهاتە دیتن","Mîkrofon an kamera nehat dîtin"],
ch_inuse:["مایک/کامێرا لەلایەن بەرنامەیەکی ترەوە بەکاردێت","The microphone/camera is being used by another app","الميكروفون/الكاميرا مستخدم من تطبيق آخر","مایک/کامێرا ژ لایێ ئەپەکێ دی ڤە دهێتە بکارئینان","Mîkrofon/kamera ji aliyê sepaneke din ve tê bikaranîn"],
ch_imgerr:["ئەم وێنەیە نەکرایەوە، وێنەیەکی تر هەڵبژێرە","This image couldn't be opened, pick another one","تعذر فتح هذه الصورة، اختر صورة أخرى","ئەڤ وێنە نەهاتە ڤەکرن، وێنەکێ دی هەلبژێرە","Ev wêne nehat vekirin, wêneyekî din hilbijêre"],
ch_bigv:["ڤیدیۆکە زۆر گەورەیە (زیاتر لە 25MB)","The video is too large (over 25MB)","الفيديو كبير جدًا (أكثر من 25MB)","ڤیدیۆ گەلەک مەزنە (پتر ژ 25MB)","Vîdyo pir mezin e (ji 25MB zêdetir)"],
g_new:["کۆمەڵە","Group","مجموعة","کۆمەل","Kom"],
g_title:["کۆمەڵەی نوێ","New group","مجموعة جديدة","کۆمەلا نوی","Koma nû"],
g_name_ph:["ناوی کۆمەڵە...","Group name…","اسم المجموعة…","ناڤێ کۆمەلێ...","Navê komê…"],
g_pick:["ئەندامەکان هەڵبژێرە (لە پەیوەندییەکانتەوە)","Choose members (from your contacts)","اختر الأعضاء (من جهات اتصالك)","ئەندامان هەلبژێرە (ژ پەیوەندیێن خۆ)","Endaman hilbijêre (ji têkiliyên xwe)"],
g_none:["هێشتا هیچ پەیوەندییەکت نییە بۆ زیادکردن. سەرەتا لەگەڵ کەسێک چات بکە.","You have no contacts to add yet. Chat with someone first.","ليس لديك جهات اتصال لإضافتها بعد. ابدأ محادثة مع شخص أولًا.","هێشتا چ پەیوەندی نینن بۆ زێدەکرنێ. ب دەستپێکێ دگەل کەسەکی چات بکە.","Hê tu têkilî tune ne ku tu zêde bikî. Pêşî bi kesekî re çat bike."],
g_create:["دروستکردن","Create","إنشاء","دروستکرن","Çêkirin"],
g_need:["ناوێک بنووسە و لانی کەم دوو کەس هەڵبژێرە","Enter a name and choose at least 2 people","اكتب اسمًا واختر شخصين على الأقل","ناڤەکی بنڤێسە و لانیکەم دوو کەسان هەلبژێرە","Navekî binivîse û herî kêm 2 kesan hilbijêre"],
g_members:["{n} ئەندام","{n} members","{n} أعضاء","{n} ئەندام","{n} endam"],
g_created:["{n} کۆمەڵەکەی دروست کرد","{n} created the group","{n} أنشأ المجموعة","{n} کۆمەل دروست کر","{n} komê çêkir"],
g_left:["{n} کۆمەڵەکەی بەجێهێشت","{n} left the group","{n} غادر المجموعة","{n} کۆمەل هێلا","{n} komê hişt"],
g_leave:["جێهێشتنی کۆمەڵە","Leave group","مغادرة المجموعة","هێلانا کۆمەلێ","Hiştina komê"],
g_you:["تۆ","You","أنت","تو","Tu"],
gc_in_a:["پەیوەندی دەنگیی کۆمەڵەیی","Group audio call","مكالمة صوتية جماعية","پەیوەندیا دەنگی یا کۆمەلێ","Têkiliya dengî ya komê"],
gc_in_v:["پەیوەندی ڤیدیۆیی کۆمەڵەیی","Group video call","مكالمة فيديو جماعية","پەیوەندیا ڤیدیۆیی یا کۆمەلێ","Têkiliya vîdyoyî ya komê"],
gc_join:["بەشداربوون","Join","انضمام","بەشداربوون","Tev lê bibe"],
gc_started:["{n} پەیوەندییەکی کۆمەڵەیی دەستپێکرد","{n} started a group call","{n} بدأ مكالمة جماعية","{n} پەیوەندیەکا کۆمەلێ دەستپێکر","{n} têkiliyeke komê dest pê kir"],
gc_full:["ئەم پەیوەندییە تەواوە (زۆرترین 6 کەس)","This call is full (max 6 people)","هذه المكالمة ممتلئة (6 أشخاص كحد أقصى)","ئەڤ پەیوەندی پڕە (پتر ژ 6 کەسان نابیت)","Ev têkilî tije ye (herî zêde 6 kes)"],
gc_n:["{n} کەس لە پەیوەندییەکەدان","{n} in the call","{n} في المكالمة","{n} د پەیوەندیێ دا","{n} di têkiliyê de ne"],
d_msg_t:["سڕینەوەی نامە","Delete message","حذف الرسالة","ڕەشکرنا نامەیێ","Jêbirina peyamê"],
d_msg_s:["ئەم نامەیە لەلای هەموو لایەک دەسڕدرێتەوە","This message will be deleted for everyone","ستُحذف هذه الرسالة للجميع","ئەڤ نامە دێ ل دەڤ هەمیان هێتە ڕەشکرن","Ev peyam ji bo hemûyan were jêbirin"],
d_msg_x:["شتێک نێردرا و سڕایەوە","Something was sent and deleted","تم إرسال شيء وحذفه","تشتەک هاتە هنارتن و ڕەشکرن","Tiştek hat şandin û hat jêbirin"],
d_del:["سڕینەوە","Delete","حذف","ڕەشکرن","Jêbirin"],
d_chat_t:["سڕینەوەی پەیوەندی","Delete this contact","حذف جهة الاتصال","ڕەشکرنا پەیوەندیێ","Jêbirina têkiliyê"],
d_chat_s:["هەموو نامەکانی ئەم گفتوگۆیە لای هەردووکتان دەسڕدرێنەوە و {n} ئاگادار دەکرێتەوە.","All messages in this chat will be deleted for both of you, and {n} will be notified.","ستُحذف كل رسائل هذه المحادثة لدى كليكما وسيتم إشعار {n}.","هەمی نامەیێن ڤێ گفتوگۆیێ دێ ل دەڤ هەردووکان هێنە ڕەشکرن و {n} دێ هێتە ئاگەهدارکرن.","Hemû peyamên vê axaftinê ji bo we herduyan werin jêbirin û {n} were agahdarkirin."],
d_grp_s:["تۆ لە کۆمەڵەکە دەردەچیت و ئەم کۆمەڵەیە لە لیستەکەت نامێنێت.","You will leave this group and it will disappear from your list.","ستغادر هذه المجموعة وستختفي من قائمتك.","تو دێ ژ کۆمەلێ دەرکەڤی و ئەڤ کۆمەل دێ ژ لیستا تە ڤەشێت.","Tu ê ji vê komê derkevî û ew ê ji lîsteya te winda bibe."],
g_max:["لە کۆمەڵەیەکدا زۆرترین 12 ئەندام دەتوانن بن","A group can have up to 12 members","يمكن أن تضم المجموعة حتى 12 عضوًا","د کۆمەلەکێ دا هەتا 12 ئەندام دشێن هەبن","Di komekê de heta 12 endam dikarin hebin"],
n_chat_del:["🗑️ {n} پەیوەندییەکەی سڕییەوە","🗑️ {n} deleted the contact with you","🗑️ {n} حذف جهة الاتصال بينكما","🗑️ {n} پەیوەندی ڕەشکر","🗑️ {n} têkilî jêbir"]
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
 trash:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',
 group:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.3 5 2.6 5 5.8"/></svg>',
 chev:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
 locate:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
 user:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18c1.2-2.4 3.2-3.5 5.5-3.5s4.3 1.1 5.5 3.5"/></svg>',
 edit:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>',
 info:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
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
  var k=c.lastK,nm=(c.names&&c.names[c.lastFrom])||"—";
  var who=(c.group&&c.lastFrom&&c.lastFrom!==UID&&k!=="s"&&k!=="c")?nm+": ":"";
  if(k==="i")return who+"📷 "+t("ch_img");
  if(k==="a")return who+"🎤 "+t("ch_voice");
  if(k==="v")return who+"🎬 "+t("ch_vid");
  if(k==="x")return who+"🚫 "+t("d_msg_x");
  if(k==="s")return t(c.last==="left"?"g_left":"g_created",{n:nm});
  if(k==="c")return c.last==="gstart"?"📞 "+t("gc_started",{n:nm}):"📞 "+t(c.last==="miss"?"ch_miss":c.last==="dec"?"ch_dec":"ch_acall");
  return who+(c.last||"");
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
  var h='<div class="chhead"><h2>💬 '+esc(t("tab_chats"))+'</h2>'+(cloudOK()?'<button type="button" class="btn sec gnew" id="gnew">+ '+esc(t("g_new"))+'</button>':'')+'</div>';
  if(!cloudOK())return h+'<div class="empty">'+esc(t("off_need"))+'</div>';
  var L=CH.list.filter(function(c){return c.lastTs});          // hide conversations that have no message yet
  if(!L.length)return h+'<div class="empty">'+esc(t("ch_empty"))+'</div>';
  L.forEach(function(c){
    var gr=!!c.group,o=gr?{u:"",n:c.title||"—"}:oth(c),un=unread(c);
    h+='<div class="chrow'+(un?' unread':'')+'"><button type="button" class="chopen" '+(gr?'data-gchat="'+esc(c.id)+'"':'data-chat="'+esc(o.u)+'" data-chname="'+esc(o.n)+'"')+'><span class="chava'+(gr?' gr':'')+'">'+(gr?IC.group:esc(o.n.charAt(0)))+'</span><span class="chmid"><b>'+esc(o.n)+'</b><small>'+esc(prev(c))+'</small></span><span class="chmeta"><i>'+fts(c.lastTs)+'</i>'+(un?'<b class="tbd">●</b>':'')+'</span></button><button type="button" class="chdel" data-chdel="'+esc(c.id)+'" aria-label="'+esc(t("d_del"))+'">'+IC.trash+'</button></div>';
  });
  return h;
}
var permShown=false;
function permOnce(e){if(permShown)return;permShown=true;fail(e)}
function watchChats(){
  CH.unL=FB.db.collection("chats").where("members","array-contains",UID).onSnapshot(function(sn){
    var first=!CH.ready;
    CH.list=sn.docs.map(function(d){var x=d.data();x.id=d.id;return x}).sort(function(a,b){return (b.lastTs||0)-(a.lastTs||0)});
    sn.docChanges().forEach(function(c){
      var id=c.doc.id;
      if(c.type==="removed"){if(CH.cur&&CH.cur.cid===id)closeChat(true);return}
      if(first)return;
      var x=c.doc.data();
      if(x.lastFrom&&x.lastFrom!==UID&&!c.doc.metadata.hasPendingWrites&&unread(x)&&(!CH.cur||CH.cur.cid!==id||document.hidden)){
        var m="💬 "+(x.group?(x.title||"")+" • ":"")+((x.names&&x.names[x.lastFrom])||"")+": "+prev(x);
        toast(m,3500);try{sysNotify(m,"chat-"+id)}catch(e){}
      }
    });
    CH.ready=true;badge();
    var cu=CH.cur&&CH.cur.g?CH.list.find(function(x){return x.id===CH.cur.cid}):null;
    if(cu){var s=$("chsub");if(s)s.textContent=t("g_members",{n:(cu.members||[]).length})}
    if(state.tab==="chats"&&!CH.cur&&!document.querySelector("#cfbg,#ntbg,#gnbg"))doRender();
  },permOnce);
}
function openChat(u,n){
  if(GUEST){guestNeed();return}
  if(!cloudOK()||!u||u===UID)return;
  if(PEN.until>Date.now())return;
  var id=cidOf(UID,u),names={};names[UID]=myName();names[u]=n||"—";
  FB.db.collection("chats").doc(id).set({members:[UID,u].sort(),names:names},{merge:true}).then(function(){showChat(id,u,n||"—")},fail);
}
function openGroup(id,doc){
  if(GUEST){guestNeed();return}
  var c=doc||CH.list.find(function(x){return x.id===id});if(!c||!cloudOK()||PEN.until>Date.now())return;
  showChat(id,"",c.title||"—",true,c);
}
function showChat(id,u,n,gr,c0){
  closeChat(true);
  var bg=document.createElement("div");bg.className="chbg";bg.id="chbg";
  bg.innerHTML='<div class="chtop"><button type="button" class="chic chback" id="chx" aria-label="back">'+IC.back+'</button>'+
    (gr?'<button type="button" class="chtitle" data-ginfo="1"><span class="chava gr">'+IC.group+'</span><span class="chnm"><b>'+esc(n)+'</b><small id="chsub">'+esc(t("g_members",{n:((c0&&c0.members)||[]).length}))+'</small></span></button>'
       :'<span class="chava">'+esc(n.charAt(0))+'</span><div class="chnm"><b>'+esc(n)+'</b></div>')+
    '<button type="button" class="chic" data-call="a" aria-label="'+esc(t("ch_acall"))+'">'+IC.phone+'</button><button type="button" class="chic" data-call="v" aria-label="'+esc(t("ch_vcall"))+'">'+IC.video+'</button></div>'+
    (gr?'<div class="gjoinbar hide" id="gjoin"></div>':'')+
    '<div class="chmsgs" id="chmsgs"></div><div class="chbar" id="chbar"></div><input type="file" id="chfi" accept="image/*" hidden><input type="file" id="chfv" accept="video/*" hidden>';
  document.body.appendChild(bg);
  CH.cur={cid:id,u:u,n:n,g:!!gr,names:(c0&&c0.names)||{},members:(c0&&c0.members)||[]};CH.msgs=[];paintBar();gjoinPaint();
  CH.unM=FB.db.collection("chats").doc(id).collection("msgs").orderBy("ts").limitToLast(150).onSnapshot(function(sn){
    CH.msgs=sn.docs.map(function(d){var x=d.data();x.id=d.id;return x});paintMsgs();
    var last=CH.msgs[CH.msgs.length-1];if(last&&last.from!==UID&&!sn.metadata.hasPendingWrites)markRead();
  },fail);
}
function closeChat(quiet){
  if(REC)recStop(true);
  if(CH.unM){try{CH.unM()}catch(e){}CH.unM=null}
  CH.cur=null;CH.msgs=[];
  ["chbg","gmbg"].forEach(function(i){var b=$(i);if(b)b.remove()});
  if(!quiet){badge();if(state.tab==="chats")doRender()}
}
var OKD=/^data:(image|audio)\/[a-z0-9.+-]+(;[a-z0-9=.+-]+)*;base64,[A-Za-z0-9+\/=]+$/i;
function senderName(u){
  var c=CH.cur&&CH.list.find(function(x){return x.id===CH.cur.cid});
  return (c&&c.names&&c.names[u])||(CH.cur&&CH.cur.names&&CH.cur.names[u])||"—";
}
function bub(m){
  var id=' data-mid="'+esc(m.id||"")+'"',me=m.from===UID;
  if(m.k==="c"){
    var tx=m.st==="gstart"?t("gc_started",{n:m.fn||"—"}):m.st==="miss"?t("ch_miss"):m.st==="dec"?t("ch_dec"):(t(m.ck==="v"?"ch_vcall":"ch_acall")+(m.dur?" • "+dur(m.dur):""));
    return '<div class="mcall"'+id+'>'+esc((m.ck==="v"?"🎥 ":"📞 ")+tx)+' <small>'+hhmm(m.ts)+'</small></div>';
  }
  if(m.k==="s")return '<div class="mcall"'+id+'>'+esc("👥 "+t(m.st==="left"?"g_left":"g_created",{n:m.fn||"—"}))+' <small>'+hhmm(m.ts)+'</small></div>';
  var who=(CH.cur&&CH.cur.g&&!me)?'<b class="msn">'+esc(senderName(m.from))+'</b>':"";
  if(m.k==="x")return '<div class="m del '+(me?"me":"he")+'"'+id+'>'+who+'<span class="mt">🚫 '+esc(t("d_msg_x"))+'</span><div class="mf"><small>'+hhmm(m.ts)+'</small></div></div>';
  var body="";
  if(m.k==="t")body='<span class="mt">'+esc(m.txt||"")+'</span>';
  else if(m.k==="i"&&OKD.test(m.d||""))body='<img class="mimg" data-lb="1" alt="" src="'+m.d+'">';
  else if(m.k==="a"&&OKD.test(m.d||""))body='<audio controls preload="metadata" src="'+m.d+'"></audio>';
  else if(m.k==="v"&&/^https:\/\//.test(m.u||""))body='<video controls playsinline preload="metadata" src="'+esc(m.u)+'"></video>';
  else return "";
  return '<div class="m '+(me?"me":"he")+'"'+id+'>'+who+body+'<div class="mf"><small>'+hhmm(m.ts)+'</small>'+(me?'<button type="button" class="mdel" data-mdel="'+esc(m.id||"")+'" aria-label="'+esc(t("d_del"))+'">'+IC.trash+'</button>':'')+'</div></div>';
}
function paintMsgs(){
  var e=$("chmsgs");if(!e)return;
  var near=!e._ids||e.scrollHeight-e.scrollTop-e.clientHeight<160,add="";
  e._ids=e._ids||{};
  CH.msgs.forEach(function(m){
    var sig=m.k+(m.del?"d":"");
    if(!(m.id in e._ids)){e._ids[m.id]=sig;add+=bub(m)}
    else if(e._ids[m.id]!==sig){                                  // edited in place (a deleted message)
      e._ids[m.id]=sig;
      var el=e.querySelector('[data-mid="'+m.id+'"]');if(el)el.outerHTML=bub(m);
    }
  });
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
function loadPic(f){
  var viaImg=function(){return new Promise(function(ok,no){
    var u=URL.createObjectURL(f),im=new Image();
    im.onload=function(){URL.revokeObjectURL(u);ok(im)};
    im.onerror=function(){URL.revokeObjectURL(u);no(new Error("decode"))};
    im.src=u;
  })};
  if(window.createImageBitmap){try{return createImageBitmap(f).catch(viaImg)}catch(e){}}
  return viaImg();
}
function shrink(src,max,q){
  var s=Math.min(1,max/Math.max(src.width,src.height)),c=document.createElement("canvas");
  c.width=Math.max(1,Math.round(src.width*s));c.height=Math.max(1,Math.round(src.height*s));
  var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(src,0,0,c.width,c.height);
  return c.toDataURL("image/jpeg",q);
}
function sendImage(f){
  loadPic(f).then(function(src){
    var steps=[[1280,.72],[1024,.62],[800,.55],[640,.5],[480,.42]],d="";
    for(var i=0;i<steps.length;i++){d=shrink(src,steps[i][0],steps[i][1]);if(d.length<=700000)break}
    try{if(src.close)src.close()}catch(e){}
    if(d.indexOf("data:image/jpeg")!==0){toast(t("ch_imgerr"),3500);return}
    if(d.length>900000){toast(t("ch_big"));return}
    sendMsg({k:"i",d:d});
  }).catch(function(){toast(t("ch_imgerr"),3500)});
}
function sendVideo(f){
  if(f.size>25*1048576){toast(t("ch_bigv"),3500);return}
  var c=CH.cur;if(!c)return;
  if(!FB.st){toast(t("ch_novid"),3500);return}
  var ext=/mp4|quicktime|mov/i.test(f.type)?"mp4":"webm",ref=FB.st.ref(c.g?("chat/"+UID+"_g/"+c.cid+"_"+Date.now()+"."+ext):("chat/"+c.cid+"/"+Date.now()+"_"+UID+"."+ext));
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
  },mediaErr);
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
var UA=navigator.userAgent||"",IOS=/iP(hone|ad|od)/.test(UA)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
function inAppBrowser(){return /FBAN|FBAV|Instagram|Snapchat|Line\/|Viber|MicroMessenger|TikTok|Telegram/i.test(UA)||(IOS&&!/Safari\//.test(UA)&&!navigator.standalone)}
function permHelp(name){
  var o=$("hpbg");if(o)o.remove();
  o=document.createElement("div");o.className="tmbg hpbg";o.id="hpbg";
  o.innerHTML='<div class="tmbox"><div class="tmico">🎙️</div><h2>'+esc(t("ch_pt"))+'</h2>'+(inAppBrowser()?'<p class="maphint hpnote">'+esc(t("ch_inapp"))+'</p>':'')+'<p class="maphint hptxt">'+esc(t("ch_ph_i"))+'</p><div class="hpath" dir="ltr">aA → Website Settings → Microphone / Camera → Allow</div><div class="hpath" dir="ltr">Settings → Safari → Camera / Microphone → Ask / Allow</div><p class="maphint hptxt">'+esc(t("ch_ph_a"))+'</p><div class="hpath" dir="ltr">Chrome → ⋮ → Settings → Site settings → Microphone / Camera → Allow</div><p class="maphint hptxt">'+esc(t("ch_ph_end"))+'</p>'+(name?'<p class="hpcode" dir="ltr">'+esc(name)+'</p>':'')+'<button type="button" class="btn" id="hpok" style="width:100%">OK</button></div>';
  document.body.appendChild(o);
}
function mediaErr(e){
  var n=(e&&e.name)||"";
  if(n==="NotAllowedError"||n==="SecurityError"||n==="PermissionDeniedError"){permHelp(n);return}
  if(n==="NotFoundError"||n==="DevicesNotFoundError"||n==="OverconstrainedError"){toast(t("ch_nodev"),4000);return}
  if(n==="NotReadableError"||n==="TrackStartError"||n==="AbortError"){toast(t("ch_inuse"),4000);return}
  toast(t("ch_noperm")+(n?" ("+n+")":""),4500);
}
function getMedia(kind){
  var md=navigator.mediaDevices;
  var want={audio:{echoCancellation:true,noiseSuppression:true},video:kind==="v"?{facingMode:"user",width:{ideal:640},height:{ideal:480}}:false};
  return md.getUserMedia(want).catch(function(e){
    var n=e&&e.name;
    if(n==="OverconstrainedError"||n==="TypeError")return md.getUserMedia({audio:true,video:kind==="v"});
    throw e;
  });
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
  var c=CH.cur;if(!c||c.g||CALL||INC||GC||!cloudOK())return;
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
  },mediaErr);
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
  },function(e){mediaErr(e);declineCall()});
}
function watchCalls(){
  callU=FB.db.collection("calls").where("to","==",UID).where("state","==","ring").onSnapshot(function(sn){
    sn.docChanges().forEach(function(ch){
      if(ch.type==="removed"){if(INC&&INC.id===ch.doc.id&&!INC.acc)closeIncoming();return}
      var d=ch.doc.data();
      if(ch.type!=="added"||Date.now()-(d.ts||0)>40000)return;
      if(CALL||INC||GC||PEN.until>Date.now()){ch.doc.ref.update({state:"declined"}).catch(function(){});return}
      showIncoming(ch.doc.id,d);
    });
  },permOnce);
}
function stopCallWatch(){if(callU){try{callU()}catch(e){}callU=null}}

/* ================= delete: messages + contacts ================= */
function curChat(){return CH.cur?CH.list.find(function(x){return x.id===CH.cur.cid}):null}
function delMsgAsk(id){
  var m=CH.msgs.find(function(x){return x.id===id});
  if(!m||m.from!==UID||m.k==="x")return;
  askConfirm("🗑️",t("d_msg_t"),t("d_msg_s"),"🗑 "+t("d_del"),function(){delMsg(m)});
}
function delMsg(m){
  var c=CH.cur;if(!c)return;
  var ref=FB.db.collection("chats").doc(c.cid);
  if(m.k==="v"&&m.u&&FB.st){try{FB.st.refFromURL(m.u).delete().catch(function(){})}catch(e){}}
  ref.collection("msgs").doc(m.id).set({from:m.from,ts:m.ts,k:"x",del:true}).then(function(){
    var ch=curChat();
    if(ch&&(ch.lastTs||0)<=m.ts)return ref.update({last:"",lastK:"x"});
  }).catch(fail);
}
function wipeMsgs(ref){
  return ref.collection("msgs").limit(300).get().then(function(sn){
    if(sn.empty)return null;
    var b=FB.db.batch();
    sn.docs.forEach(function(d){var x=d.data();if(x.k==="v"&&x.u&&FB.st){try{FB.st.refFromURL(x.u).delete().catch(function(){})}catch(e){}}b.delete(d.ref)});
    return b.commit().then(function(){return sn.size>=300?wipeMsgs(ref):null});
  });
}
function delChatAsk(cid){
  var c=CH.list.find(function(x){return x.id===cid});if(!c)return;
  if(c.group)askConfirm("👋",t("g_leave"),t("d_grp_s"),"👋 "+t("g_leave"),function(){leaveGroup(c)});
  else askConfirm("🗑️",t("d_chat_t"),t("d_chat_s",{n:oth(c).n}),"🗑 "+t("d_del"),function(){delChat(c)});
}
function delChat(c){
  var ref=FB.db.collection("chats").doc(c.id),o=oth(c);
  if(CH.cur&&CH.cur.cid===c.id)closeChat(true);
  wipeMsgs(ref).then(function(){return ref.delete()}).then(function(){
    try{colN().add(ntDoc(o.u,"p","chat_del",{name:myName()})).then(flushPush)}catch(e){}   // tell the other person
    if(state.tab==="chats")doRender();
  }).catch(fail);
}
function leaveGroup(c){
  var ref=FB.db.collection("chats").doc(c.id),ts=Date.now();
  if(CH.cur&&CH.cur.cid===c.id)closeChat(true);
  if((c.members||[]).length<=1){wipeMsgs(ref).then(function(){return ref.delete()}).catch(fail);return}
  var up={members:firebase.firestore.FieldValue.arrayRemove(UID),last:"left",lastK:"s",lastFrom:UID,lastTs:ts};
  ref.collection("msgs").add({from:UID,k:"s",st:"left",fn:myName(),ts:ts}).then(function(){return ref.update(up)}).catch(fail);
}

/* ================= groups ================= */
function gnOpen(){
  if(!cloudOK()||PEN.until>Date.now())return;
  var cand=CH.list.filter(function(c){return !c.group&&c.lastTs}).map(function(c){var o=oth(c);return {u:o.u,n:o.n}});
  var o=$("gnbg");if(o)o.remove();
  o=document.createElement("div");o.className="tmbg gnbg";o.id="gnbg";
  var h='<div class="tmbox"><div class="tmico">👥</div><h2>'+esc(t("g_title"))+'</h2><input id="gnname" maxlength="40" autocomplete="off" placeholder="'+esc(t("g_name_ph"))+'"><p class="maphint hptxt">'+esc(t("g_pick"))+'</p>';
  if(!cand.length)h+='<div class="empty">'+esc(t("g_none"))+'</div>';
  else{h+='<div class="gnlist">';cand.forEach(function(c){h+='<button type="button" class="gnrow" data-gsel="'+esc(c.u)+'" data-gn="'+esc(c.n)+'" aria-pressed="false"><span class="chava">'+esc(c.n.charAt(0))+'</span><b>'+esc(c.n)+'</b><span class="gnck"></span></button>'});h+='</div>'}
  h+='<button type="button" class="btn" id="gncreate" style="width:100%;margin-top:12px">✅ '+esc(t("g_create"))+'</button><button type="button" class="btn sec" id="gncancel" style="width:100%;margin-top:8px">'+esc(t("cf_no"))+'</button></div>';
  o.innerHTML=h;document.body.appendChild(o);
}
function gnCreate(){
  var nm=(($("gnname")||{}).value||"").trim();
  var rows=[].slice.call(document.querySelectorAll('#gnbg .gnrow[aria-pressed="true"]'));
  if(!nm||rows.length<2){toast(t("g_need"));return}
  if(rows.length>11){toast(t("g_max"));return}
  var members=[UID],names={};names[UID]=myName();
  rows.forEach(function(r){members.push(r.dataset.gsel);names[r.dataset.gsel]=r.dataset.gn});
  var ref=FB.db.collection("chats").doc(),ts=Date.now(),btn=$("gncreate");if(btn)btn.disabled=true;
  var doc={group:true,title:nm.slice(0,40),owner:UID,members:members,names:names,createdAt:ts,last:"create",lastK:"s",lastFrom:UID,lastTs:ts,rd:{}};doc.rd[UID]=ts;
  ref.set(doc).then(function(){return ref.collection("msgs").add({from:UID,k:"s",st:"create",fn:myName(),ts:ts})}).then(function(){
    var g=$("gnbg");if(g)g.remove();openGroup(ref.id,doc);
  }).catch(function(e){if(btn)btn.disabled=false;fail(e)});
}
function gInfo(){
  var cc=CH.cur;if(!cc||!cc.g)return;
  var c=curChat()||{members:cc.members||[],names:cc.names||{}};
  var o=$("gmbg");if(o)o.remove();
  o=document.createElement("div");o.className="tmbg gmbg";o.id="gmbg";
  var h='<div class="tmbox"><div class="tmico">👥</div><h2>'+esc(cc.n)+'</h2><p class="maphint" style="text-align:center">'+esc(t("g_members",{n:(c.members||[]).length}))+'</p><div class="gnlist">';
  (c.members||[]).forEach(function(u){var nm=(c.names&&c.names[u])||"—";h+='<div class="gnrow"><span class="chava">'+esc(nm.charAt(0))+'</span><b>'+esc(nm)+(u===UID?' • '+esc(t("g_you")):'')+'</b></div>'});
  h+='</div><button type="button" class="btn no" id="gleave" style="width:100%;margin-top:12px">👋 '+esc(t("g_leave"))+'</button><button type="button" class="btn sec" id="gmx" style="width:100%;margin-top:8px">'+esc(t("pk_x"))+'</button></div>';
  o.innerHTML=h;document.body.appendChild(o);
}

/* ================= group calls: every phone connects to every other phone (WebRTC mesh), signalling in Firestore ================= */
var GC=null,GCI=null,gcU=null,GCA={},GC_MAX=6;
function gjoinPaint(){
  var b=$("gjoin");if(!b)return;
  var a=CH.cur&&CH.cur.g&&GCA[CH.cur.cid];
  if(!a||GC){b.classList.add("hide");b.innerHTML="";return}
  b.classList.remove("hide");
  b.innerHTML='<button type="button" class="btn gjb" data-gjoin="'+esc(a.id)+'">'+IC.phone+' '+esc(t(a.kind==="v"?"gc_in_v":"gc_in_a"))+' • '+esc(t("gc_join"))+'</button>';
}
function gcWatch(){
  gcU=FB.db.collection("gcalls").where("members","array-contains",UID).onSnapshot(function(sn){
    GCA={};
    sn.docs.forEach(function(dd){var d=dd.data();if(d.state==="active"&&Date.now()-(d.ts||0)<4*3600e3&&(!GCA[d.gid]||GCA[d.gid].ts<d.ts)){d.id=dd.id;GCA[d.gid]=d}});
    gjoinPaint();
    sn.docChanges().forEach(function(ch){
      var d=ch.doc.data(),id=ch.doc.id;
      if(ch.type==="removed"||d.state!=="active"){if(GCI&&GCI.id===id)gcCloseIn();return}
      if(ch.type!=="added"||d.starter===UID||GC||GCI||CALL||INC||PEN.until>Date.now())return;
      if(Date.now()-(d.ts||0)>90000)return;                       // an old call: not ringing any more
      gcShowIn(id,d);
    });
  },permOnce);
}
function gcStopWatch(){if(gcU){try{gcU()}catch(e){}gcU=null}GCA={}}
function gcShowIn(id,d){
  GCI={id:id,d:d};
  var o=document.createElement("div");o.id="gibg";o.className="clbg";
  o.innerHTML='<div class="clmid"><span class="chava big gr">'+IC.group+'</span><h2>'+esc(d.title||"")+'</h2><p>'+esc((d.sname||"")+" • "+t(d.kind==="v"?"gc_in_v":"gc_in_a"))+'</p></div><div class="clbtns"><button type="button" class="clb dec" id="gidec">'+IC.phone+'<span>'+esc(t("ch_decline"))+'</span></button><button type="button" class="clb acc" id="gijoin">'+IC.phone+'<span>'+esc(t("gc_join"))+'</span></button></div>';
  document.body.appendChild(o);startRing();
  try{sysNotify("📞 "+(d.title||"")+" — "+t(d.kind==="v"?"gc_in_v":"gc_in_a"),"gcall-"+id)}catch(e){}
}
function gcCloseIn(){stopRing();GCI=null;var o=$("gibg");if(o)o.remove()}
function gcLog(c,kind){
  var ref=FB.db.collection("chats").doc(c.cid),ts=Date.now(),up={last:"gstart",lastK:"c",lastFrom:UID,lastTs:ts};up["rd."+UID]=ts;
  ref.collection("msgs").add({from:UID,k:"c",ck:kind,st:"gstart",fn:myName(),ts:ts}).then(function(){return ref.update(up)}).catch(function(){});
}
function gcStart(kind){
  var c=CH.cur;if(!c||!c.g||GC||CALL||INC||!cloudOK())return;
  if(!navigator.mediaDevices||!window.RTCPeerConnection){toast(t("ch_nocall"));return}
  if(GCA[c.cid]){gcJoin(GCA[c.cid].id,GCA[c.cid]);return}       // there is already a call in this group: join it
  getMedia(kind).then(function(st){
    var cu=curChat()||c,ref=FB.db.collection("gcalls").doc();
    var doc={gid:c.cid,title:c.n,kind:kind,starter:UID,sname:myName(),members:(cu.members||c.members||[]).slice(),state:"active",ts:Date.now()};
    ref.set(doc).then(function(){gcLog(c,kind);gcEnter(ref.id,doc,st)}).catch(function(e){st.getTracks().forEach(function(tr){tr.stop()});fail(e)});
  },mediaErr);
}
function gcJoin(id,d){
  if(GC||CALL||!cloudOK())return;
  if(!navigator.mediaDevices||!window.RTCPeerConnection){toast(t("ch_nocall"));return}
  FB.db.collection("gcalls").doc(id).collection("peers").get().then(function(sn){
    var live=0;sn.docs.forEach(function(x){var p=x.data();if(p.uid!==UID&&Date.now()-(p.hb||0)<45000)live++});
    if(live>=GC_MAX-1){toast(t("gc_full"),3500);return}
    getMedia(d.kind).then(function(st){gcEnter(id,d,st)},mediaErr);
  }).catch(fail);
}
function gcEnter(id,d,st){
  var ref=FB.db.collection("gcalls").doc(id);
  GC={id:id,ref:ref,kind:d.kind,gid:d.gid,title:d.title||"",st:st,pcs:{},peers:{},uns:[],me:Date.now(),done:false};
  gcUI();
  var pr=ref.collection("peers"),G=GC;
  pr.doc(UID).set({uid:UID,name:myName(),joinedAt:G.me,hb:Date.now()}).then(function(){
    if(GC!==G)return;
    G.uns.push(pr.onSnapshot(function(sn){
      if(GC!==G)return;
      var now=Date.now(),live={};
      sn.docs.forEach(function(dd){var p=dd.data();if(p.uid!==UID&&now-(p.hb||0)<45000)live[p.uid]=p});
      Object.keys(live).forEach(function(u){var isNew=!G.peers[u];G.peers[u]=live[u];if(isNew)gcPeerAdd(u,live[u])});
      Object.keys(G.peers).forEach(function(u){if(!live[u]){delete G.peers[u];gcPeerDrop(u)}});
      gcCount();
    },permOnce));
    G.uns.push(ref.collection("sig").where("to","==",UID).onSnapshot(function(sn){
      sn.docChanges().forEach(function(ch){
        if(ch.type!=="added")return;
        var x=ch.doc.data();
        ch.doc.ref.delete().catch(function(){});
        if(GC===G&&(x.ts||0)>=G.me-8000)gcSig(x);
      });
    },permOnce));
    G.uns.push(ref.onSnapshot(function(s){if(GC===G&&!s.exists)gcLeave(true)}));
    G.hb=setInterval(function(){
      if(GC!==G)return;
      pr.doc(UID).update({hb:Date.now()}).catch(function(){});
      var now=Date.now();Object.keys(G.peers).forEach(function(u){if(now-(G.peers[u].hb||0)>60000){delete G.peers[u];gcPeerDrop(u)}});gcCount();
    },15000);
  }).catch(function(e){fail(e);gcLeave()});
}
function gcUI(){
  var o=$("gcbg");if(o)o.remove();
  o=document.createElement("div");o.id="gcbg";o.className="gcbg"+(GC.kind==="v"?" vid":"");
  o.innerHTML='<div class="gctop"><b>'+esc(GC.title)+'</b><span id="gccnt"></span></div><div class="gcgrid" id="gcgrid"></div><div class="clbtns" id="gcbtns"><button type="button" class="clb" id="gcmute" aria-pressed="false">'+IC.mic+'<span>'+esc(t("ch_mute"))+'</span></button>'+(GC.kind==="v"?'<button type="button" class="clb" id="gccam" aria-pressed="false">'+IC.video+'<span>'+esc(t("ch_vid"))+'</span></button>':'')+'<button type="button" class="clb dec" id="gcend">'+IC.phone+'<span>'+esc(t("ch_end"))+'</span></button></div>';
  document.body.appendChild(o);
  gcTile(UID,myName(),GC.st);gcCount();
}
function gcTile(u,name,stream){
  var g=$("gcgrid");if(!g)return null;
  var el=g.querySelector('[data-gu="'+u+'"]');
  if(!el){
    el=document.createElement("div");el.className="gct"+(u===UID?" me":"");el.setAttribute("data-gu",u);
    el.innerHTML='<video autoplay playsinline'+(u===UID?' muted':'')+'></video><span class="chava">'+esc((name||"?").charAt(0))+'</span><span class="gcn">'+esc(u===UID?t("g_you"):(name||"—"))+'</span>';
    g.appendChild(el);
  }
  if(stream){
    var v=el.querySelector("video");
    if(v.srcObject!==stream){v.srcObject=stream;try{var p=v.play();if(p&&p.catch)p.catch(function(){})}catch(e){}}
    el.classList.add("on");
  }
  return el;
}
function gcCount(){var e=$("gccnt");if(e&&GC)e.textContent=t("gc_n",{n:Object.keys(GC.peers).length+1})}
function gcPc(u){
  if(GC.pcs[u])return GC.pcs[u];
  var pc=new RTCPeerConnection({iceServers:ICE}),o={pc:pc,q:[],has:false},G=GC;
  G.pcs[u]=o;
  G.st.getTracks().forEach(function(tr){pc.addTrack(tr,G.st)});
  pc.onicecandidate=function(e){if(e.candidate)gcSend(u,"cand",e.candidate.toJSON())};
  pc.ontrack=function(e){if(e.streams&&e.streams[0])gcTile(u,(G.peers[u]&&G.peers[u].name)||"",e.streams[0])};
  return o;
}
function gcSend(to,type,data){if(GC)GC.ref.collection("sig").add({from:UID,to:to,type:type,data:data,ts:Date.now()}).catch(function(){})}
function gcPeerAdd(u,p){
  gcTile(u,p.name,null);
  var earlier=GC.me<p.joinedAt||(GC.me===p.joinedAt&&UID<u);
  if(earlier)return;                                              // the person who joined later calls the earlier ones
  var o=gcPc(u),pc=o.pc;
  pc.createOffer().then(function(of){return pc.setLocalDescription(of)}).then(function(){
    gcSend(u,"offer",{type:pc.localDescription.type,sdp:pc.localDescription.sdp});
  }).catch(function(e){try{console.log(e)}catch(x){}});
}
function gcPeerDrop(u){
  var o=GC&&GC.pcs[u];if(o){try{o.pc.close()}catch(e){}delete GC.pcs[u]}
  var g=$("gcgrid");if(g){var el=g.querySelector('[data-gu="'+u+'"]');if(el)el.remove()}
}
function gcFlush(o){o.has=true;o.q.splice(0).forEach(function(c){o.pc.addIceCandidate(new RTCIceCandidate(c)).catch(function(){})})}
function gcSig(x){
  if(!GC)return;
  var u=x.from;
  if(x.type==="offer"&&GC.pcs[u]&&GC.pcs[u].has){gcPeerDropPc(u)}  // the other phone restarted: begin again
  var o=gcPc(u),pc=o.pc;
  if(x.type==="offer"){
    pc.setRemoteDescription(new RTCSessionDescription(x.data)).then(function(){gcFlush(o);return pc.createAnswer()}).then(function(a){return pc.setLocalDescription(a)}).then(function(){
      gcSend(u,"answer",{type:pc.localDescription.type,sdp:pc.localDescription.sdp});
    }).catch(function(e){try{console.log(e)}catch(z){}});
  }else if(x.type==="answer"){
    pc.setRemoteDescription(new RTCSessionDescription(x.data)).then(function(){gcFlush(o)}).catch(function(e){try{console.log(e)}catch(z){}});
  }else if(x.type==="cand"){
    if(o.has)pc.addIceCandidate(new RTCIceCandidate(x.data)).catch(function(){});else o.q.push(x.data);
  }
}
function gcPeerDropPc(u){var o=GC.pcs[u];if(o){try{o.pc.close()}catch(e){}delete GC.pcs[u]}}
function gcLeave(remote){
  var G=GC;if(!G||G.done)return;
  G.done=true;clearInterval(G.hb);
  G.uns.forEach(function(u){try{u()}catch(e){}});
  Object.keys(G.pcs).forEach(function(u){try{G.pcs[u].pc.close()}catch(e){}});
  try{G.st.getTracks().forEach(function(tr){tr.stop()})}catch(e){}
  if(!remote){
    G.ref.collection("peers").doc(UID).delete().catch(function(){});
    if(!Object.keys(G.peers).length)G.ref.delete().catch(function(){});     // the last person out closes the call
  }
  GC=null;
  var o=$("gcbg");if(o)o.remove();
  gjoinPaint();
}

/* ================= settings ================= */
function viewSettings(){
  var rows=[["me",IC.user,t("tab_me")],["fb",IC.edit,t("tab_fb")],["about",IC.info,String(t("tab_about")).replace(/\s+/g," ")]];
  var h='<h2>⚙️ '+esc(t("tab_set"))+'</h2>'+thPanel()+'<div class="setlist">';
  rows.forEach(function(r){h+='<button type="button" class="setrow" data-setgo="'+r[0]+'"><span class="seti">'+r[1]+'</span><b>'+esc(r[2])+'</b><span class="chev">'+IC.chev+'</span></button>'});
  return h+'</div>';
}
function setWrap(h){return '<button type="button" class="setback" data-setback="1">'+IC.back+'<span>'+esc(t("tab_set"))+'</span></button>'+h}

/* ================= map picker: "my location" button ================= */
function mpLocate(){
  var b=$("msloc");
  if(!$("mpbg")||typeof mp==="undefined"||!mp)return;
  if(!navigator.geolocation){toast(t("loc_fail"),3500);return}
  var my=mp,lab=$("mslabel");
  if(b)b.classList.add("busy");
  if(lab)lab.textContent="⏳ "+t("ms_locating");
  navigator.geolocation.getCurrentPosition(function(p){
    if(b)b.classList.remove("busy");
    if(mp!==my)return;
    var ll=[p.coords.latitude,p.coords.longitude];
    try{my.map.setView(ll,Math.max(my.map.getZoom()||0,17))}catch(e){}
    mpSet(ll,null);
  },function(e){
    if(b)b.classList.remove("busy");
    if(lab&&mp===my&&!my.ll)lab.textContent=t("ms_tap");
    toast(t(e&&e.code===1?"loc_denied":"loc_fail"),4000);
  },{enableHighAccuracy:true,timeout:15000,maximumAge:0});
}
function addLocBtn(){
  var box=$("pkmap");if(!box||$("msloc"))return;
  var b=document.createElement("button");b.type="button";b.id="msloc";b.className="msloc";
  b.innerHTML=IC.locate+'<span>'+esc(t("ms_loc"))+'</span>';
  b.addEventListener("click",function(e){e.preventDefault();mpLocate()});
  try{L.DomEvent.disableClickPropagation(b)}catch(e){}
  box.appendChild(b);
}
var _omp=window.openMapPicker;
window.openMapPicker=function(){var r=_omp.apply(this,arguments);try{addLocBtn()}catch(e){}return r};

/* ================= wiring ================= */
function plusStop(){
  unsubs2.forEach(function(u){try{u()}catch(e){}});unsubs2=[];
  if(CH.unL){try{CH.unL()}catch(e){}CH.unL=null}
  stopCallWatch();endCallLocal();gcStopWatch();gcLeave(true);gcCloseIn();closeChat(true);
  ["gnbg","gmbg"].forEach(function(i){var b=$(i);if(b)b.remove()});
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
  watchChats();watchCalls();gcWatch();
  if(isAdmin())unsubs2.push(db.collection("feedback").orderBy("ts","desc").limit(100).onSnapshot(function(sn){
    FBL=sn.docs.map(function(d){var x=d.data();x.id=d.id;return x});
    var e=$("fbin");if(e&&state.tab==="fb")e.innerHTML=fbItems();
  },function(){}));
}
var _ss=window.startSync,_sp=window.stopSync;
window.startSync=function(){_ss.apply(this,arguments);try{plusStart()}catch(e){try{console.log(e)}catch(x){}}};
window.stopSync=function(){_sp.apply(this,arguments);try{plusStop()}catch(e){}};

/* the main script calls these by name */
window.chBtn=chBtn;window.viewChats=viewChats;window.viewFeedback=viewFeedback;window.endBtn=endBtn;window.hwEnd=hwEnd;window.viewSettings=viewSettings;window.setWrap=setWrap;

/* one click handler for everything new */
document.addEventListener("click",function(e){
  var tg=e.target,lb=tg.closest&&tg.closest("[data-lb]");
  if(lb){lightbox(lb.src);return}
  var b=tg.closest&&tg.closest("button");if(!b)return;
  var d=b.dataset,id=b.id;
  if(d.setgo){state.tab=d.setgo;render();window.scrollTo(0,0);return}
  if(d.setback){state.tab="settings";render();window.scrollTo(0,0);return}
  if(d.chat!==undefined){openChat(d.chat,d.chname);return}
  if(d.call){if(CH.cur&&CH.cur.g)gcStart(d.call);else startCall(d.call);return}
  if(d.gchat){openGroup(d.gchat);return}
  if(d.ginfo){gInfo();return}
  if(d.gjoin){var ga=GCA[CH.cur&&CH.cur.cid];if(ga)gcJoin(ga.id,ga);return}
  if(d.chdel){delChatAsk(d.chdel);return}
  if(d.mdel){delMsgAsk(d.mdel);return}
  if(d.gsel){b.setAttribute("aria-pressed",b.getAttribute("aria-pressed")!=="true");return}
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
  if(id==="gnew"){gnOpen();return}
  if(id==="gncreate"){gnCreate();return}
  if(id==="gncancel"){var gn=$("gnbg");if(gn)gn.remove();return}
  if(id==="gmx"){var gm=$("gmbg");if(gm)gm.remove();return}
  if(id==="gleave"){var gl=$("gmbg");if(gl)gl.remove();if(CH.cur)delChatAsk(CH.cur.cid);return}
  if(id==="gijoin"){var gi=GCI;gcCloseIn();if(gi)gcJoin(gi.id,gi.d);return}
  if(id==="gidec"){gcCloseIn();return}
  if(id==="gcend"){gcLeave();return}
  if(id==="gcmute"&&GC){var ga2=GC.st.getAudioTracks()[0];if(ga2){ga2.enabled=!ga2.enabled;b.setAttribute("aria-pressed",!ga2.enabled)}return}
  if(id==="gccam"&&GC){var gv=GC.st.getVideoTracks()[0];if(gv){gv.enabled=!gv.enabled;b.setAttribute("aria-pressed",!gv.enabled)}return}
  if(id==="hpok"){var hp=$("hpbg");if(hp)hp.remove();return}
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
