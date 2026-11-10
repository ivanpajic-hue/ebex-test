# eBex testni prototip

Verzija 1.1 · 09.11.2026. · srpski, latinica · RSD · Europe/Belgrade.

Samostalna HTML aplikacija za proveru korisničkih tokova pre razvoja produkcionog sistema. Osnova je dokument eBex_Konacni_Master_Prompt.md, uz korisnikovu izričitu odluku da se sada razvije prototip sa testnim podacima.

## Pokretanje

Otvori `index.html` ili `eBex_Prototip.html` u savremenom pregledaču. Nisu potrebni instalacija, internet, nalozi i pristupni podaci. Glavni isporučeni HTML sadrži sve stilove, logiku, ikone i ilustracije.

Podaci se čuvaju u localStorage-u konkretnog pregledača. Ako pregledač ne dozvoljava lokalno čuvanje, aplikacija prikazuje poruku i radi u memoriji. Pre zatvaranja izvezi JSON kroz Test centar. Za prenos na drugi uređaj koristi JSON izvoz i uvoz. Ovo nije zajednička baza.

## Predloženo testiranje

1. Otvori oglas Sony slušalica i potvrdi testnu kupovinu pouzećem. Unesi izmišljene podatke.
2. Na detalju porudžbine promeni testnu ulogu u prodavca. Dodaj fotografiju ili demo dokaz pakovanja.
3. Pokreni BEX preuzimanje, uručenje i naplatu u testnom panelu.
4. Pomeri sat za +1 dan i potvrdi BEX isplatu. Ponovi događaj i proveri da nema duplog finansijskog zapisa.
5. U Test centru pokreni reklamaciju pre isplate i proveri da je isplata blokirana. Zatim probaj scenario reklamacije nakon isplate.
6. U administraciji promeni ulogu u moderatora i probaj da odobriš finansijsku akciju. Radnja mora biti odbijena.
7. Kao super administrator odobri BEX povrat, simuliraj preuzimanje i uručenje povrata, pa potvrdi testni COD povraćaj.
8. Otvori oglas u režimu Kontaktiraj me, pošalji ponudu i promeni stranu razgovora da je druga strana prihvati. Nastavi na kupovinu pouzećem.
9. Postavi besplatan oglas u tri koraka. Dodaj kontakt podatke u opis da proveriš slanje na moderaciju.
10. Proveri premium pakete, poslovna pravila, revizijski trag, CSV i JSON izvoz, uvoz i čuvanje posle ponovnog otvaranja.

Demo SMS kod je **123456**. Testni profil dolazi sa potvrđenim statusima; potvrdu telefona možeš ukloniti kroz Profil i ponoviti simulaciju. Nema stvarnog slanja SMS-a.

## Funkcionalni obim

- Katalog, kategorije, pretraga i osnovni sinonimi, filteri, sortiranje, favoriti i sačuvane pretrage.
- Detalj oglasa, tri koraka objave, stvarno učitavanje fotografija, nacrt, izmena i pauza oglasa.
- Razgovori, blokada kontakta i dogovora van platforme, formalne ponude sa rokom i kupovina prihvaćene ponude.
- BEX checkout pouzećem, rezervacija jednog predmeta, dokumentovani statusi dostave, naplate i isplate.
- Fotografije i demo dokazi pakovanja, testne nalepnice jasno označene kao nevažeće za BEX.
- Reklamacije, prioritet zadržavanja pre isplate, pregled nakon isplate, odluke sa razlogom i BEX povrat.
- Premium simulacije, profil, odvojeni statusi verifikacija i osnovna ocena završene transakcije.
- Administracija, primeri uloga i ovlašćenja, poslovna konfiguracija, demo usaglašavanje, finansijska evidencija i audit.
- Test centar sa scenarijima, pomeranjem sata, automatskim proverama, izvozom, uvozom i vraćanjem početnih podataka.

## Otvorene pretpostavke

Sve cene i logistička ograničenja su sintetička konfiguracija, a ne potvrđene BEX tarife. Početne vrednosti: osnovna dostava 390 RSD, dodatni kg 60 RSD, demo Paket Shop umanjenje 50 RSD, prag dokaza 15.000 RSD, masa do 30 kg, stranica do 120 cm, predaja za 48 sati i testna isplata narednog dana. Elektronika zahteva dokaz i ispod praga. Premium testne cene su 99, 249 i 499 RSD. Administrator može da menja ove vrednosti.

Testni rokovi se računaju kao trajanja u satima/danima. Radni dani, praznici, bankarski cut-off i potvrđen BEX obračun nisu implementirani. Novi testni događaji i porudžbine uvažavaju pomeren sat.

Promena BEX cena ne preračunava stare porudžbine. Novac se čuva u celobrojnim parama. Događaji imaju reference i zaštitu od ponavljanja. Finansijska evidencija predstavlja simulirane BEX potvrde, bez stvarnog prenosa novca.

## Provere i ograničenja

Pokreni:

```sh
python3 build.py
python3 tests/check_syntax.py
python3 tests/run_checks.py
python3 tests/render_smoke.py
```

Poslovni testovi koriste Node ako postoji ili sistemski JavaScriptCore na macOS-u. Provera sintakse i izolovane UI provere koriste macOS JavaScriptCore. Rezultati su u `docs/`.

Izolovane UI provere pokreću stvarni aplikacioni kod nad minimalnim DOM stubom. One proveravaju generisanje ekrana i vezu akcija, ali ne predstavljaju browser E2E, proveru prikaza, pristupačnosti ili mobilnog rasporeda. Otvaranje lokalnog servera i lokalnog HTML-a kroz automatizovani pregledač blokirano je pravilima okruženja. Vizuelna provera u stvarnom pregledaču zato ostaje otvorena.

## Granica prema produkciji

Ovo je web prototip, uključujući mobilni raspored. Nisu napravljene zasebne iOS i Android aplikacije. Nema servera, stvarne baze, prave autentikacije i server autorizacije, MFA, real-time razmene između uređaja, pravog OTP/KYC-a, OCR-a, malware skeniranja, video dokaza, stvarnog AI servisa i slanja obaveštenja.

Uloge se slobodno menjaju radi testiranja. Lokalni podaci nisu šifrovani i mogu se izmeniti van aplikacije. Audit je nepromenljiv kroz UI, ali nije bezbednosno nepromenljivo skladište. Koristi isključivo sintetičke podatke.

Produkcija zahteva backend i bazu sa transakcijama i outbox-om, server autorizaciju, pravu verifikaciju, zvaničnu BEX dokumentaciju i sandbox, potvrđen C2C model isplate i pravovremene blokade, pravno odobrenje, bezbednosnu proveru i browser/mobile E2E testove. Stvarna integracija nije predstavljena kao završena.

## Izvorni kod

- `src/domain.js`: poslovna pravila i BEX simulator.
- `src/app.js`: ekrani i interakcije.
- `src/visuals.js`: autorske vektorske ilustracije i logo.
- `src/style.css`, `src/readability.css`: vizuelni sistem i prilagođavanje širini.
- `src/checks.js`: testovi dostupni i u Test centru.
- `build.py`: generisanje samostalnog HTML-a.

Nijedan deo aplikacije ne pristupa mreži. CSP isključuje mrežne pozive. Ilustracije i logo nisu finalni produkcioni brand paket.
