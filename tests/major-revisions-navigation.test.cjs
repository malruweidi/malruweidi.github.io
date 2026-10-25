'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const home = read('index.html');
const writing = read('writing.html');
const book = read('major-revisions.html');

test('Major Revisions retains its standalone coming-soon book page and original cover', () => {
  assert.match(book, /<h1 id="book-title">Major<br><em>Revisions\.<\/em><\/h1>/);
  assert.match(book, /Coming soon/);
  assert.match(book, /\/assets\/major-revisions-cover\.svg/);
});

test('the book remains in Explore without displacing the main reader routes', () => {
  const nav = home.match(/<nav class="navlinks"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'primary navigation not found');
  assert.match(nav[1], /<div class="rx-more-panel">[\s\S]*?<a href="\/major-revisions\.html">Major Revisions \(book in progress\)<\/a>/);
  assert.doesNotMatch(nav[1].split('<details class="rx-more">')[0], /major-revisions\.html/);
});

test('the expanded homepage chapter index includes a visible Major Revisions card', () => {
  const visibleHome = home.split('<details class="rx-home-complete-record"')[0];
  assert.match(visibleHome, /class="rx26-portal-card" href="\/major-revisions\.html"/);
  assert.match(visibleHome, /Major Revisions/);
});

test('Writing page navigation links to the book without replacing essays', () => {
  const nav = writing.match(/<nav aria-label="Writing navigation">([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'writing navigation not found');
  assert.match(nav[1], /<a href="\/major-revisions\.html">Book<\/a>/);
  assert.match(writing, /The Life Between Diagnoses/);
});
