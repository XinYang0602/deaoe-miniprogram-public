Page({
  data: {
    failed: false
  },
  loadError() {
    this.setData({ failed: true });
  },
  retry() {
    this.setData({ failed: false });
  }
});
