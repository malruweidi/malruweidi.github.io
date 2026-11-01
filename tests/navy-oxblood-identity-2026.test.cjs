'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

const colors = {
  navy: '#2D4C6B',
  burgundy: '#71394C',
  paper: '#F4F0E8',
  white: '#FFFCF7',
  muted: '#53677D',
  paleRose: '#E6BFC7',
  deepBlue: '#263B55'
};
const luminance = hex => {
  const channels = hex.slice(1).match(/.{2}/g).map(v => parseInt(v, 16) / 255);
  const [r, g, b] = channels.map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
};
const contrast = (a, b) => {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
};

test('canonical site palette uses lighter navy and burgundy, including mirrored tokens', () => {
  for (const file of ['assets/design-system.css', 'assets/scientific-palette.css']) {
    const css = read(file);
    assert.ok(css.includes('--rx-midnight:' + colors.navy), file);
    assert.ok(css.includes('--rx-copper:' + colors.burgundy), file);
    assert.ok(css.includes('--rx-parchment:' + colors.paper), file);
  }
  assert.ok(read('assets/homepage-editorial-2026.css').includes('--home-ink:' + colors.navy));
  assert.ok(read('assets/taste-editorial-2026-10-18.css').includes('--taste-accent:' + colors.burgundy));
  assert.ok(read('index.html').includes('<meta name="theme-color" content="' + colors.paper + '">'));
});

test('essential reading and dark-surface text pairs have AA contrast or better', () => {
  const pairs = [
    [colors.navy, colors.paper],
    [colors.navy, colors.white],
    [colors.burgundy, colors.paper],
    [colors.burgundy, colors.white],
    [colors.muted, colors.paper],
    [colors.white, colors.navy],
    [colors.paleRose, colors.deepBlue]
  ];
  for (const [foreground, background] of pairs) {
    assert.ok(contrast(foreground, background) >= 4.5,
      foreground + ' against ' + background + ' = ' + contrast(foreground, background).toFixed(2));
  }
});

test('palette pass changes neither editorial structure nor remote dependencies', () => {
  const home = read('index.html');
  assert.match(home, /class="rx-hero-portrait"/);
  assert.match(home, /class="rx26-portal-card"/);
  assert.match(home, /id="film"/);
  for (const file of ['assets/design-system.css', 'assets/homepage-editorial-2026.css', 'assets/taste-editorial-2026-10-18.css']) {
    assert.doesNotMatch(read(file), /@import\s+url\(https?:/i, file);
  }
});

test('homepage requests fresh versioned styles after the new palette deployment', () => {
  const html = read('index.html');
  for (const asset of [
    'design-system.css',
    'narrative-journey.css',
    'aesthetic-integrity-2026.css',
    'homepage-editorial-2026.css',
    'home-film-2026.css',
    'editorial-wayfinding-2026.css',
    'taste-editorial-2026-10-18.css',
    'three-places-2026.css'
  ]) {
    const link = '/assets/' + asset + '?v=20261101-navy2';
    assert.equal(html.split(link).length - 1, 1, 'One fresh stylesheet link expected for ' + asset);
  }
  assert.ok(html.includes('--ruwaidix-navy:#2D4C6B'), 'Homepage branding must not retain old midnight blue');
});
