const api = require('../../services/api');
const config = require('../../config');
Page({
  data: { url: '', message: '正在打开工作台…' },
  onLoad() {
    api.launchWorkbench().then(({ launch }) => {
      this.launch = launch;
      this.setData({ url: config.apiBase.replace(/\/mini$/, '/') + '?staff_entry=' + encodeURIComponent(launch) });
    }).catch(error => this.setData({ message: error.message }));
  },
  loadError() {
    this.setData({ url: '', message: '工作台加载失败，请返回后重试' });
  }
});
