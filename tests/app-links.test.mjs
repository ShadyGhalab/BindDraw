import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const association = JSON.parse(read('../public/.well-known/assetlinks.json'));
const landing = read('../public/match/invite.js');
const html = read('../public/match/index.html');
const legacy = read('../src/pages/match/[mode].astro');
const modes = ['guess', 'guesslive', 'copycat', 'copycatlive', 'speeddraw', 'speeddrawlive', 'blindrelay', 'collab'];

function render(search) {
  const nodes = Object.fromEntries(['title', 'message', 'code', 'actions', 'app', 'browser'].map((id) => [id, { hidden: true }]));
  vm.runInNewContext(landing, { window: { location: { search } }, document: { getElementById: (id) => nodes[id] }, URLSearchParams });
  return nodes;
}

test('Android association has the correct package, relation and valid signing fingerprints', () => {
  assert.equal(association.length, 1);
  assert.deepEqual(association[0].relation, ['delegate_permission/common.handle_all_urls']);
  assert.equal(association[0].target.namespace, 'android_app');
  assert.equal(association[0].target.package_name, 'com.tendonlife.invisibleink');
  const fingerprints = association[0].target.sha256_cert_fingerprints;
  assert.ok(fingerprints.length >= 2);
  assert.equal(new Set(fingerprints).size, fingerprints.length);
  for (const fingerprint of fingerprints) assert.match(fingerprint, /^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/);
});

test('all eight modes provide native and browser links with the original code', () => {
  for (const mode of modes) {
    assert.ok(legacy.includes("{ params: { mode: '" + mode + "' } }"));
    const nodes = render('?mode=' + mode + '&code=7y4jdp');
    assert.equal(nodes.actions.hidden, false);
    assert.equal(nodes.code.textContent, '7Y4JDP');
    assert.equal(nodes.app.href, 'invisibleink://match/' + mode + '?code=7Y4JDP');
    assert.equal(nodes.browser.href, 'https://blind-draw-c6ee2.web.app/match/' + mode + '?code=7Y4JDP');
  }
  assert.ok(html.includes('src="/match/invite.js"'));
});

test('legacy links keep four-digit iOS invitations and redirect six-character Firebase invitations', () => {
  const code = legacy.match(/<script define:vars=\{\{[^\n]+\}\}>\s*([\s\S]*?)<\/script>/)?.[1];
  assert.ok(code);
  for (const raw of ['7Y4JDP', '4821']) {
    const redirects = [];
    vm.runInNewContext(code, {
      mode: 'speeddraw', appStoreURL: 'https://apps.apple.com/app/id6758377109', appsFlyerOneLinkURL: '',
      URL, URLSearchParams,
      window: { location: { search: '?code=' + raw, origin: 'https://blinddraw.ink', replace: (url) => redirects.push(url) } },
      document: { getElementById: () => null },
    });
    assert.deepEqual(redirects, raw === '4821' ? [] : ['/match/?mode=speeddraw&code=7Y4JDP']);
  }
});

test('invalid and injected query values cannot produce arbitrary destinations', () => {
  for (const query of ['?mode=__proto__&code=7Y4JDP', '?mode=speeddraw&code=1234', '?mode=https://evil.example&code=7Y4JDP']) {
    assert.equal(render(query).actions.hidden, true);
  }
  assert.equal(render('?mode=speeddraw&code=7Y4JDP&next=https://evil.example').browser.href, 'https://blind-draw-c6ee2.web.app/match/speeddraw?code=7Y4JDP');
});
