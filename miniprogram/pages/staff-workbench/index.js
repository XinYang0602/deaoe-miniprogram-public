const api = require('../../services/api');
const config = require('../../config');
Page({
  data: { url: '', message: '' },
  onLoad() {
    api.launchWorkbench().then(({ launch }) => {
      this.launch = launch;
      this.setData({ url: config.apiBase.replace(/\/mini$/, '/') + '?staff_entry=' + encodeURIComponent(launch) + '&inline=1' });
    }).catch(error => this.setData({ message: error.message }));
  },
  onWebLoad(event) {
    const url = event.detail && event.detail.src;
    const prefix = this.data.url + '&challenge=';
    if (!this.launch || typeof url !== 'string' || !url.startsWith(prefix)) return;
    const challenge = url.slice(prefix.length);
    if (!/^[a-f0-9]{48}$/.test(challenge) || this.confirming === challenge) return;
    this.confirming = challenge;
    // If the client only reports the initial URL, the web page uses the existing confirmation route.
    api.approveWorkbench(this.launch, challenge).catch(() => { this.confirming = ''; });
  },
  loadError() {
    this.setData({ url: '', message: '工作台加载失败，请返回后重试' });
  }
});
