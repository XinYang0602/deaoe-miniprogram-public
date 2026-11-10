const cameraScan = require('../../services/camera-scan');
const api = require('../../services/api');
Page({
  data: {
    scanning: false
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
  website() {
    wx.navigateTo({
      url: '/pages/website/index'
    });
  },
  request(e) {
    if (!api.hasSession()) {
      this.login();
      return;
    }
    wx.navigateTo({
      url: '/pages/request/index?type=' + encodeURIComponent(e.currentTarget.dataset.type ||
        '维修')
    });
  }
});
