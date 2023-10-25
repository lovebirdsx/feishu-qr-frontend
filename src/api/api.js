import axios from 'axios';
import { message } from 'antd';


axios.interceptors.request.use(config => {
  config = {
    ...config,
    withCredentials: true,
    baseURL: '',
  }
  return config
})

axios.interceptors.response.use(response => {
  return response
})
axios.defaults.baseURL = "http://127.0.0.1";


export async function qr_login() {
  try {
    const appId = process.env.REACT_APP_ID;
    const redirect_uri = `${window.location.origin}/qrLogin`;
    const res = await axios.post('http://127.0.0.1:3000/qrLogin/', {
      loginTime: `${new Date().getTime()}`,
      redirect_uri: redirect_uri,
      url: window.location.href,
    });

    var gotoUrl = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURI(redirect_uri)}&response_type=code&state=success_login`;

    var QRLoginObj = window.QRLogin({
      id: "login_container",
      goto: `${gotoUrl}`,
      style: "width: 300px; height: 300px; margin-left: 3em; border: 0; background-color: #E6F4F3; background-size: cover",
    });

    var handleMessage = function (event) {
      var origin = event.origin;
      if (QRLoginObj.matchOrigin(origin) && window.location.href.indexOf('/qrLogin') > -1) {
        var loginTmpCode = event.data;
        window.location.href = `${gotoUrl}&tmp_code=${loginTmpCode}`;
      }
    };

    if (typeof window.addEventListener !== 'undefined') {
      window.addEventListener('message', handleMessage, false);
    } else if (typeof window.attachEvent !== 'undefined') {
      window.attachEvent('onmessage', handleMessage);
    }

    const { code, tokenInfo, qrUserInfo } = res.data;
    console.log(JSON.stringify(res));
    if (code === 0) {
      message.success(res.data.msg);
      return { tokenInfo, qrUserInfo };
    } else {
      message.info(res.data.msg);
      return false;
    }
  } catch (err) {
    return false;
  }
}
