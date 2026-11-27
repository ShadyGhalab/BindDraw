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
  // Play signs with a v3.0 signer (Android 16 and below) and a v3.2 hybrid (Android 17+), and sideloaded builds carry
  // the EAS upload key: every one must be listed or App Links don't verify on those phones.
  for (const required of [
    '03:BC:41:34:94:C1:F1:F6:2B:0C:1E:26:65:6A:99:FF:66:BB:53:6C:B4:ED:E8:8C:3E:B1:E5:07:D2:71:25:76',
    'D5:33:9E:F9:BD:59:85:98:B8:CF:95:6F:C5:D8:C0:4D:80:FC:CD:B4:39:C2:44:62:B6:86:86:2C:C3:D0:16:DC',
    'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C',
  ]) assert.ok(fingerprints.includes(required), required);
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
