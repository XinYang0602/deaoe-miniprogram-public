const api = require('../../services/api');
Page({
  data: {
    user: null,
    loading: false,
    logging: false,
    error: '',
    displayName: ''
  },
  onLoad() {
    const user = api.cachedUser();
    if (user) this.preloadUser(user);
  },
  preloadUser(user, ready) {
    this._refreshId = (this._refreshId || 0) + 1;
    const phone = user.phone || '';
    this.setData({
      user,
      displayName: user.nickname || (phone ? phone.slice(-4) : '德澳用户'),
      loading: false,
      error: ''
    }, ready);
  },
  onShow() {
    this.refresh();
  },
  refresh() {
    const run = (this._refreshId || 0) + 1;
    this._refreshId = run;
    if (!api.hasSession()) {
      this.setData({
        user: null,
        error: '',
        loading: false,
        displayName: ''
      });
      return Promise.resolve();
    }
    const cached = api.cachedUser();
    if (cached) {
      const phone = cached.phone || '';
      this.setData({ user: cached, displayName: cached.nickname || (phone ? phone.slice(-4) : '德澳用户') });
    }
    this.setData({
      loading: !cached,
      error: ''
    });
    return api.profile().then(user => {
      if (run !== this._refreshId) return null;
      const phone = user.phone || '';
      this.setData({
        user,
        displayName: user.nickname || (phone ? phone.slice(-4) : '德澳用户'),
        loading: false
      });
    }).catch(e => {
      if (run !== this._refreshId) return;
      this.setData({
        error: e.message,
        loading: false,
        ...(!api.hasSession() ? {
          user: null,
          displayName: ''
        } : {})
      });
    });
  },
  openLogin() {
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },
  requireLogin() {
    if (!this.data.user) {
      this.openLogin();
      return false;
    }
    return true;
  },
  copy() {
    if (this.requireLogin()) wx.setClipboardData({
      data: this.data.user.memberNo || this.data.user.id
    });
  },
  privacy() {
    wx.navigateTo({
      url: '/pages/privacy/index'
    });
  },
  binding() {
    if (!this.requireLogin()) return;
    wx.showModal({
      title: '设备登记与保修',
      content: '安装完成后，可从首页扫描机身二维码。厂家码登记目前准备中，尚不会自动生成保修卡；现阶段请将会员号提供给购买门店，核实后绑定。',
      confirmText: '复制编号',
      success: r => {
        if (r.confirm) this.copy();
      }
    });
  },
  logout() {
    if (this.data.logging) return;
    wx.showModal({
      title: '退出登录',
      content: '退出后需要重新微信登录才能查看设备和服务记录。',
      confirmColor: '#c84039',
      success: r => {
        if (!r.confirm) return;
        this._refreshId = (this._refreshId || 0) + 1;
        this.setData({
          logging: true
        });
        api.logout().then(() => {
          this.setData({
            logging: false
          });
          this.refresh();
        }).catch(e => {
          this.setData({
            logging: false,
            error: e.message
          });
          if (!api.hasSession()) this.refresh();
        });
      }
    });
  }
});
