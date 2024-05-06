let TAB_ID, WINDOW_ID = '';

const sateraito = {
  UI: {
    update_text_selected: (text) => {
      document.getElementById('original_text').value = text;
    },
    show_text_selected: async () => {
      let payload = await chrome.storage.sync.get('text_selected');
      document.getElementById('original_text').value = payload.text_selected;
    },
  }
}

const getTabId = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.id;
}
const getWindowId = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab.windowId;
}
const getCurrentTab = async () => {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

const handlerTextSelectedChange = async (payload) => {
  let text = payload.text_selected.newValue;
  sateraito.UI.update_text_selected(text);
}

const init_components = () => {
  let flag = false;
  let sidebar_flag = false;

  const LANGUAGE = [
    {
      name_dis: 'Việt Nam',
      sub_dis: 'Vietnamese',
      value: 'vietnamese',
    },
    {
      name_dis: '日本語',
      sub_dis: 'Japanese',
      value: 'japanese',
    },
    {
      name_dis: '한국어',
      sub_dis: 'Korean',
      value: 'korean',
    },
  ]
  const VERSION_GPT = [
    {
      name_dis: 'GPT-3.5 Turbo',
      icon: '/chatgpt-icon.svg',
      value: 'gpt-3.5-turbo',
    },
    {
      name_dis: '日本語',
      icon: '/chatgpt-4-icon.svg',
      value: 'gpt-4-turbo',
    },
    {
      name_dis: '한국어',
      icon: '/google-gemini-icon.svg',
      value: 'gemini',
    },
  ]

  // For combobox component
  $('.combobox').click(event => {
    $('.popover-cbx').removeClass('show');

    const targetEl = event.target;
    const popoverEl = targetEl.querySelector(`.popover-cbx`);

    if (!popoverEl) return;

    flag = true;

    popoverEl.classList.add('show');
    popoverEl.style.top = `-${popoverEl.offsetHeight - 10}px`;
    popoverEl.style.left = `${targetEl.offsetWidth - 20}px`;

    setTimeout(() => {
      flag = false;
    }, 100)
  });
  $('.popover-cbx.wrap-item .combobox-item').click(event => {
    const value = event.target.getAttribute('value');

    const comboboxEl = $(event.target).parents('button.combobox')[0];
    if (comboboxEl.onSelect) {
      comboboxEl.onSelect(comboboxEl, event.target, value);
    }
  });

  // For tab component
  $('.tab .tab-title .item').click(event => {
    const targetEl = event.target;
    const keyTab = targetEl.getAttribute('key_tab');
    console.log(keyTab);

    $('.tab .tab-title .item').removeClass('active');
    $(targetEl).addClass('active');

    $('.tab .tab-body .tab-item').removeClass('active');
    $(`.tab .tab-body #${keyTab}.tab-item`).addClass('active');
  });

  document.getElementById('language_cbx').onSelect = (comboboxEl, itemEl, value) => {
    let record = LANGUAGE.find(item => {
      return value == item.value
    });

    if (record) {
      itemEl.remove();

      $('.your-language .item').removeClass('active');

      const buttonEl = document.createElement('button');
      buttonEl.setAttribute('value', record.value);
      buttonEl.className = 'item text active';
      buttonEl.innerHTML = record.name_dis;

      const closeBtnEl = document.createElement('div');
      closeBtnEl.className = 'close';
      closeBtnEl.innerHTML = '<img class="icon" src="./icons/cancel.svg">';

      closeBtnEl.onclick = () => {
        buttonEl.remove();

      }
      buttonEl.onclick = () => {
        const parent = $(buttonEl).parents('.options')[0];
        $(parent).children('.item').removeClass('active');
        $(buttonEl).addClass('active');
      }

      buttonEl.append(closeBtnEl);
      $(buttonEl).insertBefore(comboboxEl);
    }

    if ($('.your-language .combobox-item').length == 0) {
      comboboxEl.remove();
    }
  }
  document.getElementById('version_gpt').onSelect = (comboboxEl, itemEl, value) => {
    let record = VERSION_GPT.find(item => {
      return value == item.value
    });

    if (record) {
      $('#version_gpt .content img').attr('src', record.icon);
    }
  }
  $('.submit-generate').click(event => {
    $('#result').css('height', $('#tab_container')[0].offsetHeight + 'px');

    $('#tab_container').animate({
      scrollTop: $("#result").offset().top
    }, 700);
  });

  $('.config .options .item').click(event => {
    const targetEl = event.target;
    const parent = $(targetEl).parents('.options')[0];

    $(parent).children('.item').removeClass('active');
    $(targetEl).addClass('active');
  });

  $('.gpt-layout').click(event => {
    if (!flag) {
      $('.popover-cbx').removeClass('show');
    }

    // For sidebar
    if (!sidebar_flag) {
      $('.sidebar').removeClass('show');
    }
  });

  $('.collapse-navbar').click(event => {
    sidebar_flag = true;

    // For sidebar
    $('.sidebar').addClass('show');

    setTimeout(() => {
      sidebar_flag = false;
    }, 100)
  });

  $('.sidebar .action .collapse').click(event => {
    const root = $('#root_gpt');
    const ui001 = 'ui-001'
    const ui002 = 'ui-002'

    if (root.hasClass(ui001)) {
      root.removeClass(ui001)
      root.addClass(ui002)
    } else {
      root.removeClass(ui002)
      root.addClass(ui001)
    }
  });
};

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

const LIST_TAB = [
  {
    id: 'write_tab',
    name: 'Write',
    icon: write_icon,
    onActive: null
  },
  {
    id: 'ocr_tab',
    name: 'OCR',
    icon: ocr_icon,
    onActive: null
  },
  {
    id: 'translate_tab',
    name: 'Translate',
    icon: translate_icon,
    onActive: null
  },
  {
    id: 'grammar_tab',
    name: 'Grammar',
    icon: grammar_icon,
    onActive: null
  },
];
const VOICE_SETTING_DATA = [
  {
    name_kind: "format",
    name: "Format",
    icon: descriptionIconUrl,
    options: [
      {
        value: 'essay',
        display: `Essay`
      },
      {
        value: 'paragraph',
        display: `Paragraph`
      },
      {
        value: 'email',
        display: `Email`
      },
      {
        value: 'idea',
        display: `Idea`
      },
      {
        value: 'blog post',
        display: `Blog Post`
      },
      {
        value: 'outline',
        display: `Outline`
      },
      {
        value: 'marketing ads',
        display: `Marketing Ads`
      },
      {
        value: 'comment',
        display: `Comment`
      },
      {
        value: 'message',
        display: `Message`
      },
      {
        value: 'twitter',
        display: `Twitter`
      },
    ]
  },
  {
    name_kind: "format_reply",
    name: "Format",
    icon: descriptionIconUrl,
    options: [
      {
        value: 'comment',
        display: `Comment`
      },
      {
        value: 'email',
        display: `Email`
      },
      {
        value: 'message',
        display: `Message`
      },
      {
        value: 'twitter',
        display: `Twitter`
      },
    ]
  },
  {
    name_kind: "tone",
    name: "Tone",
    icon: emojiIconUrl,
    options: [
      {
        value: 'formal',
        display: `Formal`
      },
      {
        value: 'casual',
        display: `Casual`
      },
      {
        value: 'professional',
        display: `Professional`
      },
      {
        value: 'enthusiastic',
        display: `Enthusiastic`
      },
      {
        value: 'informational',
        display: `Informational`
      },
      {
        value: 'funny',
        display: `Funny`
      },
    ],
  },
  {
    name_kind: "email_length",
    name: "Email length",
    icon: formatAlignIconUrl,
    options: [
      {
        value: 'medium',
        display: `Medium`
      },
      {
        value: 'short',
        display: `Short`
      },
      {
        value: 'long',
        display: `Long`
      },
    ],
  },
];
const LANGUAGE_SETTING_DATA = [
  {
    value: 'vietnamese',
    name: 'Tiếng Việt',
    sub: 'Vietnamese',
  },
  {
    value: 'japanese',
    name: '日本語',
    sub: 'Japanese',
  },
  {
    value: 'korean',
    name: '한국어',
    sub: 'Korean',
  },
];
const GPT_VERSION_SETTING_DATA = [
  {
    value: 'gpt-3.5-turbo',
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
]

const _SendMessageManager = {
  generateContentCompose: function (params, callback) {
    chrome.runtime.sendMessage({
      method: 'generate_content_compose_mail',
      data: params
    },
      function (response) {
        callback(response);
      }
    );
  },

  generateContentReply: function (params, callback) {
    chrome.runtime.sendMessage({
      method: 'generate_content_reply',
      data: params
    },
      function (response) {
        callback(response);
      }
    );
  }
};

const TabWriteManager = {
  is_loading: false,
  combobox_flag: false,

  idTab: LIST_TAB[0].id,
  formData: {
    type_generate: null,
    topic_compose: null,
    original_text_reply: null,
    general_content_reply: null,
    your_lang: null,
    gpt_version: null,
  },
  result_active: 0,
  generate_result_list: [],

  // Getter
  getVHtml: () => {
    let reloadIconUrl = chrome.runtime.getURL("icons/refresh-icon.png");
    let copyIconUrl = chrome.runtime.getURL("icons/content-copy-icon.png");

    return `
            <div class="form-config">
              <div class="tab">
                <div class="tab-title">
                  <div class="item" key_tab="compose_tab">
                    <span>Compose</span>
                  </div>
                  <div class="item" key_tab="reply_tab">
                    <span>Reply</span>
                  </div>
                </div>
                <div class="tab-body">
                  <span id="compose_tab" class="tab-item">
                    <textarea placeholder="The topic you want to compose. Press Enter to generate draft"></textarea>
                  </span>
                  <span id="reply_tab" class="tab-item ">
                    <textarea class="original_text_reply" placeholder="The original text to which you want to reply"></textarea>
                    <textarea class="general_content_reply" placeholder="The general content of your reply to the above text. Press Enter to generate draft"></textarea>
                  </span>
                </div>
              </div>

              <div class="voice-config">
              </div>

              <div class="your-language config">
                <div class="title">
                  <img class="icon" src="./icons/translate.svg" alt="account-circle-icon">
                  <span class="text">Language:</span>
                </div>
                <div class="options">
                </div>
              </div>

              <div class="version config">
                <div class="options">
                </div>

                <button class="submit-generate">Generate draft</button>
              </div>
            </div>

            <div id="result" class="hidden">
            
              <div class="result-title">
                <div class="left">
                  <img class="icon" src="./icons/chatgpt-icon.svg" alt="gpt-version-icon">
                  <span class="name-gpt">...</span>
                </div>

                <div class="right">
                  <svg class="icon prev disable" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                  <span class="text"> _/_ </span>
                  <svg class="icon next disable" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </div>
              </div>

              <div class="result-generate">
              </div>

              <div class="result-footer">
                <div class="left">
                  <button class="btn">
                    <img src="${reloadIconUrl}" alt="">
                  </button>
                  <button class="btn">
                    <img src="${copyIconUrl}" alt="">
                  </button>
                </div>
                <div class="right">
                  <button class="btn add-to-site">
                    Add to site
                  </button>
                </div>
              </div>

            </div>
          `
  },

  createPanel: () => {
    const self = TabWriteManager;

    self.result_active = 0;
    self.generate_result_list = [];

    self.formData.your_lang = 'english';
    self.formData.gpt_version = GPT_VERSION_SETTING_DATA[0].value;
    for (let i = 0; i < VOICE_SETTING_DATA.length; i++) {
      const item = VOICE_SETTING_DATA[i];
      self.formData[item.name_kind] = item.options[0].value;
    }

    const panelEl = document.createElement('div');
    panelEl.id = self.idTab
    panelEl.innerHTML = self.getVHtml();

    LIST_TAB[0].onActive = self.onActive;

    return panelEl;
  },

  fixHeightResult: () => {
    const tabContainerEl = document.getElementById(`write_tab`);
    const resultEl = document.body.querySelector(`#${self.idTab} #result`);
    $(resultEl).css('height', tabContainerEl.offsetHeight + 'px');
  },

  // Setter
  loadData: () => {
    const self = TabWriteManager;

    $(`#${self.idTab} .voice-config`).html('');

    for (let i = 0; i < VOICE_SETTING_DATA.length; i++) {
      const config_item = VOICE_SETTING_DATA[i];

      const configEl = document.createElement('div');
      configEl.className = `${config_item.name_kind} config`;

      let vHtmlOption = ``;
      for (let j = 0; j < config_item.options.length; j++) {
        const optionItem = config_item.options[j];

        let isActive = false;
        if (self.formData[config_item.name_kind] == optionItem.value) {
          isActive = true;
        }

        vHtmlOption += `<button kind="${config_item.name_kind}" value="${optionItem.value}" class="item ${isActive ? 'active' : ''}">
                            ${optionItem.display}
                        </button>`
      }
      let vHtml = `<div class="title">
                      <img class="icon" src="${config_item.icon}" alt="${config_item.name_kind}">
                      <span class="text">${config_item.name}:</span>
                    </div>
                    <div class="options">
                      ${vHtmlOption}
                    </div>`;

      configEl.innerHTML = vHtml;
      $(`#${self.idTab} .voice-config`).append(configEl);
    }
  },

  loadLangConfig: () => {
    const self = TabWriteManager;

    let lang_option = '';
    for (let i = 0; i < LANGUAGE_SETTING_DATA.length; i++) {
      const item = LANGUAGE_SETTING_DATA[i];
      lang_option += `
        <li class="combobox-item" value="${item.value}">
          <div class="name">${item.name}</div>
          <div class="sub">${item.sub}</div>
        </li>
      `;
    }

    let vHtml_init = `
      <button value="english" kind="your_lang" class="item text active">English</button>
      <button class="item text combobox" id="language_cbx">
          <span class="space">...</span>
          <ul class="popover-cbx wrap-item">
            ${lang_option}
          </ul>
      </button>
    `

    $(`#${self.idTab} .your-language .options`).html(vHtml_init);
  },

  loadVersionGPTConfig: () => {
    const self = TabWriteManager;

    let itemActive = GPT_VERSION_SETTING_DATA[0];
    let gpt_option = '';
    for (let i = 0; i < GPT_VERSION_SETTING_DATA.length; i++) {
      const item = GPT_VERSION_SETTING_DATA[i];
      gpt_option += `
        <li class="combobox-item" value="${item.value}">
          <div class="icon">
            <img src="${item.icon}" alt="" srcset="">
          </div>
          <div class="name">${item.name}</div>
        </li>
      `;

      // get gpt version active
      if (item.value == self.formData.gpt_version) {
        itemActive = item;
      }
    }

    let vHtml_init = `
        <button class="item text version-gpt combobox" id="version_gpt">

          <div class="content">
            <img src="${itemActive.icon}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
            </svg>
          </div>

          <ul class="popover-cbx wrap-item type-icon">
            ${gpt_option}
          </ul>

        </button>
    `

    $(`#${self.idTab} .version .options`).html(vHtml_init);
  },

  resetEvent: () => {
    const self = TabWriteManager;

    // For combobox component
    $(`#${self.idTab} .combobox`).click(event => {
      $(`#${self.idTab} .popover-cbx`).removeClass('show');

      const targetEl = event.target;
      const popoverEl = targetEl.querySelector(`#${self.idTab} .popover-cbx`);

      if (!popoverEl) return;

      self.combobox_flag = true;

      popoverEl.classList.add('show');
      popoverEl.style.top = `-${popoverEl.offsetHeight - 10}px`;
      popoverEl.style.left = `${targetEl.offsetWidth - 20}px`;

      setTimeout(() => {
        self.combobox_flag = false;
      }, 100)
    });
    $(`#${self.idTab} .popover-cbx.wrap-item .combobox-item`).click(event => {
      const value = event.target.getAttribute('value');

      const comboboxEl = $(event.target).parents('button.combobox')[0];
      if (comboboxEl.onSelect) {
        comboboxEl.onSelect(comboboxEl, event.target, value);
      }
    });

    // For tab component
    $(`#${self.idTab} .tab .tab-title .item`).click(event => {
      const targetEl = event.target;
      const keyTab = targetEl.getAttribute('key_tab');

      $(`#${self.idTab} .voice-config .format`).removeClass('hidden');
      $(`#${self.idTab} .voice-config .format_reply`).removeClass('hidden');
      if (keyTab == 'reply_tab') {
        $(`#${self.idTab} .voice-config .format`).addClass('hidden');
      } else {
        $(`#${self.idTab} .voice-config .format_reply`).addClass('hidden');
      }

      $(`#${self.idTab} .tab .tab-title .item`).removeClass('active');
      $(targetEl).addClass('active');

      $(`#${self.idTab} .tab .tab-body .tab-item`).removeClass('active');
      $(`#${self.idTab} .tab .tab-body #${keyTab}.tab-item`).addClass('active');
    });

    const handlerActive = () => {
      $(`#${self.idTab} #result .result-generate .result-item`).removeClass('active');
      $(`#${self.idTab} #result .result-generate .result-item[data-index="${self.result_active}"]`).addClass('active');

      self.handlerUpdatePaging();
    };
    $(`#${self.idTab} #result .result-title .right .prev`).click((event) => {
      if (event.target.className.baseVal.indexOf('disable') != -1) {
        return;
      }
      self.result_active--;
      handlerActive();
    })
    $(`#${self.idTab} #result .result-title .right .next`).click((event) => {
      if (event.target.className.baseVal.indexOf('disable') != -1) {
        return;
      }
      self.result_active++;
      handlerActive();
    })

    // For button submit generate
    $(`#${self.idTab} .submit-generate`).click(self.onSubmitGenerate);

    // For items options voice config
    $(`#${self.idTab} .config .options .item`).click(self.onClickConfigItem);

    document.body.querySelector(`#${self.idTab} #language_cbx`).onSelect = self.onSelectLanguageConfig;
    document.body.querySelector(`#${self.idTab} #version_gpt`).onSelect = self.onSelectVersionGptConfig;
  },

  /**
     * Handler show generate result
     * 
     */
  handlerShowGenerateResult: function () {
    const self = TabWriteManager;

    const result = self.generate_result_list;
    self.result_active = (result.length - 1);

    $(`#${self.idTab} #result .result-generate`).html('');

    let resultActiveEl = null;
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      let isActive = (i == self.result_active)

      let textEl = document.createElement('div');
      textEl.setAttribute('disabled', true);

      textEl.innerHTML = item.replaceAll('\n', '<br/>');
      
      let resultDivEl = document.createElement('div');
      resultDivEl.classList = ['result-item'];
      resultDivEl.setAttribute('data-index', i);
      if (isActive) {
        resultActiveEl = resultDivEl
        resultDivEl.classList.add('active');
      }
      resultDivEl.append(textEl);
      
      $(`#${self.idTab} #result .result-generate`).append(resultDivEl);
    }

    $(`#${self.idTab} #result .result-generate`).css('height', `${resultActiveEl.offsetHeight}px`)

    self.handlerUpdatePaging();
    self.is_loading = false;
  },

  /**
   * Handler update paging status
   * 
   */
  handlerUpdatePaging: function () {
    const self = TabWriteManager;
    const result_list = self.generate_result_list;

    $(`#${self.idTab} #result .result-title .right .text`).html(`${self.result_active + 1}/${result_list.length}`)

    // paging prev
    if (self.result_active <= 0) {
      $(`#${self.idTab} #result .result-title .right .prev`)[0].classList.add('disable');
    } else {
      $(`#${self.idTab} #result .result-title .right .prev`)[0].classList.remove('disable');
    }

    // paging next
    if (self.result_active >= (result_list.length - 1)) {
      $(`#${self.idTab} #result .result-title .right .next`)[0].classList.add('disable');
    } else {
      $(`#${self.idTab} #result .result-title .right .next`)[0].classList.remove('disable');
    }
  },
  
  processAddGenerateWrite: () => {
    const self = TabWriteManager;
    if (self.is_loading) return;

    // self.is_loading = true;

    let typeGenerate = '';
    if ($('#write_tab div[key_tab="compose_tab"]').hasClass('active')) {
      typeGenerate = 'compose'
    } else {
      typeGenerate = 'reply'
    }

    let topicCompose = $('#write_tab #compose_tab textarea').val()
    let originalTextReply = $('#write_tab #reply_tab textarea.original_text_reply').val()
    let generalContentReply = $('#write_tab #reply_tab textarea.general_content_reply').val()

    let params = self.formData;
    params.type_generate = typeGenerate;
    params.topic_compose = topicCompose;
    params.original_text_reply = originalTextReply;
    params.general_content_reply = generalContentReply;

    $('#write_tab #result .result-title .left .icon').attr('src', getIconGptVersion('icon', self.formData.gpt_version))
    $('#write_tab #result .result-title .left .name-gpt').text(getIconGptVersion('name', self.formData.gpt_version))

    _SendMessageManager.generateContentReply(params, (content) => {
      console.log(content);
      self.generate_result_list.push(content);

      self.handlerShowGenerateResult();
    });
  },

  // Event

  onActive: () => {
    const self = TabWriteManager;

    $('.tab .tab-title .item').removeClass('active');
    $('.tab .tab-title .item[key_tab="compose_tab"]').addClass('active');

    $('.tab .tab-body .tab-item').removeClass('active');
    $('.tab .tab-body #compose_tab').addClass('active');

    self.loadData();
    self.loadLangConfig();
    self.loadVersionGPTConfig();

    self.resetEvent();

    $(`#${self.idTab} .voice-config .format`).removeClass('hidden');
    $(`#${self.idTab} .voice-config .format_reply`).addClass('hidden');
  },

  onSubmitGenerate: (event) => {
    const self = TabWriteManager;

    if (self.is_loading) return;

    // process add generate write
    self.processAddGenerateWrite();

    const containerEl = document.getElementById(`tab_container`);
    const formConfigEl = document.body.querySelector(`#${self.idTab} .form-config`);
    const resultEl = document.body.querySelector(`#${self.idTab} #result`);

    $(resultEl).removeClass('hidden');
    // $(resultEl).css('height', formConfigEl.offsetHeight + 'px');
    
    $(containerEl).animate({
      scrollTop: $(resultEl).offset().top
    }, 500);
  },

  onClickConfigItem: (event) => {
    const self = TabWriteManager;

    const targetEl = event.target;
    const kind = event.target.getAttribute('kind');
    const value = event.target.getAttribute('value');

    if (!value || !kind) return;
    self.formData[kind] = value;

    const parent = $(targetEl).parents('.options')[0];
    $(parent).children('.item').removeClass('active');
    $(targetEl).addClass('active');
  },

  onSelectLanguageConfig: (comboboxEl, itemEl, value) => {
    const self = TabWriteManager;

    let record = LANGUAGE_SETTING_DATA.find(item => {
      return value == item.value
    });

    if (record) {
      $(itemEl).addClass('hidden');

      $(`#${self.idTab} .your-language .item`).removeClass('active');

      const buttonEl = document.createElement('button');
      buttonEl.setAttribute('kind', 'your_lang');
      buttonEl.setAttribute('value', record.value);
      buttonEl.className = 'item text';
      buttonEl.innerHTML = record.name;

      const closeBtnEl = document.createElement('div');
      closeBtnEl.className = 'close';
      closeBtnEl.innerHTML = '<img class="icon" src="./icons/cancel.svg">';

      closeBtnEl.onclick = () => {
        buttonEl.remove();
        $(itemEl).removeClass('hidden');

        if ($(`#${self.idTab} #language_cbx`).hasClass('hidden')) {
          $(comboboxEl).removeClass('hidden');
        }
      }
      $(buttonEl).click(self.onClickConfigItem);

      buttonEl.append(closeBtnEl);
      $(buttonEl).insertBefore(comboboxEl);

      setTimeout(() => {
        self.formData['your_lang'] = value;
        $(buttonEl).addClass('active');
      }, 100);
    }

    if ($(`#${self.idTab} .your-language .combobox-item.hidden`).length == $(`#${self.idTab} .your-language .combobox-item`).length) {
      $(comboboxEl).addClass('hidden');
    }
  },

  onSelectVersionGptConfig: (comboboxEl, itemEl, value) => {
    const self = TabWriteManager;

    let record = GPT_VERSION_SETTING_DATA.find(item => {
      return value == item.value
    });

    if (record) {
      self.formData.gpt_version = value;

      $(`#${self.idTab} #version_gpt .content img`).attr('src', record.icon);
    }
  }
}

const WrapperManager = {
  sidebar_flag: false,

  _init: () => {
    const self = WrapperManager;

    self.initTab();
    self.setActiveTab();

    self.fixHeightContainer();
  },

  // UI
  setActiveTab: (idTab) => {
    if (!idTab) idTab = LIST_TAB[0].id;

    // sidebar
    $(`.sidebar .menu .item`).removeClass('active');
    $(`.sidebar .menu .item[tab_id=${idTab}]`).addClass('active');

    // title
    $(`.title .left .title`).removeClass('active');
    $(`.title .left .title[tab_id=${idTab}]`).addClass('active');

    // tab main
    $(`#tab_container .tab-item`).removeClass('active');
    $(`#tab_container #${idTab}`).addClass('active');

    for (let i = 0; i < LIST_TAB.length; i++) {
      const item = LIST_TAB[i];

      if (item.id == idTab) {
        if (item.onActive) {
          item.onActive();
        }
      }
    }
  },

  fixHeightContainer: () => {
    const heightMain = document.body.querySelector('.gpt-layout main').offsetHeight;
    const heightTitleMain = document.body.querySelector('.gpt-layout main .title').offsetHeight;
    const heightFooterMain = document.body.querySelector('footer').offsetHeight;

    $('main .wrap-content').css('height', `${heightMain - heightFooterMain}px`);
    $('#tab_container').css('height', `${heightMain - (heightFooterMain + heightTitleMain)}px`);
  },

  initTab: () => {
    const self = WrapperManager;

    self.addTabToSidebar();
    self.addTabToTitleMain();

    // Init write tab
    const writeTabItem = TabWriteManager.createPanel();

    $('#tab_container').append(writeTabItem);

    self.initEvent();
  },

  addTabToTitleMain: () => {
    const self = WrapperManager;

    LIST_TAB.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = `title`;
      itemEl.setAttribute('tab_id', item.id)

      itemEl.innerHTML = `
                ${item.icon}
                <span>
                    ${item.name}
                </span>
            `

      $('main .title .left').append(itemEl);
    });
  },

  addTabToSidebar: () => {
    const self = WrapperManager;

    LIST_TAB.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.setAttribute('tab_id', item.id);
      itemEl.className = `item`;
      itemEl.innerHTML = `
                ${item.icon}
                <div class="label">
                    ${item.name}
                </div>
            `
      $('.sidebar .menu').append(itemEl);
    });
  },

  // Event
  initEvent: () => {
    const self = WrapperManager;

    // Resize event
    window.addEventListener("resize", (event) => {
      self.fixHeightContainer();

      // TabWriteManager.fixHeightResult();
    });

    $('.gpt-layout').click(event => {
      if (!TabWriteManager.combobox_flag) {
        $('.popover-cbx').removeClass('show');
      }

      // For sidebar
      if (!WrapperManager.sidebar_flag) {
        $('.sidebar').removeClass('show');
      }
    });

    $('.collapse-navbar').click(event => {
      WrapperManager.sidebar_flag = true;

      // For sidebar
      $('.sidebar').addClass('show');

      setTimeout(() => {
        WrapperManager.sidebar_flag = false;
      }, 100)
    });

    $('.sidebar .action .collapse').click(event => {
      const root = $('#root_gpt');
      const ui001 = 'ui-001'
      const ui002 = 'ui-002'

      if (root.hasClass(ui001)) {
        root.removeClass(ui001)
        root.addClass(ui002)
      } else {
        root.removeClass(ui002)
        root.addClass(ui001)
      }
    });
  },
};

const getIconGptVersion = (keyGet, gptVersion) => {
  for (let i = 0; i < GPT_VERSION_SETTING_DATA.length; i++) {
    const element = GPT_VERSION_SETTING_DATA[i];
    
    if (element.value == gptVersion) {
      return element[keyGet];
    }
  }
}
const initialize_side = async () => {
  TAB_ID = await getTabId();
  WINDOW_ID = await getWindowId();

  WrapperManager._init();

  chrome.storage.onChanged.addListener((payload) => {
    if ('text_selected' in payload) {
      handlerTextSelectedChange(payload);
    }
  });
}

initialize_side();