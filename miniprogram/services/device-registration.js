// Manufacturer format and verification endpoint will be supplied later.
// Never treat an arbitrary QR payload or a shared product URL as ownership proof.
const policy = {
  enabled: false,
  warrantyStart: 'registration_date',
  timezone: 'Asia/Shanghai'
};

function inspect(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return {
    ready: false,
    recognized: false,
    message: '未识别到二维码内容，请重新扫描机身二维码。'
  };
  const content = raw.trim().replace(/[\u0000-\u001f\u007f]/g, ' ');
  const preview = content.length > 160 ? content.slice(0, 160) + '…' : content;
  return {
    ready: false,
    recognized: true,
    message: '已读取二维码：\n' + preview + '\n\n当前仅完成识别，尚未绑定设备或开通保修。请联系购机门店核验并登记。'
  };
}
module.exports = {
  policy,
  inspect
};
