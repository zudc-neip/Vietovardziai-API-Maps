# GV_DRLT paieškos servisas

Nacionalinės žemės tarnybos erdvinių duomenų rinkinio GV_DRLT paieškos servisas realizuotas naudojant Elasticsearch technologiją. Servisas suteikia galimybę vykdyti paiešką GV_DRLT duomenų rinkinyje panaudojant Elasticsearch paieškų žymenis ([daugiau informacijos](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html)). 

Šiame projekte rasite GV_DRLT paieškos serviso integracijos į tris populiariausias žemėlapių naršyklių API pavyzdžius. 

## GV_DRLT turinys

Su GV_DRLT duomenų rinkinio specifikacija galite susipažinti [čia](https://www.geoportal.lt/download/Specifikacijos/GV_DRLT-duomenu-specifikacija.pdf). Taip pat [vietovardžių el. paslaugos internetiniame puslapyje](https://www.geoportal.lt/vietovardziai/) susipažinti su GV_DRLT pagrindu veikiančiomis ir teikiamomis paslaugomis.

GV_DRLT duomenų rinkinio paieškos grąžinami rezultatai:
* sourceid
* namestatus
* sourcedata
* beginlifespanversion
* esri_json - json formatu pateikiama objekto geometrija
* municipality
* inspireid
* subtype
* name
* namegenitive
* sourceofname
* localtype
* objectid
* gyvsk
* maxx
* maxy
* minx
* miny
* locationx
* locationy
* geometryType - geometrijos tipas patogesniam objektų vaizdavimo apdorojimui

## Kaip pradėti

Klonuokite šį projektą į savo lokalią darbo vietą. Projekto failus galite patalpinti tiesiai į interneto serverį (pvz. Apache) ir peržiūrėti veikiančias 3 tipų žemėlapių naršykles su GV_DRLT duomenų rinkinio Elasticsearch paieškos serviso integracija.

### Žemėlapių naršyklių API

GV_DRLT paieškos serviso integracijos pavyzdžiai parengti šioms žemėlapių naršyklių API:
* [OpenLayers](https://openlayers.org/)
* [Leaflet](https://leafletjs.com/)
* [ESRI JS](https://developers.arcgis.com/javascript/)

Projekto api.js ir sidebar.js failai yra bendri visoms žemėlapių naršyklėms. Juose pateikiama bendra paieškos logika, rezultatų apdorojimas bei pateikimas sąrašu žemėlapių naršyklės grafinėje naudotojo sąsajoje. Šie failai nėra pritaikyti konkrečiam žemėlapių naršyklės API, todėl, juos naudojant, GV_DRLT paiešką galite integruoti į daugelį JS pagrindu veikiančių žemėlapių aplikacijų.
Paieška vykdoma kreipiantis į tarpinį servisą GET protokolu adresu https://www.geoportal.lt/mapproxy/elasticsearch_service. Paieškos žodis siunčiamas kaip parametras, pvz.: q=kaunas.
Užklausos į tarpinį servisą pavyzdys: https://www.geoportal.lt/mapproxy/elasticsearch_service?q=kaunas.
Tarpinis servisas, gavęs paieškos žodį, suformuoja užklausą (užklausa-1.txt, užklausa-3.txt), kreipiasi į Elasticsearch API _search metodą ir grąžina rezultatą.

### Elasticsearch API _search

GV_DRLT paieškos servisas pasiekiamas adresu https://www.geoportal.lt/mapproxy/elasticsearch_gvdr. Tai adresas į Elasticsearch API _search metodą. Naudodami šį metodą POST užklausomis galite vykdyti įvairaus sudėtingumo paiešką GV_DRLT rinkinyje. Daugiau informacijos apie Elasticsearch paieškos galimybes rasite [čia](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html).

Paieška GV_DRLT rinkinyje galima pagal šiuos atributus:
* Analizuojami (Tipas - text. Paieška vyks tiek su tikslia reikšme, tiek su apytiksle reikšme.):
  - municipality
  - name
  - namegenitive
* Neanalizuojami (Tipas - keyword. Paieška vyks tik su tikslia reikšme. Galima naudoti filtrams.):
  - geometryType
  - localtype
  - subtype
  - sourceofname
  - namestatus

Užklausų, kurios vykdytų paiešką GV_DRLT atributuose 'name', 'namegenitive' ir 'municipality' pagal paieškos frazę pavyzdžiai pateikiami failuose užklausa-1.txt, užklausa-2.txt ir užklausa-3.txt.

## Autoriai

* [VĮ „GIS-Centras“, nuo 2023-01-03 VĮ Žemės ūkio duomenų centras](https://www.gis-centras.lt) - projekto autorius
* [Nacionalinė žemės tarnyba prie aplinkos ministerijos](https://www.nzt.lt) - GV_DRLT duomenų rinkinio valdytojas
