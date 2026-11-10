const registration = require('./device-registration');

// Native WeChat scanner owns the camera lifecycle and its system authorization UI.
// A decoded payload is not proof of device ownership. Never open or upload it here.
function scan(page) {
  if (page.data.scanning) return;
  page.setData({ scanning: true });
  const release = () => page.setData({ scanning: false });
  const failure = error => {
    const message = String(error && error.errMsg || '');
    if (/cancel/i.test(message)) return;
    const denied = /auth|permission|denied|authorize/i.test(message);
    wx.showModal({
      title: denied ? '需要相机权限' : '暂时无法扫码',
      content: denied
        ? '请在手机系统设置中允许微信使用相机，然后返回小程序重新点击扫一扫。'
        : '请在手机微信中打开小程序，检查相机是否可用后重试。开发者工具的模拟扫码不能代替真机相机测试。',
      showCancel: false,
      confirmText: '知道了'
    });
  };
  try {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: response => {
        const result = registration.inspect(response.result);
        wx.showModal({
          title: result.recognized ? '二维码识别成功' : '未识别到内容',
          content: result.message,
          showCancel: false,
          confirmText: '知道了'
        });
      },
      fail: failure,
      complete: release
    });
  } catch (error) {
    release();
    failure(error);
  }
}

module.exports = { scan };
