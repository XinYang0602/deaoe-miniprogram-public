const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
let stored = {},
  calls = [],
  responder;
global.wx = {
  getStorageSync: k => stored[k],
  setStorageSync: (k, v) => stored[k] = v,
  removeStorageSync: k => delete stored[k],
  login: opts => opts.success({
    code: 'temporary-code'
  }),
  request: opts => {
    calls.push(opts);
    responder(opts)
  }
};
const api = require('../miniprogram/services/api');
(async () => {
  await assert.rejects(api.devices());
  assert.equal(calls.length, 0);
  responder = o => {
    assert.ok(o.url.startsWith('https://example.com/service/mini/'));
    assert.equal(o.header.Authorization, undefined);
    assert.deepEqual(o.data, {
      code: 'temporary-code'
    });
    o.success({
      statusCode: 200,
      data: {
        token: 'a'.repeat(64),
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        user: {
          id: 'WXTEST'
        }
      }
    })
  };
  assert.equal((await api.login()).id, 'WXTEST');
  assert.equal(api.hasSession(), true);
  responder = o => {
    assert.equal(o.header.Authorization, 'Bearer ' + 'a'.repeat(64));
    o.success({
      statusCode: 200,
      data: {
        items: [{
          id: 'D1',
          name: 'server device'
        }]
      }
    })
  };
  assert.equal((await api.devices())[0].name, 'server device');
  assert.equal((await api.device('D1')).id, 'D1');
  await assert.rejects(api.device('missing'));
  const before = calls.length;
  await assert.rejects(api.submit({
    agreed: false
  }));
  assert.equal(calls.length, before);
  responder = o => o.fail({});
  await assert.rejects(api.orders(), /无法连接服务器/);
  responder = o => o.fail({
    errMsg: 'request:fail url not in domain list'
  });
  await assert.rejects(api.orders(), /域名校验未通过/);
  responder = o => o.fail({
    errMsg: 'request:fail ssl hand shake error'
  });
  await assert.rejects(api.orders(), /HTTPS 证书/);
  responder = o => o.fail({
    errMsg: 'request:fail timeout'
  });
  await assert.rejects(api.orders(), /请求超时/);
  responder = o => o.success({
    statusCode: 401,
    data: {
      error: 'expired'
    }
  });
  await assert.rejects(api.profile(), /expired/);
  assert.equal(api.hasSession(), false);
  responder = o => o.success({
    statusCode: 200,
    data: {
      token: 'b'.repeat(64),
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: 'WXOTHER'
      }
    }
  });
  await api.login();
  responder = o => {
    assert.ok(o.url.endsWith('/logout'));
    o.success({
      statusCode: 200,
      data: {
        ok: true
      }
    })
  };
  await api.logout();
  assert.equal(api.hasSession(), false);
  const root = path.join(__dirname, '../miniprogram');
  const config = JSON.parse(fs.readFileSync(path.join(root, '../project.config.json')));
  assert.equal(config.appid, 'touristappid');
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json')));
  for (const route of app.pages) {
    let page;
    vm.runInNewContext(fs.readFileSync(path.join(root, route + '.js'), 'utf8'), {
      require: name => name.startsWith('../../services/')
        ? require(path.join(root, 'services', path.basename(name)))
        : api,
      Page: p => page = p
    });
    const markup = fs.readFileSync(path.join(root, route + '.wxml'), 'utf8');
    for (const match of markup.matchAll(/bind(?:tap|change|submit)="([^"]+)"/g)) assert.equal(
      typeof page[match[1]], 'function', route + ':' + match[1]);
    JSON.parse(fs.readFileSync(path.join(root, route + '.json')));
    assert.ok(fs.existsSync(path.join(root, route + '.wxss')))
  }
  console.log(
    'PASS: wx.login code exchange, HTTPS API target, bearer auth, guest guard, server data, errors, 401 clear, logout, all registered page bindings'
    );
})().catch(e => {
  console.error(e);
  process.exitCode = 1
});
