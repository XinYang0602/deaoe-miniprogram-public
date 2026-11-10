const api = require('../../services/api');
Page({
  data: {
    order: null,
    error: ''
  },
  onLoad(q) {
    this.id = q.id
  },
  onShow() {
    this.setData({
      order: null,
      error: ''
    });
    api.order(this.id).then(order => this.setData({
      order,
      error: ''
    })).catch(e => this.setData({
      error: e.message
    }))
  },
  records() {
    wx.switchTab({
      url: '/pages/orders/index'
    })
  }
});
