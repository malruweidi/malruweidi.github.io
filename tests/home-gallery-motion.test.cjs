/* Homepage moving-gallery accessibility contract. Source + behavior verification. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = () => fs.readFileSync(path.join(root, 'assets/home-gallery-motion.css'), 'utf8');
const js = () => fs.readFileSync(path.join(root, 'assets/home-gallery-motion.js'), 'utf8');

test('moving scientific figures have a named, keyboard-accessible persistent control', () => {
  assert.match(html, /<button\b[^>]*type="button"[^>]*id="rx-gallery-motion"[^>]*aria-controls="rx-gallery-track"[^>]*aria-pressed="false"[^>]*>/);
  assert.match(html, /<div\b[^>]*class="moving-gallery"[^>]*id="rx-gallery"[^>]*>/);
  assert.match(html, /<div\b[^>]*class="moving-track"[^>]*id="rx-gallery-track"[^>]*>/);
  assert.match(html, /home-gallery-motion\.css/);
  assert.match(html, /home-gallery-motion\.js/);
});

test('motion-off still retains all six original scientific figure links and labels', () => {
  const gallery = html.match(/<div class="moving-track" id="rx-gallery-track">([\s\S]*?)<\/div>/);
  assert.ok(gallery, 'scientific media gallery is preserved');
  assert.equal((gallery[1].match(/<a\b/g) || []).length, 6);
  assert.equal((gallery[1].match(/<img\b/g) || []).length, 6);
  assert.match(css(), /\.moving-gallery\[data-motion-paused="true"\]/);
  assert.match(css(), /overflow-x:\s*auto/);
  assert.match(css(), /\.moving-gallery\[data-motion-paused="true"\] \.moving-track>\[aria-hidden="true"\]/);
  assert.match(css(), /@media\(prefers-reduced-motion:reduce\)[\s\S]*?\[aria-hidden="true"\]/);
  assert.match(css(), /animation:\s*none\s*!important/);
  assert.match(css(), /prefers-reduced-motion:\s*reduce/);
});

test('activating motion control toggles announcement and the persistent static gallery state', () => {
  const listeners = {};
  const gallery = { dataset: { motionPaused: 'false' } };
  const button = {
    attrs: { 'aria-pressed': 'false' },
    textContent: 'Pause moving figures',
    hidden: true,
    addEventListener(name, cb) { listeners[name] = cb; },
    setAttribute(key, val) { this.attrs[key] = val; }
  };
  const document = {
    readyState: 'complete',
    getElementById(id) {
      return id === 'rx-gallery' ? gallery : id === 'rx-gallery-motion' ? button : null;
    }
  };
  vm.runInNewContext(js(), { document });
  assert.equal(typeof listeners.click, 'function');
  assert.equal(button.hidden, false, 'functional control is revealed only when JavaScript is active');
  listeners.click();
  assert.equal(gallery.dataset.motionPaused, 'true');
  assert.equal(button.attrs['aria-pressed'], 'true');
  assert.match(button.textContent, /Resume/);
  listeners.click();
  assert.equal(gallery.dataset.motionPaused, 'false');
  assert.equal(button.attrs['aria-pressed'], 'false');
  assert.match(button.textContent, /Pause/);
});
