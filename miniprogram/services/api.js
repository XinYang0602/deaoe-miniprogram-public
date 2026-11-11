const config = require('../config');
const KEY = 'deaoe-mini-session-v1';
let session = null;

function saved() {
  if (session) return session;
  try {
    session = wx.getStorageSync(KEY) || null
  } catch {}
  return session
}

function clear() {
  session = null;
  wx.removeStorageSync(KEY)
}

function hasSession() {
  const s = saved();
  return !!(s && s.token && s.expiresAt * 1000 > Date.now())
}

function networkError(err) {
  const raw = String(err && err.errMsg || 'request:fail（未返回详细原因）').slice(0, 300);
  let tip = '无法连接服务器，请检查网络';
  if (/url not in domain list|domain.*(list|legal)|合法域名/i.test(raw)) tip =
    '域名校验未通过：请确认 request 合法域名已保存 https://example.com，然后关闭并重新打开项目';
  else if (/ssl|tls|certificate|cert_/i.test(raw)) tip = 'HTTPS 证书或 TLS 连接失败，需要检查服务器证书链';
  else if (/timeout|timed out/i.test(raw)) tip = '服务器请求超时，请稍后重试并检查服务是否可用';
  else if (/name_not_resolved|dns|resolve host/i.test(raw)) tip = '域名解析失败，请检查当前网络的 DNS';
  else if (/connection_refused|connection_reset|connection_closed/i.test(raw)) tip =
    '服务器连接被拒绝或中断，请检查网络及服务器 HTTPS 服务';
  return new Error(tip + '。详细原因：' + raw);
}

function call(path, method = 'GET', data, auth = true) {
  return new Promise((resolve, reject) => {
    if (auth && !hasSession()) {
      clear();
      const e = new Error('请先在“我的”页面微信登录');
      e.code = 401;
      reject(e);
      return
    }
    const header = {
      'Content-Type': 'application/json'
    };
    if (auth) header.Authorization = 'Bearer ' + saved().token;
    wx.request({
      url: config.apiBase + path,
      method,
      data,
      header,
      timeout: 20000,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return
        }
        if (res.statusCode === 401) clear();
        const e = new Error(res.data && res.data.error || '服务请求失败，请稍后重试');
        e.code = res.statusCode;
        reject(e)
      },
      fail(err) {
        reject(networkError(err))
      }
    })
  })
}

function login() {
  return new Promise((resolve, reject) => wx.login({
    timeout: 10000,
    success(r) {
      if (!r.code) {
        reject(new Error('未获得微信登录凭证，请重试'));
        return
      }
      resolve(r.code)
    },
    fail() {
      reject(new Error('微信登录失败，请重试'))
    }
  })).then(code => call('/login', 'POST', {
    code
  }, false)).then(s => {
    if (!s.token || !s.user || !s.user.id) throw new Error('服务器登录响应不正确');
    wx.setStorageSync(KEY, s);
    session = s;
    return { ...s.user, isNewUser: s.isNewUser === true }
  })
}

function cachedUser() {
  return hasSession() ? saved().user : null
}

function userRequest(path, method = 'GET', data) {
  const token = hasSession() ? saved().token : null;
  return call(path, method, data).then(r => {
    if (token && hasSession() && saved().token === token) {
      session = { ...saved(), user: r.user };
      wx.setStorageSync(KEY, session);
    }
    return r.user
  })
}

function profile() {
  return userRequest('/me')
}

function logout() {
  return call('/logout', 'POST', {}).then(() => clear())
}

function devices() {
  return call('/devices').then(r => r.items)
}

function orders() {
  return call('/orders').then(r => r.items)
}

function device(id) {
  return devices().then(rows => {
    const d = rows.find(d => d.id === id);
    if (!d) throw new Error('未找到属于当前账号的设备，请联系门店核实绑定');
    return d
  })
}

function order(id) {
  return orders().then(rows => {
    const o = rows.find(o => o.id === id);
    if (!o) throw new Error('未找到属于当前账号的服务记录');
    return o
  })
}

function today() {
  const d = new Date(Date.now() + 8 * 3600000);
  return d.toISOString().slice(0, 10)
}

function submit(input) {
  if (!input.agreed) return Promise.reject(new Error('请先确认服务信息使用说明'));
  return call('/orders', 'POST', input).then(r => r.order)
}

function saveAvatar(avatar) {
  return userRequest('/avatar', 'POST', {
    avatar
  })
}

function bindPhone(code) {
  return userRequest('/phone', 'POST', {
    code,
    agreed: true
  })
}
module.exports = {
  cachedUser,
  bindPhone,
  saveAvatar,
  hasSession,
  login,
  profile,
  logout,
  devices,
  device,
  orders,
  order,
  submit,
  today
};
