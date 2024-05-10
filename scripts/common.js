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

let chat_gpt_api_key = null;
let is_domain_regist = false;
let is_not_access_list = false;

let TAB_ID, WINDOW_ID, ID_USER_ADDON_LOGIN, USER_ADDON_LOGIN = '';

const USER_SETTING = {
  language_write_active: {}
};

const LOCALE_CODES = {
  "ar": "Arabic",
  "am": "Amharic",
  "bg": "Bulgarian",
  "bn": "Bengali",
  "ca": "Catalan",
  "cs": "Czech",
  "da": "Danish",
  "de": "German",
  "el": "Greek",
  "en": "English",
  "en_AU": "English (Australia)",
  "en_GB": "English (Great Britain)",
  "en_US": "English (USA)",
  "es": "Spanish",
  "es_419": "Spanish (Latin America and Caribbean)",
  "et": "Estonian",
  "fa": "Persian",
  "fi": "Finnish",
  "fil": "Filipino",
  "fr": "French",
  "gu": "Gujarati",
  "he": "Hebrew",
  "hi": "Hindi",
  "hr": "Croatian",
  "hu": "Hungarian",
  "id": "Indonesian",
  "it": "Italian",
  "ja": "Japanese",
  "kn": "Kannada",
  "ko": "Korean",
  "lt": "Lithuanian",
  "lv": "Latvian",
  "ml": "Malayalam",
  "mr": "Marathi",
  "ms": "Malay",
  "nl": "Dutch",
  "no": "Norwegian",
  "pl": "Polish",
  "pt_BR": "Portuguese (Brazil)",
  "pt_PT": "Portuguese (Portugal)",
  "ro": "Romanian",
  "ru": "Russian",
  "sk": "Slovak",
  "sl": "Slovenian",
  "sr": "Serbian",
  "sv": "Swedish",
  "sw": "Swahili",
  "ta": "Tamil",
  "te": "Telugu",
  "th": "Thai",
  "tr": "Turkish",
  "uk": "Ukrainian",
  "vi": "Vietnamese",
  "zh_CN": "Chinese (China)",
  "zh_TW": "Chinese (Taiwan)",

  getNameLocale: () => {
    if (USER_SETTING && USER_SETTING.language) {
      return LOCALE_CODES[USER_SETTING.language] || 'Japanese';
    }
    return LOCALE_CODES[chrome.i18n.getUILanguage().replaceAll('-', '_')] || 'Japanese';
  },

  getLangUI: () => {
    return chrome.i18n.getUILanguage().replaceAll('-', '_');
  }
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
        name: MyLang.getMsg('TXT_PROFESSIONAL'),
        display: MyLang.getMsg('TXT_PROFESSIONAL'),
      },
      {
        value: 'confident',
        name: MyLang.getMsg('TXT_CONFIDENT'),
        display: MyLang.getMsg('TXT_CONFIDENT'),
      },
      {
        value: 'formal',
        name: MyLang.getMsg('TXT_FORMAL'),
        display: MyLang.getMsg('TXT_FORMAL'),
      },
      {
        value: 'friendly',
        name: MyLang.getMsg('TXT_FRIENDLY'),
        display: MyLang.getMsg('TXT_FRIENDLY'),
      },
      {
        value: 'personable',
        name: MyLang.getMsg('TXT_PERSONABLE'),
        display: MyLang.getMsg('TXT_PERSONABLE'),
      },
      {
        value: 'informational',
        name: MyLang.getMsg('TXT_INFORMATIONAL'),
        display: MyLang.getMsg('TXT_INFORMATIONAL'),
      },
      {
        value: 'witty',
        name: MyLang.getMsg('TXT_WITTY'),
        display: MyLang.getMsg('TXT_WITTY'),
      },
      {
        value: 'direct',
        name: MyLang.getMsg('TXT_DIRECT'),
        display: MyLang.getMsg('TXT_DIRECT'),
      },
      {
        value: 'enthusiastic',
        name: MyLang.getMsg('TXT_ENTHUSIASTIC'),
        display: MyLang.getMsg('TXT_ENTHUSIASTIC'),
      },
      {
        value: 'empathetic',
        name: MyLang.getMsg('TXT_EMPATHETIC'),
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
        name: MyLang.getMsg('TXT_SHORT'),
        display: MyLang.getMsg('TXT_SHORT'),
      },
      {
        value: 'medium',
        name: MyLang.getMsg('TXT_MEDIUM'),
        display: MyLang.getMsg('TXT_MEDIUM'),
      },
      {
        value: 'long',
        name: MyLang.getMsg('TXT_LONG'),
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
        name: '---',
        display: `---`
      },
      {
        value: 'leader',
        name: MyLang.getMsg('TXT_LEADER'),
        display: MyLang.getMsg('TXT_LEADER'),
      },
      {
        value: 'subordinate',
        name: MyLang.getMsg('TXT_SUBORDINATE'),
        display: MyLang.getMsg('TXT_SUBORDINATE'),
      },
      {
        value: 'colleague',
        name: MyLang.getMsg('TXT_COLLEAGUE'),
        display: MyLang.getMsg('TXT_COLLEAGUE'),
      },
      {
        value: 'sales representative',
        name: MyLang.getMsg('TXT_SALES_REPRESENTATIVE'),
        display: MyLang.getMsg('TXT_SALES_REPRESENTATIVE'),
      },
      {
        value: 'applicant',
        name: MyLang.getMsg('TXT_APPLICANT'),
        display: MyLang.getMsg('TXT_APPLICANT'),
      },
      {
        value: 'customer service staff',
        name: MyLang.getMsg('TXT_CUSTOMER_SERVICE_STAFF'),
        display: MyLang.getMsg('TXT_CUSTOMER_SERVICE_STAFF'),
      },
      {
        value: 'project manager',
        name: MyLang.getMsg('TXT_PROJECT_MANAGER'),
        display: MyLang.getMsg('TXT_PROJECT_MANAGER'),
      },
      {
        value: 'human resources',
        name: MyLang.getMsg('TXT_HUMAN_RESOURCES'),
        display: MyLang.getMsg('TXT_HUMAN_RESOURCES'),
      },
    ],
  },
];

const VOICE_SETTING_DATA_1 = [
  {
    name_kind: "format",
    name: MyLang.getMsg('TXT_FORMAT'),
    icon: descriptionIconUrl,
    options: [
      {
        value: 'essay',
        display: MyLang.getMsg('TXT_ESSAY')
      },
      {
        value: 'paragraph',
        display: MyLang.getMsg('TXT_PARAGRAPH')
      },
      {
        value: 'email',
        display: MyLang.getMsg('TXT_EMAIL')
      },
      {
        value: 'idea',
        display: MyLang.getMsg('TXT_IDEA')
      },
      {
        value: 'blog post',
        display: MyLang.getMsg('TXT_BLOG_POST')
      },
      {
        value: 'outline',
        display: MyLang.getMsg('TXT_OUTLINE')
      },
      {
        value: 'marketing ads',
        display: MyLang.getMsg('TXT_MARKETING_ADS')
      },
      {
        value: 'comment',
        display: MyLang.getMsg('TXT_COMMENT')
      },
      {
        value: 'message',
        display: MyLang.getMsg('TXT_MESSAGE')
      },
      {
        value: 'twitter',
        display: MyLang.getMsg('TXT_TWITTER')
      },
    ]
  },
  {
    name_kind: "format_reply",
    name: MyLang.getMsg('TXT_FORMAT'),
    icon: descriptionIconUrl,
    options: [
      {
        value: 'comment',
        display: MyLang.getMsg('TXT_COMMENT')
      },
      {
        value: 'email',
        display: MyLang.getMsg('TXT_EMAIL')
      },
      {
        value: 'message',
        display: MyLang.getMsg('TXT_MESSAGE')
      },
      {
        value: 'twitter',
        display: MyLang.getMsg('TXT_TWITTER')
      },
    ]
  },
  {
    name_kind: "tone",
    name: MyLang.getMsg('TXT_TONE'),
    icon: emojiIconUrl,
    options: [
      {
        value: 'formal',
        display: MyLang.getMsg('TXT_FORMAL'),
      },
      {
        value: 'casual',
        display: MyLang.getMsg('TXT_CASUAL'),
      },
      {
        value: 'professional',
        display: MyLang.getMsg('TXT_PROFESSIONAL'),
      },
      {
        value: 'enthusiastic',
        display: MyLang.getMsg('TXT_ENTHUSIASTIC'),
      },
      {
        value: 'informational',
        display: MyLang.getMsg('TXT_INFORMATIONAL'),
      },
      {
        value: 'funny',
        display: MyLang.getMsg('TXT_FUNNY'),
      },
    ],
  },
  {
    name_kind: "email_length",
    name: MyLang.getMsg('TXT_EMAIL_LENGTH'),
    icon: formatAlignIconUrl,
    options: [
      {
        value: 'medium',
        display: MyLang.getMsg('TXT_MEDIUM'),
      },
      {
        value: 'short',
        display: MyLang.getMsg('TXT_SHORT'),
      },
      {
        value: 'long',
        display: MyLang.getMsg('TXT_LONG'),
      },
    ],
  },
];

const LANGUAGE_SETTING_DATA = [
  {
    value: 'japanese',
    name: '日本語',
    sub: MyLang.getMsg('TXT_JAPANESE'),
  },
  {
    value: 'english',
    name: 'English',
    sub: MyLang.getMsg('TXT_ENGLISH'),
  },
  {
    value: 'simplified chinese',
    name: '中文(简体)',
    sub: MyLang.getMsg('TXT_S_CHINESE'),
  },
  {
    value: 'traditional chinese',
    name: '中文(繁體)',
    sub: MyLang.getMsg('TXT_T_CHINESE'),
  },
  {
    value: 'vietnamese',
    name: 'Tiếng Việt',
    sub: MyLang.getMsg('TXT_VIETNAMESE'),
  },
  {
    value: 'korean',
    name: '한국어',
    sub: MyLang.getMsg('TXT_KOREAN'),
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

const _StorageManager = {
  getLanguageWriteList: (callback) => {
    chrome.storage.sync.get('write_language_output_list').then(payload => {
      let config = payload.write_language_output_list;
      if (!config) config = [];

      callback(config);
    });
  },
  addLanguageWriteList: (value) => {
    chrome.storage.sync.get('write_language_output_list').then(payload => {
      let config = payload.write_language_output_list;
      if (!config) config = [];

      const record = LANGUAGE_SETTING_DATA.find(item => {
        return value == item.value
      });
      const record_in_config = config.find(item => {
        return value == item.value
      });

      if (record && !record_in_config) {
        config.push(record);
        chrome.storage.sync.set({ write_language_output_list: config });
      }
    });
  },
  removeLanguageWriteList: (value) => {
    chrome.storage.sync.get('write_language_output_list').then(payload => {
      let config = payload.write_language_output_list;
      if (!config) config = [];

      for (let i = 0; i < config.length; i++) {
        if (config[i].value == value) {
          config.splice(i, 1);
          chrome.storage.sync.set({ write_language_output_list: config });
          break;
        }
      }
    });
  },

  setLanguageWrite: (value) => {
    const record = LANGUAGE_SETTING_DATA.find(item => {
      return value == item.value
    });
    if (record) {
      USER_SETTING.language_write_active = record;
      chrome.storage.sync.set({ write_language_output_active: record });
    }
  },
  getLanguageWrite: (callback) => {
    chrome.storage.sync.get('write_language_output_active', payload => {
      callback(payload.write_language_output_active)
    });
  },

  setVoiceConfigWrite: (voiceConfig) => {
    if (voiceConfig) {
      chrome.storage.sync.set({ write_voice_config: voiceConfig });
    }
  },
  getVoiceConfigWrite: (callback) => {
    chrome.storage.sync.get('write_voice_config', payload => {
      callback(payload.write_voice_config)
    });
  },
}

/**
 * Render text to element style chat GPT
 * 
 * @param {element} elToRender 
 * @param {string} stringRender 
 * @param {Function} callback 
 */
const renderTextStyleChatGPT = (elToRender, stringRender, callback) => {
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
}

/**
 * Get radom string
 * 
 * @returns {string}
 */
const randomId = () => {
  return Math.random().toString(36).slice(-8);
}

/**
 * Get properties in gpt record by gpt version
 * 
 * @param {string} keyGet 
 * @param {string} gptVersion 
 * @returns string
 */
const getPropGptByVersion = (keyGet, gptVersion) => {
  for (let i = 0; i < GPT_VERSION_SETTING_DATA.length; i++) {
    const element = GPT_VERSION_SETTING_DATA[i];

    if (element.value == gptVersion) {
      return element[keyGet];
    }
  }
}

/**
 * Load chat GPT AI key
 * 
 */
const loadChatGPTAIKey = () => {
  if (!chat_gpt_api_key) {
    fetchChatGPTAIKey(function (api_key, version_ext) {
      if (typeof (api_key) != "undefined") {
        chat_gpt_api_key = api_key;
      }
    })
  }
}

/**
 * Get chat GPT AI key
 * 
 * @param {Function} callback 
 */
const getChatGPTAIKey = (callback) => {
  if (!chat_gpt_api_key) {
    fetchChatGPTAIKey(function (api_key, version_ext) {
      if (typeof (api_key) != "undefined") {
        chat_gpt_api_key = api_key;
        callback(api_key)
        return;
      }
      //fail
      callback()
    })
  } else {
    // exist key
    callback(chat_gpt_api_key)
  }
}