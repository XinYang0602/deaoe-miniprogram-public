const api = require('../../services/api');
Page({
  data: {
    user: null,
    editingAvatar: false,
    agreed: false,
    busy: false,
    error: '',
    welcomeVisible: false,
    welcomeMemberNo: '',
    welcomeTitle: '欢迎加入德澳',
    welcomeNote: '贴心服务，从这里开始',
    welcomeButton: '开启服务',
    welcomeParticles: Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: 5 + (i * 29) % 90,
      delay: (i % 4) * 180,
      top: 8 + (i % 3) * 12
    }))
  },
  onLoad() {
    this.setData({ editingAvatar: api.hasSession() });
    if (api.hasSession()) api.profile().then(user => this.setData({
      user
    })).catch(e => this.setData({
      error: e.message
    }));
  },
  welcome(user) {
    if (!user || !/^DE[0-9]+$/.test(user.memberNo || '')) return false;
    const isNew = user.isNewUser === true;
    this.setData({
      welcomeVisible: true,
      welcomeMemberNo: user.memberNo,
      welcomeTitle: isNew ? '欢迎加入德澳' : '欢迎回来',
      welcomeNote: isNew ? '贴心服务，从这里开始' : '贴心服务，始终相伴',
      welcomeButton: isNew ? '开启服务' : '继续服务'
    });
    return true;
  },
  closeWelcome() {
    this.setData({ welcomeVisible: false, welcomeMemberNo: '' });
  },
  preventWelcomeScroll() {},

  phoneConsent() {
    wx.showToast({
      title: '请先勾选同意服务说明',
      icon: 'none'
    });
  },
  phone(e) {
    if (this.data.busy) return;
    if (!this.data.agreed) {
      this.phoneConsent();
      return;
    }
    const code = e.detail && e.detail.code;
    if (!code) {
      this.setData({
        error: '未获得手机号授权，你仍可使用微信登录'
      });
      return;
    }
    this.setData({
      busy: true,
      error: ''
    });
    let registeredUser;
    return (api.hasSession() ? Promise.resolve() : api.login()).then(user => {
      registeredUser = user;
      return api.bindPhone(code);
    })
      .then(user => {
        this.setData({
          user,
          busy: false
        });
        if (!registeredUser || !this.welcome({ ...registeredUser, ...user, isNewUser: registeredUser.isNewUser === true })) {
          wx.showToast({ title: registeredUser ? '登录成功' : '手机号已绑定' });
        }
      }).catch(e => {
        this.setData({
          busy: false,
          error: e.code === 404 ? '请先安装服务器手机号授权补丁' : e.message
        });
      });
  },
  agree(e) {
    this.setData({
      agreed: e.detail.value.includes('yes')
    });
  },
  privacy(e) {
    const doc = e && e.currentTarget && e.currentTarget.dataset.doc || 'privacy';
    wx.navigateTo({
      url: '/pages/privacy/index?doc=' + doc
    });
  },
  login() {
    if (this.data.busy) return;
    if (!this.data.agreed) {
      wx.showToast({
        title: '请先阅读并同意服务说明',
        icon: 'none'
      });
      return;
    }
    this.setData({
      busy: true,
      error: ''
    });
    let registeredUser;
    return api.login().then(user => {
      registeredUser = user;
      return api.profile();
    }).then(user => {
      this.setData({
        user,
        busy: false
      });
      if (!this.welcome({ ...registeredUser, ...user, isNewUser: registeredUser && registeredUser.isNewUser === true })) {
        wx.showToast({ title: '登录成功', icon: 'success' });
      }
    }).catch(e => this.setData({
      busy: false,
      error: e.message
    }));
  },
  chooseAvatar(e) {
    const path = e.detail.avatarUrl;
    if (!path || this.data.busy) return;
    this.setData({
      busy: true,
      error: ''
    });
    wx.getFileSystemManager().readFile({
      filePath: path,
      encoding: 'base64',
      success: r => {
        if (r.data.length > 350000) {
          this.setData({
            busy: false,
            error: '头像图片过大，请选择较小的图片'
          });
          return;
        }
        api.saveAvatar(r.data).then(user => {
          this.setData({
            user,
            busy: false
          });
          wx.showToast({
            title: '头像已保存'
          });
        }).catch(e => this.setData({
          busy: false,
          error: e.code === 404 ? '请先安装头像服务补丁，再保存头像' : e.message
        }));
      },
      fail: () => this.setData({
        busy: false,
        error: '无法读取头像，请重新选择'
      })
    });
  },
  done() {
    wx.navigateBack({
      delta: 1,
      fail: () => wx.switchTab({
        url: '/pages/my/index'
      })
    });
  }
});
