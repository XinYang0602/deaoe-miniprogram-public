const api = require('./services/api');
App({
  onLaunch() {
    this._checkInitialWorkbench = true;
  },
  onShow() {
    const initial = this._checkInitialWorkbench;
    this._checkInitialWorkbench = false;
    if (!api.hasSession()) return;
    api.profile().then(user => {
      if (!initial || user.staffWorkbench !== true ||
          wx.getStorageSync('workbench-auto-' + user.id) !== true) return;
      const pages = getCurrentPages();
      if (pages.some(page => page.route === 'pages/staff-workbench/index')) return;
      wx.navigateTo({ url: '/pages/staff-workbench/index' });
    }).catch(() => {});
  },
  globalData: {
    mode: 'live'
  }
});
