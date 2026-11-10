const api = require('../../services/api');
Page({
  data: {
    devices: [],
    deviceIndex: 0,
    types: ['维修', '安装'],
    typeIndex: 0,
    date: '',
    today: '',
    agreed: false,
    submitting: false,
    error: ''
  },
  onLoad(q = {}) {
    this.setData({
      typeIndex: q.type === '安装' ? 1 : 0
    });
    this.requestKey = 'REQ' + Date.now() + Math.random().toString(36).slice(2);
    this.setData({
      date: api.today(),
      today: api.today()
    });
    api.devices().then(devices => this.setData({
      devices,
      deviceIndex: Math.max(0, devices.findIndex(d => d.id === q.deviceId))
    })).catch(e => this.setData({
      error: e.message
    }))
  },
  chooseDevice(e) {
    this.setData({
      deviceIndex: Number(e.detail.value)
    })
  },
  chooseType(e) {
    this.setData({
      typeIndex: Number(e.detail.value)
    })
  },
  chooseDate(e) {
    this.setData({
      date: e.detail.value
    })
  },
  agree(e) {
    this.setData({
      agreed: e.detail.value.includes('yes')
    })
  },
  submit(e) {
    if (this.data.submitting) return;
    this.setData({
      submitting: true,
      error: ''
    });
    const d = this.data.devices[this.data.deviceIndex];
    api.submit(Object.assign({}, e.detail.value, {
      requestKey: this.requestKey,
      deviceId: d && d.id,
      type: this.data.types[this.data.typeIndex],
      date: this.data.date,
      agreed: this.data.agreed
    })).then(row => wx.redirectTo({
      url: '/pages/order/index?id=' + encodeURIComponent(row.id),
      fail: () => {
        this.setData({
          submitting: false,
          error: '申请已保存，可到服务记录中查看。'
        })
      }
    })).catch(err => this.setData({
      error: err.message,
      submitting: false
    }))
  }
});
