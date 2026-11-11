const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function page(file, context) {
  let def;
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), { ...context, Page: p => { def = p; } });
  return { ...def, data: JSON.parse(JSON.stringify(def.data)), setData(data, cb) { Object.assign(this.data, data); if (cb) cb(); } };
}
(async () => {
  let session = true, resolveProfile;
  const user = { id: 'TEST', memberNo: 'DE8000001', phone: '00000001234' };
  const api = { hasSession: () => session, cachedUser: () => session ? user : null,
    profile: () => new Promise(resolve => { resolveProfile = resolve; }) };
  const mine = page('miniprogram/pages/my/index.js', { require: () => api, wx: {} });
  mine.onLoad();
  assert.equal(mine.data.displayName, '1234');
  const pending = mine.refresh();
  assert.equal(mine.data.user.memberNo, user.memberNo);
  assert.equal(mine.data.loading, false, 'cached profile remains visible while refreshing');
  mine.preloadUser({ ...user, phone: '00000005678' });
  resolveProfile({ ...user, phone: '00000009999' });
  await pending;
  assert.equal(mine.data.displayName, '5678', 'old request cannot overwrite preloaded profile');
  session = false;
  await mine.refresh();
  assert.equal(mine.data.user, null);
  let ready, switched = 0;
  const previous = { route: 'pages/my/index', preloadUser(value, cb) { assert.equal(value, user); ready = cb; } };
  const login = page('miniprogram/pages/login/index.js', { require: () => api,
    getCurrentPages: () => [previous, {}], wx: { switchTab(options) { switched++; assert.equal(options.url, '/pages/my/index'); options.complete(); } } });
  login.data.user = user;
  login.done();
  login.done();
  assert.equal(switched, 0, 'navigation waits for setData rendering callback');
  ready();
  assert.equal(switched, 1);
  previous.route = 'pages/home/index';
  login.done();
  assert.equal(switched, 2, 'other entry points return to My tab');
  console.log('PASS: preload before navigation, cached first render, stale response guard, logout and alternate entry');
})().catch(e => { console.error(e); process.exitCode = 1; });
