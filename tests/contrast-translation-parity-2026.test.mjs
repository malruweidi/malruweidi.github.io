import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=read('index.html');
const moments=read('assets/ruwaidix-moving-moments-2026.css');
const arabic=read('assets/ruwaidix-arabic-editorial-2026.css');
const dictionary=read('assets/i18n-dictionary.js');
const i18n=read('assets/i18n.js');
const stories=read('stories.html');
const writing=read('writing.html');
const research=read('research.html');

function contrast(fg,bg){
 const lum=hex=>{
  const channels=hex.replace('#','').match(/.{2}/g).map(n=>parseInt(n,16)/255);
  const linear=channels.map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);
  return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
 };
 const l1=lum(fg),l2=lum(bg);
 return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
}
test('Moving Moments has high-contrast ivory text against its darkest and lightest navy background',()=>{
 const palette={
  lightBackground:'#253f66',
  mainBackground:'#1c324f',
  darkBackground:'#162a44',
  headline:'#fffaf0',
  emphasis:'#bbd5f7',
  paragraph:'#ecf1f7',
  eyebrow:'#ead9b9'
 };
 const selectors=moments.slice(moments.indexOf('html[data-rx-page="home"] body .rx-moments-header{'));
 for(const background of [palette.lightBackground,palette.mainBackground,palette.darkBackground]){
  for(const foreground of [palette.headline,palette.emphasis,palette.paragraph,palette.eyebrow]){
   assert.ok(contrast(foreground,background)>=7,
    foreground+' should be readable on '+background);
  }
 }
 assert.match(selectors,/background-image:linear-gradient\(125deg,#253f66 0%,#1c324f 70%,#162a44 100%\)!important/);
 assert.match(selectors,/color:#fffaf0!important/);
 assert.match(selectors,/-webkit-text-fill-color:#fffaf0!important/);
 assert.match(selectors,/-webkit-text-fill-color:#bbd5f7!important/);
 assert.match(selectors,/\.rx-moments-header p\{/);
 assert.doesNotMatch(moments,/--rx-moments-heading-paper/,'discarded paper tokens must not hide the effective dark design');
});
test('Arabic calligraphy uses Ruqaa for artwork, Amiri for literary titles and IBM Plex for interface',()=>{
 assert.match(arabic,/Aref Ruqaa/);
 assert.match(arabic,/Amiri/);
 assert.match(arabic,/IBM Plex Sans Arabic/);
 assert.match(arabic,/--rx-ar-calligraphy:/);
 assert.match(arabic,/\.rx-moments-glyph[\s\S]*?var\(--rx-ar-calligraphy\)/);
 assert.match(arabic,/prefers-reduced-motion/);
});
test('all newly introduced English scientific narratives have matching Arabic translations',()=>{
 for(const value of [
  'The questions changed.',
  'Curiosity stayed.',
  'Not a chronology of achievements, but four moments in a longer effort to understand the world. Move from a family photograph to an instrument, a measured living system, and the problem of designing medicines.',
  'Before the questions had names.',
  'A microscope from Cairo.',
  'Life moves. Evidence must follow.',
  'What survives the journey?',
  'Play the sequence',
  'Science begins with',
  'looking closer.',
  'A formulation is more than a sphere.',
  'Change the scale.',
  'Change the method.',
  'Watching a vessel is not yet measuring it.',
  'A promising carrier must survive its journey.'
 ]){
  assert.ok(dictionary.includes(JSON.stringify(value)), 'Missing Arabic translation of: '+value);
 }
 assert.match(i18n,/\["aria-label",\s*"placeholder",\s*"title",\s*"alt"\]/);
});
test('letterpress presents the same four essay panels in both languages',()=>{
 const cut=writing.slice(writing.indexOf('id="rx-letterpress"'),writing.indexOf('</section>',writing.indexOf('id="rx-letterpress"')));
 const en=(cut.match(/class="rx-press-en"/g)||[]).length;
 const ar=(cut.match(/class="rx-press-ar"/g)||[]).length;
 assert.equal(en,ar,'Arabic and English spans must be one-to-one');
 assert.ok(en>=25,'all titles, metadata, explanatory text and tabs are paired');
 assert.equal((cut.match(/data-rx-press-panel/g)||[]).length,4);
 assert.match(arabic,/html\[lang="ar"\] \.rx-letterpress/);
});
test('preserves the original homepage film and two scientific feature records',()=>{
 assert.match(page,/anatomy-of-a-question-2026-v2\.mp4/);
 assert.match(page,/id="rx-moving-moments"/);
 assert.match(page,/id="research-workbench"/);
 assert.match(stories,/id="rx-evidence-cabinet"/);
 assert.match(research,/id="rx-method-scale"/);
});
