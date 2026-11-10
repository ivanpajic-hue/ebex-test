/* eBex prototype domain. All integrations and records are local simulations. */
(function (root) {
  'use strict';
  const VERSION = 1;
  let seq = 0;
  const uid = prefix => prefix + '-' + Date.now().toString(36) + '-' + (++seq).toString(36);
  const now = () => new Date().toISOString();
  const clone = x => JSON.parse(JSON.stringify(x));
  const defaults = {
    shippingBase: 39000, shippingPerKg: 6000, shopDiscount: 5000,
    proofThreshold: 1500000, maxKg: 30, maxCm: 120, dispatchHours: 48,
    payoutDays: 1, holdSupported: true,
    plans: [{id:'boost',name:'Podigni',price:9900,days:3,description:'Vrati oglas među najnovije.'},
      {id:'spotlight',name:'Istakni',price:24900,days:7,description:'Diskretno isticanje i bolja pozicija.'},
      {id:'premium',name:'Premium',price:49900,days:14,description:'Isticanje, vrh kategorije i preporuke.'}]
  };
  const categories = [
    {id:'all',name:'Sve kategorije',icon:'grid'},
    {id:'tech',name:'Elektronika',icon:'headphones'},
    {id:'fashion',name:'Moda i stil',icon:'shirt'},
    {id:'home',name:'Dom i enterijer',icon:'armchair'},
    {id:'sport',name:'Sport i hobi',icon:'bike'},
    {id:'kids',name:'Za najmlađe',icon:'bear'},
    {id:'books',name:'Knjige i kultura',icon:'book'},
    {id:'tools',name:'Alati i oprema',icon:'tool'}
  ];
  function seed() {
    const listings = [
      ['l1','Sony WH-1000XM5','tech',2350000,'Beograd','Kao novo','buy','headphones','s1',true,'Bežične slušalice sa odličnim poništavanjem buke. Veoma malo korišćene, originalna kutija i futrola. Sve radi besprekorno.',0.8],
      ['l2','Fotelja od buklea, boja peska','home',1850000,'Novi Sad','Odlično','contact','chair','s2',false,'Udobna mala fotelja za kutak za čitanje. Očuvana tkanina, bez oštećenja. Dimenzije 72 × 68 × 75 cm.',9],
      ['l3','Nike Air Max 90 · 42','fashion',790000,'Kragujevac','Kao novo','buy','sneaker','s3',true,'Broj 42, originalno pakovanje. Nošene nekoliko puta i detaljno očišćene. Unutrašnje gazište 26,5 cm.',1.2],
      ['l4','Fujifilm X-T30 II + 15–45 mm','tech',6900000,'Šabac','Odlično','contact','camera','s4',false,'Kompaktan fotoaparat, 26 MP senzor, kit objektiv i dve baterije. Bez tragova pada. Dostupan uz originalni kaiš i punjač.',1.5],
      ['l5','Fjällräven Kånken ranac','fashion',540000,'Beograd','Odlično','buy','backpack','s1',false,'Klasičan ranac u maslinastoj boji. Očuvan, svi rajsferšlusi rade. Zapremina 16 litara.',0.5],
      ['l6','Monstera u keramičkoj saksiji','home',280000,'Niš','Novo','buy','plant','s2',false,'Zdrava monstera visine oko 50 cm sa saksijom. Šalje se uz zaštitu biljke i saksije.',2],
      ['l7','Nintendo Switch OLED','tech',2790000,'Novi Sad','Kao novo','buy','console','s3',true,'OLED model sa belim kontrolerima, dock-om i kompletnom opremom. Bez ogrebotina, sve funkcionalno.',1.3],
      ['l8','Drvena balans bicikla','kids',630000,'Šabac','Odlično','buy','bike','s4',false,'Lagana balans bicikla za decu. Podesivo sedište, dobre gume i očuvano drvo.',3],
      ['l9','Atomske navike · Džejms Klir','books',120000,'Beograd','Kao novo','buy','books','s1',false,'Pročitana jednom, bez podvlačenja i savijanja stranica. Srpsko izdanje.',0.4],
      ['l10','Bosch aku bušilica 12 V','tools',980000,'Subotica','Odlično','buy','drill','s2',false,'Bušilica sa dve baterije, punjačem i koferom. Koristio sam je za sitne kućne radove.',2.2],
      ['l11','JBL Flip 6 zvučnik','tech',850000,'Valjevo','Kao novo','buy','speaker','me',false,'Prenosivi zvučnik u crnoj boji. Baterija odlična, dolazi sa USB-C kablom.',0.8],
      ['l12','Set tegova za kućni trening','sport',450000,'Novi Sad','Odlično','contact','weights','s3',false,'Dve bučice sa podesivim opterećenjem. Ukupna masa seta 12 kg. Uredno pakovanje u čvrstu kutiju.',12]
    ].map((a,i)=>({id:a[0],title:a[1],category:a[2],price:a[3],city:a[4],condition:a[5],mode:a[6],art:a[7],seller:a[8],premiumUntil:a[9]?new Date(Date.now()+7*864e5).toISOString():null,description:a[10],weight:a[11],dims:a[7]==='chair'?[72,68,75]:[35,25,20],status:'ACTIVE',createdAt:new Date(Date.now()-i*36e5).toISOString(),views:120-i*7,photos:[],fixed:a[6]==='buy',declaredValue:a[3]}));
    const users = {
      me:{id:'me',name:'Ana Petrović',city:'Beograd',initials:'AP',phone:true,email:true,identity:true,bank:true,bankOwner:'Ana Petrović',rating:4.9,trades:24,since:'2024',bio:'Volim da stvarima pronađem novi dom.'},
      s1:{id:'s1',name:'Marko J.',city:'Beograd',initials:'MJ',phone:true,email:true,identity:true,bank:true,rating:5,trades:47,since:'2023'},
      s2:{id:'s2',name:'Jelena M.',city:'Novi Sad',initials:'JM',phone:true,email:true,identity:true,bank:true,rating:4.9,trades:32,since:'2024'},
      s3:{id:'s3',name:'Nikola S.',city:'Kragujevac',initials:'NS',phone:true,email:true,identity:true,bank:true,rating:4.8,trades:19,since:'2024'},
      s4:{id:'s4',name:'Milica P.',city:'Šabac',initials:'MP',phone:true,email:true,identity:true,bank:true,rating:5,trades:63,since:'2022'}
    };
    const s={version:VERSION,createdAt:now(),config:clone(defaults),users,listings,favorites:['l2','l4'],savedSearches:[],orders:[],conversations:[],audit:[],ledger:[],notifications:[],premiumPurchases:[],moderation:[],processed:[],ratings:[],consents:[],dataRequests:[],session:{role:'buyer',adminRole:'super',user:'me'},clock:0};
    s.conversations=[{id:'c1',listingId:'l4',buyer:'me',seller:'s4',messages:[{id:'m1',from:'s4',text:'Zdravo! Fotoaparat je i dalje dostupan. Slobodno pitaj sve što te zanima.',at:now()}],offers:[],unread:1}];
    const order={id:'EB-1042',listingId:'demo-earbuds',snapshot:{title:'Apple AirPods Pro · 2. generacija',art:'earbuds',category:'tech',price:1590000,condition:'Kao novo',description:'Demo porudžbina sa evidentiranim dokazom pakovanja.'},buyer:'me',seller:'s1',price:1590000,shipping:39000,total:1629000,delivery:'home',address:{name:'Ana Petrović',street:'Test adresa 1',city:'Beograd',postal:'11000'},createdAt:new Date(Date.now()-864e5).toISOString(),status:'IN_TRANSIT',shipmentStatus:'IN_TRANSIT',codStatus:'PENDING',payoutStatus:'NOT_DUE',shipment:'DEMO-BEX-001042',events:[{id:'demo-created',type:'CREATED',at:new Date(Date.now()-864e5).toISOString(),text:'Porudžbina potvrđena'},{id:'demo-packed',type:'PACKED',at:new Date(Date.now()-8e7).toISOString(),text:'Demo dokaz pakovanja evidentiran'},{id:'demo-transit',type:'IN_TRANSIT',at:new Date(Date.now()-36e5).toISOString(),text:'BEX je preuzeo pošiljku · simulacija'}],evidence:[{id:'demo-proof',name:'Primer dokaza pakovanja',demo:true,at:now()}],dispute:null,refundStatus:'NONE',returnStatus:'NONE',eventIds:[],proofRequired:true};
    order.seed=true;s.orders.push(order);
    const sale=clone(order); Object.assign(sale,{id:'EB-1041',listingId:'demo-lamp',snapshot:{title:'Stona lampa od metala',art:'lamp',category:'home',price:420000,condition:'Odlično'},buyer:'s2',seller:'me',price:420000,shipping:39000,total:459000,status:'DELIVERED_COD_COLLECTED',shipmentStatus:'DELIVERED',codStatus:'COLLECTED',payoutStatus:'PENDING',shipment:'DEMO-BEX-001041',deliveredAt:now(),payoutDueAt:new Date(Date.now()+864e5).toISOString(),proofRequired:false});
    sale.seed=true;sale.events.push({id:'demo-delivered',type:'DELIVERED',at:now(),text:'Uručeno i naplaćeno 4.590 RSD · simulacija'}); s.orders.push(sale);
    journal(s,sale,'COD',sale.total,'demo-cod-1041','BEX naplatio pouzeće', 'COD receivable','BEX collected');
    notify(s,'Pošiljka je na putu','BEX je preuzeo tvoju porudžbinu EB-1042.','order','EB-1042');
    audit(s,'SYSTEM','DEMO_INITIALIZED','Pokrenuti sintetički podaci za testiranje.');
    return s;
  }
  function audit(s,actor,action,detail,ref='') {s.audit.unshift({id:uid('audit'),at:now(),actor,action,detail,ref});}
  function notify(s,title,text,kind,ref) {s.notifications.unshift({id:uid('n'),at:now(),title,text,kind,ref,read:false});}
  function journal(s,o,type,amount,ref,reason,debit,credit) {
    if(s.ledger.some(e=>e.ref===ref)) return false;
    if(!Number.isSafeInteger(amount)||amount<=0) throw Error('Neispravan iznos evidencije.');
    s.ledger.unshift({id:uid('led'),orderId:o.id,type,amount,currency:'RSD',ref,reason,at:now(),debit,credit}); return true;
  }
  function money(x) {return new Intl.NumberFormat('sr-Latn-RS',{maximumFractionDigits:2}).format(x/100)+' RSD';}
  function normalized(x) {return String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'dj');}
  function contactViolation(text) {
    const t=normalized(text);
    if(/(?:https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b[a-z0-9-]+\.(?:com|rs|net|org|me|io|si)\b)/i.test(t)) return 'Kontakt podaci i spoljni linkovi nisu dozvoljeni.';
    if(/(?:\+?\d[\s()./-]*){7,}/.test(t)) return 'Brojevi telefona nisu dozvoljeni u oglasima i porukama.';
    if(/licn\w*\s+preuz|uzivo|viber|whats\s*app|telegram|van\s+(?:platforme|ebex)|drugi\s+kurir|post\s*express|postexpress|aks\s+kurir|uplati\w*\s+(?:mi\s+)?(?:direktno|na\s+racun)|poslacu\s+ti\s+broj/.test(t)) return 'Dogovor i plaćanje obavljaju se kroz eBex, uz BEX dostavu.';
    return '';
  }
  function quote(s,weight,delivery) {return Math.max(0,s.config.shippingBase+Math.max(0,Math.ceil(weight)-1)*s.config.shippingPerKg-(delivery==='shop'?s.config.shopDiscount:0));}
  function needsProof(s,l) {return l.price>=s.config.proofThreshold || l.category==='tech';}
  function effectivePremium(l,s) {return l.premiumUntil&&new Date(l.premiumUntil)>new Date(Date.now()+(s.clock||0));}
  function can(s,action) {
    if(s.session.role!=='admin') return false;
    const r=s.session.adminRole;
    return r==='super'||({finance:['payout','refund','reconcile','release'],moderator:['moderate'],support:['review'],auditor:[]}[r]||[]).includes(action);
  }
  function requirePermission(s,action) {if(!can(s,action)) throw Error('Ova administratorska uloga nema potrebno ovlašćenje.');}
  function createOrder(s,{listingId,offerId,address,delivery='home',requestId}) {
    const requestSignature=JSON.stringify({listingId,offerId:offerId||null,address,delivery});
    if(requestId&&s.orders.some(o=>o.requestId===requestId)) {const existing=s.orders.find(o=>o.requestId===requestId);if(existing.requestSignature&&existing.requestSignature!==requestSignature)throw Error('Isti ključ kupovine ne može imati drugačije podatke.');return existing;}
    const l=s.listings.find(x=>x.id===listingId); if(!l||l.status!=='ACTIVE') throw Error('Oglas više nije dostupan.');
    if(l.seller===s.session.user) throw Error('Ne možeš kupiti sopstveni oglas.');
    if(!s.users[s.session.user].phone) throw Error('Pre kupovine potvrdi telefon u svom profilu.');
    if(!['home','shop'].includes(delivery)) throw Error('Dozvoljena je isključivo BEX dostava.');
    if(l.weight>s.config.maxKg||l.dims.some(d=>d>s.config.maxCm)) throw Error('Predmet premašuje testna BEX ograničenja.');
    if(!address||!address.name||!address.street||!address.city||!/^\d{5}$/.test(address.postal)) throw Error('Unesi sve podatke i poštanski broj od 5 cifara.');
    let price=l.price;
    if(l.mode==='contact') {
      const conv=s.conversations.find(c=>c.listingId===l.id&&c.buyer===s.session.user);
      const offer=conv?.offers.find(o=>o.id===offerId&&o.status==='ACCEPTED');
      if(!offer||new Date(offer.expiresAt)<new Date(Date.now()+s.clock)) throw Error('Potrebna je važeća prihvaćena ponuda iz razgovora.');
      price=offer.price;
    }
    const shipping=quote(s,l.weight,delivery); const id='EB-'+(1043+s.orders.filter(o=>!o.seed).length);
    const o={id,listingId:l.id,snapshot:clone(l),buyer:s.session.user,seller:l.seller,price,shipping,total:price+shipping,address:clone(address),delivery,createdAt:now(),status:'AWAITING_SHIPMENT',shipmentStatus:'CREATED',codStatus:'PENDING',payoutStatus:'NOT_DUE',shipment:'DEMO-BEX-'+uid('S').toUpperCase(),events:[{id:uid('evt'),type:'CREATED',at:now(),text:'Kupovina potvrđena · plaćanje BEX kuriru pri uručenju'}],evidence:[],dispute:null,refundStatus:'NONE',returnStatus:'NONE',eventIds:[],proofRequired:needsProof(s,l),requestId,seed:false,deadlineAt:new Date(Date.now()+s.config.dispatchHours*36e5).toISOString()};
    o.requestSignature=requestSignature;o.createdAt=new Date(Date.now()+s.clock).toISOString();o.deadlineAt=new Date(Date.now()+s.clock+s.config.dispatchHours*36e5).toISOString();o.proofRequired=needsProof(s,{...l,price});
    s.orders.push(o); l.status='RESERVED';
    if(offerId) for(const c of s.conversations) for(const f of c.offers) if(f.id===offerId) f.status='CONVERTED';
    audit(s,s.session.user,'ORDER_CREATED',money(o.total)+' pouzećem, BEX simulacija',o.id);
    notify(s,'Kupovina je potvrđena',l.title+' · '+money(o.total)+' pri uručenju.','order',o.id); return o;
  }
  function addEvidence(s,orderId,files) {
    const o=order(s,orderId); if(s.session.role!=='seller'&&s.session.role!=='admin') throw Error('Dokaze pakovanja dodaje prodavac u testnom režimu.');
    if(!['AWAITING_SHIPMENT','IN_TRANSIT'].includes(o.status)) throw Error('Pakovanje je moguće dodati pre uručenja.');
    o.evidence.push(...files.map(f=>({...f,id:uid('proof'),at:now()})));
    audit(s,s.session.user,'PACKING_EVIDENCE',files.length+' fotografija pakovanja',o.id);
  }
  function order(s,id) {const o=s.orders.find(x=>x.id===id);if(!o) throw Error('Porudžbina nije pronađena.');return o;}
  function simulate(s,id,type,eventId) {
    const o=order(s,id); const ref=eventId||uid('bex');
    if(o.eventIds.includes(ref)) {if(o.events.find(e=>e.id===ref)?.type!==type)throw Error('Ista BEX referenca ne može označavati različite događaje.');audit(s,'BEX_MOCK','DUPLICATE_IGNORED',type+' · '+ref,id);return {duplicate:true,order:o};}
    const terminal=['CANCELLED','COD_REFUNDED','SHIPMENT_EXPIRED'].includes(o.status);
    if(terminal) throw Error('Završena ili otkazana porudžbina ne prima ovaj događaj.');
    const eventAt=new Date(Date.now()+s.clock).toISOString();
    if(type==='TRANSIT') {
      if(o.shipmentStatus==='DELIVERED') {audit(s,'BEX_MOCK','LATE_EVENT_IGNORED','Zakasneli status transporta',id);return {duplicate:true,order:o};}
      if(o.shipmentStatus!=='CREATED') throw Error('Pošiljka je već predata ili završena.');
      if(o.proofRequired&&!o.evidence.length) throw Error('Pre BEX preuzimanja obavezan je dokaz pakovanja.');
      o.shipmentStatus='IN_TRANSIT'; if(!o.dispute)o.status='IN_TRANSIT';
    } else if(type==='DELIVERED') {
      if(o.shipmentStatus==='DELIVERED') {audit(s,'BEX_MOCK','LATE_EVENT_IGNORED','Ponovljen događaj uručenja',id);return {duplicate:true,order:o};}
      if(o.proofRequired&&!o.evidence.length) throw Error('Nedostaje obavezan dokaz pakovanja.');
      if(!['CREATED','IN_TRANSIT'].includes(o.shipmentStatus)) throw Error('Uručenje nije dostupno iz trenutnog stanja.');
      o.shipmentStatus='DELIVERED';o.codStatus='COLLECTED';o.deliveredAt=eventAt;
      o.payoutDueAt=new Date(Date.now()+s.clock+s.config.payoutDays*864e5).toISOString();
      journal(s,o,'COD',o.total,'cod-'+o.shipment,'Simulirana BEX naplata pouzeća','BEX potraživanje','BEX naplaćeno');
      if(o.dispute||o.payoutStatus==='HOLD_REQUESTED') {o.status='PAYOUT_HOLD';o.payoutStatus='HOLD_CONFIRMED';}else{o.status='DELIVERED_COD_COLLECTED';o.payoutStatus='PENDING';}
    } else if(type==='PAYOUT') {
      if(o.payoutStatus==='PAID') return {duplicate:true,order:o};
      if(o.codStatus!=='COLLECTED') throw Error('BEX još nije naplatio pouzeće.');
      if(o.dispute||['HOLD_CONFIRMED','HOLD_REQUESTED'].includes(o.payoutStatus)) throw Error('Isplata je zaustavljena zbog reklamacije ili rizika.');
      if(o.refundStatus!=='NONE'||o.returnStatus!=='NONE') throw Error('Povrat i isplata ne mogu biti istovremeno izvršeni.');
      if(new Date(Date.now()+s.clock)<new Date(o.payoutDueAt)) throw Error('Još nije dospeo testni rok isplate. Pomeri sat za +1 dan.');
      const seller=s.users[o.seller]; if(!seller.identity||!seller.bank) throw Error('Identitet i račun istog lica moraju biti verifikovani.');
      if(seller.id==='me'&&normalized(seller.bankOwner)!==normalized(seller.name)) throw Error('Račun mora pripadati istom licu.');
      o.payoutStatus='PAID';o.status='COMPLETED';o.paidAt=eventAt;
      journal(s,o,'PAYOUT',o.price,'payout-'+o.shipment,'BEX potvrdio testnu isplatu prodavcu','Isplata prodavcu','BEX potraživanje');
      const l=s.listings.find(l=>l.id===o.listingId);if(l)l.status='SOLD';
    } else if(type==='CANCEL') {
      if(o.shipmentStatus!=='CREATED'||o.codStatus!=='PENDING') throw Error('Otkazivanje je dozvoljeno pre BEX preuzimanja.');
      o.status='CANCELLED';o.shipmentStatus='CANCELLED';o.payoutStatus='CANCELLED';
      const l=s.listings.find(l=>l.id===o.listingId);if(l)l.status='ACTIVE';
    } else if(type==='EXPIRE') {
      if(o.shipmentStatus!=='CREATED'||!o.deadlineAt||new Date(Date.now()+s.clock)<new Date(o.deadlineAt)) throw Error('Rok predaje nije istekao ili je BEX već preuzeo pošiljku.');
      o.status='SHIPMENT_EXPIRED';o.shipmentStatus='CANCELLED';o.payoutStatus='CANCELLED';
      const l=s.listings.find(l=>l.id===o.listingId);if(l)l.status='ACTIVE';
    } else if(type==='RETURN_TRANSIT') {
      if(o.returnStatus!=='REQUIRED') throw Error('Najpre odobri povrat u administraciji.');o.returnStatus='IN_TRANSIT';o.status='RETURN_IN_TRANSIT';
    } else if(type==='RETURN_DELIVERED') {
      if(o.returnStatus!=='IN_TRANSIT') throw Error('Povratna pošiljka nije predata.');o.returnStatus='DELIVERED';o.status='RETURNED';o.refundStatus='PENDING';
    } else if(type==='REFUND') {
      requirePermission(s,'refund');
      if(o.payoutStatus==='PAID') throw Error('Isplata je već izvršena. Potreban je zaseban pregled.');
      if(o.refundStatus!=='PENDING'||o.returnStatus!=='DELIVERED') throw Error('Sačekaj BEX povrat i dokumentovanu odluku.');
      o.refundStatus='REFUNDED';o.status='COD_REFUNDED';o.payoutStatus='CANCELLED';o.dispute.status='RESOLVED';
      journal(s,o,'REFUND',o.total,'refund-'+o.shipment,'Potvrđen simulirani BEX povraćaj pouzeća','Povraćaj kupcu','BEX potraživanje');
    } else throw Error('Nepoznat testni događaj.');
    o.eventIds.push(ref);o.events.push({id:ref,type,at:eventAt,text:({TRANSIT:'BEX je preuzeo pošiljku',DELIVERED:'Uručeno i naplaćeno pouzeće',PAYOUT:'BEX je potvrdio isplatu prodavcu',CANCEL:'Porudžbina otkazana pre slanja',EXPIRE:'Istekao rok predaje · bez naplate',RETURN_TRANSIT:'BEX je preuzeo povratnu pošiljku',RETURN_DELIVERED:'Povrat uručen prodavcu',REFUND:'BEX je potvrdio povraćaj pouzeća'})[type]+' · simulacija'});
    audit(s,'BEX_MOCK',type,ref,id);notify(s,o.events[o.events.length-1].text,o.snapshot.title,'order',o.id);return {order:o};
  }
  function complain(s,id,reason,description,evidence=[]) {
    const o=order(s,id);if(o.dispute&&o.dispute.status!=='RESOLVED') throw Error('Reklamacija je već otvorena.');
    if(['CANCELLED','SHIPMENT_EXPIRED','COD_REFUNDED'].includes(o.status)) throw Error('Za ovu porudžbinu nije moguće otvoriti reklamaciju.');
    if(!reason||String(description).trim().length<10) throw Error('Izaberi razlog i opiši problem u najmanje 10 znakova.');
    o.dispute={id:uid('case'),reason,description,evidence,status:'OPEN',openedAt:now(),afterPayout:o.payoutStatus==='PAID',history:[]};
    if(o.payoutStatus==='PAID') {o.status='MANUAL_REVIEW';}
    else {o.payoutStatus=s.config.holdSupported?'HOLD_CONFIRMED':'HOLD_REQUESTED';o.status='PAYOUT_HOLD';}
    o.events.push({id:uid('evt'),type:'COMPLAINT',at:now(),text:o.dispute.afterPayout?'Prijava posle isplate · ručni pregled':'Reklamacija evidentirana · '+(s.config.holdSupported?'testno BEX zadržavanje potvrđeno':'čeka se potvrda zadržavanja')});
    audit(s,s.session.user,'COMPLAINT_OPENED',reason+' · '+description,id);notify(s,'Reklamacija je otvorena',o.dispute.afterPayout?'Isplata je već izvršena. Slučaj je upućen na pregled.':'Pokrenuto je zadržavanje još neizvršene isplate.','order',id);
    return o;
  }
  function decide(s,id,decision,reason) {
    requirePermission(s,decision==='release'?'release':'review');
    if(String(reason||'').trim().length<10) throw Error('Obrazloženje odluke mora imati najmanje 10 znakova.');
    const o=order(s,id); if(!o.dispute) throw Error('Nema aktivne reklamacije.');
    if(o.dispute.afterPayout&&['release','return'].includes(decision)) throw Error('Isplata je već izvršena. Potreban je zaseban odobren postupak.');
    if(o.dispute.status==='RESOLVED') throw Error('Slučaj je već završen.');
    if(decision==='release') {
      if(!s.config.holdSupported) throw Error('BEX potvrda ukidanja zadržavanja nije dostupna u ovoj konfiguraciji.');
      if(o.returnStatus!=='NONE') throw Error('Povrat je već pokrenut. Isplata ostaje blokirana do završetka odobrenog postupka.');
      o.disputeArchive=o.disputeArchive||[];o.disputeArchive.push({...clone(o.dispute),status:'RESOLVED',resolution:reason,resolvedAt:now()});
      o.dispute.status='RESOLVED';o.payoutStatus=o.codStatus==='COLLECTED'?'PENDING':'NOT_DUE';o.status=o.codStatus==='COLLECTED'?'REMITTANCE_PENDING':o.shipmentStatus==='IN_TRANSIT'?'IN_TRANSIT':'AWAITING_SHIPMENT';o.dispute=null;
    } else if(decision==='return') {
      if(o.shipmentStatus!=='DELIVERED') throw Error('Povrat se odobrava nakon uručenja.');
      if(o.returnStatus!=='NONE') throw Error('BEX povratna pošiljka je već kreirana.');
      o.returnStatus='REQUIRED';o.status='RETURN_REQUIRED';o.returnShipment='DEMO-RET-'+uid('BEX');o.dispute.status='RETURN_APPROVED';
    } else if(decision==='evidence') {o.dispute.status='EVIDENCE_REQUESTED';}
    else throw Error('Nepoznata odluka.');
    audit(s,'ADMIN:'+s.session.adminRole,'DISPUTE_'+decision.toUpperCase(),reason,id);
    o.events.push({id:uid('evt'),at:now(),type:'ADMIN_DECISION',text:'Administrator: '+({release:'zadržavanje ukinuto uz testnu BEX potvrdu',return:'odobrena BEX povratna pošiljka',evidence:'zatražen dodatni dokaz'})[decision]+'. '+reason});
  }
  function publish(s,draft) {
    const me=s.users[s.session.user]; if(!me.phone) throw Error('Potvrdi telefon pre objave oglasa.');
    if(!categories.some(c=>c.id===draft.category&&c.id!=='all')) throw Error('Izaberi dozvoljenu kategoriju. Automobili i nekretnine nisu deo prve verzije.');
    if(!draft.title||draft.title.trim().length<5||!draft.description||draft.description.trim().length<20) throw Error('Naslov mora imati 5, a opis najmanje 20 znakova.');
    if(!Number.isSafeInteger(draft.price)||draft.price<=0) throw Error('Cena mora biti pozitivan iznos u RSD.');
    if(!['buy','contact'].includes(draft.mode)) throw Error('Izaberi režim prodaje.');
    if(!draft.weight||draft.weight>s.config.maxKg||draft.dims.some(d=>!d||d>s.config.maxCm)) throw Error('Masa ili dimenzije nisu u testnim BEX granicama.');
    if(!draft.photos.length) throw Error('Dodaj najmanje jednu fotografiju predmeta.');
    if(!draft.ownership) throw Error('Potvrdi tačnost oglasa i pravo prodaje.');
    const violation=contactViolation(draft.title+' '+draft.description);
    const prohibited=/oruzje|municija|duvan|cigarete|lekovi|narkoti|nekretnin|polovan auto|putnicki automobil/i.test(normalized(draft.title+' '+draft.description));
    const l={...clone(draft),id:uid('listing'),seller:s.session.user,createdAt:now(),status:violation||prohibited?'PENDING_REVIEW':'ACTIVE',views:0,premiumUntil:null,art:draft.art||'box',declaredValue:draft.price};
    s.listings.unshift(l);
    if(violation||prohibited)s.moderation.unshift({id:uid('mod'),listingId:l.id,reason:violation||'Potencijalno zabranjen sadržaj',status:'OPEN',at:now()});
    audit(s,s.session.user,'LISTING_'+l.status,l.title,l.id);return l;
  }
  function sendMessage(s,conversationId,text) {
    const c=s.conversations.find(c=>c.id===conversationId);if(!c)throw Error('Razgovor nije pronađen.');
    if(c.blocked)throw Error('Razgovor je blokiran.');
    if(!text.trim())throw Error('Napiši poruku.');
    const violation=contactViolation(text);if(violation){audit(s,s.session.user,'CHAT_BLOCKED',violation,c.id);throw Error(violation);}
    c.messages.push({id:uid('msg'),from:s.session.role==='seller'?c.seller:c.buyer,text:text.trim(),at:now()}); c.unread=0;
  }
  function makeOffer(s,cid,price) {
    const c=s.conversations.find(c=>c.id===cid);const l=s.listings.find(l=>l.id===c?.listingId);
    if(!l||l.status!=='ACTIVE'||c.blocked)throw Error('Oglas ili razgovor nije dostupan.');
    if(!Number.isSafeInteger(price)||price<=0)throw Error('Unesi važeći iznos ponude.');
    c.offers.filter(o=>o.status==='PENDING').forEach(o=>o.status='SUPERSEDED');
    const f={id:uid('offer'),price,from:s.session.role==='seller'?'seller':'buyer',status:'PENDING',createdAt:now(),expiresAt:new Date(Date.now()+s.clock+864e5).toISOString()};c.offers.push(f);audit(s,s.session.user,'OFFER_CREATED',money(price),cid);return f;
  }
  function acceptOffer(s,cid,oid) {
    const c=s.conversations.find(c=>c.id===cid);const f=c?.offers.find(f=>f.id===oid);
    if(!f||f.status!=='PENDING'||new Date(f.expiresAt)<new Date(Date.now()+s.clock))throw Error('Ponuda nije važeća.');
    const role=s.session.role==='seller'?'seller':'buyer';if(f.from===role)throw Error('Ponudu prihvata druga strana. Promeni testnu ulogu.');
    f.status='ACCEPTED';audit(s,s.session.user,'OFFER_ACCEPTED',money(f.price),cid);return f;
  }
  function promote(s,id,planId) {
    const l=s.listings.find(l=>l.id===id); const p=s.config.plans.find(p=>p.id===planId);
    if(!l||l.seller!==s.session.user||l.status!=='ACTIVE'||!p)throw Error('Izaberi svoj aktivan oglas i paket.');
    l.premiumUntil=new Date(Date.now()+s.clock+p.days*864e5).toISOString();l.premiumPlan=p.id;
    s.premiumPurchases.push({id:uid('promo'),listingId:id,plan:clone(p),at:now(),demo:true});audit(s,s.session.user,'PREMIUM_SIMULATED',p.name+' · '+money(p.price),id);
  }
  function validateImport(s) {
    if(!s||s.version!==VERSION||!s.users?.me||!Array.isArray(s.listings)||!Array.isArray(s.orders)||!Array.isArray(s.audit)||!Array.isArray(s.ledger)||!Array.isArray(s.conversations)||!s.config?.plans)throw Error('Nevažeći eBex testni izvoz.');
    if(JSON.stringify(s).length>12e6)throw Error('Testni izvoz je prevelik.');return s;
  }
  const api={VERSION,defaults,categories,seed,clone,uid,now,audit,notify,money,normalized,contactViolation,quote,needsProof,effectivePremium,can,requirePermission,createOrder,addEvidence,order,simulate,complain,decide,publish,sendMessage,makeOffer,acceptOffer,promote,validateImport};
  root.EB=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
