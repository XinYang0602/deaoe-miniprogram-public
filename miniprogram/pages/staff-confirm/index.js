const api = require('../../services/api');
Page({
  data: { message: '正在确认当前员工账号…' },
  onLoad(options) {
    const pages = getCurrentPages();
    const source = pages[pages.length - 2];
    if (!source || source.route !== 'pages/staff-workbench/index' || !source.launch || !/^[a-f0-9]{48}$/.test(options.challenge || '')) {
      this.setData({ message: '请从「我的 → 员工工作台」进入' });
      return;
    }
    api.approveWorkbench(source.launch, options.challenge).then(() => wx.navigateBack())
      .catch(error => this.setData({ message: error.message }));
  }
});
