const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function createPage({ session = false, isNew = false, fail = false } = {}) {
  let definition;
  const user = { memberNo: 'DE8000006' };
  vm.runInNewContext(fs.readFileSync('miniprogram/pages/login/index.js', 'utf8'), {
    require: () => ({
      hasSession: () => session,
      login: async () => ({ ...user, isNewUser: isNew }),
      profile: async () => { if (fail) throw Error('profile failed'); return user; },
      bindPhone: async () => { if (fail) throw Error('phone failed'); return user; }
    }),
    Page: value => { definition = value; },
    wx: { showToast() {}, showModal: () => { throw Error('Native welcome modal must not be used'); } }
  });
  return { ...definition, data: JSON.parse(JSON.stringify(definition.data)), setData(value) { Object.assign(this.data, value); } };
}
(async () => {
  const page = createPage();
  for (const user of [null, {}, { memberNo: 'WXINVALID' }]) {
    assert.equal(page.welcome(user), false);
    assert.equal(page.data.welcomeVisible, false);
  }
  for (const isNew of [true, false]) {
    for (const method of ['login', 'phone']) {
      const p = createPage({ isNew });
      p.data.agreed = true;
      await p[method]({ detail: { code: 'test-only-code' } });
      assert.equal(p.data.welcomeVisible, true);
      assert.equal(p.data.welcomeTitle, isNew ? '欢迎加入德澳' : '欢迎回来');
      assert.equal(p.data.welcomeButton, isNew ? '开启服务' : '继续服务');
      assert.equal(p.data.welcomeMemberNo, 'DE8000006');
      assert.equal(p.data.welcomeParticles.length, 12);
      p.closeWelcome();
      assert.equal(p.data.welcomeVisible, false);
      assert.equal(p.data.welcomeMemberNo, '');
      assert.equal(p.data.busy, false);
    }
  }
  const existing = createPage({ session: true });
  existing.onLoad();
  await Promise.resolve();
  assert.equal(existing.data.welcomeVisible, false, 'profile editing must not greet again');
  existing.data.agreed = true;
  await existing.phone({ detail: { code: 'test-only-code' } });
  assert.equal(existing.data.welcomeVisible, false, 'phone rebinding is not a new login');
  for (const method of ['login', 'phone']) {
    const failed = createPage({ fail: true });
    failed.data.agreed = true;
    await failed[method]({ detail: { code: 'test-only-code' } });
    assert.equal(failed.data.welcomeVisible, false);
    assert.equal(failed.data.busy, false);
  }
  console.log('PASS welcome: new/returning members, both login methods, profile/rebind exclusion, failures, dismissal');
})().catch(error => { console.error(error); process.exitCode = 1; });
