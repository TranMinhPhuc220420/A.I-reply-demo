/** @define {boolean} デバッグモード */
let DEBUG_MODE = true;

// (function () {
'use strict';

/**
 * Debug log
 * @param {string} strMsg
 */
const debugLog = (strMsg) => {
  if (DEBUG_MODE === true) {
    console.log(chrome.i18n.getMessage('@@extension_id') + ' ' + (new Date()).toLocaleString() + ':', strMsg);
  }
}

/**
 * Send message manager
 * 
 */
const _SendMessageManager = {
  /**
   * Get summary content mail
   * 
   * @param {string} titleMail 
   * @param {string} contentMail 
   * @param {Function} callback 
   */
  getSummaryContentMail: function (titleMail, contentMail, callback) {
    // Get open ai KEY
    getChatGPTAIKey((gptAiKey) => {
      let params = {
        title_mail: titleMail,
        content_mail: contentMail,
        gpt_ai_key: gptAiKey,
        lang: USER_SETTING.language_active
      };

      // Call request get data to show popup in mail
      summaryContentMailRequest(params, (response) => {
        callback({
          summary: response.summarize,
          key_points_list: response.key_points,
          lang_content: response.language,
          suggestion_list: response.answer_suggest,
        });
      })
    })
  },

  /**
   * Generate content compose
   * 
   * @param {json} params 
   * @param {Function} callback 
   */
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

  /**
   * Generate content reply
   * 
   * @param {json} params 
   * @param {Function} callback 
   */
  generateContentReply: function (params, callback) {
    const self = _SendMessageManager;

    // Get open ai KEY
    getChatGPTAIKey((gptAiKey) => {
      params.gpt_ai_key = gptAiKey;

      generateContentRequest(params, (response) => {
        callback(response);
      })
    })
  }
};

/**
 * Tab write manager
 * 
 */
const TabWriteManager = {
  is_loading: false,
  is_summarizing: false,
  combobox_flag: false,

  idTab: LIST_TAB[0].id,
  formData: {
    type_generate: null,
    topic_compose: null,
    original_text_reply: null,
    general_content_reply: null,
    gpt_version: null,
  },
  result_active: 0,
  generate_result_list: [],
  language_output_list_config: [],
  voice_config_of_user: [],

  summaryMailData: null,
  title_content_mail_to_write: null,

  // Getter

  /**
   * Get inner html for tab write
   * 
   * @returns {string}
   */
  getVHtml: () => {
    let reloadIconUrl = chrome.runtime.getURL("icons/refresh-icon.png");
    let copyIconUrl = chrome.runtime.getURL("icons/content-copy-icon.png");
    let doneIconUrl = chrome.runtime.getURL("icons/done.svg");

    return `
            <div class="form-config">
              <div class="tab content-config">
                <div class="tab-title">
                  <div class="item" key_tab="compose_tab">
                    <span>${MyLang.getMsg('TXT_COMPOSE')}</span>
                  </div>
                  <div class="item" key_tab="reply_tab">
                    <span>${MyLang.getMsg('TXT_REPLY')}</span>
                  </div>
                </div>
                <div class="tab-body">
                  <span id="compose_tab" class="tab-item">
                    <textarea placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_TOPIC_COMPOSE')}"></textarea>
                  </span>
                  <span id="reply_tab" class="tab-item ">
                    <textarea class="original_text_reply" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_REPLY')}"></textarea>
                    <textarea class="general_content_reply" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_GENERAL_CONTENT_REPLY')}"></textarea>

                    <ul class="reply-suggestions">
                    </ul>
                  </span>
                </div>
              </div>

              <div class="voice-config">
              </div>

              <div class="version config">
                <div class="options">
                </div>

                <button class="submit-generate">${MyLang.getMsg('TXT_GENERATE_DRAFT')}</button>
              </div>

              <div class="alert">
              </div>
            </div>

            <div id="result" class="hidden is-loading">
            
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
                <div class="cmp-loading">
                  <div class="loading"></div>
                  <div class="loading"></div>
                  <div class="loading"></div>
                </div>
              </div>

              <div class="result-footer">
                <div class="left">
                  <button class="btn re-generate">
                    <img src="${reloadIconUrl}" alt="">
                  </button>
                  <button class="btn copy-content">
                    <img src="${copyIconUrl}" alt="">
                    <img class="icon-done" src="${doneIconUrl}" alt="">
                  </button>
                </div>
                <div class="right">
                  <button class="btn send-to-site">
                    ${MyLang.getMsg('TXT_ADD_TO_SITE')}
                  </button>
                </div>
              </div>

            </div>
          `
  },

  /**
   * Create panel
   * 
   * @returns {Element}
   */
  createPanel: () => {
    const self = TabWriteManager;

    self.result_active = 0;
    self.generate_result_list = [];

    self.formData['gpt_version'] = GPT_VERSION_SETTING_DATA[0].value;

    const panelEl = document.createElement('div');
    panelEl.id = self.idTab
    panelEl.innerHTML = self.getVHtml();

    LIST_TAB[0].onActive = self.onActive;

    return panelEl;
  },

  /**
   * Fix height for session result
   * 
   */
  fixHeightResult: () => {
    const tabContainerEl = document.getElementById(`write_tab`);
    const resultEl = document.body.querySelector(`#${self.idTab} #result`);
    $(resultEl).css('height', tabContainerEl.offsetHeight + 'px');
  },

  /**
   * Check form data is validate to call GPT
   * 
   * @returns {boolean}
   */
  isValidateToCallGPT: () => {
    const self = TabWriteManager;

    let typeGenerate = '';
    if ($('#write_tab div[key_tab="compose_tab"]').hasClass('active')) {
      typeGenerate = 'compose'
    } else {
      typeGenerate = 'reply'
    }

    let topicCompose = $('#write_tab #compose_tab textarea').val().trim();
    let originalTextReply = $('#write_tab #reply_tab textarea.original_text_reply').val().trim();
    let generalContentReply = $('#write_tab #reply_tab textarea.general_content_reply').val().trim();

    if (typeGenerate == 'compose') {
      if (!topicCompose || topicCompose == '') {
        return MyLang.getMsg('DES_ERROR_TOPIC_COMPOSE');
      }
    }
    if (typeGenerate == 'reply') {
      if (!originalTextReply || originalTextReply == '') {
        return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_REPLY');
      }
      if (!generalContentReply || generalContentReply == '') {
        return MyLang.getMsg('DES_ERROR_GENERAL_CONTENT_REPLY');
      }
    }
    if (self.formData.gpt_version == 'gemini') {
      return MyLang.getMsg('DES_ERROR_GEMINI_NOT_RELEASED');
    }
    if (self.formData.gpt_version == 'gpt-4-turbo') {
      return MyLang.getMsg('DES_ERROR_GPT4_NOT_RELEASED');
    }
  },

  getLanguageFromConfig: () => {
    const self = TabWriteManager;

    const langOptions = self.voice_config_of_user.find(item => item.name_kind == 'your_language').options;
    const languageItem = langOptions.find(item => (item.isActive == true))

    return languageItem.value;
  },

  // Setter

  /**
   * Load and show list option gpt version for user
   * 
   */
  loadVersionGPTConfig: () => {
    const self = TabWriteManager;

    let itemActive = GPT_VERSION_SETTING_DATA[0];
    let gpt_option = '';
    for (let i = 0; i < GPT_VERSION_SETTING_DATA.length; i++) {
      const item = GPT_VERSION_SETTING_DATA[i];
      gpt_option += `
        <li class="combobox-item" value="${item.value}" kind="version_gpt">
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

  /**
   * Load and show voice config
   * 
   */
  loadVoiceConfig: () => {
    const self = TabWriteManager;

    $(`#${self.idTab} .voice-config .wrap-config`).remove();

    for (let i = 0; i < self.voice_config_of_user.length; i++) {
      const configItem = self.voice_config_of_user[i];

      // Shows all previously added
      const optionsConfig = configItem.options;
      let vHtmlItemConfig = '';
      for (let i = 0; i < optionsConfig.length; i++) {
        const optionConfigItem = optionsConfig[i];

        if (optionConfigItem.isActive) {
          // Set form data to call request API OpenAI
          self.formData[configItem.name_kind] = optionConfigItem.value;
        }

        vHtmlItemConfig += `
          <button kind="${configItem.name_kind}" value="${optionConfigItem.value}" class="item text ${optionConfigItem.isActive ? 'active' : ''}">
            ${optionConfigItem.display}
            ${optionsConfig.length > 1 ?
            `<div class="close">
                <img class="icon" src="./icons/cancel.svg">
              </div>` : ''
          }
          </button>
          `
      }

      // Add options not use to option combobox
      let optionsDefault = VOICE_SETTING_DATA_2.find(config => config.name_kind == configItem.name_kind).options;
      let vHtmlOptionsConfig = '';
      for (let i = 0; i < optionsDefault.length; i++) {
        const item = optionsDefault[i];

        let hasInConfig = optionsConfig.find(configItem => configItem.value == item.value);
        vHtmlOptionsConfig += `
            <li class="combobox-item ${hasInConfig ? 'hidden' : ''}" kind="${configItem.name_kind}" value="${item.value}">
              <div class="name">${item.display}</div>
              ${item.sub ? `<div class="sub">${item.sub}</div>` : ''}
            </li>
          `;
      }

      // Button combobox
      let vHtml = ` <div class="title">
                        <img class="icon" src="${configItem.icon}" alt="${configItem.name_kind}">
                        <span class="text">${configItem.name}:</span>
                      </div>
                      <div class="options">
                        ${vHtmlItemConfig}
                        <button class="item text combobox" id="${configItem.name_kind}_cbx">
                          <img class="icon" src="${moreHorizIconUrl}" />
                          <ul class="popover-cbx wrap-item">
                            ${vHtmlOptionsConfig}
                          </ul>
                        </button>
                      </div>
                    `

      let wrap = document.createElement('div');
      wrap.className = `wrap-config ${configItem.name_kind} ${configItem.name_kind == 'formality_reply' ? 'hidden' : ''}`
      wrap.innerHTML = vHtml;

      // Add to html side panel
      $(`#${self.idTab} .voice-config`).append(wrap);

      // Set event on select item in combobox
      document.body.querySelector(`#${self.idTab} #${configItem.name_kind}_cbx`).onSelect = self.onSelectComboboxConfig;

      // Hidden combobox element when add all to html side panel
      if ($(`#${self.idTab} .wrap-config.${configItem.name_kind} .combobox-item.hidden`).length == $(`#${self.idTab} .wrap-config.${configItem.name_kind} .combobox-item`).length) {
        $(`#${configItem.name_kind}_cbx`).addClass('hidden');
      }
    }
  },

  /**
   * reload and re-show session voice config item
   * 
   */
  reloadVoiceConfigItem: (nameKind) => {
    const self = TabWriteManager;

    $(`#${self.idTab} .voice-config .wrap-config.${nameKind} .options .item`).remove();

    for (let i = 0; i < self.voice_config_of_user.length; i++) {
      const configItem = self.voice_config_of_user[i];

      if (configItem.name_kind == nameKind) {
        // Shows all previously added
        const optionsConfig = configItem.options;
        let vHtmlItemConfig = '';
        for (let i = 0; i < optionsConfig.length; i++) {
          const optionConfigItem = optionsConfig[i];

          if (optionConfigItem.isActive) {
            // Set form data to call request API OpenAI
            self.formData[configItem.name_kind] = optionConfigItem.value;
          }

          vHtmlItemConfig += `<button kind="${configItem.name_kind}" value="${optionConfigItem.value}" class="item text ${optionConfigItem.isActive ? 'active' : ''}">
                                  ${optionConfigItem.display}
                                  ${optionsConfig.length > 1 ?
              `<div class="close">
                                      <img class="icon" src="./icons/cancel.svg">
                                    </div>` : ''
            }
                                </button>
                              `
        }

        // Add options not use to option combobox
        let optionsDefault = VOICE_SETTING_DATA_2.find(config => config.name_kind == configItem.name_kind).options;
        let vHtmlOptionsConfig = '';
        for (let i = 0; i < optionsDefault.length; i++) {
          const item = optionsDefault[i];

          let hasInConfig = optionsConfig.find(configItem => configItem.value == item.value);
          vHtmlOptionsConfig += ` <li class="combobox-item ${hasInConfig ? 'hidden' : ''}" kind="${configItem.name_kind}" value="${item.value}">
                                      <div class="name">${item.display}</div>
                                      ${item.sub ? `<div class="sub">${item.sub}</div>` : ''}
                                    </li>`;
        }

        // Button combobox
        let vHtml = ` ${vHtmlItemConfig}
                        <button class="item text combobox" id="${configItem.name_kind}_cbx">
                          <img class="icon" src="${moreHorizIconUrl}" />
                          <ul class="popover-cbx wrap-item">
                            ${vHtmlOptionsConfig}
                          </ul>
                        </button>`

        // Add to html side panel
        $(`#${self.idTab} .voice-config .wrap-config.${nameKind} .options`).html(vHtml);

        // Set event on select item in combobox
        document.body.querySelector(`#${self.idTab} #${configItem.name_kind}_cbx`).onSelect = self.onSelectComboboxConfig;

        // Hidden combobox element when add all to html side panel
        if ($(`#${self.idTab} .wrap-config.${configItem.name_kind} .combobox-item.hidden`).length == $(`#${self.idTab} .wrap-config.${configItem.name_kind} .combobox-item`).length) {
          $(`#${configItem.name_kind}_cbx`).addClass('hidden');
        }
      }
    }
  },

  loadSummaryMailData: () => {
    const self = TabWriteManager;
    if (self.is_loading) return;
    if (!self.summaryMailData) return;

    const { summary, key_points_list, lang_content, suggestion_list } = self.summaryMailData;

    let originalTextReplyEl = document.body.querySelector(`#${self.idTab} #reply_tab .original_text_reply`);
    renderTextStyleChatGPT(originalTextReplyEl, summary);

    for (let i = 0; i < suggestion_list.length; i++) {
      const suggestItem = suggestion_list[i];
      
      let pEl = document.createElement('p');
      pEl.innerHTML = suggestItem;
      let suggestEl = document.createElement('li');
      suggestEl.append(pEl);

      $(`#${self.idTab} #reply_tab .reply-suggestions`).append(suggestEl);
    }
  },

  /**
   * Show alert
   * 
   * @param {string} type 
   * @param {string} message 
   */
  showAlert: (type, message) => {
    const self = TabWriteManager;

    let alertEl = document.createElement('div');
    alertEl.className = 'item ' + type;
    alertEl.innerHTML = message;

    $(`#${self.idTab} .form-config .alert`).append(alertEl);

    alertEl.onclick = (event) => {
      alertEl.remove();
    }
    setTimeout(() => {
      alertEl.remove();
    }, 3000);
  },

  /**
   * Set event for element in panel
   * 
   */
  resetEvent: () => {
    const self = TabWriteManager;

    // For combobox component
    $(document).on('click', `#${self.idTab} .combobox`, function (event) {
      $(`#${self.idTab} .popover-cbx`).removeClass('show');

      const targetEl = event.target;
      const popoverEl = targetEl.querySelector(`#${self.idTab} .popover-cbx`);

      if (!popoverEl) return;

      self.combobox_flag = true;

      popoverEl.classList.add('show');
      popoverEl.style.top = `-${popoverEl.offsetHeight - 10}px`;
      popoverEl.style.left = `${targetEl.offsetWidth - 20}px`;

      if (isRightSideOutOfViewport(popoverEl)) {
        popoverEl.style.left = 'unset'
        popoverEl.style.right = `${targetEl.offsetWidth - 20}px`;
      }
      if (isTopOutOfViewport(popoverEl)) {
        popoverEl.style.top = 'unset'
        // popoverEl.style.bottom = `${targetEl.offsetWidth - 20}px`;
      }

      setTimeout(() => {
        self.combobox_flag = false;
      }, 100)
    });
    $(document).on('click', `#${self.idTab} .popover-cbx.wrap-item .combobox-item`, function (event) {
      if (self.is_loading) return;
      const kind = event.target.getAttribute('kind');
      const value = event.target.getAttribute('value');

      const comboboxEl = $(event.target).parents('button.combobox')[0];
      if (comboboxEl.onSelect) {
        comboboxEl.onSelect(comboboxEl, event.target, kind, value);
      }
    });

    // For tab component
    $(`#${self.idTab} .tab .tab-title .item`).click(event => {
      const targetEl = event.target;
      const keyTab = targetEl.getAttribute('key_tab');

      $(`#${self.idTab} .voice-config .formality`).removeClass('hidden');
      $(`#${self.idTab} .voice-config .formality_reply`).removeClass('hidden');
      if (keyTab == 'reply_tab') {
        $(`#${self.idTab} .voice-config .formality`).addClass('hidden');
      } else {
        $(`#${self.idTab} .voice-config .formality_reply`).addClass('hidden');
      }

      $(`#${self.idTab} .tab .tab-title .item`).removeClass('active');
      $(targetEl).addClass('active');

      $(`#${self.idTab} .tab .tab-body .tab-item`).removeClass('active');
      $(`#${self.idTab} .tab .tab-body #${keyTab}.tab-item`).addClass('active');

      setTimeout(() => {
        let inputFocusEl = document.body.querySelector(`#${self.idTab} .tab.content-config .tab-item.active textarea`);
        $(inputFocusEl).focus();
      });
    });

    const handlerActive = () => {
      $(`#${self.idTab} #result .result-generate .result-item`).removeClass('active');
      let itemActiveEl = $(`#${self.idTab} #result .result-generate .result-item[data-index="${self.result_active}"]`);
      itemActiveEl.addClass('active');

      $(`#${self.idTab} #result .result-generate`).css('height', `${itemActiveEl[0].offsetHeight}px`)

      self.handlerUpdatePaging();
    };
    $(`#${self.idTab} #result .result-title .right .prev`).click((event) => {
      if (self.is_loading) return;
      if (event.target.className.baseVal.indexOf('disable') != -1) {
        return;
      }
      self.result_active--;
      handlerActive();
    })
    $(`#${self.idTab} #result .result-title .right .next`).click((event) => {
      if (self.is_loading) return;
      if (event.target.className.baseVal.indexOf('disable') != -1) {
        return;
      }
      self.result_active++;
      handlerActive();
    })

    // For button submit generate
    $(`#${self.idTab} .submit-generate`).click(self.onSubmitGenerate);

    // For items options voice config
    $(document).on('click', `#${self.idTab} .form-config .wrap-config .item`, self.onClickConfigItem);

    // Remove and save language config
    $(document).on('click', `#${self.idTab} .form-config .wrap-config .item .close`, self.handlerRemoveOptionVoiceConfig);

    // For action button session result footer
    $(`#${self.idTab} .result-footer .btn.re-generate`).click(self.onSubmitGenerate);
    $(`#${self.idTab} .result-footer .btn.copy-content`).click(self.onClickCopyContentResult);
    $(`#${self.idTab} .result-footer .btn.send-to-site`).click(self.onClickSendContentResultToBrowserPage);

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

    $(`#${self.idTab} #result`).removeClass('is-loading');
    $(`#${self.idTab} #result .result-generate .result-item`).remove();

    let resultActiveEl = null;
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      let isActive = (i == self.result_active)

      let titleEl = document.createElement('div');
      titleEl.className = 'title'
      titleEl.innerHTML = `<span class="bold">Subject: </span> ${item.title}`

      let textEl = document.createElement('div');
      textEl.setAttribute('disabled', true);

      textEl.innerHTML = item.body.replaceAll('\n', '<br/>');

      let resultDivEl = document.createElement('div');
      resultDivEl.classList = ['result-item'];
      resultDivEl.setAttribute('data-index', i);
      if (isActive) {
        resultActiveEl = resultDivEl
        resultDivEl.classList.add('active');
      }

      resultDivEl.append(titleEl);
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
    if (self.is_loading) return;

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

  /**
   * Handler remove option voice config
   * 
   * @param {Event} event 
   */
  handlerRemoveOptionVoiceConfig: (event) => {
    const self = TabWriteManager;
    const targetEl = event.target;
    if (self.is_loading) return;

    const parentBtnEl = $(targetEl).parents('button.item.text');
    const kind = parentBtnEl.attr('kind');
    const value = parentBtnEl.attr('value');

    const configItemDefault = VOICE_SETTING_DATA_2.find(item => item.name_kind == kind);
    let record = configItemDefault.options.find(item => {
      return value == item.value
    });

    if (record) {
      const voiceConfig = [...self.voice_config_of_user]

      for (let i = 0; i < voiceConfig.length; i++) {
        const configItem = voiceConfig[i];

        if (configItem.name_kind == kind) {

          if (configItem.options.length <= 1) {
            return;
          }


          // Update all flag is active to false and save index item remove
          let indexOfRemove = -1;
          for (let j = 0; j < configItem.options.length; j++) {
            const option = configItem.options[j];
            configItem.options[j].isActive = false;

            if (option.value == value) {
              indexOfRemove = j;
            }
          }

          configItem.options.splice(indexOfRemove, 1);
          configItem.options[0].isActive = true;

          voiceConfig[i] = configItem;
        }
      }

      // Save to storage
      _StorageManager.setVoiceConfigWrite(voiceConfig);
    }
  },

  /**
   * Process add generate write
   * 
   */
  processAddGenerateWrite: () => {
    const self = TabWriteManager;
    if (self.is_loading) return;

    self.is_loading = true;

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

    $('#write_tab #result .result-title .left .icon').attr('src', getPropGptByVersion('icon', self.formData.gpt_version))
    $('#write_tab #result .result-title .left .name-gpt').text(getPropGptByVersion('name', self.formData.gpt_version))

    _SendMessageManager.generateContentReply(params, (data) => {
      self.generate_result_list.push(data);

      self.handlerShowGenerateResult();
    });
  },

  processTitleContentMailToWrite: () => {
    const self = TabWriteManager;
    if (self.is_loading) return;
    if (!self.title_content_mail_to_write) return;

    let { title, original_text } = self.title_content_mail_to_write;
    if (!title || !original_text) return;

    title = title.trim(), original_text = original_text.trim();
    if (title == '' || original_text == '') return;

    self.is_summarizing = true;
    _SendMessageManager.getSummaryContentMail(title, original_text, (dataRes) => {
      self.summaryMailData = dataRes;

      self.loadSummaryMailData();

      self.is_summarizing = false;
    });
  },

  // Event

  /**
   * On active tab
   * 
   */
  onActive: () => {
    const self = TabWriteManager;

    self.loadVersionGPTConfig();
    self.loadVoiceConfig();
    self.processTitleContentMailToWrite();

    self.resetEvent();

    let tabActive = 'compose_tab';
    if (self.is_summarizing) {
      tabActive = 'reply_tab'
    }
    $(`#${self.idTab} .tab .tab-title .item`).removeClass('active');
    $(`#${self.idTab} .tab .tab-title .item[key_tab="${tabActive}"]`).addClass('active');
    $(`#${self.idTab} .tab .tab-body .tab-item`).removeClass('active');
    $(`#${self.idTab} .tab .tab-body #${tabActive}`).addClass('active');
    $(`#${self.idTab} .tab .tab-body #${tabActive} textarea`).focus();

    $(`#${self.idTab} .voice-config .formality`).removeClass('hidden');
    $(`#${self.idTab} .voice-config .formality_reply`).addClass('hidden');
  },

  /**
   * On submit generate content
   * 
   * @param {event} event 
   */
  onSubmitGenerate: (event) => {
    const self = TabWriteManager;
    if (self.is_loading) return;

    let messValidate = self.isValidateToCallGPT();
    if (messValidate) {
      self.showAlert('error', messValidate);
      return;
    }

    // process add generate write
    self.processAddGenerateWrite();

    const containerEl = document.getElementById(`tab_container`);
    const formConfigEl = document.body.querySelector(`#${self.idTab} .form-config`);
    const resultEl = document.body.querySelector(`#${self.idTab} #result`);

    $(resultEl).removeClass('hidden');
    $(containerEl).animate({
      scrollTop: $(resultEl).offset().top + containerEl.scrollTop
    }, 500);

    $(resultEl).addClass('is-loading');
    // $(resultEl).css('height', formConfigEl.offsetHeight + 'px');
  },

  /**
   * On click copy content result
   * 
   * @param {event} event 
   */
  onClickCopyContentResult: (event) => {
    const self = TabWriteManager;
    if (self.is_loading) return;

    $(event.target).addClass('done');
    navigator.clipboard.writeText(self.generate_result_list[self.result_active].body);

    setTimeout(() => {
      $(event.target).removeClass('done');
    }, 1000);
  },

  /**
   * On click send content result to browser page
   * 
   * @param {event} event 
   */
  onClickSendContentResultToBrowserPage: (event) => {
    const self = TabWriteManager;
    if (self.is_loading) return;

    let itemActive = self.generate_result_list[self.result_active];

    let params = {
      title: itemActive.title,
      body: itemActive.body,
    }
    chrome.storage.sync.set({ side_panel_send_result: params });
  },

  /**
   * On click config item
   * 
   * @param {event} event 
   */
  onClickConfigItem: (event) => {
    const self = TabWriteManager;
    if (self.is_loading) return;

    const targetEl = event.target;
    const kind = targetEl.getAttribute('kind');
    const value = targetEl.getAttribute('value');
    if (!kind || !value) return;

    const configItemDefault = VOICE_SETTING_DATA_2.find(item => item.name_kind == kind);
    let record = configItemDefault.options.find(item => {
      return value == item.value
    });

    if (record) {
      const voiceConfig = [...self.voice_config_of_user]

      for (let i = 0; i < voiceConfig.length; i++) {
        const configItem = voiceConfig[i];

        if (configItem.name_kind == kind) {

          for (let j = 0; j < configItem.options.length; j++) {
            if (configItem.options[j].value == value) {
              configItem.options[j].isActive = true;
            } else {
              configItem.options[j].isActive = false;
            }
          }

          voiceConfig[i] = configItem;
        }
      }

      // Save to storage
      _StorageManager.setVoiceConfigWrite(voiceConfig);
    }
  },

  /**
   * On select combobox component config
   * 
   * @param {Element} comboboxEl 
   * @param {Element} itemEl 
   * @param {string} value 
   */
  onSelectComboboxConfig: (comboboxEl, itemEl, kind, value) => {
    const self = TabWriteManager;
    if (self.is_loading) return;

    const configItemDefault = VOICE_SETTING_DATA_2.find(item => item.name_kind == kind);
    let record = configItemDefault.options.find(item => {
      return value == item.value
    });

    if (record) {
      const voiceConfig = [...self.voice_config_of_user]

      for (let i = 0; i < voiceConfig.length; i++) {
        const configItem = voiceConfig[i];

        if (configItem.name_kind == kind) {

          if (configItem.options.length == MAX_VOICE_CONFIG_OPTIONS_SHOW) {
            // Swap the record into the active option item
            configItem.options = configItem.options.map(item => {
              if (item.isActive) {
                return { ...record, isActive: true }
              }
              return item;
            });

          } else {
            // Update all flag is active to false
            configItem.options = configItem.options.map(item => {
              return { ...item, isActive: false }
            });
            configItem.options.push({ ...record, isActive: true });
          }

          voiceConfig[i] = configItem;
        }
      }

      // Save to storage
      _StorageManager.setVoiceConfigWrite(voiceConfig);
    }
  },

  /**
   * On select version GPT config
   * 
   * @param {Element} comboboxEl 
   * @param {Element} itemEl 
   * @param {string} value 
   */
  onSelectVersionGptConfig: (comboboxEl, itemEl, kind, value) => {
    const self = TabWriteManager;
    if (self.is_loading) return;

    let record = GPT_VERSION_SETTING_DATA.find(item => {
      return value == item.value
    });

    if (record) {
      self.formData['gpt_version'] = value;

      $(`#${self.idTab} #version_gpt .content img`).attr('src', record.icon);
    }
  }
}

/**
 * Wrapper manager
 * 
 */
const WrapperManager = {
  sidebar_flag: false,

  /**
   * Initialize wrapper manager
   */
  _init: () => {
    const self = WrapperManager;

    self.initTab();
    self.setActiveTab();

    self.fixHeightContainer();
  },

  // UI

  /**
   * Set active tab
   * 
   * @param {string} idTab 
   */
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

  /**
   * Fix height container
   * 
   */
  fixHeightContainer: () => {
    const heightMain = document.body.querySelector('.gpt-layout main').offsetHeight;
    const heightTitleMain = document.body.querySelector('.gpt-layout main .title').offsetHeight;
    const heightFooterMain = document.body.querySelector('footer').offsetHeight;

    $('main .wrap-content').css('height', `${heightMain - heightFooterMain}px`);
    $('#tab_container').css('height', `${heightMain - (heightFooterMain + heightTitleMain)}px`);
  },

  /**
   * Initialize all tab
   * 
   */
  initTab: () => {
    const self = WrapperManager;

    self.addTabToSidebar();
    self.addTabToTitleMain();

    // Init write tab
    const writeTabItem = TabWriteManager.createPanel();

    $('#tab_container').append(writeTabItem);

    self.initEvent();
  },

  /**
   * Add tab to title main
   *  
   */
  addTabToTitleMain: () => {
    const self = WrapperManager;

    LIST_TAB.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = `title d-flex content-center align-center`;
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

  /**
   * Add tab to sidebar
   * 
   */
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

    $('.sidebar .btn.collapse .label').html(MyLang.getMsg('TXT_COLLAPSE_NAVBAR'))
    $('.sidebar .footer .setting .label').html(MyLang.getMsg('TXT_SETTING'))
  },

  // Event

  /**
   * Init event for wrapper container
   * 
   */
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

/**
 * Handler when storage has value change
 * 
 * @param {Event} event 
 */
const storageOnChanged = (payload, type) => {
  if ('write_voice_config' in payload) {
    let configNew = payload.write_voice_config.newValue;
    let configOld = payload.write_voice_config.oldValue || [];

    for (let i = 0; i < configNew.length; i++) {
      const itemConfigNew = configNew[i];

      let kindOld = configOld.find(item => item.name_kind == itemConfigNew.name_kind);
      if (!kindOld) {
        // Updated when there is a different name kind
        TabWriteManager.reloadVoiceConfigItem(itemConfigNew.name_kind);

      } else {
        if (itemConfigNew.options.length != kindOld.options.length) {
          // Updated when there is a different options length
          TabWriteManager.reloadVoiceConfigItem(itemConfigNew.name_kind);

        } else {

          for (let j = 0; j < itemConfigNew.options.length; j++) {
            const itemOptionNew = itemConfigNew.options[j];
            let optionsOld = kindOld.options.find(item => (item.name_kind == itemOptionNew.name && item.value == itemOptionNew.value && item.isActive == itemOptionNew.isActive));

            if (!optionsOld) {
              // Updated when there is a different name and value options
              TabWriteManager.reloadVoiceConfigItem(itemConfigNew.name_kind);
            }
          }

        }
      }
    }

    TabWriteManager.voice_config_of_user = configNew;

    USER_SETTING.language_active = TabWriteManager.getLanguageFromConfig();
  }
}

/**
 * Initialize side panel
 * 
 */
const initialize_side = async () => {
  let pallaFinishedCount = 0;
  let NUM_PROCEED_PALLA_FINISHED_COUNT = 3;
  let proceedByPallaFinishedCount = function () {
    pallaFinishedCount++;
    if (pallaFinishedCount >= NUM_PROCEED_PALLA_FINISHED_COUNT) {
      WrapperManager._init();
    }
  };

  _StorageManager.getVoiceConfigWrite(voiceConfig => {
    if (!voiceConfig) {
      voiceConfig = [];
    }

    for (let i = 0; i < VOICE_SETTING_DATA_2.length; i++) {
      const configItem = VOICE_SETTING_DATA_2[i];
      const nameKind = configItem.name_kind, optionsConfig = [...configItem.options];

      let hasConfig = voiceConfig.find(item => item.name_kind == nameKind);
      if (!hasConfig) {
        let optionsDefault = optionsConfig.splice(0, 3);
        optionsDefault[0].isActive = true;
        voiceConfig.push({
          ...configItem,
          options: optionsDefault
        })
      }
    }

    TabWriteManager.voice_config_of_user = voiceConfig;
    USER_SETTING.language_active = TabWriteManager.getLanguageFromConfig();

    proceedByPallaFinishedCount();
  })

  _StorageManager.getTitleContentMailToWrite(titleContent => {
    TabWriteManager.title_content_mail_to_write = titleContent;

    proceedByPallaFinishedCount();
  })

  chrome.storage.onChanged.addListener(storageOnChanged);

  $('body').addClass(LOCALE_CODES.getLangUI());

  chrome.runtime.sendMessage({ method: 'get_user_info' }, (userInfo) => {
    ID_USER_ADDON_LOGIN = userInfo.id;
    USER_ADDON_LOGIN = userInfo.email;

    //addon setting
    loadAddOnSetting(userInfo.email, function (result) {
      is_domain_regist = result.is_domain_regist
      is_not_access_list = result.is_not_access_list
      debugLog(`auto summary chat GPT: domain regist:[${is_domain_regist}], permission deny:[${is_not_access_list}]`)
    });

    proceedByPallaFinishedCount();
  });
}

// __main__
initialize_side();
// }());