const api = require('../../services/api');
Page({
  data: {
    items: [],
    visible: [],
    filter: '全部',
    filters: ['全部', '待处理', '处理中', '已完成'],
    error: '',
    loading: true
  },
  onShow() {
    const app = getApp();
    const filter = app.globalData.orderFilter || '全部';
    app.globalData.orderFilter = null;
    this.setData({
      filter,
      loading: true,
      items: [],
      visible: [],
      error: ''
    });
    api.orders().then(items => {
      this.setData({
        items,
        error: '',
        loading: false
      });
      this.apply();
    }).catch(e => this.setData({
      error: e.message,
      loading: false
    }));
  },
  apply() {
    const f = this.data.filter;
    this.setData({
      visible: this.data.items.filter(o => f === '全部' || f === '待处理' && ['待派工', '待处理']
        .includes(o.status) || f === '处理中' && o.status === '处理中' || f === '已完成' && ['已完工',
          '已关闭'
        ].includes(o.status))
    });
  },
  filter(e) {
    this.setData({
      filter: e.currentTarget.dataset.filter
    });
    this.apply();
  },
  open(e) {
    wx.navigateTo({
      url: '/pages/order/index?id=' + encodeURIComponent(e.currentTarget.dataset.id)
    })
  },
  request() {
    if (!api.hasSession()) {
      wx.switchTab({
        url: '/pages/my/index'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/request/index'
    })
  }
});
