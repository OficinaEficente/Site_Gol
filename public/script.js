const CONTENT_NAME='Curso Reparo Caixa Direcao Gol G5 G6 Fox Polo';
const VALUE=79;
const CURRENCY='BRL';

function eventId(){
  return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2,11)}`;
}

function trackMeta(name,custom={},userData={}){
  const id=eventId();
  if(typeof window.fbq==='function'){
    window.fbq('track',name,custom,{eventID:id});
  }
  fetch('/api/track',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
      event_name:name,
      event_id:id,
      event_source_url:location.href,
      custom_data:custom,
      user_data:userData
    }),
    keepalive:true
  }).catch(()=>{});
  return id;
}

async function initMeta(){
  try{
    const response=await fetch('/config.js',{cache:'no-store'});
    if(!response.ok)return;
    const js=await response.text();
    new Function(js)();
    const pixelId=window.OE_CONFIG?.metaPixelId;
    if(!pixelId)return;

    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
      t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init',pixelId);
    trackMeta('PageView');
    trackMeta('ViewContent',{content_name:CONTENT_NAME,value:VALUE,currency:CURRENCY});
  }catch(error){
    console.warn('Meta tracking init skipped',error);
  }
}

const checkoutButtons=document.querySelectorAll('[data-checkout]');
checkoutButtons.forEach(button=>{
  button.addEventListener('click',()=>{
    const label=button.dataset.label||'checkout';
    if(typeof gtag==='function'){
      gtag('event','click_checkout',{event_category:'cta',event_label:label});
    }
    trackMeta('InitiateCheckout',{content_name:CONTENT_NAME,value:VALUE,currency:CURRENCY,cta_label:label});
  });
});

const legacySource='https://raw.githubusercontent.com/OficinaEficente/Site_Gol/main/index.html';
const imageRanges={2:{start:5072857,end:13383332,mime:'image/png'}};
const imageCache=new Map();
async function loadLegacyImage(index){if(imageCache.has(index))return imageCache.get(index);const range=imageRanges[index];if(!range)return null;const promise=fetch(legacySource,{headers:{Range:`bytes=${range.start}-${range.end}`}}).then(async response=>{if(!response.ok||response.status!==206)return null;const base64=(await response.text()).trim();return `data:${range.mime};base64,${base64}`;}).catch(()=>null);imageCache.set(index,promise);return promise;}
const lazyPhotos=[...document.querySelectorAll('[data-legacy-img]')];
const loadPhoto=async img=>{if(img.dataset.loaded)return;img.dataset.loaded='1';const src=await loadLegacyImage(Number(img.dataset.legacyImg));if(src)img.src=src;};
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){loadPhoto(entry.target);observer.unobserve(entry.target);}});},{rootMargin:'350px'});lazyPhotos.forEach(img=>observer.observe(img));}else{lazyPhotos.forEach(loadPhoto);}

initMeta();
