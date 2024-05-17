// const SERVER_URL = 'https://sites.sateraito.jp';
const SERVER_URL = 'https://tambh-dot-sateraito-gpt-api.appspot.com';
const PREFIX_KEY = 'Sateraito-WzNyEGIZoaF7Z1R8';
const MD5_SUFFIX_KEY = '6a8a0a5a5bf94c95aa0f39d0eedbe71e'

function getDateUTCString() {
  let curr_date = new Date();
  let dt_str = curr_date.getUTCFullYear() +
    ('00' + (curr_date.getUTCMonth() + 1)).slice(-2) +
    ('00' + curr_date.getUTCDate()).slice(-2) +
    ('00' + curr_date.getUTCHours()).slice(-2) +
    ('00' + curr_date.getUTCMinutes()).slice(-2);
  return dt_str;
}

function generateToken() {
  var date_str = getDateUTCString();
  return CryptoJS.MD5(PREFIX_KEY + date_str);
}

function generateTokenByTenant(tenant) {
  var date_str = getDateUTCString();
  return CryptoJS.MD5(tenant + date_str);
}

function addParameters(data) {
  if (typeof (data) == "undefined") data = {};
  const params = new URLSearchParams();
  for (let key in data) {
    params.append(key, data[key]);
  }

  //create token
  if (!(params.get('token'))) {
    // var date_str = getDateUTCString();
    // var token = CryptoJS.MD5(PREFIX_KEY + date_str);
    // params.append('token', token);
    var date_str = getDateUTCString();
    var check_key = CryptoJS.MD5(DOMAIN_ADDON_LOGIN + date_str + MD5_SUFFIX_KEY);
    params.append('ck', check_key);
  }

  return params
}

function fetchData(url, data, callback) {
  if (typeof (data) == "undefined") data = {};
  const params = addParameters(data)
  try {
    fetch(url, {
      method: "POST",
      body: params,
    }).then((response) => {
      if (response.status !== 200) {
        callback({ code: 500, msg: response.status, data: {} })
      } else {
        response.json().then(function (data) {
          // console.log(data);
          callback(data)
        });
      }
    }).catch(function (error) {
      // There was an error
      console.error(error);
      callback({ code: 500, msg: error.message, data: {} })
    });
  } catch (err) {
    console.info("ERROR", err);
    callback({ code: 500, msg: err.message, data: {} })
  }
}

function encodeBase64(value) {
  const encodedWord = CryptoJS.enc.Utf8.parse(value);
  const encoded = CryptoJS.enc.Base64.stringify(encodedWord);
  return encoded;
}

function decodeBase64(value) {
  // PROCESS
  const encodedWord = CryptoJS.enc.Base64.parse(value);
  const decoded = CryptoJS.enc.Utf8.stringify(encodedWord);
  return decoded;
}

function getChatAIKey(enc_key) {
  var keys = [];
  if (!enc_key) return '';
  enc_key = decodeBase64(enc_key)
  let temp_keys = enc_key.split("@@");
  if (temp_keys.length > 2) {
    var aes_iv = temp_keys[temp_keys.length - 1];
    var token = temp_keys[temp_keys.length - 2];
    if (token) {
      for (var i = 0; i < temp_keys.length - 2; i++) {
        var sub_key_enc = temp_keys[i];
        var sub_key_dec = deCryptChatAIKey(token, sub_key_enc, aes_iv);
        keys.push(sub_key_dec)
      }
    }
  }

  return keys.join('');
}

function deCryptChatAIKey(token, enc_key, aes_iv) {
  var enc_token = encodeBase64(token)
  var derived_key = CryptoJS.enc.Base64.parse(enc_token)
  var iv = CryptoJS.enc.Utf8.parse(aes_iv);
  var decrypted = CryptoJS.AES.decrypt(enc_key, derived_key, { iv: iv, mode: CryptoJS.mode.CBC }).toString(CryptoJS.enc.Utf8);
  return decrypted
}

function fetchChatGPTAIKey(callback) {
  // return
  var url = SERVER_URL + '/a/extension/chatgpt/aikey';
  var token = generateToken()
  var data = { token: token };
  fetchData(url, data, function (res) {
    if (res) {
      if (res.code == 0) {
        var api_key_dec = ''
        if (typeof (res.data.key) != "undefined") {
          api_key_dec = getChatAIKey(res.data.key);
        }

        var version_ext = ''
        if (typeof (res.data.version) != "undefined") {
          version_ext = res.data.version
        }
        callback(api_key_dec, version_ext)
        return;
      }
    }
    callback()
  })
}

/**
 * Fetch chat gpt setting
 * 
 * @param {string} tenant 
 * @param {Function} callback 
 */
function fetchChatGPTSetting(tenant, callback) {
  var url = SERVER_URL + `/a/${tenant}/addon/email/setting`;
  var token = generateTokenByTenant(tenant);
  var data = { token: token };
  fetchData(url, data, function (res) {
    // console.log(res)
    if (res) {
      if (res.code == 0) {
        callback(res.data);
        return;
      }
    }
    callback();
  });
}

/**
 * Fetch chat GPT add log
 * 
 * @param {string} tenant 
 * @param {object} data 
 * @param {Function} callback 
 */
function fetchChatGPTAddLog(tenant, data, callback) {
  var url = SERVER_URL + `/a/${tenant}/addon/email/addlog`;
  var token = generateTokenByTenant(tenant);
  if (typeof (data) == "undefined") data = {}
  data['token'] = token
  fetchData(url, data, function (res) {
    // console.log(res)
    if (res) {
      if (res.code == 0) {
        callback(res.data);
        return;
      }
    }
    callback();
  });
}

/**
 * Fetch chat GPT count request
 * 
 * @param {string} tenant 
 * @param {object} data 
 * @param {Function} callback 
 */
function fetchChatGPTCountRequest(tenant, data, callback) {
  var url = SERVER_URL + `/a/${tenant}/addon/email/countrequest`;
  var token = generateTokenByTenant(tenant);
  if (typeof (data) == "undefined") data = {}
  data['token'] = token
  fetchData(url, data, function (res) {
    // console.log(res)
    if (res) {
      if (res.code == 0) {
        callback(res.data);
        return;
      }
    }
    callback();
  });
}

function fetchPromptsRequest(tenant, data, callback) {
  var url = SERVER_URL + '/a/' + tenant + '/addon/api/prompt';
  if (typeof (data) == "undefined") data = {}

  if (!('user_id' in data)) {
    data['user_id'] = USER_ADDON_LOGIN
  }

  fetchData(url, data, function (res) {
    console.log(res)
    if (res) {
      if (res.code == 0) {
        callback(res.data);
        return;
      }
    }
    callback();
  });
}