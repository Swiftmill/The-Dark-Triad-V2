# THE DARK TRIAD

Site statique inspiré du mood "THE DARK TRIAD". Double-cliquez simplement sur `index.html` pour lancer l'expérience.

## Arborescence
- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `assets/js/glyphs.js`
- `assets/data/glyphs.json`
- `assets/media/` *(déposez vos fichiers ici)*

## Médias à fournir
Placez vos fichiers dans `assets/media/` avec les noms suivants :
- `hero.mp4` : vidéo de fond principale.
- `hero-fallback.jpg` : image fallback utilisée lorsqu'une vidéo ne peut être lue ou quand `prefers-reduced-motion` est actif.
- `logo-triangle.png` : logo triangulaire affiché dans le hero.

Vous pouvez ajouter d'autres vidéos ou images (ex. `hero-alt.mp4`, `hero-alt.jpg`). Référez-vous à la section "Backgrounds" ci-dessous pour les intégrer.

## Paramétrages des glyphes
Les vitesses sont définies dans `assets/js/app.js` et `assets/js/glyphs.js` :
- `GLYPH_RATE_MS` (par défaut 80 ms) : fréquence de changement des symboles. Peut descendre jusqu'à `1` pour un clignotement quasi instantané.
- `GLYPH_REVEAL_STEP` (par défaut 16 ms) : délai entre chaque lettre lors de la révélation du texte réel. Ajustez cette valeur pour accélérer ou ralentir l'animation.
- Le délai de retour vers les glyphes après un hover/blur est fixé à 500 ms dans `assets/js/glyphs.js` (`REVERT_DELAY_MS`).

## Modifier les glyphes
Le fichier `assets/data/glyphs.json` contient les boutons du bas :
```json
[
  { "id": "library", "real": "ACCESS LIBRARY", "glyphs": ["⎔⟟⟊", "𐍉𐍊𐌼"] }
]
```
- `id` correspond à l'ancre de section (ex. `#library`).
- `real` est le libellé révélé.
- `glyphs` est un tableau de symboles affichés en rotation. Ajoutez ou supprimez des éléments librement.

Après modification, aucun build n'est nécessaire : rechargez simplement la page.

## Backgrounds
Dans `assets/js/app.js`, le tableau `BACKGROUNDS` définit la liste des médias utilisés lors du clic sur le titre :
```js
const BACKGROUNDS = [
  { type: "video", src: "assets/media/hero.mp4", poster: "assets/media/hero-fallback.jpg" },
  { type: "image", src: "assets/media/hero-fallback.jpg" }
];
```
- Ajoutez des objets supplémentaires pour créer un carrousel (par exemple un second couple vidéo/poster).
- Pour un simple fond statique, utilisez `type: "image"`.
- Le fondu enchaîné dure ~450 ms. Ajustez `BACKGROUND_FADE_MS` si besoin.

## Couleurs et style
Les variables principales se trouvent en tête de `assets/css/styles.css` (`:root`). Modifiez-les pour personnaliser la palette (par exemple `--accent` et `--accent-dark` pour le dégradé "TRIAD").

## Accessibilité & motion
- Le site respecte `prefers-reduced-motion` : les glyphes et le glitch sont neutralisés, et la vidéo est remplacée par l'image fallback.
- Les boutons sont accessibles au clavier (focus visible, navigation via `Tab`).
- Les glyphes utilisent `aria-label` pour conserver le texte réel aux technologies d'assistance.

## Tests
Aucun outil n'est requis : ouvrez `index.html` dans votre navigateur pour vérifier le rendu.
