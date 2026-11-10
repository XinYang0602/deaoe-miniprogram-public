const cameraScan = require('../../services/camera-scan');
const api = require('../../services/api');
const registration = require('../../services/device-registration');
Page({
  data: {
    items: [],
    error: '',
    loading: true,
    loggedIn: false,
    scanning: false,
    registrationReady: registration.policy.enabled
  },
  onShow() {
    this.setData({
      loggedIn: api.hasSession(),
      loading: api.hasSession(),
      items: [],
      error: ''
    });
    if (!api.hasSession()) return;
    api.devices().then(items => this.setData({
      items,
      error: '',
      loading: false
    })).catch(e => this.setData({
      error: e.message,
      loading: false,
      loggedIn: api.hasSession()
    }));
  },
  login() {
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },
  scan() {
    if (this.data.scanning) return;
    if (!api.hasSession()) {
      wx.showModal({
        title: '请先登录',
        content: '请使用顾客本人的微信账号登录，再扫描机身二维码登记设备。',
        confirmText: '去登录',
        success: r => {
          if (r.confirm) this.login();
        }
      });
      return;
    }
    cameraScan.scan(this);
  },
  open(e) {
    wx.navigateTo({
      url: '/pages/card/index?id=' + encodeURIComponent(e.currentTarget.dataset.id)
    });
  }
});
