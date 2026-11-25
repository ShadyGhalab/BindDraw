import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config, catalog, keys } from '../scripts/beta-content.mjs';
import { outputs } from '../scripts/generate-beta.mjs';
const root = fileURLToPath(new URL('../',import.meta.url));
test('all localized pages are complete and reproducible',()=>{
  assert.equal(config.locales.length, 21);
  for(const [path,expected] of Object.entries(outputs())){
    const actual=readFileSync(join(root,path),'utf8');
    assert.equal(actual,expected,path);
    assert.ok(actual.includes('https://groups.google.com/g/alpha-android-testers'));
    assert.ok(actual.includes('https://play.google.com/apps/testing/'+config.pkg));
    assert.ok(actual.includes('https://play.google.com/store/apps/details?id='+config.pkg));
    assert.ok(actual.includes('mailto:'+config.email));
    assert.ok(actual.includes('id="main-content"'));
    assert.doesNotMatch(actual,/<form\b|<input[^>]*type="email"/i);
    assert.doesNotMatch(actual,/Teddy Dreams|com\.tendonlife\.teddybear|teddytoymatch\.com/i);
  }
  for(const locale of config.locales){
    assert.equal(catalog[locale].length,keys.length);
    assert.ok(catalog[locale].every(s=>typeof s==='string' && s.trim()));
    const html=readFileSync(join(root,config.prefix,locale,'index.html'),'utf8');
    assert.ok(html.includes('lang="'+locale+'" dir="'+(locale==='ar'?'rtl':'ltr')+'"'));
    assert.ok(html.includes('data-auto-locale="false"'));
    for(const l of config.locales) assert.ok(html.includes('href="/beta/'+l+'/"'));
  }
});
test('all local artwork and assets exist; homepage links to beta',()=>{
  const publicRoot = join(root,'public');
  for(const path of [config.icon,config.art,'/beta/beta.css','/beta/locale.js','/beta/invite-qr.svg']){
    assert.ok(existsSync(join(publicRoot,path)),path);
  }
  const homepage = readFileSync(join(root,'src/layouts/BaseLayout.astro'),'utf8');
  assert.ok(homepage.includes('beta/'));
});
test('Astro publishes every static localized page',()=>{
  for(const path of Object.keys(outputs())) {
    const built=path.replace(/^public\//,'dist/');
    assert.equal(readFileSync(join(root,built),'utf8'),readFileSync(join(root,path),'utf8'));
  }
  assert.ok(readFileSync(join(root,'dist/index.html'),'utf8').includes('href="/beta/"'));
});

test('every invitation includes direct opt-in, private checklist, native sharing and verified QR asset',()=>{
  const qr=readFileSync(join(root,config.prefix,'invite-qr.svg'),'utf8');
  assert.ok(qr.includes('<title>'+config.domain+'/beta/</title>'));
  for(const html of Object.values(outputs())){
    assert.ok(html.includes('class="action member" href="https://play.google.com/apps/testing/'+config.pkg+'"'));
    for(const step of ['group','test','install']) assert.equal((html.match(new RegExp('data-step="'+step+'"','g'))||[]).length,1);
    assert.ok(html.includes('data-checklist hidden'));
    assert.ok(html.includes('data-native-share hidden'));
    assert.ok(html.includes('src="/beta/invite-qr.svg"'));
    assert.ok(html.includes('https://wa.me/?text='));assert.ok(html.includes('https://t.me/share/url?url='));
  }
});

import { art, funnelLabels } from '../scripts/beta-funnel.mjs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
test('every locale prioritizes enrollment and keeps real store artwork below the steps',()=>{
  assert.equal(Object.keys(funnelLabels).length,config.locales.length);
  for(const [path,html] of Object.entries(outputs())){
    assert.ok(html.indexOf('id="enroll"')<html.indexOf('id="preview-title"'),path);
    assert.equal((html.match(/data-next-action/g)||[]).length,1,path);
    for(const key of ['group','test','install'])assert.ok(html.includes('data-next-target="'+key+'"'),path);
    assert.ok(html.includes('data-feedback-link'));assert.ok(html.includes('data-reminder-download'));
    assert.ok(html.includes('support.google.com/googleplay/android-developer/answer/9845334'));
    assert.ok(html.includes('content="'+config.domain+art.graphic.url+'"'));
    for(const image of art.screenshots)assert.ok(html.includes('src="'+image.url+'"'),path);
    assert.doesNotMatch(html,/undefined|NaN/);
  }
  const publicRoot=config.kind==='ink'?join(root,'public'):root;
  for(const image of [art.graphic,...art.screenshots]){
    const data=readFileSync(join(publicRoot,image.url));
    const sha=createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
    assert.equal(sha,image.sha,image.url);
  }
});
test('next action only advances on explicitly checked steps; reminder is 14 days later and handles boundaries',()=>{
  const context=vm.createContext({TextEncoder,Date});
  vm.runInContext(readFileSync(join(root,config.prefix,'funnel.js'),'utf8'),context);
  for(const [input,expected] of [[[],'group'],[['group'],'test'],[['group','test'],'install'],[['group','test','install'],'feedback'],[['install'],'group']]){
    context.completed=input;assert.equal(vm.runInContext('betaNextStep(completed)',context),expected);
  }
  for(const [input,expected] of [['2026-11-25','20261209'],['2026-12-25','20270108'],['2028-02-20','20280305'],['2026-02-30',null],['bad',null]]){
    context.input=input;assert.equal(vm.runInContext('betaReminderDate(input)',context),expected);
  }
  const ics=vm.runInContext("betaCalendar('2026-11-25','Title, semicolon;','note\\nline','uid',new Date('2026-11-25T12:00:00Z'))",context);
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20261209\r\n'));assert.ok(ics.includes('DTEND;VALUE=DATE:20261210\r\n'));
  assert.ok(ics.includes('SUMMARY:Title\\, semicolon\\;'));
  assert.ok(ics.includes('DESCRIPTION:note\\nline'));
});


test('all six original English Play Store phone screenshots are present, ordered, unique and lazy-loaded',()=>{
  assert.equal(art.screenshots.length,6);
  assert.deepEqual(art.screenshots.map(image=>image.url.split('/').pop()),['01-free-draw.png','02-speed-draw.png','03-copycat.png','04-daily.png','05-online.png','06-arcade.png']);
  for(const [path,html] of Object.entries(outputs())){
    assert.equal((html.match(/class="store-shot"/g)||[]).length,6,path);
    assert.ok(html.includes('class="store-gallery" role="region" aria-labelledby="preview-title" tabindex="0"'));
    for(const image of art.screenshots){assert.ok(html.includes('href="'+image.url+'" target="_blank" rel="noopener noreferrer"><img src="'+image.url+'"'),path);}
    const gallery=html.split('<div class="store-gallery"')[1].split('</div>')[0];
    assert.equal((gallery.match(/loading="lazy"/g)||[]).length,6,path);
  }
});


import { communityLabels, communityActivities } from '../scripts/beta-community.mjs';
test('personal invitation, first-wave testers and optional adventure are localized without changing enrollment',()=>{
  assert.deepEqual(Object.keys(communityLabels).sort(),[...config.locales].sort());
  assert.deepEqual(Object.keys(communityActivities).sort(),[...config.locales].sort());
  assert.ok(existsSync(join(root,config.prefix,'community.css')));
  for(const [path,html] of Object.entries(outputs())){
    const locale=html.match(/<html lang="([^"]+)"/)[1];
    assert.equal(communityLabels[locale].length,config.kind==='ink'?12:10);
    assert.equal(communityActivities[locale].length,5);
    assert.ok(html.includes('class="developer-invite"'));
    assert.ok(html.includes('class="enroll-clarity"'));
    assert.equal((html.match(/data-next-action/g)||[]).length,1);
    assert.equal((html.match(/data-next-target=/g)||[]).length,3);
    assert.equal((html.match(/class="store-shot"/g)||[]).length,art.screenshots.length);
    assert.ok(html.indexOf('id="enroll"')<html.indexOf('id="founding-title"'));
    assert.ok(html.indexOf('id="enroll"')<html.indexOf('id="adventure-title"'));
    assert.deepEqual([...html.matchAll(/data-activity-day="(\d+)"/g)].map(m=>Number(m[1])),[1,3,5,7,10,14],path);
    const web='https://blind-draw-c6ee2.web.app/';
    if(config.kind==='ink'){
      assert.equal((html.match(/class="browser-preview"/g)||[]).length,1);
      assert.ok(html.includes('href="'+web+'" target="_blank" rel="noopener noreferrer"'));
      assert.ok(html.indexOf('id="enroll"')<html.indexOf('class="browser-preview"'));
    }else assert.ok(!html.includes(web));
  }
});
