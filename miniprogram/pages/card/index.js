const api = require('../../services/api');
Page({
  data: {
    device: null,
    records: [],
    error: ''
  },
  onLoad(q) {
    this.id = q.id
  },
  onShow() {
    this.setData({
      device: null,
      error: ''
    });
    Promise.all([api.device(this.id), api.orders()]).then(([device, orders]) => this.setData({
      device,
      records: orders.filter(o => o.deviceId === this.id),
      error: ''
    })).catch(e => this.setData({
      error: e.message
    }))
  },
  request() {
    wx.navigateTo({
      url: '/pages/request/index?deviceId=' + encodeURIComponent(this.id)
    })
  },
  open(e) {
    wx.navigateTo({
      url: '/pages/order/index?id=' + encodeURIComponent(e.currentTarget.dataset.id)
    })
  }
});
