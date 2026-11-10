(function(root){
function run(){
 const D=root.EB, results=[];
 function test(name,fn){try{fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:String(e.message||e)});}}
 function assert(x,msg='Uslov nije ispunjen'){if(!x)throw Error(msg);}
 function rejects(fn){let ok=false;try{fn();}catch(e){ok=true;}assert(ok,'Očekivana zabrana nije aktivirana.');}
 const address={name:'Test Kupac',street:'Test ulica 1',city:'Beograd',postal:'11000'};
 function buy(s,id='l1',extra={}){return D.createOrder(s,{listingId:id,address,requestId:D.uid('request'),...extra});}
 function delivered(s){D.simulate(s,'EB-1042','DELIVERED');return D.order(s,'EB-1042');}
 function due(s){s.clock+=2*864e5;}
 function admin(s,role='super'){s.session.role='admin';s.session.adminRole=role;}
 test('Besplatan C2C oglas sa verifikovanim telefonom',()=>{const s=D.seed();const l=D.publish(s,{title:'Test stona lampa',description:'Očuvana lampa sa svim delovima, funkcionalna i uredna.',category:'home',price:350000,mode:'buy',weight:1,dims:[20,20,30],photos:['demo'],ownership:true});assert(l.status==='ACTIVE');});
 test('Kontakt podaci u oglasu idu na moderaciju',()=>{const s=D.seed();const l=D.publish(s,{title:'Test lampa 0601234567',description:'Očuvana lampa sa svim delovima, funkcionalna i uredna.',category:'home',price:350000,mode:'buy',weight:1,dims:[20,20,30],photos:['demo'],ownership:true});assert(l.status==='PENDING_REVIEW'&&s.moderation.length===1);});
 test('Telefon, e-mail i spoljni link u chatu se blokiraju',()=>{const s=D.seed();for(const t of ['Pozovi 060 123 4567','Piši na ime@test.rs','www.test.rs','https://test.rs'])rejects(()=>D.sendMessage(s,'c1',t));assert(s.conversations[0].messages.length===1);});
 test('Lično preuzimanje i zaobilaženje platforme se blokiraju',()=>{const s=D.seed();rejects(()=>D.sendMessage(s,'c1','Može li lično preuzimanje?'));rejects(()=>D.sendMessage(s,'c1','Piši mi na Viber'));rejects(()=>buy(s,'l1',{delivery:'personal'}));});
 test('Kupovina rezerviše oglas i ima pouzeće',()=>{const s=D.seed(),o=buy(s);assert(o.codStatus==='PENDING'&&o.shipmentStatus==='CREATED'&&s.listings.find(l=>l.id==='l1').status==='RESERVED'&&o.total===o.price+o.shipping);});
 test('Ponovljen zahtev kupovine ne stvara duplu pošiljku',()=>{const s=D.seed(),a=buy(s,'l1',{requestId:'same'}),b=buy(s,'l1',{requestId:'same'});assert(a.id===b.id&&a.shipment===b.shipment&&s.orders.length===3);});
 test('Rezervisan predmet nije moguće ponovo kupiti',()=>{const s=D.seed();buy(s);rejects(()=>buy(s));});
 test('Kontakt režim zahteva prihvaćenu formalnu ponudu',()=>{const s=D.seed();rejects(()=>buy(s,'l4'));const c=s.conversations[0],f=D.makeOffer(s,c.id,6500000);s.session.role='seller';D.acceptOffer(s,c.id,f.id);s.session.role='buyer';const o=buy(s,'l4',{offerId:f.id});assert(o.price===6500000&&f.status==='CONVERTED');});
 test('Sopstvena ponuda ne može se prihvatiti',()=>{const s=D.seed(),f=D.makeOffer(s,'c1',5000000);rejects(()=>D.acceptOffer(s,'c1',f.id));});
 test('Istekla ponuda nije važeća',()=>{const s=D.seed(),f=D.makeOffer(s,'c1',5000000);s.clock+=2*864e5;s.session.role='seller';rejects(()=>D.acceptOffer(s,'c1',f.id));});
 test('Vredniji predmet bez dokaza ne ide u slanje',()=>{const s=D.seed(),o=buy(s);rejects(()=>D.simulate(s,o.id,'TRANSIT'));});
 test('Fotografija pakovanja otključava BEX preuzimanje',()=>{const s=D.seed(),o=buy(s);s.session.role='seller';D.addEvidence(s,o.id,[{name:'demo.jpg',demo:true}]);D.simulate(s,o.id,'TRANSIT');assert(o.shipmentStatus==='IN_TRANSIT');});
 test('Uručenje evidentira jedno COD knjiženje',()=>{const s=D.seed(),o=delivered(s);assert(o.codStatus==='COLLECTED'&&s.ledger.filter(l=>l.orderId===o.id&&l.type==='COD').length===1);});
 test('Dupli COD događaj ne duplira finansijsku evidenciju',()=>{const s=D.seed();D.simulate(s,'EB-1042','DELIVERED','same-event');const n=s.ledger.length;D.simulate(s,'EB-1042','DELIVERED','same-event');D.simulate(s,'EB-1042','DELIVERED','another-event');assert(s.ledger.length===n);});
 test('Zakasneli transport ne vraća status unazad',()=>{const s=D.seed(),o=delivered(s);D.simulate(s,o.id,'TRANSIT','late');assert(o.shipmentStatus==='DELIVERED'&&o.codStatus==='COLLECTED');});
 test('Isplata pre naplate odbija se i može kasnije da se ponovi',()=>{const s=D.seed();rejects(()=>D.simulate(s,'EB-1042','PAYOUT','early'));delivered(s);due(s);D.simulate(s,'EB-1042','PAYOUT','early');assert(D.order(s,'EB-1042').payoutStatus==='PAID');});
 test('Isplata čeka dospeće narednog dana',()=>{const s=D.seed(),o=delivered(s);rejects(()=>D.simulate(s,o.id,'PAYOUT'));due(s);D.simulate(s,o.id,'PAYOUT');assert(o.payoutStatus==='PAID');});
 test('Dupla potvrda isplate ne duplira knjiženje',()=>{const s=D.seed(),o=delivered(s);due(s);D.simulate(s,o.id,'PAYOUT','p1');D.simulate(s,o.id,'PAYOUT','p1');D.simulate(s,o.id,'PAYOUT','p2');assert(s.ledger.filter(l=>l.orderId===o.id&&l.type==='PAYOUT').length===1);});
 test('Reklamacija pre isplate aktivira PAYOUT_HOLD',()=>{const s=D.seed(),o=delivered(s);D.complain(s,o.id,'Oštećen predmet','Predmet ima oštećenje koje nije navedeno.');due(s);rejects(()=>D.simulate(s,o.id,'PAYOUT'));assert(o.payoutStatus==='HOLD_CONFIRMED');});
 test('Reklamacija pre zakasnelog uručenja zadržava isplatu',()=>{const s=D.seed();D.complain(s,'EB-1042','Sumnja na prevaru','Prijavljen sumnjiv predmet pre uručenja.');delivered(s);due(s);rejects(()=>D.simulate(s,'EB-1042','PAYOUT'));});
 test('Prijava nakon izvršene isplate ne prikazuje zamrznut novac',()=>{const s=D.seed(),o=delivered(s);due(s);D.simulate(s,o.id,'PAYOUT');D.complain(s,o.id,'Pogrešan predmet','U paketu je drugi predmet od naručenog.');assert(o.payoutStatus==='PAID'&&o.dispute.afterPayout&&o.status==='MANUAL_REVIEW');});
 test('Nedostupna BEX hold podrška ostavlja zahtev nepotvrđen',()=>{const s=D.seed();s.config.holdSupported=false;const o=delivered(s);D.complain(s,o.id,'Oštećen predmet','Paket je stigao sa vidljivim oštećenjem.');assert(o.payoutStatus==='HOLD_REQUESTED');admin(s);rejects(()=>D.decide(s,o.id,'release','Odluka o ukidanju zadržavanja.'));});
 test('Moderator ne može da oslobodi isplatu',()=>{const s=D.seed(),o=delivered(s);D.complain(s,o.id,'Oštećen predmet','Predmet ima vidljivo oštećenje.');admin(s,'moderator');rejects(()=>D.decide(s,o.id,'release','Dovoljno dugo obrazloženje odluke.'));});
 test('Finansijska odluka zahteva razlog i ostavlja audit trag',()=>{const s=D.seed(),o=delivered(s);D.complain(s,o.id,'Oštećen predmet','Predmet ima vidljivo oštećenje.');admin(s,'finance');rejects(()=>D.decide(s,o.id,'release',''));D.decide(s,o.id,'release','Pregled dokaza potvrdio je ispravnost predmeta.');assert(o.payoutStatus==='PENDING'&&s.audit.some(a=>a.action==='DISPUTE_RELEASE'));});
 test('Povrat ide preko BEX-a i zahteva uručenje pre refundacije',()=>{const s=D.seed(),o=delivered(s);D.complain(s,o.id,'Pogrešan predmet','U paketu se nalazi drugi predmet.');admin(s);D.decide(s,o.id,'return','Odobren povrat posle pregleda dostavljenih dokaza.');assert(o.returnShipment.startsWith('DEMO-RET-'));rejects(()=>D.simulate(s,o.id,'REFUND'));D.simulate(s,o.id,'RETURN_TRANSIT');D.simulate(s,o.id,'RETURN_DELIVERED');D.simulate(s,o.id,'REFUND');assert(o.refundStatus==='REFUNDED'&&o.payoutStatus==='CANCELLED');rejects(()=>D.simulate(s,o.id,'PAYOUT'));});
 test('Račun trećeg lica sprečava isplatu',()=>{const s=D.seed();due(s);s.users.me.bankOwner='Drugo lice';rejects(()=>D.simulate(s,'EB-1041','PAYOUT'));});
 test('Neproveren identitet sprečava isplatu',()=>{const s=D.seed();due(s);s.users.me.identity=false;rejects(()=>D.simulate(s,'EB-1041','PAYOUT'));});
 test('Otkazivanje pre slanja oslobađa rezervaciju bez refundacije',()=>{const s=D.seed(),o=buy(s);D.simulate(s,o.id,'CANCEL');assert(s.listings.find(l=>l.id==='l1').status==='ACTIVE'&&o.codStatus==='PENDING'&&s.ledger.every(l=>l.orderId!==o.id));});
 test('Istek predaje oslobađa rezervaciju',()=>{const s=D.seed(),o=buy(s);rejects(()=>D.simulate(s,o.id,'EXPIRE'));s.clock+=3*864e5;D.simulate(s,o.id,'EXPIRE');assert(o.status==='SHIPMENT_EXPIRED');});
 test('Automobili i nekretnine nisu dozvoljene kategorije',()=>{const s=D.seed();for(const cat of ['cars','realestate'])rejects(()=>D.publish(s,{title:'Primer oglasa',description:'Opis oglasa koji ima dovoljno znakova.',category:cat,price:100000,mode:'buy',weight:1,dims:[1,1,1],photos:['demo'],ownership:true}));});
 test('Premium oznaka traje samo do isteka testnog perioda',()=>{const s=D.seed();D.promote(s,'l11','boost');const l=s.listings.find(l=>l.id==='l11');assert(D.effectivePremium(l,s));s.clock+=4*864e5;assert(!D.effectivePremium(l,s));});
 test('Cene se obračunavaju celobrojno iz konfiguracije',()=>{const s=D.seed();s.config.shippingBase=50000;assert(D.quote(s,2,'home')===56000&&D.quote(s,2,'shop')===51000);assert(s.ledger.every(l=>Number.isSafeInteger(l.amount)));});
 test('Testni izvoz može da se učita uz proveru formata',()=>{const s=D.seed();assert(D.validateImport(JSON.parse(JSON.stringify(s))).version===1);rejects(()=>D.validateImport({version:1}));});
 test('Idempotency ključ ne prihvata izmenjene podatke kupovine',()=>{const s=D.seed();buy(s,'l1',{requestId:'fixed'});rejects(()=>buy(s,'l3',{requestId:'fixed'}));});
 test('Nove porudžbine koriste pomeren testni sat',()=>{const s=D.seed();s.clock+=4*864e5;const o=buy(s);assert(new Date(o.deadlineAt).getTime()>Date.now()+s.clock);});
 test('Dokaz pakovanja se određuje prema prihvaćenoj ceni',()=>{const s=D.seed();const l=s.listings.find(l=>l.id==='l2');l.price=100000;s.conversations.push({id:'price-test',listingId:l.id,buyer:'me',seller:l.seller,messages:[],offers:[]});const f=D.makeOffer(s,'price-test',2000000);s.session.role='seller';D.acceptOffer(s,'price-test',f.id);s.session.role='buyer';assert(buy(s,l.id,{offerId:f.id}).proofRequired);});
 test('Ista BEX referenca ne može imati drugačiji tip događaja',()=>{const s=D.seed();D.simulate(s,'EB-1042','DELIVERED','fixed-event');rejects(()=>D.simulate(s,'EB-1042','PAYOUT','fixed-event'));});
 test('Rešena reklamacija čuva podatke i dokaze u arhivi',()=>{const s=D.seed(),o=delivered(s);D.complain(s,o.id,'Oštećen predmet','Testni opis reklamacije sa dokazima.',[{name:'dokaz.jpg'}]);admin(s);D.decide(s,o.id,'release','Pregled i testna BEX potvrda ukidanja.');assert(o.disputeArchive.length===1&&o.disputeArchive[0].evidence.length===1);});
 return results;
}
root.runEBTests=run;
})(typeof globalThis!=='undefined'?globalThis:this);
