const menu=document.querySelector('.menu'),nav=document.querySelector('nav');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
const track=document.querySelector('.art-track');document.querySelectorAll('[data-scroll]').forEach(button=>button.addEventListener('click',()=>{const card=track.querySelector('article:not([hidden])');if(!card)return;const distance=card.getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap);track.scrollBy({left:Number(button.dataset.scroll)*distance,behavior:'smooth'})}));
const toggle=document.querySelector('#process-toggle'),steps=document.querySelector('#process-steps');toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));steps.hidden=!open;toggle.innerHTML=open?'A little less <span>−</span>':'See the process <span>↗</span>'});
const dialog=document.querySelector('#art-dialog');document.querySelectorAll('[data-art]').forEach(button=>button.addEventListener('click',()=>{const card=button.closest('article'),photo=button.querySelector('img');document.querySelector('#dialog-image').src=photo.src;document.querySelector('#dialog-image').alt=photo.alt;document.querySelector('#dialog-title').textContent=card.querySelector('h3').textContent;document.querySelector('#dialog-description').textContent=card.querySelector('p:last-child').textContent;dialog.showModal()}));document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});

// Donation QR gallery: buttons, native swipe, and keyboard navigation.
const donationGallery=document.querySelector('.donation-carousel');
if(donationGallery){
 const slides=[...donationGallery.querySelectorAll('.donation-slide')];
 let activeDonation=0;
 const updateDonation=()=>{let nearest=0,distance=Infinity;slides.forEach((slide,i)=>{const d=Math.abs(slide.getBoundingClientRect().left-donationGallery.getBoundingClientRect().left-parseFloat(getComputedStyle(donationGallery).paddingLeft));if(d<distance){distance=d;nearest=i}});activeDonation=nearest;document.querySelector('#donation-status').textContent=['Instagram','Zelle','Venmo'][nearest]+', '+(nearest+1)+' of 3'};
 const moveDonation=direction=>{activeDonation=(activeDonation+direction+slides.length)%slides.length;const left=slides[activeDonation].offsetLeft-slides[0].offsetLeft;donationGallery.scrollTo({left,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
 document.querySelectorAll('[data-donation-direction]').forEach(button=>button.addEventListener('click',()=>moveDonation(Number(button.dataset.donationDirection))));
 donationGallery.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();moveDonation(e.key==='ArrowLeft'?-1:1)}});
 let donationScrollTimer;donationGallery.addEventListener('scroll',()=>{clearTimeout(donationScrollTimer);donationScrollTimer=setTimeout(updateDonation,150)},{passive:true});
}

// Add new figures to .polaroids in index.html; loop copies are built automatically.
const memories=document.querySelector('.polaroids');
if(memories){
 const originals=[...memories.querySelectorAll('figure')];
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 originals.forEach((figure,i)=>figure.style.setProperty('--tilt',[-10,12,-13,8][i%4]+'deg'));
 const copy=figure=>{const clone=figure.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.querySelectorAll('img').forEach(img=>{img.alt='';img.loading='eager';img.draggable=false});return clone};
 originals.forEach(figure=>figure.querySelector('img').draggable=false);
 memories.prepend(...originals.map(copy));memories.append(...originals.map(copy));
 let loopWidth=0,paused=reduceMotion.matches,hovering=false,focused=false,dragging=false,visible=false,lastTime=0,startX=0,startScroll=0,manualUntil=0;
 const pauseButton=document.querySelector('[data-memories-pause]');
 function syncPause(){pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.textContent=paused?'Play carousel':'Pause carousel'}
 function measure(){const oldWidth=loopWidth;loopWidth=originals[0].offsetLeft-memories.children[0].offsetLeft;if(loopWidth){memories.scrollLeft=loopWidth+(oldWidth?(memories.scrollLeft%oldWidth):0)}}
 function wrap(){if(!loopWidth)return;if(memories.scrollLeft<loopWidth*.5)memories.scrollLeft+=loopWidth;else if(memories.scrollLeft>=loopWidth*1.5)memories.scrollLeft-=loopWidth}
 memories.addEventListener('scroll',wrap,{passive:true});
 pauseButton.addEventListener('click',()=>{paused=!paused;syncPause()});
 document.querySelectorAll('[data-memories-direction]').forEach(button=>button.addEventListener('click',()=>{manualUntil=performance.now()+2200;memories.scrollLeft+=Number(button.dataset.memoriesDirection)*(originals[0].offsetWidth+24);wrap()}));
 memories.addEventListener('mouseenter',()=>hovering=true);memories.addEventListener('mouseleave',()=>hovering=false);
 memories.addEventListener('focusin',()=>focused=true);memories.addEventListener('focusout',()=>focused=false);
 memories.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();manualUntil=performance.now()+2200;memories.scrollLeft+=(event.key==='ArrowLeft'?-1:1)*(originals[0].offsetWidth+24);wrap()}});
 memories.addEventListener('pointerdown',event=>{manualUntil=performance.now()+2200;if(event.pointerType!=='mouse')return;dragging=true;startX=event.clientX;startScroll=memories.scrollLeft;memories.setPointerCapture(event.pointerId);memories.classList.add('dragging')});
 memories.addEventListener('pointermove',event=>{if(dragging){memories.scrollLeft=startScroll+startX-event.clientX;if(loopWidth&&(memories.scrollLeft<loopWidth*.5||memories.scrollLeft>=loopWidth*1.5)){wrap();startScroll=memories.scrollLeft;startX=event.clientX}}});
 const endDrag=()=>{dragging=false;memories.classList.remove('dragging');manualUntil=performance.now()+2200};
 memories.addEventListener('pointerup',endDrag);memories.addEventListener('pointercancel',endDrag);
 memories.addEventListener('touchstart',()=>dragging=true,{passive:true});memories.addEventListener('touchend',endDrag,{passive:true});
 reduceMotion.addEventListener('change',()=>{paused=reduceMotion.matches;syncPause()});
 new ResizeObserver(measure).observe(memories);
 new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(memories);
 function animate(time){const delta=lastTime?Math.min(time-lastTime,50):0;lastTime=time;if(visible&&!document.hidden&&!paused&&!hovering&&!focused&&!dragging&&time>manualUntil){memories.scrollLeft+=delta*.026;wrap()}requestAnimationFrame(animate)}
 syncPause();measure();requestAnimationFrame(animate);
}

// Inline image windows crossfade together without shifting the headline.
const imageWindows=[...document.querySelectorAll('.manifesto-image')];
if(imageWindows.length){
 const images=['assets/studio.webp','assets/blue-mug.webp','assets/green-mug.webp','assets/stella.webp'];
 const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
 let changing=false,imageWindowsVisible=false;
 imageWindows.forEach((window,i)=>window.dataset.imageIndex=String(i%images.length));
 images.forEach(src=>{const image=new Image();image.src=src});
 new IntersectionObserver(entries=>imageWindowsVisible=entries[0].isIntersecting).observe(document.querySelector('.manifesto'));
 setInterval(async()=>{
  if(motionPreference.matches||document.hidden||!imageWindowsVisible||changing)return;
  changing=true;
  const updates=imageWindows.map(window=>{const index=(Number(window.dataset.imageIndex)+1)%images.length;const next=window.querySelector('.image-next');next.src=images[index];return {window,index,next}});
  try{
   await Promise.all(updates.map(({next})=>next.decode()));
   updates.forEach(({window})=>window.classList.add('is-changing'));
   setTimeout(()=>{updates.forEach(({window,index,next})=>{window.querySelector('.image-current').src=next.src;window.classList.remove('is-changing');window.dataset.imageIndex=String(index)});changing=false},750);
  }catch{changing=false}
 },2600);
}

// Tilt from -30 to +30 as the intro approaches the top, then hold the end angle.
const peaceSymbol=document.querySelector('.peace-symbol');
if(peaceSymbol){
 const peaceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let peaceFramePending=false;
 function updatePeaceSpin(){peaceFramePending=false;const top=peaceSymbol.closest('.intro').getBoundingClientRect().top;const height=window.innerHeight;const progress=Math.max(0,Math.min(1,(height*.65-top)/(height*.57)));peaceSymbol.style.setProperty('--peace-spin',peaceMotion.matches?'-30deg':(-30+60*progress)+'deg')}
 function schedulePeaceSpin(){if(!peaceFramePending){peaceFramePending=true;requestAnimationFrame(updatePeaceSpin)}}
 window.addEventListener('scroll',schedulePeaceSpin,{passive:true});
 window.addEventListener('resize',schedulePeaceSpin);
 peaceMotion.addEventListener('change',schedulePeaceSpin);
 updatePeaceSpin();
}

// Opposing hero transitions: vertical on desktop, horizontal on mobile.
const heroPanels=[...document.querySelectorAll('.hero-photo')];
if(heroPanels.length){
 const heroMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const pools=[[
  {src:'assets/studio.webp',alt:'A sunlit pottery studio filled with plants and handmade ceramics'},
  {src:'assets/blue-mug.webp',alt:'Blue glazed handmade peace mug'},
  {src:'assets/green-mug.webp',alt:'Green glazed handmade peace mug'}
 ],[
  {src:'assets/stella.webp',alt:'Stella throwing a pot in her garden'},
  {src:'assets/throwing-detail.webp',alt:'Hands shaping clay on the pottery wheel'},
  {src:'assets/stella.webp',alt:'Stella working at her pottery wheel'}
 ]];
 let heroIndex=0,heroBusy=false,heroVisible=true;
 pools.flat().forEach(item=>{const preload=new Image();preload.src=item.src});
 new IntersectionObserver(entries=>heroVisible=entries[0].isIntersecting).observe(document.querySelector('.hero'));
 setInterval(async()=>{
  if(heroBusy||!heroVisible||document.hidden||heroMotion.matches)return;
  heroBusy=true;const nextIndex=(heroIndex+1)%pools[0].length;
  const updates=heroPanels.map((panel,i)=>{const item=pools[i][nextIndex];const next=panel.querySelector('.hero-next');next.src=item.src;return {panel,item,next}});
  try{await Promise.all(updates.map(({next})=>next.decode()));
   updates.forEach(({panel})=>panel.classList.add('hero-moving'));
   setTimeout(()=>{updates.forEach(({panel,item})=>{const current=panel.querySelector('.hero-current');current.src=item.src;current.alt=item.alt;panel.classList.add('hero-reset');panel.classList.remove('hero-moving')});
    requestAnimationFrame(()=>requestAnimationFrame(()=>{updates.forEach(({panel})=>panel.classList.remove('hero-reset'));heroBusy=false}));heroIndex=nextIndex;
   },1100);
  }catch{heroBusy=false}
 },3500);
}

// Prepare a reviewable pottery inquiry for the supplied Instagram contact route.
const potteryForm=document.querySelector('#pottery-contact-form');
if(potteryForm){
 let preparedInquiry='';
 potteryForm.addEventListener('submit',event=>{
  event.preventDefault();if(!potteryForm.reportValidity())return;
  const fields=new FormData(potteryForm);
  preparedInquiry=['Hi Stella, I’d love to ask about a pottery piece.','',
   'Name: '+fields.get('firstName').trim()+' '+fields.get('lastName').trim(),
   'Email: '+fields.get('email').trim(),'Interested in: '+fields.get('piece'),
   ...(fields.get('referral').trim()?['Found you through: '+fields.get('referral').trim()]:[]),
   '',fields.get('message').trim(),
   ...(fields.get('solidarity')?['','I’d also like to know which pieces support Palestine relief and how the contribution works.']:[])
  ].join('\n');
  const review=document.querySelector('#inquiry-review');review.hidden=false;
  document.querySelector('#inquiry-preview').textContent=preparedInquiry;
  document.querySelector('#inquiry-status').textContent='Your request is ready to review. It has not been sent. Copy it below and send it to Pottery for Palestine on Instagram.';
  review.focus();
 });
 document.querySelector('#copy-inquiry').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(preparedInquiry);document.querySelector('#inquiry-status').textContent='Copied. Open Instagram and paste your request into a message.'}
  catch{document.querySelector('#inquiry-status').textContent='Select and copy the request below, then paste it into an Instagram message.';const range=document.createRange();range.selectNodeContents(document.querySelector('#inquiry-preview'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range)}
 });
}

// Category tabs: assign data-category on future artwork cards to populate each collection.
const artworkTabs=[...document.querySelectorAll('[data-artwork-tab]')];
if(artworkTabs.length){
 const categoryCopy={
  mugs:{image:'assets/studio.webp',alt:'Sunlit studio with plants, ceramics, and a pottery wheel',text:'A little company for your everyday rituals. Explore handmade mugs with earthy glazes, playful details, and a little reminder to choose peace. Each piece brings its own character to the table.'},
  bowls:{image:'assets/throwing-detail.webp',alt:'Clay being shaped on a pottery wheel',text:'For slow breakfasts, shared meals, and the small rituals that make a home. This is the space for handmade bowls — new pieces will appear here as they’re added to the collection.'},
  spoons:{image:'assets/studio.webp',alt:'Pottery tools and ceramics in the studio',text:'Small objects, thoughtfully made. A space for ceramic spoons and the little details that make everyday moments special. New pieces will appear here as they’re added.'},
  others:{image:'assets/stella.webp',alt:'Stella making a pottery piece in the garden',text:'A little room to experiment. Explore studio moments, work in progress, and pieces that take a different shape. This is where new ideas begin.'}
 };
 const panel=document.querySelector('#artwork-category-panel'),cards=[...panel.querySelectorAll('.art-card')];
 function activateArtworkTab(tab,focus=false){
  artworkTabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1});
  const key=tab.dataset.artworkTab,content=categoryCopy[key];
  panel.setAttribute('aria-labelledby',tab.id);
  const banner=panel.querySelector('.category-intro img');banner.src=content.image;banner.alt=content.alt;
  panel.querySelector('.category-intro p').textContent=content.text;
  cards.forEach(card=>card.hidden=card.dataset.category!==key);
  const count=cards.filter(card=>!card.hidden).length;
  panel.querySelector('.art-track').hidden=!count;panel.querySelector('.art-track').scrollLeft=0;
  const empty=panel.querySelector('.artwork-empty');empty.hidden=!!count;empty.textContent='No '+(key==='others'?'pieces':key)+' added yet. Come back soon to see what’s taking shape.';
  panel.querySelector('.gallery-hint').hidden=!count;
  panel.querySelectorAll('[data-scroll]').forEach(button=>button.disabled=count<2);
  document.querySelector('#artwork-tab-status').textContent=tab.textContent+': '+count+' '+(count===1?'artwork':'artworks');
  if(focus)tab.focus();
 }
 artworkTabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activateArtworkTab(tab));tab.addEventListener('keydown',event=>{
  let next=index;if(event.key==='ArrowRight')next=(index+1)%artworkTabs.length;else if(event.key==='ArrowLeft')next=(index+artworkTabs.length-1)%artworkTabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=artworkTabs.length-1;else return;
  event.preventDefault();activateArtworkTab(artworkTabs[next],true);
 })});
 activateArtworkTab(artworkTabs[0]);
}
