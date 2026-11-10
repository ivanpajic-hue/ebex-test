# Odluke pre produkcione faze

Zaključano: Srbija, C2C, RSD, besplatni standardni oglasi, samo BEX, samo pouzeće, bez ličnog preuzimanja i razmene kontakta, bez isplate trećem licu, bez isplate uz aktivan hold, bez automobila i nekretnina u prvom obimu.

| Oblast | Prototip | Potrebno pre produkcije |
| --- | --- | --- |
| BEX | Lokalni simulator bez HTTP poziva | Zvanični API ugovor, testni pristup i potvrđene mogućnosti |
| Isplata C2C | Simulirana narednodnevna potvrda | Ugovor, verifikacija vlasništva računa, radni dani i cut-off |
| Zadržavanje isplate | Podesiva testna potvrda | Pravovremen mehanizam i proverljiva BEX potvrda |
| Baza i integritet | localStorage i kontrolisane funkcije | PostgreSQL, transakcije, ograničenja, outbox i zaključavanje |
| Identitet i bezbednost | Otvorene demo uloge i verifikacije | OTP, KYC, MFA, autorizacija, sesije, tajne i revizija |
| Mobilni kanali | Responzivan HTML | iOS i Android aplikacije sa zajedničkim ugovorima |
| Dokazi | Fotografije i demo oznake | Video, hash, objekti, skeniranje, pristup i rok čuvanja |
| Moderacija | Osnovna tekstualna pravila | Odobren katalog robe, OCR, žalbe i operativni tim |
| Premium | Besplatna testna aktivacija | Katalog, porezi, period važenja i odobren način naplate usluge |
| Sporovi i refundacije | Simulirani BEX povrat celog COD iznosa | Potvrđen redosled, troškovi povrata, pravna pravila i proces BEX-a |
| Ocene | Jedna lokalna ocena završene kupovine | Više dimenzija, dvostrano objavljivanje, moderacija i žalbe |
| Provera prikaza | Izolovani testovi generisanja i radnji | Stvarni browser i mobile E2E, pristupačnost i vizuelni pregled |

Produkciona aplikacija se ne dobija prostim povezivanjem ovog HTML-a sa bazom. Prototip služi prihvatanju tokova i dizajna; finansijska i bezbednosna logika mora biti ponovo sprovedena i proverena na serveru.
