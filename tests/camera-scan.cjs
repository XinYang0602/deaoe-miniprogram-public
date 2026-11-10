const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const scanner = require('../miniprogram/services/camera-scan');
const registration = require('../miniprogram/services/device-registration');
let options, count = 0, modals = [];
global.wx = {
  scanCode: o => { options = o; count++; },
  showModal: o => modals.push(o)
};
const page = { data: { scanning: false }, setData(d) { Object.assign(this.data, d); } };
scanner.scan(page);
scanner.scan(page);
assert.equal(count, 1);
assert.equal(options.onlyFromCamera, true);
assert.deepEqual(options.scanType, ['qrCode']);
options.success({ result: 'DEAOE-TEST-CODE' });
options.complete();
assert.equal(page.data.scanning, false);
assert.equal(modals.at(-1).title, '二维码识别成功');
assert.match(modals.at(-1).content, /DEAOE-TEST-CODE/);
assert.match(modals.at(-1).content, /尚未绑定/);
const before = modals.length;
scanner.scan(page);
options.fail({ errMsg: 'scanCode:fail cancel' });
options.complete();
assert.equal(modals.length, before);
assert.equal(page.data.scanning, false);
scanner.scan(page);
options.fail({ errMsg: 'scanCode:fail permission denied' });
options.complete();
assert.equal(modals.at(-1).title, '需要相机权限');
scanner.scan(page);
options.fail({ errMsg: 'scanCode:fail camera unavailable' });
options.complete();
assert.equal(modals.at(-1).title, '暂时无法扫码');
wx.scanCode = () => { throw new Error('unavailable'); };
scanner.scan(page);
assert.equal(page.data.scanning, false);
assert.equal(registration.inspect('').recognized, false);
assert.equal(registration.inspect('https://example.invalid/device').ready, false);
assert.ok(registration.inspect('x'.repeat(10000)).message.length < 250);
for (const name of ['home', 'devices']) {
  let definition, calls = 0;
  vm.runInNewContext(fs.readFileSync(`${__dirname}/../miniprogram/pages/${name}/index.js`, 'utf8'), {
    Page: p => { definition = p; },
    wx: global.wx,
    require: module => module.endsWith('camera-scan') ? { scan: () => calls++ }
      : module.endsWith('device-registration') ? registration : { hasSession: () => false }
  });
  definition.scan();
  assert.equal(calls, 0, 'guest cannot bypass login');
  assert.equal(modals.at(-1).title, '请先登录');
}
console.log('PASS: native camera options, repeat-tap guard, result, cancel, permissions, failure recovery, guest guard');
