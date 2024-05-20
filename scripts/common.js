let write_icon = `  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M18.41 5.8L17.2 4.59c-.78-.78-2.05-.78-2.83 0l-2.68 2.68L3 15.96V20h4.04l8.74-8.74 2.63-2.63c.79-.78.79-2.05 0-2.83zM6.21 18H5v-1.21l8.66-8.66 1.21 1.21L6.21 18zM11 20l4-4h6v4H11z" />
                    </svg>`;
let ocr_icon = `    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M18 13v7H4V6h5.02c.05-.71.22-1.38.48-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5l-2-2zm-1.5 5h-11l2.75-3.53 1.96 2.36 2.75-3.54zm2.8-9.11c.44-.7.7-1.51.7-2.39C20 4.01 17.99 2 15.5 2S11 4.01 11 6.5s2.01 4.5 4.49 4.5c.88 0 1.7-.26 2.39-.7L21 13.42 22.42 12 19.3 8.89zM15.5 9C14.12 9 13 7.88 13 6.5S14.12 4 15.5 4 18 5.12 18 6.5 16.88 9 15.5 9z" />
                    </svg>`
let translate_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                    </svg>`
let grammar_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z" />
                    </svg>`

let descriptionIconUrl = chrome.runtime.getURL("icons/description-icon.svg");
let emojiIconUrl = chrome.runtime.getURL("icons/emoji-emotions-icon.svg");
let formatAlignIconUrl = chrome.runtime.getURL("icons/format-align-icon.svg");
let accountCircleIconUrl = chrome.runtime.getURL("icons/account-circle-icon.svg");
let translateIconUrl = chrome.runtime.getURL("icons/translate.svg");
let moreHorizIconUrl = chrome.runtime.getURL("icons/more_horiz.svg");
let minimizeIconUrl = chrome.runtime.getURL("icons/minimize.svg");
let tipsIconUrl = chrome.runtime.getURL("icons/tips_and_updates.svg");
let syncAltIconUrl = chrome.runtime.getURL("icons/sync_alt.svg");
let expandMoreIconUrl = chrome.runtime.getURL("icons/expand_more.svg");

let AddOnEmailSetting = {
  is_domain_registered: false,
  is_not_access_list: false,
  chat_gpt_access_list: "",
  chat_gpt_whitelist: "",
  chatgpt_prohibited_keywords: "",
  is_ip_address_ok: true,
  restricted_rule_address_flag: false,
  restricted_rule_bank_flag: false,
  restricted_rule_email_flag: false,
  restricted_rule_phone_flag: false,
}
/** @define {boolean} デバッグモード */
const DEBUG_MODE = true;

let TAB_ID, WINDOW_ID, ID_USER_ADDON_LOGIN, USER_ADDON_LOGIN, DOMAIN_ADDON_LOGIN = '';

const MAX_VOICE_CONFIG_OPTIONS_SHOW = 1;
const MAX_LENGTH_TEXTAREA_TOKEN = 4000;

const GROUP_PROMPT_LABEL_BG_COLOR = "#2196F3";
const GROUP_PROMPT_LABEL_TEXT_COLOR = "#ffffff";

const UserSetting = {
  language_active: 'japanese'
};

const LIST_TAB = [
  {
    id: 'write_tab',
    name: MyLang.getMsg('TXT_WRITE'),
    icon: write_icon,
    onActive: null
  },
  {
    id: 'ocr_tab',
    name: MyLang.getMsg('TXT_OCR'),
    icon: ocr_icon,
    onActive: null
  },
  {
    id: 'translate_tab',
    name: MyLang.getMsg('TXT_TRANSLATE'),
    icon: translate_icon,
    onActive: null
  },
  {
    id: 'grammar_tab',
    name: MyLang.getMsg('TXT_GRAMMAR'),
    icon: grammar_icon,
    onActive: null
  },
];

const VOICE_SETTING_DATA = [
  {
    name_kind: "formality",
    name: MyLang.getMsg('TXT_FORMAT'),
    icon: descriptionIconUrl,
    options: [
      {
        value: 'email',
        name: MyLang.getMsg('TXT_EMAIL'),
        display: MyLang.getMsg('TXT_EMAIL'),
      },
      {
        value: 'casual',
        name: MyLang.getMsg('TXT_CASUAL'),
        display: MyLang.getMsg('TXT_CASUAL'),
      },
      {
        value: 'neutral',
        name: MyLang.getMsg('TXT_NEUTRAL'),
        display: MyLang.getMsg('TXT_NEUTRAL'),
      },
      {
        value: 'formal',
        name: MyLang.getMsg('TXT_FORMAL'),
        display: MyLang.getMsg('TXT_FORMAL'),
      },
      {
        value: 'paragraph',
        name: MyLang.getMsg('TXT_PARAGRAPH'),
        display: MyLang.getMsg('TXT_PARAGRAPH'),
      },
      {
        value: 'blog post',
        name: MyLang.getMsg('TXT_BLOG_POST'),
        display: MyLang.getMsg('TXT_BLOG_POST'),
      },
      {
        value: 'idea',
        name: MyLang.getMsg('TXT_IDEA'),
        display: MyLang.getMsg('TXT_IDEA'),
      },
      {
        value: 'essay',
        name: MyLang.getMsg('TXT_ESSAY'),
        display: MyLang.getMsg('TXT_ESSAY'),
      },
      {
        value: 'summary',
        name: MyLang.getMsg('TXT_SUMMARY'),
        display: MyLang.getMsg('TXT_SUMMARY'),
      },
      {
        value: 'report',
        name: MyLang.getMsg('TXT_REPORT'),
        display: MyLang.getMsg('TXT_REPORT'),
      },
      {
        value: 'daily report',
        name: MyLang.getMsg('TXT_DAILY_REPORT'),
        display: MyLang.getMsg('TXT_DAILY_REPORT'),
      },
      {
        value: 'todo',
        name: MyLang.getMsg('TXT_TODO'),
        display: MyLang.getMsg('TXT_TODO'),
      },
    ]
  },
  {
    name_kind: "formality_reply",
    name: MyLang.getMsg('TXT_FORMAT'),
    icon: descriptionIconUrl,
    options: [
      {
        value: 'email',
        name: MyLang.getMsg('TXT_EMAIL'),
        display: MyLang.getMsg('TXT_EMAIL'),
      },
      {
        value: 'comment',
        name: MyLang.getMsg('TXT_COMMENT'),
        display: MyLang.getMsg('TXT_COMMENT'),
      },
      {
        value: 'message',
        name: MyLang.getMsg('TXT_MESSAGE'),
        display: MyLang.getMsg('TXT_MESSAGE'),
      },
      {
        value: 'twitter',
        name: MyLang.getMsg('TXT_TWITTER'),
        display: MyLang.getMsg('TXT_TWITTER'),
      },
    ]
  },
  {
    name_kind: "tone",
    name: MyLang.getMsg('TXT_TONE'),
    icon: emojiIconUrl,
    options: [
      {
        value: 'professional',
        display: MyLang.getMsg('TXT_PROFESSIONAL'),
      },
      {
        value: 'friendly',
        display: MyLang.getMsg('TXT_FRIENDLY'),
      },
      {
        value: 'formal',
        display: MyLang.getMsg('TXT_FORMAL'),
      },
      {
        value: 'confident',
        display: MyLang.getMsg('TXT_CONFIDENT'),
      },
      {
        value: 'personable',
        display: MyLang.getMsg('TXT_PERSONABLE'),
      },
      {
        value: 'informational',
        display: MyLang.getMsg('TXT_INFORMATIONAL'),
      },
      {
        value: 'witty',
        display: MyLang.getMsg('TXT_WITTY'),
      },
      {
        value: 'direct',
        display: MyLang.getMsg('TXT_DIRECT'),
      },
      {
        value: 'enthusiastic',
        display: MyLang.getMsg('TXT_ENTHUSIASTIC'),
      },
      {
        value: 'empathetic',
        display: MyLang.getMsg('TXT_EMPATHETIC'),
      },
    ],
  },
  {
    name_kind: "email_length",
    name: MyLang.getMsg('TXT_EMAIL_LENGTH'),
    icon: formatAlignIconUrl,
    options: [
      {
        value: 'short',
        display: MyLang.getMsg('TXT_SHORT'),
      },
      {
        value: 'medium',
        display: MyLang.getMsg('TXT_MEDIUM'),
      },
      {
        value: 'long',
        display: MyLang.getMsg('TXT_LONG'),
      },
    ],
  },
  {
    name_kind: "your_role",
    name: MyLang.getMsg('TXT_YOUR_ROLE'),
    icon: accountCircleIconUrl,
    options: [
      {
        value: ' ',
        display: `---`
      },
      {
        value: 'leader',
        display: MyLang.getMsg('TXT_LEADER'),
      },
      {
        value: 'subordinate',
        display: MyLang.getMsg('TXT_SUBORDINATE'),
      },
      {
        value: 'colleague',
        display: MyLang.getMsg('TXT_COLLEAGUE'),
      },
      {
        value: 'sales representative',
        display: MyLang.getMsg('TXT_SALES_REPRESENTATIVE'),
      },
      {
        value: 'applicant',
        display: MyLang.getMsg('TXT_APPLICANT'),
      },
      {
        value: 'customer service staff',
        display: MyLang.getMsg('TXT_CUSTOMER_SERVICE_STAFF'),
      },
      {
        value: 'project manager',
        display: MyLang.getMsg('TXT_PROJECT_MANAGER'),
      },
      {
        value: 'human resources',
        display: MyLang.getMsg('TXT_HUMAN_RESOURCES'),
      },
    ],
  },
  {
    xtype: 'combobox',
    name_kind: "your_language",
    name: MyLang.getMsg('TXT_LANGUAGE'),
    icon: translateIconUrl,
    options: [
      {
        value: 'japanese',
        display: '日本語',
        sub: MyLang.getMsg('TXT_JAPANESE'),
      },
      {
        value: 'english',
        display: 'English',
        sub: MyLang.getMsg('TXT_ENGLISH'),
      },
      {
        value: 'simplified chinese',
        display: '中文(简体)',
        sub: MyLang.getMsg('TXT_S_CHINESE'),
      },
      {
        value: 'traditional chinese',
        display: '中文(繁體)',
        sub: MyLang.getMsg('TXT_T_CHINESE'),
      },
      {
        value: 'vietnamese',
        display: 'Tiếng Việt',
        sub: MyLang.getMsg('TXT_VIETNAMESE'),
      },
      {
        value: 'korean',
        display: '한국어',
        sub: MyLang.getMsg('TXT_KOREAN'),
      },
    ],
  },
];

const GPT_VERSION_SETTING_DATA = [
  {
    value: 'gpt-3.5-turbo-0125',
    icon: './icons/chatgpt-icon.svg',
    name: 'GPT-3.5 Turbo',
  },
  {
    value: 'gpt-4-turbo',
    icon: './icons/chatgpt-4-icon.svg',
    name: 'GPT-4 Turbo',
  },
  {
    value: 'gemini',
    icon: './icons/google-gemini-icon.svg',
    name: 'Gemini 1.0 Pro',
  },
];

const MyUtils = {

  /**
   * Debug log
   * @param {string} strMsg
   */
  debugLog: (strMsg) => {
    if (DEBUG_MODE === true) {
      console.log(chrome.i18n.getMessage('@@extension_id') + ' ' + (new Date()).toLocaleString() + ':', strMsg);
    }
  },

  encodeBase64: (value) => {
    const encodedWord = CryptoJS.enc.Utf8.parse(value);
    const encoded = CryptoJS.enc.Base64.stringify(encodedWord);
    return encoded;
  },

  decodeBase64: (value) => {
    // PROCESS
    const encodedWord = CryptoJS.enc.Base64.parse(value);
    const decoded = CryptoJS.enc.Utf8.stringify(encodedWord);
    return decoded;
  },

  generateToken: () => {
    let date_str = MyUtils.getDateUTCString();
    return CryptoJS.MD5(PREFIX_KEY + date_str);
  },

  generateTokenByTenant: (tenant) => {
    let date_str = MyUtils.getDateUTCString();
    return CryptoJS.MD5(tenant + date_str);
  },

  getDateUTCString: () => {
    let curr_date = new Date();
    let dt_str = curr_date.getUTCFullYear() +
      ('00' + (curr_date.getUTCMonth() + 1)).slice(-2) +
      ('00' + curr_date.getUTCDate()).slice(-2) +
      ('00' + curr_date.getUTCHours()).slice(-2) +
      ('00' + curr_date.getUTCMinutes()).slice(-2);
    return dt_str;
  },

  /**
   * Render text to element style chat GPT
   * 
   * @param {element} elToRender 
   * @param {string} stringRender 
   * @param {Function} callback 
   */
  renderTextStyleChatGPT: (elToRender, stringRender, callback) => {
    let indexText = 0;
    let timeT = setInterval(() => {
      elToRender.innerHTML += stringRender[indexText];
      indexText++;
      if (indexText >= stringRender.length) {
        clearInterval(timeT);

        if (callback) {
          callback(elToRender);
        }
      }
    }, 5);
  },

  /**
   * Get radom string
   * 
   * @returns {string}
   */
  randomId: () => {
    return Math.random().toString(36).slice(-8);
  },

  isTopOutOfViewport: (elem) => {
    let bounding = elem.getBoundingClientRect();

    let heightTitleWrap = 51;

    return (bounding.top - heightTitleWrap < 0);
  },

  isLeftOutOfViewport: (elem) => {
    let bounding = elem.getBoundingClientRect();
    return (bounding.left < 0);
  },

  isRightSideOutOfViewport: (elem) => {
    let bounding = elem.getBoundingClientRect();

    let widthNavbar = 45;

    if (bounding.right + widthNavbar > (window.innerWidth || document.documentElement.clientWidth)) {
      return true;
    }

    return false;
  },

  isBottomSideOutOfViewport: (elem) => {
    let bounding = elem.getBoundingClientRect();

    if (bounding.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
      return true;
    }
    return false;
  },

};

const _StorageManager = {
  setSecondEmail: (email) => {
    chrome.storage.local.set({ second_email: email });
  },

  setOriginalTextSidePanel: (original_text) => {
    if (original_text) {
      chrome.storage.local.set({ original_text_side_panel: original_text });
    }
  },
  getOriginalTextSidePanel: (callback) => {
    chrome.storage.local.get('original_text_side_panel', payload => {
      callback(payload.original_text_side_panel)
    });
  },
  removeOriginalTextSidePanel: () => {
    chrome.storage.local.remove('original_text_side_panel');
  },

  setGeneralContentReplySidePanel: (general_content_reply, is_direct_send = false) => {
    if (general_content_reply) {
      chrome.storage.local.set({ general_content_reply_side_panel: { general_content_reply, is_direct_send } });
    }
  },
  getGeneralContentReplySidePanel: (callback) => {
    chrome.storage.local.get('general_content_reply_side_panel', payload => {
      callback(payload.general_content_reply_side_panel)
    });
  },
  removeGeneralContentReplySidePanel: () => {
    chrome.storage.local.remove('general_content_reply_side_panel');
  },

  setVoiceConfigWrite: (voiceConfig) => {
    if (voiceConfig) {
      chrome.storage.local.set({ write_voice_config: voiceConfig });
    }
  },
  getVoiceConfigWrite: (callback) => {
    chrome.storage.local.get('write_voice_config', payload => {
      callback(payload.write_voice_config)
    });
  },

  setTitleContentMailToWrite: (id_popup, title, original_text) => {
    let params = null;
    if (id_popup != null) {
      params = { id_popup, title, original_text };
    }

    chrome.storage.local.set({ title_content_mail_to_write: params });
  },
  getTitleContentMailToWrite: (callback) => {
    chrome.storage.local.get('title_content_mail_to_write', payload => {
      callback(payload.title_content_mail_to_write)
    });
  },

  setCloseSidePanel: (id_popup, is_close, callback) => {
    chrome.storage.local.set({ trigger_close_side_panel: { is_close, id_popup } }, () => {
      if (callback) {
        callback();
      }
    });
  },
  triggerClearSidePanel: (id_popup, callback) => {
    chrome.storage.local.set({ trigger_clear_side_panel: { id_popup } }, () => {
      if (callback) {
        callback();
      }
    });
  },

  toggleSidePromptBuilder: () => {
    chrome.storage.local.set({ toggle_side_prompt_builder: { is_open: Math.random() } });
  },
  removeToggleSidePromptBuilder: () => {
    chrome.storage.local.remove('toggle_side_prompt_builder');
  },
};

const _OpenAIManager = {
  chat_gpt_api_key: '',

  /**
   * Get properties in gpt record by gpt version
   * 
   * @param {string} keyGet 
   * @param {string} gptVersion 
   * @returns string
   */
  getPropGptByVersion: (keyGet, gptVersion) => {
    for (let i = 0; i < GPT_VERSION_SETTING_DATA.length; i++) {
      const element = GPT_VERSION_SETTING_DATA[i];

      if (element.value == gptVersion) {
        return element[keyGet];
      }
    }
  },

  /**
 * Get key api Open AI
 * 
 * @param {Function} callback 
 */
  getOpenAIKey: (callback) => {
    const self = _OpenAIManager;

    if (!self.chat_gpt_api_key) {
      fetchChatGPTAIKey(function (api_key, version_ext) {
        if (api_key) {
          self.chat_gpt_api_key = api_key;
          callback(api_key)
          return;
        }
        //fail
        callback()
      });
    } else {
      // exist key
      callback(self.chat_gpt_api_key)
    }
  }
};

const SateraitoRequest = {
  SERVER_URL: 'https://tambh-dot-sateraito-gpt-api.appspot.com',
  PREFIX_KEY: 'Sateraito-WzNyEGIZoaF7Z1R8',
  MD5_SUFFIX_KEY: '6a8a0a5a5bf94c95aa0f39d0eedbe71e',

  addParameters: (data) => {
    const self = SateraitoRequest;

    if (typeof (data) == "undefined") data = {};
    const params = new URLSearchParams();
    for (let key in data) {
      params.append(key, data[key]);
    }

    //create token
    if (!(params.get('token'))) {
      let date_str = MyUtils.getDateUTCString();
      let check_key = CryptoJS.MD5(DOMAIN_ADDON_LOGIN + date_str + self.MD5_SUFFIX_KEY);
      params.append('ck', check_key);
    }

    return params
  },

  deCryptChatAIKey: (token, enc_key, aes_iv) => {
    const self = SateraitoRequest;

    let enc_token = MyUtils.encodeBase64(token)
    let derived_key = CryptoJS.enc.Base64.parse(enc_token)
    let iv = CryptoJS.enc.Utf8.parse(aes_iv);
    let decrypted = CryptoJS.AES.decrypt(enc_key, derived_key, { iv: iv, mode: CryptoJS.mode.CBC }).toString(CryptoJS.enc.Utf8);

    return decrypted
  },

  getChatAIKey: (enc_key) => {
    const self = SateraitoRequest;

    let keys = [];
    if (!enc_key) return '';
    enc_key = MyUtils.decodeBase64(enc_key)
    let temp_keys = enc_key.split("@@");
    if (temp_keys.length > 2) {
      let aes_iv = temp_keys[temp_keys.length - 1];
      let token = temp_keys[temp_keys.length - 2];
      if (token) {
        for (let i = 0; i < temp_keys.length - 2; i++) {
          let sub_key_enc = temp_keys[i];
          let sub_key_dec = deCryptChatAIKey(token, sub_key_enc, aes_iv);
          keys.push(sub_key_dec)
        }
      }
    }

    return keys.join('');
  },

  fetchData: (url, data, callback) => {
    const self = SateraitoRequest;

    if (typeof (data) == "undefined") data = {};

    const params = self.addParameters(data);

    try {
      fetch(url, {
        method: "POST",
        body: params,
      }).then((response) => {
        if (response.status !== 200) {
          callback({ code: 500, msg: response.status, data: {} })
        } else {
          response.json().then(function (data) {
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
  },

  fetchChatGPTAIKey: (callback) => {
    const self = SateraitoRequest;

    let url = `${self.SERVER_URL}/a/extension/chatgpt/aikey`;
    let token = MyUtils.generateToken();
    let data = { token: token };

    self.fetchData(url, data, function (res) {
      if (res) {
        if (res.code == 0) {
          let api_key_dec = ''
          if (typeof (res.data.key) != "undefined") {
            api_key_dec = self.getChatAIKey(res.data.key);
          }

          let version_ext = ''
          if (typeof (res.data.version) != "undefined") {
            version_ext = res.data.version
          }

          callback(api_key_dec, version_ext)
          return;
        }
      }

      callback()
    })
  },

  fetchChatGPTSetting: (tenant, callback) => {
    const self = SateraitoRequest;

    let url = `${self.SERVER_URL}/a/${tenant}/addon/email/setting`;
    let token = MyUtils.generateTokenByTenant(tenant);
    let data = { token: token };

    self.fetchData(url, data, function (res) {
      if (res) {
        if (res.code == 0) {
          callback(res.data);
          return;
        }
      }

      callback();
    });
  },

  fetchChatGPTAddLog: (tenant, data, callback) => {
    const self = SateraitoRequest;

    let url = `${self.SERVER_URL}/a/${tenant}/addon/email/addlog`;
    let token = MyUtils.generateTokenByTenant(tenant);
    if (typeof (data) == "undefined") data = {};

    data['token'] = token
    self.fetchData(url, data, function (res) {
      if (res) {
        if (res.code == 0) {
          callback(res.data);
          return;
        }
      }

      callback();
    });
  },

  fetchChatGPTCountRequest: (tenant, data, callback) => {
    const self = SateraitoRequest;

    let url = `${self.SERVER_URL}/a/${tenant}/addon/email/countrequest`;
    let token = MyUtils.generateTokenByTenant(tenant);
    if (typeof (data) == "undefined") data = {};

    data['token'] = token
    self.fetchData(url, data, function (res) {
      if (res) {
        if (res.code == 0) {
          callback(res.data);
          return;
        }
      }

      callback();
    });
  },

  fetchPromptsRequest: (tenant, data, callback) => {
    const self = SateraitoRequest;

    let url = `${self.SERVER_URL}/a/${tenant}/addon/api/prompt`;
    if (typeof (data) == "undefined") data = {}

    if (!('user_id' in data)) {
      data['user_id'] = USER_ADDON_LOGIN
    }

    self.fetchData(url, data, function (res) {
      if (res) {
        if (res.code == 0) {
          callback(res.data);
          return;
        }
      }

      callback();
    });
  }
}