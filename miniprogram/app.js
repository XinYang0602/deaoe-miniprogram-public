const api = require('./services/api');
App({
  onShow() {
    if (api.hasSession()) api.profile().catch(() => {});
  },
  globalData: {
    mode: 'live'
  }
});
