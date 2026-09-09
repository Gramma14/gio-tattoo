# Come aggiungere le foto al sito

Il sito rileva automaticamente le immagini in questa cartella: basta salvarle **con questi nomi esatti** (minuscolo, estensione `.jpg`) e appaiono da sole al posto dei placeholder grafici — nessuna modifica al codice necessaria. Se un file non c'è, resta semplicemente il placeholder attuale, senza errori.

Formato consigliato: `.jpg`, orientamento verticale/ritratto dove indicato, lato lungo almeno 1600–2000px (poi compresso prima della pubblicazione).

## Home (index.html)

| File | Dove appare | Note |
|---|---|---|
| `hero.jpg` | Sfondo Home (hero) | Orizzontale, scena ampia — resterà scurita/vignettata dagli overlay del sito |
| `work-1.jpg` … `work-8.jpg` | Fila "Work" in home | Verticale 3:4, in ordine da sinistra a destra |
| `about-portrait.jpg` | Foto grande "About" con nome "Gio" in overlay | Verticale 4:5 |
| `about-studio.jpg` | Foto piccola sotto al titolo "About" | Orizzontale 16:9 |

## Galleria (galleria.html)

| File | Note |
|---|---|
| `gallery-1.jpg` … `gallery-18.jpg` | In ordine nella griglia; dimensioni miste già gestite dal layout, va bene qualunque proporzione verticale/quadrata |

## Note

- I nomi devono corrispondere esattamente (case-sensitive su alcuni hosting: meglio tutto minuscolo).
- Puoi aggiungerle una alla volta: quelle mancanti restano placeholder, non serve completarle tutte insieme.
- Una volta aggiunte foto reali, valuta di scrivere anche gli `alt` descrittivi nell'HTML (oggi generici) — utile per SEO/accessibilità, lo sistemiamo insieme quando le foto sono pronte.
