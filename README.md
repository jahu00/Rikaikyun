# Rikaikyun
Rikaikyun is a Phonegap app for reading Japanese text and was based on <a href="">Rikaichan</a>\Rikaikun
(I used one of the core files from Rikaikun, but it appears to be no different from the original Rikaichan).
At its core it uses <a href="http://www.edrdg.org/jmdict/edict.html">EDICT</a> (I used the modified files from
Rikaikun which again likely are the same as in Rikaichan).

This app was made because the existing <a href="https://play.google.com/store/apps/details?id=com.zyz.mobile&hl=pl">
Jade Reader</a> was missing a number of features (and I know too little about JAVA to make any major changes).
The key ones:
- name and kanji dictionary
- furigana
- displaying images
- showing reading progress

This app is somewhere in alpha stage, meaning some of planned features are still not implemented
(though all of the above are already there). Some of the planned features include:
- better control of displaying status bar\progress (currently the size cannot be changed and there is page count)
- e-ink blink
- replace Rikaichan code with my own to move to a less restrictive license

Nonetheless even at the current stage the application should be usable.

<h3>License</h3>
<a href="https://www.gnu.org/licenses/gpl.html">GPLv3</a> (because Rikaikun\Rikaichan were licensed with that)

This project also uses a number of compatible open-source licensed libraries and I retaind information on their
licenses (where it was possible).

I'm inclined to publish this on a less restrictive license than GPLv3, but it will require me to rewrite the
core Rikaichan file (loading dictionary, parsing it, deinflection, dictionary look ups).
