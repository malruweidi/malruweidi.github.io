import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../assets/ruwaidix-one-blue-2026.css',import.meta.url),'utf8');
test('Stories archival source controls meet contrast on blue paper',()=>{
 assert.match(css,/html\[data-rx-page="stories"\] main \.stories-source\.rx-source-fold > summary \{color:#2d507d!important\}/);
});
test('Stories historic photo eyebrows have dark-blue foreground on pale backgrounds',()=>{
 assert.match(css,/#rx26-festival-portrait > \.rx26-eyebrow/);
 assert.match(css,/#rx26-acs-2019-history > \.rx26-eyebrow/);
});
