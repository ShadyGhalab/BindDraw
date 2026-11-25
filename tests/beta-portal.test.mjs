import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';
import { games, groupUrl, portalUrl } from '../src/data/beta.mjs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('public enrollment links use the existing Google Group and exact Android package IDs', () => {
  assert.equal(groupUrl, 'https://groups.google.com/g/alpha-android-testers');
  assert.equal(portalUrl, 'https://blinddraw.ink/beta/');
  assert.deepEqual(games.map((g) => g.packageId), ['com.tendonlife.invisibleink', 'com.tendonlife.teddybear']);
  for (const game of games) {
    assert.equal(game.testingUrl, 'https://play.google.com/apps/testing/' + game.packageId);
    assert.equal(game.storeUrl, 'https://play.google.com/store/apps/details?id=' + game.packageId);
    assert.ok(existsSync(new URL('../public/' + game.icon, import.meta.url)));
  }
});

test('built beta page has functional direct enrollment links and accessible enrollment instructions', () => {
  const html = read('../dist/beta/index.html');
  for (const href of [groupUrl, portalUrl, ...games.flatMap((g) => [g.testingUrl, g.storeUrl, g.feedback])]) {
    assert.ok(html.includes('href="' + href + '"'), 'Missing link: ' + href);
  }
  assert.ok(html.includes('same Google account'));
  assert.ok(html.includes('14 consecutive days'));
  assert.ok(html.includes('No separate email submission'));
  assert.ok(html.includes('id="main-content"'));
  assert.doesNotMatch(html, /<form\b/i);
  assert.doesNotMatch(html, /<input[^>]*type="email"/i);
  for (const game of games) {
    assert.ok(existsSync(new URL('../dist/' + game.icon, import.meta.url)));
  }
});

test('the main website links to the beta portal after build', () => {
  const html = read('../dist/index.html');
  assert.ok(html.includes('href="/beta/"'));
});
