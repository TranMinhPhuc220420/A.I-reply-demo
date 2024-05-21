/** start - VALUE CONSTANT AND GLOBAL */
let write_icon = `  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M18.41 5.8L17.2 4.59c-.78-.78-2.05-.78-2.83 0l-2.68 2.68L3 15.96V20h4.04l8.74-8.74 2.63-2.63c.79-.78.79-2.05 0-2.83zM6.21 18H5v-1.21l8.66-8.66 1.21 1.21L6.21 18zM11 20l4-4h6v4H11z" />
                    </svg>`;
let ocr_icon = `    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M18 13v7H4V6h5.02c.05-.71.22-1.38.48-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5l-2-2zm-1.5 5h-11l2.75-3.53 1.96 2.36 2.75-3.54zm2.8-9.11c.44-.7.7-1.51.7-2.39C20 4.01 17.99 2 15.5 2S11 4.01 11 6.5s2.01 4.5 4.49 4.5c.88 0 1.7-.26 2.39-.7L21 13.42 22.42 12 19.3 8.89zM15.5 9C14.12 9 13 7.88 13 6.5S14.12 4 15.5 4 18 5.12 18 6.5 16.88 9 15.5 9z" />
                    </svg>`;
let translate_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                    </svg>`;
let grammar_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z" />
                    </svg>`;
let content_paste_icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M0 0h24v24H0z" fill="none"/>
                            <path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/>
                          </svg>`;
let tips_and_update_icon = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368">
                            <rect fill="none" height="24" width="24" y="0"/>
                            <path d="M7,20h4c0,1.1-0.9,2-2,2S7,21.1,7,20z M5,19h8v-2H5V19z M16.5,9.5c0,3.82-2.66,5.86-3.77,6.5H5.27 C4.16,15.36,1.5,13.32,1.5,9.5C1.5,5.36,4.86,2,9,2S16.5,5.36,16.5,9.5z M21.37,7.37L20,8l1.37,0.63L22,10l0.63-1.37L24,8 l-1.37-0.63L22,6L21.37,7.37z M19,6l0.94-2.06L22,3l-2.06-0.94L19,0l-0.94,2.06L16,3l2.06,0.94L19,6z"/>
                          </svg>`;

let descriptionIconUrl = chrome.runtime.getURL("icons/description-icon.svg");
let emojiIconUrl = chrome.runtime.getURL("icons/emoji-emotions-icon.svg");
let formatAlignIconUrl = chrome.runtime.getURL("icons/format-align-icon.svg");
let accountCircleIconUrl = chrome.runtime.getURL("icons/account-circle-icon.svg");
let translateIconUrl = chrome.runtime.getURL("icons/translate.svg");
let moreHorizIconUrl = chrome.runtime.getURL("icons/more_horiz.svg");
let minimizeIconUrl = chrome.runtime.getURL("icons/minimize.svg");
// let tipsIconUrl = chrome.runtime.getURL("icons/tips_and_updates.svg");
let tipsIconUrl = chrome.runtime.getURL("icons/tips_and_updates_2.svg");
let syncAltIconUrl = chrome.runtime.getURL("icons/sync_alt.svg");
let expandMoreIconUrl = chrome.runtime.getURL("icons/expand_more.svg");

let TAB_ID, WINDOW_ID, ID_USER_ADDON_LOGIN, USER_ADDON_LOGIN, DOMAIN_ADDON_LOGIN = '';

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
};

const DEBUG_MODE = true;

const MAX_VOICE_CONFIG_OPTIONS_SHOW = 1;
const MAX_LENGTH_TEXTAREA_TOKEN = 4000;

const GROUP_PROMPT_LABEL_BG_COLOR = "#2196F3";
const GROUP_PROMPT_LABEL_TEXT_COLOR = "#ffffff";

const SERVER_URL = 'https://tambh-dot-sateraito-gpt-api.appspot.com';
const PREFIX_KEY = 'Sateraito-WzNyEGIZoaF7Z1R8';
const MD5_SUFFIX_KEY = '6a8a0a5a5bf94c95aa0f39d0eedbe71e';

const TIMEOUT_FETCH = 60000;
const CHAT_GPT_VERSION = "gpt-3.5-turbo-0125";
const RETRY_CALL_GPT = true;

const SKIN_BACKGROUND_COLOR_DEFAULT = { name: 'dark-light', val: '#293039' };
const SKIN_TEXT_COLOR_DEFAULT = { name: 'white', val: '#ffffff' };
const SKIN_BACKGROUND_COLOR_LOCALSTORAGE_KEY = 'Sateraito_AI_Register_Skin_Background_Color_LS_Key';
const SKIN_TEXT_COLOR_LOCALSTORAGE_KEY = 'Sateraito_AI_Register_Skin_Text_Color_LS_Key';

const EMPTY_KEY = 'sateraito_key_empty_293039';

const UserSetting = {
  language_active: 'japanese'
};

/** end - VALUE CONSTANT AND GLOBAL */


/** start - DATA DEFAULT */

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
        value: ' ',
        display: `---`
      },
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
        value: ' ',
        display: `---`
      },
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
        value: ' ',
        display: `---`
      },
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
        value: ' ',
        display: `---`
      },
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
        value: ' ',
        display: `---`
      },
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

/** end - DATA DEFAULT */


/**
 * My Utils
 * 
 */
const MyUtils = {
  flagHasSetCloseSidePanel: false,
  flagHasSetClearSidePanel: false,

  /**
   * Debug log
   * @param {string} strMsg
   */
  debugLog: (strMsg) => {
    if (DEBUG_MODE === true) {
      console.log(chrome.i18n.getMessage('@@extension_id') + ' ' + (new Date()).toLocaleString() + ':', strMsg);
    }
  },

  /**
   * encodeBase64
   * 
   * @param {string} value 
   * @returns {string}
   */
  encodeBase64: (value) => {
    const encodedWord = CryptoJS.enc.Utf8.parse(value);
    const encoded = CryptoJS.enc.Base64.stringify(encodedWord);
    return encoded;
  },

  /**
   * decodeBase64
   * 
   * @param {string} value 
   * @returns {string}
   */
  decodeBase64: (value) => {
    // PROCESS
    const encodedWord = CryptoJS.enc.Base64.parse(value);
    const decoded = CryptoJS.enc.Utf8.stringify(encodedWord);
    return decoded;
  },

  /**
   * generateToken
   * 
   * @returns {string}
   */
  generateToken: () => {
    let date_str = MyUtils.getDateUTCString();
    return CryptoJS.MD5(PREFIX_KEY + date_str);
  },

  /**
   * generateTokenByTenant
   * 
   * @param {string} tenant 
   * @returns {string}
   */
  generateTokenByTenant: (tenant) => {
    let date_str = MyUtils.getDateUTCString();
    return CryptoJS.MD5(tenant + date_str);
  },

  /**
   * getDateUTCString
   * 
   * @returns {string}
   */
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

  /**
   * isTopOutOfViewport
   * 
   * @param {Element} elem 
   * @returns {boolean}
   */
  isTopOutOfViewport: (elem) => {
    let bounding = elem.getBoundingClientRect();

    let heightTitleWrap = 51;

    return (bounding.top - heightTitleWrap < 0);
  },

  /**
   * isLeftOutOfViewport
   * 
   * @param {Element} elem 
   * @returns {boolean}
   */
  isLeftOutOfViewport: (elem) => {
    let bounding = elem.getBoundingClientRect();
    return (bounding.left < 0);
  },

  /**
   * isRightSideOutOfViewport
   * 
   * @param {Element} elem 
   * @returns {boolean}
   */
  isRightSideOutOfViewport: (elem) => {
    let bounding = elem.getBoundingClientRect();

    let widthNavbar = 45;

    if (bounding.right + widthNavbar > (window.innerWidth || document.documentElement.clientWidth)) {
      return true;
    }

    return false;
  },

  /**
   * isBottomSideOutOfViewport
   * 
   * @param {Element} elem 
   * @returns {boolean}
   */
  isBottomSideOutOfViewport: (elem) => {
    let bounding = elem.getBoundingClientRect();

    if (bounding.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
      return true;
    }
    return false;
  },

  /**
   * Get new id popup
   * 
   * @returns {string}
   */
  getNewIdPopup: () => {
    const self = MyUtils;

    let idNew = self.randomId();

    if ($(`#${idNew}`).length == 0) {
      return idNew;
    }

    return self.getNewIdPopup();
  },

  /**
   * setOpenSidePanel
   * 
   */
  setOpenSidePanel: () => {
    const self = MyUtils;

    // open side panel when action for compose
    chrome.runtime.sendMessage({
      method: 'open_side_panel',
    })
  },

  /**
   * setCloseSidePanel
   * 
   * @param {string} idTarget 
   */
  setCloseSidePanel: (idTarget) => {
    const self = MyUtils;

    if (self.flagHasSetCloseSidePanel) return;
    self.debugLog('setCloseSidePanel');

    self.flagHasSetCloseSidePanel = true;
    StorageManager.setCloseSidePanel(idTarget, true, () => {
      self.flagHasSetCloseSidePanel = false;
    });
  },

  /**
   * setClearSidePanel
   * 
   * @param {string} idTarget 
   */
  setClearSidePanel: (idTarget) => {
    const self = MyUtils;

    if (self.flagHasSetClearSidePanel) return;
    MyUtils.debugLog('setClearSidePanel');

    self.flagHasSetClearSidePanel = true;
    StorageManager.triggerClearSidePanel(idTarget, () => {
      self.flagHasSetClearSidePanel = false;
    });
  },

  /**
   * checkUseExtension
   * 
   * @returns {boolean}
   */
  checkUseExtension: () => {
    const self = MyUtils;
    var is_ok = true

    if (!AddOnEmailSetting.is_ip_address_ok || AddOnEmailSetting.is_not_access_list) is_ok = false;

    if (is_ok) {
      if (!AddOnEmailSetting.is_domain_registered) {
        self.debugLog('Domain register not yet')
        return false;
      } else {
        self.debugLog('Domain registered')
        return true;
      }
    } else {
      self.debugLog('Extension deny')
      return false;
    }
  },

  /**
   * Get content by role in message
   * 
   * @param {string} role 
   * @param {Array} messages 
   * @returns {string}
   */
  getContentByRoleInMessage: (role, messages) => {
    const self = MyUtils;

    let content_all = '';
    for (let i = 0; i < messages.length; i++) {
      const item = messages[i];

      if (item.role == role) {
        content_all += item.content + '\n\n';
      }
    }

    return content_all;
  },

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
   * Check chat gpt access list
   * 
   * @param {*} accesslist_str 
   * @returns {boolean}
   */
  checkChatGptAccessList: (access_list_str) => {
    const self = MyUtils;

    var is_allow = true, is_not_access_list = false

    if (USER_ADDON_LOGIN && access_list_str) {
      is_allow = false
      var access_list = access_list_str.split(';')
      for (var i in access_list) {
        var user_email = access_list[i].trim()
        if (USER_ADDON_LOGIN == user_email) {
          is_allow = true;
          break;
        }
      }
    }

    if (!is_allow) is_not_access_list = true;
    return is_not_access_list
  },

  parseJsonStrToOject: (json_str) => {
    if (!json_str) return null;
    try {
      return JSON.parse(json_str);
    } catch (e) {
      return null;
    }
  },

  loadSkinColor: (callback) => {
    const self = MyUtils;

    try {
      var bg_color_str = '';
      var text_color_str = '';
      chrome.storage.local.get([SKIN_BACKGROUND_COLOR_LOCALSTORAGE_KEY, SKIN_TEXT_COLOR_LOCALSTORAGE_KEY], function (items) {
        if (typeof (items[SKIN_BACKGROUND_COLOR_LOCALSTORAGE_KEY]) != 'undefined') {
          bg_color_str = items[SKIN_BACKGROUND_COLOR_LOCALSTORAGE_KEY];
        }

        if (typeof (items[SKIN_TEXT_COLOR_LOCALSTORAGE_KEY]) != 'undefined') {
          text_color_str = items[SKIN_TEXT_COLOR_LOCALSTORAGE_KEY];
        }

        var bg_color = null;
        var text_color = null;
        if (bg_color_str) {
          bg_color = self.parseJsonStrToOject(bg_color_str)
        }
        if (text_color_str) {
          text_color = self.parseJsonStrToOject(text_color_str)
        }
        if (bg_color == null) bg_color = SKIN_BACKGROUND_COLOR_DEFAULT;
        if (text_color == null) text_color = SKIN_TEXT_COLOR_DEFAULT;

        callback(bg_color, text_color)
      });
    } catch (e) {
      callback(SKIN_BACKGROUND_COLOR_DEFAULT, SKIN_TEXT_COLOR_DEFAULT)
    }
  },

  loadSkin: () => {
    const self = MyUtils;

    self.loadSkinColor(function (bg_color, text_color) {
      if (bg_color.val === '#293039') {
        $('body').addClass('default-skin')
      }

      var css = ':root{--base-addon-color:' + bg_color.val + ';--base-text-color:' + text_color.val + '}',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

      style.id = 'sateratio_style_css';

      head.appendChild(style);

      style.type = 'text/css';
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    });
  }
};

/**
 * _Storage Manager
 * 
 */
const StorageManager = {
  setSecondEmail: (email) => {
    chrome.storage.local.set({ second_email: email });
  },

  setOriginalTextSidePanel: (original_text) => {
    // if (original_text) {
    chrome.storage.local.set({ original_text_side_panel: original_text });
    // }
  },
  getOriginalTextSidePanel: (callback) => {
    chrome.storage.local.get('original_text_side_panel', payload => {
      callback(payload.original_text_side_panel)
    });
  },
  removeOriginalTextSidePanel: () => {
    chrome.storage.local.remove('original_text_side_panel');
  },

  setGeneralContentReplySidePanel: (general_content_reply, is_direct_send = false, is_prompt_sateraito = false) => {
    if (general_content_reply) {
      chrome.storage.local.set({ general_content_reply_side_panel: { general_content_reply, is_direct_send, is_prompt_sateraito } });
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

/**
 * Sateraito Request
 * 
 */
const SateraitoRequest = {

  /**
   * Add parameters
   * 
   * @param {object} data 
   * @returns {URLSearchParams}
   */
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
      let check_key = CryptoJS.MD5(DOMAIN_ADDON_LOGIN + date_str + MD5_SUFFIX_KEY);
      params.append('ck', check_key);
    }

    return params
  },

  /**
   * deCryptChatAIKey
   * 
   * @param {string} token 
   * @param {string} enc_key 
   * @param {string} aes_iv 
   * @returns {string}
   */
  deCryptChatAIKey: (token, enc_key, aes_iv) => {
    const self = SateraitoRequest;

    let enc_token = MyUtils.encodeBase64(token)
    let derived_key = CryptoJS.enc.Base64.parse(enc_token)
    let iv = CryptoJS.enc.Utf8.parse(aes_iv);
    let decrypted = CryptoJS.AES.decrypt(enc_key, derived_key, { iv: iv, mode: CryptoJS.mode.CBC }).toString(CryptoJS.enc.Utf8);

    return decrypted
  },

  /**
   * Get OpenAI api key
   * 
   * @param {string} enc_key 
   * @returns {string}
   */
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
          let sub_key_dec = self.deCryptChatAIKey(token, sub_key_enc, aes_iv);
          keys.push(sub_key_dec)
        }
      }
    }

    return keys.join('');
  },

  /**
   * Fetch data
   * 
   * @param {string} url 
   * @param {URLSearchParams} data 
   * @param {Function} callback 
   */
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

  /**
   * Get open ai api key request
   * 
   * @param {Function} callback 
   */
  fetchAPIOpenAIKeyRequest: (callback) => {
    const self = SateraitoRequest;

    let url = `${SERVER_URL}/a/extension/chatgpt/aikey`;
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

  /**
   * _fetchAddOnSettingRequest
   * 
   * @param {string} tenant 
   * @param {Function} callback 
   */
  _fetchAddOnSettingRequest: (tenant, callback) => {
    const self = SateraitoRequest;

    let url = `${SERVER_URL}/a/${tenant}/addon/email/setting`;
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

  /**
   * Load add on setingg
   * 
   * @param {string} email 
   * @param {Function} callback 
   */
  loadAddOnSetting: (email, callback) => {
    const self = SateraitoRequest;

    //check domain
    if (email) {
      USER_ADDON_LOGIN = email
      const suffix = email.match(/.+@(.+)/);
      if (suffix) {
        DOMAIN_ADDON_LOGIN = suffix.pop();
      }
    }

    MyUtils.debugLog(`domain login: ${DOMAIN_ADDON_LOGIN}`)
    if (USER_ADDON_LOGIN) {
      self._fetchAddOnSettingRequest(DOMAIN_ADDON_LOGIN, function (data) {
        AddOnEmailSetting = data;

        if ('is_domain_regist' in data) {
          AddOnEmailSetting.is_domain_registered = data['is_domain_regist'];
        }

        if ('chat_gpt_accesslist' in data) {
          AddOnEmailSetting.is_not_access_list = MyUtils.checkChatGptAccessList(data['chat_gpt_accesslist']);
        }

        callback(true);
      });
    } else {
      //user undefined
      callback(false);
    }
  },

  /**
   * fetchOpenAIAddLogRequest
   * 
   * @param {string} tenant 
   * @param {object|null} data 
   * @param {Function} callback 
   */
  fetchOpenAIAddLogRequest: (tenant, data, callback) => {
    const self = SateraitoRequest;

    let url = `${SERVER_URL}/a/${tenant}/addon/email/addlog`;
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

  /**
   * fetchOpenAICountRequest
   * 
   * @param {string} tenant 
   * @param {object|null} data 
   * @param {Function} callback 
   */
  fetchOpenAICountRequest: (tenant, data, callback) => {
    const self = SateraitoRequest;

    let url = `${SERVER_URL}/a/${tenant}/addon/email/countrequest`;
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

  /**
   * fetchPromptsRequest
   * 
   * @param {string} tenant 
   * @param {object|null} data 
   * @param {Function} callback 
   */
  _fetchPromptsRequest: (tenant, data, callback) => {
    const self = SateraitoRequest;

    let url = `${SERVER_URL}/a/${tenant}/addon/api/prompt`;
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
  },

  /**
   * get prompts request
   * 
   * @param {object} params 
   * @param {Function} callback 
   * @param {Number|null} retry 
   */
  getPrompts: async (params, callback, retry) => {
    const self = SateraitoRequest;

    if (!AddOnEmailSetting.is_domain_registered) return

    if (DOMAIN_ADDON_LOGIN) {
      self._fetchPromptsRequest(DOMAIN_ADDON_LOGIN, params, function (res) {
        callback(res)
      })
    }
  },
};

/**
 * Open AI Manager
 * 
 */
const OpenAIManager = {
  chat_gpt_api_key: '',

  /**
   * Save log
   * 
   * @param {string} question 
   * @param {string} answer 
   * @param {string} type_chat 
   * @param {string} error 
   */
  saveLog: (question, answer, type_chat, error = '') => {
    const self = OpenAIManager;

    //save log
    var data = {
      user_id: USER_ADDON_LOGIN,
      question: question,
      answer: answer,
      // answer_html: '',
      model: CHAT_GPT_VERSION,
      error_info: error,
      memo: type_chat,
      environment_type: type_chat,
      // options: options,
    }
    if (DOMAIN_ADDON_LOGIN) {
      SateraitoRequest.fetchOpenAIAddLogRequest(DOMAIN_ADDON_LOGIN, data, function (res) {
        MyUtils.debugLog(res)
      })
    }
  },

  /**
   * Save count request
   * 
   * @param {string} prompt 
   * @param {string} error 
   */
  saveCount: async (prompt, error = '') => {
    const self = OpenAIManager;
    if (!AddOnEmailSetting.is_domain_registered) return

    var data = {
      user_id: USER_ADDON_LOGIN,
      prompt: prompt,
      model: CHAT_GPT_VERSION,
      error_info: error,
    }
    if (DOMAIN_ADDON_LOGIN) {
      SateraitoRequest.fetchOpenAICountRequest(DOMAIN_ADDON_LOGIN, data, function (res) {
        MyUtils.debugLog(res)
      })
    }
  },

  /**
   * Call GPT request to api.openai.com
   * 
   * @param {string} key_api 
   * @param {string|Array<string>} prompt_or_messages 
   * @param {string} gpt_model 
   * @param {boolean} return_fetch 
   * @param {string} role 
   * @param {object} response_format 
   * @returns 
   */
  callGPTRequest: async (key_api, prompt_or_messages = null, gpt_model = false, return_fetch = false, role = false, response_format = null) => {
    const self = OpenAIManager;

    let model = CHAT_GPT_VERSION
    if (gpt_model) model = gpt_model

    let url = "https://api.openai.com/v1/chat/completions"

    // call chatGPT    
    var myHeaders = new Headers();
    try {
      myHeaders.append("Authorization", "Bearer " + key_api);
      myHeaders.append("Content-Type", "application/json");
    } catch (err) {
      MyUtils.debugLog(err)
      return false
    }

    const payload = {
      model: model,
      // messages: ?,
      temperature: 1,
      // response_format: ?
    }

    if (typeof (prompt_or_messages) == 'string') {
      prompt_or_messages = [
        {
          "role": role ? role : "system",
          "content": prompt_or_messages
        }
      ]
    }
    payload.messages = prompt_or_messages;

    if (response_format) {
      payload.response_format = response_format;
    }

    const signal = AbortSignal.timeout(TIMEOUT_FETCH)
    const options = {
      method: "post",
      headers: myHeaders,
      body: JSON.stringify(payload),
      signal: signal
    }

    if (return_fetch) return fetch(url, options);

    try {
      let response = await fetch(url, options);
      let posts = await response.json();
      if (!response.ok) {
        return false;
      }

      //count request charge
      self.saveCount(prompt_or_messages[prompt_or_messages.length - 1].content)

      return posts;
    } catch (e) {
      if (RETRY_CALL_GPT) {
        try {
          options["signal"] = signal
          let response_try = await fetch(url, options);
          let posts = await response_try.json();
          if (!response_try.ok) {
            return false;
          }
          return posts;
        } catch (err) {
          return false;
        }
      } else return false;
    }
  },

  /**
   * Get key api Open AI
   * 
   * @param {Function} callback 
   */
  getOpenAIKey: (callback) => {
    const self = OpenAIManager;

    if (!self.chat_gpt_api_key) {
      SateraitoRequest.fetchAPIOpenAIKeyRequest(function (api_key, version_ext) {
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
  },

  /**
   * Get suggest reply content mail request
   * 
   * @param {object} params 
   * @param {Function} callback 
   * @param {NUmber|null} retry 
   * @returns 
   */
  _getSuggestReplyMailRequest: async (params, callback, retry) => {
    const self = OpenAIManager;

    if (typeof retry == 'undefined') retry = 0;
    if (retry > 3) {
      callback({ answer_suggest: [] })
      return false;
    }
    // callback({ answer_suggest: [
    //   'Xin lỗi về sự cố hệ thống gần đây và đang tích cực khắc phục.',
    //   'Dự kiến vấn đề sẽ được giải quyết trong buổi chiều hôm nay.',
    //   'Liên hệ trực tiếp nếu gặp khó khăn, đang làm việc chăm chỉ để giải quyết vấn đề.'
    // ] })
    // return false;

    const { gpt_ai_key, gpt_model, title_mail, content_mail, lang } = params;

    const messages = [
      { role: "system", content: `You are a helpful assistant designed to output JSON` },
      { role: 'user', content: `Language in ${lang}.` },
      { role: 'assistant', content: 'Ok' },
      {
        role: 'user', content: `"""
Title: ${title_mail}
Content: ${content_mail}
"""

Suggest me 3 main points to answer, without using bullet points.
Format Json: {answer_suggest: [3 item<string>]}.
Output in ${lang}`
      },
    ];

    try {
      const response = await self.callGPTRequest(gpt_ai_key, messages, gpt_model, false, null, { "type": "json_object" })
      const contentRes = response.choices[0].message.content;
      const dataJson = JSON.parse(contentRes);

      //Save log summary chat
      let question = MyUtils.getContentByRoleInMessage('user', messages);
      self.saveLog(question, contentRes, 'email');

      if (dataJson.answer_suggest && dataJson.answer_suggest.length) {
        callback(dataJson);

      } else {
        retry++;
        self._getSuggestReplyMailRequest(params, callback, retry);
      }

    } catch (error) {
      retry++;
      self._getSuggestReplyMailRequest(params, callback, retry);
    }
  },

  getSuggestReplyMail: function (titleMail, contentMail, callback) {
    const self = OpenAIManager;

    // Get open ai KEY
    self.getOpenAIKey((gptAiKey) => {
      let params = {
        title_mail: titleMail,
        content_mail: contentMail,
        gpt_ai_key: gptAiKey,
        lang: UserSetting.language_active
      };

      // Call request get data to show popup in mail
      self._getSuggestReplyMailRequest(params, (response) => {
        callback(response.answer_suggest);
      })
    })
  },

  /**
   * Generate content compose request
   * 
   * @param {object} params 
   * @param {Function} callback 
   * @param {Number|null} retry 
   */
  _generateComposeContentRequest: async (params, callback, retry) => {
    const self = OpenAIManager;

    if (typeof retry == 'undefined') retry = 0;
    if (retry > 3) {
      callback({ title: 'error', body: 'error' })
      return false;
    }

    const {
      gpt_ai_key, gpt_version,

      topic_compose, formality,

      tone, email_length, your_role, your_language
    } = params;

    let prompt;
    let role_trim = your_role.trim();
    let role_str = ` as a ${role_trim}`;

    const messages = [
      { role: "system", content: `You are a helpful assistant.` },
    ];

    prompt = '';
    prompt += `Write a ${formality}${(role_trim != '') ? role_str : ''}, with ${tone} tone and ${email_length} length. The topic is:\n`
    prompt += `"""\n`
    prompt += `${topic_compose}\n`
    prompt += `"""\n`
    prompt += `Output in ${your_language}\n`;
    messages.push({ role: 'user', content: prompt })

    try {
      const response = await self.callGPTRequest(gpt_ai_key, messages, gpt_version, false, null)
      const contentRes = response.choices[0].message.content;

      const dataJson = {};
      dataJson.title = EMPTY_KEY;
      dataJson.body = contentRes;

      //Save log summary chat
      let question = MyUtils.getContentByRoleInMessage('user', messages);
      self.saveLog(question, contentRes, 'email');

      if (dataJson.title && dataJson.title != '' && dataJson.body && dataJson.body != '') {
        callback(dataJson);

      } else {
        retry++;
        self._generateComposeContentRequest(params, callback, retry);
      }

    } catch (error) {
      retry++;
      self._generateComposeContentRequest(params, callback, retry);
    }
  },

  /**
   * Generate reply content request
   * 
   * @param {object} params 
   * @param {Function} callback 
   * @param {Number|null} retry 
   */
  _generateReplyContentRequest: async (params, callback, retry) => {
    const self = OpenAIManager;

    if (typeof retry == 'undefined') retry = 0;
    if (retry > 3) {
      callback({ title: 'error', body: 'error' })
      return false;
    }

    let {
      gpt_ai_key, gpt_version,

      original_text_reply, general_content_reply, formality_reply,

      tone, email_length, your_role, your_language
    } = params;

    let prompt = '';
    let role_trim = your_role.trim();
    let role_str = ` as a ${role_trim} `;

    const messages = [
      { role: "system", content: `You are a helpful assistant.` },
    ];

    prompt += `Write a ${formality_reply}${(role_trim != '') ? role_str : ' '}to reply to the original text. Ensure your response has a ${tone} tone and a ${email_length} length. Draw inspiration from the key points provided, but adapt them thoughtfully without merely repeating.\n`
    prompt += `Respond in the ${your_language} language.\n`
    prompt += `\n`
    prompt += `-----\n`
    prompt += `\n`
    prompt += `Original text:\n`
    prompt += `"""\n`
    prompt += `${original_text_reply}\n`
    prompt += `"""\n`
    prompt += `\n`
    prompt += `The key points of the reply:\n`
    prompt += `"""\n`
    prompt += `${general_content_reply}`
    prompt += `"""\n`
    prompt += `\n`
    
    messages.push({ role: 'user', content: prompt })

    try {
      const response = await self.callGPTRequest(gpt_ai_key, messages, gpt_version, false, null)
      const contentRes = response.choices[0].message.content;

      const dataJson = {};
      dataJson.title = EMPTY_KEY;
      dataJson.body = contentRes;

      //Save log summary chat
      let question = MyUtils.getContentByRoleInMessage('user', messages);
      self.saveLog(question, contentRes, 'email');

      if (dataJson.title && dataJson.title != '' && dataJson.body && dataJson.body != '') {
        callback(dataJson);

      } else {
        retry++;
        self._generateReplyContentRequest(params, callback, retry);
      }

    } catch (error) {
      retry++;
      self._generateReplyContentRequest(params, callback, retry);
    }
  },

  generateContentReply: (params, callback) => {
    const self = OpenAIManager;

    // Get open ai KEY
    self.getOpenAIKey((gptAiKey) => {
      params.gpt_ai_key = gptAiKey;

      if (params.type_generate == 'compose') {
        self._generateComposeContentRequest(params, (response) => {
          callback(response);
        });
      } else {
        self._generateReplyContentRequest(params, (response) => {
          callback(response);
        });
      }
    })
  },
};