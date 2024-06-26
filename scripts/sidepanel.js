(function () {
  'use strict';

  /**
   * Tab write manager
   * 
   */
  const TabWriteManager = {
    is_loading: false,
    is_summarizing: false,
    combobox_flag: false,
    swap_original_text_flag: false,

    idTab: LIST_TAB[0].id,
    indexTab: 0,
    formData: {
      type_generate: null,
      topic_compose: null,
      original_text_reply: null,
      general_content_reply: null,
      gpt_version: null,
    },
    result_active: 0,
    generate_result_list: [],
    voice_config_of_user: [],

    // list_suggest_reply_mail: null,
    title_content_mail_to_write: null,
    originalTextTemp: null,

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
                    <div class="bg-active-icon">
                      ${bg_tab_active_icon}
                    </div>
                  </div>
                  <div class="item" key_tab="reply_tab">
                    <span>${MyLang.getMsg('TXT_REPLY')}</span>
                    <div class="bg-active-icon">
                      ${bg_tab_active_icon}
                    </div>
                  </div>
                </div>
                <div class="tab-body">
                  <span id="compose_tab" class="tab-item">
                    <div class="wrap-topic-to-compose">
                      <textarea class="topic_to_compose" maxlength="${MAX_LENGTH_TOPIC_COMPOSE}" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_TOPIC_COMPOSE')}"></textarea><div class="tips-icon">
                      <div class="action">
                        ${tips_and_update_icon}
                      </div>
                    </div>
                    </div>
                  </span>
                  <span id="reply_tab" class="tab-item">

                    <div class="wrap-original-text-reply">
                      <textarea class="original_text_reply" maxlength="${MAX_LENGTH_ORIGINAL_TEXT_REPLY}" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_REPLY')}"></textarea>

                      <div class="paste-selection">
                        ${content_paste_icon}
                        ${MyLang.getMsg('TXT_PASTE_SELECTION')}
                      </div>
                    </div>

                    <div class="wrap-general-content-reply">
                      <textarea class="general_content_reply" maxlength="${MAX_LENGTH_GENERAL_CONTENT_REPLY}" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_GENERAL_CONTENT_REPLY')}"></textarea>
                      <div class="tips-icon">
                        <div class="action">
                          ${tips_and_update_icon}
                        </div>
                      </div>
                    </div>

                    <ul class="reply-suggestions hidden">
                      <span> ${MyLang.getMsg('TXT_REPLY_SUGGESTIONS')} </span>
                    </ul>

                    <div class="loading-component">
                      <div class="loading">
                      </div>
                      <div class="loading">
                      </div>
                      <div class="loading">
                      </div>
                    </div>

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
      panelEl.className = 'tab-item'
      panelEl.innerHTML = self.getVHtml();

      LIST_TAB[self.indexTab].onActive = self.onActive;
      panelEl.afterRender = self.afterRender;

      return panelEl;
    },

    /**
     * updateUIResultPanel
     * 
     */
    updateUIResultPanel: () => {
      const self = TabWriteManager;

      const containerEl = document.getElementById(WrapperManager.idEl);
      const formConfigEl = document.body.querySelector(`#${self.idTab} .form-config`);

      $((`#${self.idTab} #result`)).css('marginTop', (containerEl.offsetHeight - formConfigEl.offsetHeight) + 'px');

      let itemActiveEl = $(`#${self.idTab} #result .result-generate .result-item.active`);
      if (itemActiveEl.length > 0) {
        $(`#${self.idTab} #result .result-generate`).css('height', `${itemActiveEl[0].offsetHeight}px`)
      }
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

      let topicCompose = $('#write_tab #compose_tab textarea.topic_to_compose').val().trim();
      let originalTextReply = $('#write_tab #reply_tab textarea.original_text_reply').val().trim();
      let generalContentReply = $('#write_tab #reply_tab textarea.general_content_reply').val().trim();

      if (typeGenerate == 'compose') {
        if (!topicCompose || topicCompose == '') {
          return MyLang.getMsg('DES_ERROR_TOPIC_COMPOSE');
        }
        if (topicCompose.length > MAX_LENGTH_TOPIC_COMPOSE) {
          return MyLang.getMsg('DES_ERROR_TOPIC_COMPOSE_MAX_LENGTH_TOKEN');
        }
      }
      if (typeGenerate == 'reply') {
        if (!originalTextReply || originalTextReply == '') {
          return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_REPLY');
        }
        if (originalTextReply.length > MAX_LENGTH_ORIGINAL_TEXT_REPLY) {
          return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_REPLY_MAX_LENGTH_TOKEN');
        }
        if (!generalContentReply || generalContentReply == '') {
          return MyLang.getMsg('DES_ERROR_GENERAL_CONTENT_REPLY');
        }
        if (generalContentReply.length > MAX_LENGTH_GENERAL_CONTENT_REPLY) {
          return MyLang.getMsg('DES_ERROR_GENERAL_CONTENT_REPLY_MAX_LENGTH_TOKEN');
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

    getIdTabActive: () => {
      let typeGenerate = '';
      if ($('#write_tab div[key_tab="compose_tab"]').hasClass('active')) {
        typeGenerate = 'compose_tab'
      } else {
        typeGenerate = 'reply_tab'
      }

      return typeGenerate;
    },

    // Setter
    setOriginalText: (originalText) => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      let originalTextReplyEl = document.body.querySelector(`#${self.idTab} #reply_tab .original_text_reply`);
      $(originalTextReplyEl).val(originalText);

      self.title_content_mail_to_write.original_text = originalText;

      $(originalTextReplyEl).focus();
      $(originalTextReplyEl).scrollTop(0);
    },

    setGeneralContentReply: (general_content_reply, is_direct_send = false, is_prompt_sateraito = false) => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      let generalContentReplyEl = document.body.querySelector(`#${self.idTab} #reply_tab .general_content_reply`);
      $(generalContentReplyEl).val(general_content_reply);

      $(generalContentReplyEl).focus();
      $(generalContentReplyEl).scrollTop(0);

      if (is_direct_send) {
        self.onSubmitGenerate();
      }
    },

    setTopicToCompose: (topic_to_compose, is_direct_send = false, is_prompt_sateraito = false) => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      let topicToComposeEl = document.body.querySelector(`#${self.idTab} #compose_tab .topic_to_compose`);
      $(topicToComposeEl).val(topic_to_compose);
      $(topicToComposeEl).focus();
      $(topicToComposeEl).scrollTop(0);

      if (is_direct_send) {
        self.onSubmitGenerate();
      }
    },

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
        let optionsDefault = VOICE_SETTING_DATA.find(config => config.name_kind == configItem.name_kind).options;
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
                        ${configItem.icon}
                        <span class="text">${configItem.name}</span>
                      </div>
                      <div class="options">
                        ${vHtmlItemConfig}
                        <button class="item combobox" id="${configItem.name_kind}_cbx">
                          <img class="icon" src="${expandMoreIconUrl}" />
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
          let optionsDefault = VOICE_SETTING_DATA.find(config => config.name_kind == configItem.name_kind).options;
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
                        <button class="item combobox" id="${configItem.name_kind}_cbx">
                          <img class="icon" src="${expandMoreIconUrl}" />
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

    /**
     * Load content data mail reply
     * 
     */
    loadContentDataMailReply: () => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      let originalTextReplyEl = document.body.querySelector(`#${self.idTab} #reply_tab .original_text_reply`);
      $(originalTextReplyEl).val(self.title_content_mail_to_write.original_text);

      let swapTextEl = document.createElement('div');
      swapTextEl.className = 'swap-text-original';
      swapTextEl.innerHTML = `<div class="item show-summary"></div> <div class="item show-original-text"></div>`
      $(`#${self.idTab} #reply_tab`).append(swapTextEl);

      setTimeout(() => {
        $(originalTextReplyEl).focus();
        self.is_summarizing = false;
      }, 100);

      // if (!self.list_suggest_reply_mail) return;
      // for (let i = 0; i < self.list_suggest_reply_mail.length; i++) {
      //   const suggestItem = self.list_suggest_reply_mail[i];

      //   let pEl = document.createElement('p');
      //   let suggestEl = document.createElement('li');
      //   suggestEl.className = 'd-flex content-center align-center'
      //   suggestEl.setAttribute('value', suggestItem);
      //   suggestEl.append(pEl);

      //   $(`#${self.idTab} #reply_tab .reply-suggestions`).append(suggestEl);

      //   MyUtils.renderTextStyleChatGPT(pEl, suggestItem)
      // }
      // $(`#${self.idTab} #reply_tab .reply-suggestions`).removeClass('hidden');
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
     * Set active tab
     * 
     * @param {string} tabActive 
     */
    setActiveTab: (tabActive) => {
      const self = TabWriteManager;
      if (self.is_loading) return;
      if (self.is_summarizing) return;

      $(`#${self.idTab} .tab .tab-title .item`).removeClass('active');
      $(`#${self.idTab} .tab .tab-title .item[key_tab="${tabActive}"]`).addClass('active');
      $(`#${self.idTab} .tab .tab-body .tab-item`).removeClass('active');
      $(`#${self.idTab} .tab .tab-body #${tabActive}`).addClass('active');

      $(`#${self.idTab} .voice-config .formality`).removeClass('hidden');
      $(`#${self.idTab} .voice-config .formality_reply`).removeClass('hidden');
      if (tabActive == 'reply_tab') {
        $(`#${self.idTab} .voice-config .formality`).addClass('hidden');
      } else {
        $(`#${self.idTab} .voice-config .formality_reply`).addClass('hidden');
      }

      $(`#${self.idTab} .tab .tab-body #${tabActive} textarea`)[0].focus();

      self.updateHeightTabContainer();
    },

    /**
     * Set event for element in panel
     * 
     */
    resetEvent: () => {
      const self = TabWriteManager;

      let listClsAndEvent = [
        {
          cls: `#${self.idTab} .options`,
          click: self.onClickOptionComboBox
        },
        {
          cls: `#${self.idTab} .popover-cbx.wrap-item .combobox-item`,
          click: self.onClickItemOptionComboBox
        },
        {
          cls: `#${self.idTab} .tab .tab-title .item`,
          click: self.onClickTitleTab
        },
        {
          cls: `#${self.idTab} #result .result-title .right .prev`,
          click: self.handlerNextOrPrevPagingResult
        },
        {
          cls: `#${self.idTab} #result .result-title .right .next`,
          click: self.handlerNextOrPrevPagingResult
        },
        {
          cls: `#${self.idTab} .submit-generate`,
          click: self.onSubmitGenerate
        },
        {
          cls: `#${self.idTab} .form-config .wrap-config .item`,
          click: self.onClickConfigItem
        },
        {
          cls: `#${self.idTab} .form-config .wrap-config .item .close`,
          click: self.handlerRemoveOptionVoiceConfig
        },
        {
          cls: `#${self.idTab} .result-footer .btn.re-generate`,
          click: self.onSubmitGenerate
        },
        {
          cls: `#${self.idTab} .result-footer .btn.copy-content`,
          click: self.onClickCopyContentResult
        },
        {
          cls: `#${self.idTab} .result-footer .btn.send-to-site`,
          click: self.onClickSendContentResultToBrowserPage
        },
        {
          cls: `#${self.idTab} .tips-icon .action`,
          click: self.onClickOpenTips
        },
        {
          cls: `#${self.idTab} #reply_tab .wrap-original-text-reply .paste-selection`,
          click: self.onClickPasteSelection
        },
      ];

      for (let i = 0; i < listClsAndEvent.length; i++) {
        const itemConfig = listClsAndEvent[i];
        $(document).off('click', itemConfig.cls, itemConfig.click);
        $(document).on('click', itemConfig.cls, itemConfig.click);
      }

      let versionGptComboBox = document.body.querySelector(`#${self.idTab} #version_gpt`);
      if (versionGptComboBox && !versionGptComboBox.onSelect) {
        versionGptComboBox.onSelect = self.onSelectVersionGptConfig;
      }
    },

    /**
     * handlerNextOrPrevPagingResult
     * 
     * @param {Event} event 
     */
    handlerNextOrPrevPagingResult: (event) => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      if (event.target.className.baseVal.indexOf('disable') != -1) {
        return;
      }

      if (event.target.className.baseVal.indexOf('next') != -1) {
        self.result_active++;
      } else {
        self.result_active--;
      }

      $(`#${self.idTab} #result .result-generate .result-item`).removeClass('active');
      let itemActiveEl = $(`#${self.idTab} #result .result-generate .result-item[data-index="${self.result_active}"]`);
      itemActiveEl.addClass('active');

      $(`#${self.idTab} #result .result-generate`).css('height', `${itemActiveEl[0].offsetHeight}px`)

      self.handlerUpdatePaging();
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

        let textEl = document.createElement('div');
        textEl.classList = ['wrap-content'];
        textEl.innerHTML = item.body.replaceAll('\n', '<br/>');

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

      self.is_loading = false;

      self.handlerUpdatePaging();
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

      const configItemDefault = VOICE_SETTING_DATA.find(item => item.name_kind == kind);
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

      let topicCompose = $('#write_tab #compose_tab textarea.topic_to_compose').val()
      let originalTextReply = $('#write_tab #reply_tab textarea.original_text_reply').val()
      let generalContentReply = $('#write_tab #reply_tab textarea.general_content_reply').val()

      let params = self.formData;
      params.type_generate = typeGenerate;
      params.topic_compose = topicCompose;
      params.original_text_reply = originalTextReply;
      params.general_content_reply = generalContentReply;

      $(`#${self.idTab} #result .result-footer`).addClass('hidden');
      $(`#${self.idTab} #result .result-title .left .icon`).attr('src', MyUtils.getPropGptByVersion('icon', self.formData.gpt_version));
      $(`#${self.idTab} #result .result-title .left .name-gpt`).text(MyUtils.getPropGptByVersion('name', self.formData.gpt_version));

      const result = self.generate_result_list;
      let indexActive = (result.length);

      // Setup - Add new item tab for this generate 
      self.generate_result_list.push({ title: '', body: '', is_for_reply: (self.getIdTabActive() == 'reply_tab') });
      self.handlerShowGenerateResult();

      let itemActiveEl = null;
      OpenAIManager.generateContentReply(params,
        // Response text function callback
        (textRes) => {
          let innerHTML = itemActiveEl.innerHTML;
          innerHTML += textRes.replaceAll('\n', '<br/>');
          $(itemActiveEl).html(innerHTML);

          $(`#${self.idTab} #result .result-generate`).css('height', `${itemActiveEl.offsetHeight}px`)
        },
        // On [DONE] function callback
        (contentRes) => {
          self.generate_result_list[indexActive].body = contentRes;

          $(itemActiveEl).removeClass('is-loading');
          // $(`#${WrapperManager.idEl}`).removeClass('is-loading');
          $('#write_tab #result .result-footer').removeClass('hidden');

          MyUtils.debugLog("Done!");
        },
        // Call request success function callback
        (success) => {
          itemActiveEl = document.querySelector(`.result-generate .result-item[data-index="${indexActive}"] .wrap-content`);

          $(itemActiveEl).addClass('is-loading');
          $(`#${self.idTab} #result`).removeClass('is-loading');

          MyUtils.debugLog('call request fetch success:' + success);
        });
    },

    /**
     * Process show data title content mail to write
     * 
     */
    processTitleContentMailToWrite: () => {
      const self = TabWriteManager;
      if (self.is_loading) return;
      if (!self.title_content_mail_to_write) return;

      let { title, original_text } = self.title_content_mail_to_write;
      if (!title || !original_text) return;

      title = title.trim(), original_text = original_text.trim();
      if (title == '' || original_text == '') return;

      // $('#reply_tab').addClass('is-loading');

      self.setActiveTab('reply_tab');

      self.is_summarizing = true;
      // OpenAIManager.getSuggestReplyMail(title, original_text, (dataRes) => {
      //   self.list_suggest_reply_mail = dataRes;

      //   self.loadContentDataMailReply();

      //   self.is_summarizing = false;
      //   $('#reply_tab').removeClass('is-loading');
      // });

      self.loadContentDataMailReply();

      _StorageManager.setTitleContentMailToWrite(null);
    },

    /**
     * Clear title content mail to write
     * 
     */
    clearTitleContentMailToWrite: () => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      self.summaryMailData = null;
      self.generate_result_list = [];

      $(`#${self.idTab} #result`).addClass('hidden');
      $(`#${self.idTab} #reply_tab .reply-suggestions`).addClass('hidden');

      $(`#${self.idTab} #compose_tab .topic_to_compose`).val('');
      $(`#${self.idTab} #reply_tab .original_text_reply`).val('');
      $(`#${self.idTab} #reply_tab .general_content_reply`).val('');
      $(`#${self.idTab} #reply_tab .swap-text-original`).remove();
      $(`#${self.idTab} #reply_tab .reply-suggestions li`).remove();
    },

    /**
     * Clear form data
     * 
     */
    clearForm: () => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      self.clearTitleContentMailToWrite();
    },

    /**
     * checkAndSetOriginalText
     * 
     * @param {string} originalText 
     */
    checkAndSetOriginalText: (originalText) => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      let originalTextReply = $(`#${self.idTab} #reply_tab textarea.original_text_reply`).val().trim();
      let pasteSelectionEl = $(`#${self.idTab} #reply_tab .wrap-original-text-reply .paste-selection`);

      if (originalText == EMPTY_KEY) {
        pasteSelectionEl.removeClass('show');
        return;
      }

      if (originalTextReply == '') {
        TabWriteManager.setOriginalText(originalText);
        TabWriteManager.setActiveTab('reply_tab');
      } else {
        if (originalTextReply != originalText) {
          TabWriteManager.originalTextTemp = originalText;
          pasteSelectionEl.addClass('show');
          TabWriteManager.setActiveTab('reply_tab');
        }
      }

      $(`#${WrapperManager.idEl}`).scrollTop(0);
    },

    /**
     * updateHeightTabContainer
     * 
     */
    updateHeightTabContainer: () => {
      const self = TabWriteManager;

      const containerEl = document.getElementById(WrapperManager.idEl);
      const formConfigEl = document.body.querySelector(`#${self.idTab} .form-config`);
      const resultEl = document.body.querySelector(`#${self.idTab} #result`);
      $(resultEl).css('marginTop', (containerEl.offsetHeight - formConfigEl.offsetHeight) + 'px');
    },

    /**
     * Handler on storage changed
     * 
     * @param {object} payload 
     * @param {string} type 
     */
    handlerOnStorageOnChanged: (payload, type) => {
      const self = TabWriteManager;

      if ('original_text_side_panel' in payload) {
        let originalTextNew = payload.original_text_side_panel.newValue;
        if (originalTextNew) {
          _StorageManager.removeOriginalTextSidePanel();

          self.checkAndSetOriginalText(originalTextNew);
        }
      }
      if ('general_content_reply_side_panel' in payload) {
        let newValue = payload.general_content_reply_side_panel.newValue;
        if (newValue) {
          let { general_content_reply, is_direct_send, is_prompt_sateraito } = newValue;

          if (self.getIdTabActive() == 'reply_tab') {
            self.setGeneralContentReply(general_content_reply, is_direct_send, is_prompt_sateraito);
          } else {
            self.setTopicToCompose(general_content_reply, is_direct_send, is_prompt_sateraito);
          }

          _StorageManager.removeGeneralContentReplySidePanel();
        }
      }
      if ('write_voice_config' in payload) {
        let configNew = payload.write_voice_config.newValue;
        let configOld = payload.write_voice_config.oldValue || [];

        for (let i = 0; i < configNew.length; i++) {
          const itemConfigNew = configNew[i];

          let kindOld = configOld.find(item => item.name_kind == itemConfigNew.name_kind);
          if (!kindOld) {
            // Updated when there is a different name kind
            self.reloadVoiceConfigItem(itemConfigNew.name_kind);

          } else {
            if (itemConfigNew.options.length != kindOld.options.length) {
              // Updated when there is a different options length
              self.reloadVoiceConfigItem(itemConfigNew.name_kind);

            } else {

              for (let j = 0; j < itemConfigNew.options.length; j++) {
                const itemOptionNew = itemConfigNew.options[j];
                let optionsOld = kindOld.options.find(item => (item.name_kind == itemOptionNew.name && item.value == itemOptionNew.value && item.isActive == itemOptionNew.isActive));

                if (!optionsOld) {
                  // Updated when there is a different name and value options
                  self.reloadVoiceConfigItem(itemConfigNew.name_kind);
                }
              }

            }
          }
        }

        self.voice_config_of_user = configNew;

        UserSetting.language_active = self.getLanguageFromConfig();
      }
      if ('title_content_mail_to_write' in payload) {
        let dataNew = payload.title_content_mail_to_write.newValue;

        if (dataNew && typeof (dataNew.title) != 'undefined' && typeof (dataNew.original_text) != 'undefined') {
          self.clearTitleContentMailToWrite();
          self.title_content_mail_to_write = { ...dataNew };
          self.processTitleContentMailToWrite();
        }
      }
    },

    checkOnStorageChangedNeedToActiveTab: (payload, type) => {
      const self = TabWriteManager;

      if ('title_content_mail_to_write' in payload) {
        return true;
      }

      return false;
    },

    // Event
    afterRender: () => {
      const self = TabWriteManager;

      self.loadVersionGPTConfig();
      self.loadVoiceConfig();
      self.processTitleContentMailToWrite();

      let tabActive = 'compose_tab';
      if (self.is_summarizing) {
        tabActive = 'reply_tab'
      }
      self.setActiveTab(tabActive);
    },

    /**
     * On active tab
     * 
     */
    onActive: () => {
      const self = TabWriteManager;

      self.setActiveTab(self.getIdTabActive());

      self.resetEvent();

      WrapperManager.fixHeightContainer();
      $(`#tab_container`).scrollTop(0);

      MyUtils.debugLog(`Active: ${self.idTab}`);      
    },

    /**
     * onClickTitleTab
     * 
     * @param {Event} event 
     */
    onClickTitleTab: (event) => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      const targetEl = event.target;
      const keyTab = targetEl.getAttribute('key_tab');

      self.setActiveTab(keyTab);
    },

    /**
     * onClickOptionComboBox
     * 
     * @param {Event} event 
     */
    onClickOptionComboBox: (event) => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      const targetEl = event.target;

      const popoverEl = targetEl.querySelector(`#${self.idTab} .popover-cbx`);
      if (!popoverEl) return;

      $(`#${self.idTab} .popover-cbx`).removeClass('show');
      self.combobox_flag = true;

      popoverEl.classList.add('show');

      if (MyUtils.isRightSideOutOfViewport(popoverEl)) {
        popoverEl.style.left = 'unset'
        popoverEl.style.right = `${targetEl.offsetWidth - 20}px`;
      }
      if (MyUtils.isBottomSideOutOfViewport(popoverEl)) {
        popoverEl.style.top = 'unset'
        popoverEl.style.bottom = `35px`;
      }

      setTimeout(() => {
        self.combobox_flag = false;
      }, 100)
    },

    /**
     * onClickItemOptionComboBox
     * 
     * @param {Event} event 
     */
    onClickItemOptionComboBox: (event) => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      const kind = event.target.getAttribute('kind');
      const value = event.target.getAttribute('value');

      const comboboxEl = $(event.target).parents('button.combobox')[0];
      if (comboboxEl.onSelect) {
        comboboxEl.onSelect(comboboxEl, event.target, kind, value);
      }
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
      self.updateHeightTabContainer();

      const containerEl = document.getElementById(WrapperManager.idEl);
      const resultEl = document.body.querySelector(`#${self.idTab} #result`);

      $(resultEl).removeClass('hidden');
      $(resultEl).addClass('is-loading');
      $(containerEl).animate({
        scrollTop: $(resultEl).offset().top + containerEl.scrollTop
      }, 250, 'swing', () => {
        // $(containerEl).addClass('is-loading');
      });
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
        id_popup: self.title_content_mail_to_write.id_popup,
        title: itemActive.title,
        body: itemActive.body,
        is_for_reply: itemActive.is_for_reply,
      }
      chrome.storage.local.set({ side_panel_send_result: params });
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

      const configItemDefault = VOICE_SETTING_DATA.find(item => item.name_kind == kind);
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

      const configItemDefault = VOICE_SETTING_DATA.find(item => item.name_kind == kind);
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
    },

    /**
     * On click open prompt sateraito
     * 
     * @param {Event} event 
     */
    onClickOpenTips: (event) => {
      const self = TabWriteManager;

      _StorageManager.toggleSidePromptBuilder();

      setTimeout(() => {
        _StorageManager.removeToggleSidePromptBuilder();
      }, 500);
    },

    /**
     * On click paste selection to text original
     * 
     * @param {Event} event 
     */
    onClickPasteSelection: (event) => {
      const self = TabWriteManager;

      if (self.originalTextTemp) {
        self.setOriginalText(self.originalTextTemp);

        self.originalTextTemp = null;
      }

      $(`#${self.idTab} #reply_tab .wrap-original-text-reply .paste-selection`).removeClass('show');
    }
  };

  /**
  * Tab summary manager
  * 
  */
  const TabSummaryManager = {
    idTab: LIST_TAB[1].id,
    indexTab: 1,

    combobox_flag: false,

    is_loading: false,
    formData: {
      gpt_version: null,
    },
    result_active: 0,
    generate_result_list: [],
    original_text_summary: '',
    original_text_summary_all_thread: '',

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

              <div class="tab">
                <div class="tab-title">
                  <div class="item active" key_tab="one_thread_tab">
                    <span>${MyLang.getMsg('TXT_SUMMARY_ONE_THREAD')}</span>
                    <div class="bg-active-icon">
                      ${bg_tab_active_icon}
                    </div>
                  </div>
                  <div class="item" key_tab="all_thread_tab">
                    <span>${MyLang.getMsg('TXT_SUMMARY_ALL_THREAD')}</span>
                    <div class="bg-active-icon">
                      ${bg_tab_active_icon}
                    </div>
                  </div>
                </div>

                <div class="tab-body">
                  <span id="one_thread_tab" class="tab-item active">
                    <div class="wrap-original-text-summary">
                      <textarea class="original_text_summary" maxlength="${MAX_LENGTH_ORIGINAL_TEXT_SUMMARY}" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_SUMMARY')}"></textarea>

                      <div class="paste-selection">
                        ${content_paste_icon}
                        ${MyLang.getMsg('TXT_PASTE_SELECTION')}
                      </div>
                    </div>
                  </span>

                  <span id="all_thread_tab" class="tab-item">
                    <div class="wrap-original-text-summary-all-thread">
                      <textarea class="original_text_summary_all_thread" maxlength="${MAX_LENGTH_ORIGINAL_TEXT_SUMMARY}" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_SUMMARY')}"></textarea>

                      <div class="paste-selection">
                        ${content_paste_icon}
                        ${MyLang.getMsg('TXT_PASTE_SELECTION')}
                      </div>
                    </div>
                  </span>
                </div>
              </div>

              <div class="summary-length config">
                <div class="title">
                  <div class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>
                  </div>
                  
                  <span>${MyLang.getMsg('TXT_LENGTH_SUMMARY_SETTING')}</span>
                </div>
                
                <div class="options">
                </div>
              </div>

              <div class="version config">
                <div class="options">
                </div>

                <button class="submit-summary">${MyLang.getMsg('TXT_GENERATE_SUMMARY')}</button>
              </div>

              <div class="alert">
              </div>
            </div>

            <div id="summary-result" class="hidden is-loading">

              <div class="result-title">
                <div class="left">
                  <img class="icon" src="./icons/chatgpt-icon.svg" alt="gpt-version-icon">
                  <span class="name-gpt">...</span>
                </div>

                <div class="right">
                  <svg class="icon prev disable" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                  </svg>
                  <span class="text"> _/_ </span>
                  <svg class="icon next disable" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                  </svg>
                </div>
              </div>

              <div class="result-summary">
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
      const self = TabSummaryManager;

      self.result_active = 0;
      self.generate_result_list = [];

      self.formData['gpt_version'] = GPT_VERSION_SETTING_DATA[0].value;

      const panelEl = document.createElement('div');
      panelEl.id = self.idTab
      panelEl.className = 'tab-item'
      panelEl.innerHTML = self.getVHtml();

      LIST_TAB[self.indexTab].onActive = self.onActive;
      panelEl.afterRender = self.afterRender;

      return panelEl;
    },

    /**
     * updateUIResultPanel
     * 
     */
    updateUIResultPanel: () => {
      const self = TabSummaryManager;

      const containerEl = document.getElementById(WrapperManager.idEl);
      const formConfigEl = document.body.querySelector(`#${self.idTab} .form-config`);

      $((`#${self.idTab} #summary-result`)).css('marginTop', (containerEl.offsetHeight - formConfigEl.offsetHeight) + 'px');

      let itemActiveEl = $(`#${self.idTab} #summary-result .result-summary .result-item.active`);
      if (itemActiveEl.length > 0) {
        $(`#${self.idTab} #summary-result .result-summary`).css('height', `${itemActiveEl[0].offsetHeight}px`)
      }
    },

    /**
     * updateHeightTabContainer
     * 
     */
    updateHeightTabContainer: () => {
      const self = TabSummaryManager;

      const containerEl = document.getElementById(WrapperManager.idEl);
      const formConfigEl = document.body.querySelector(`#${self.idTab} .form-config`);
      const resultEl = document.body.querySelector(`#${self.idTab} #summary-result`);
      $(resultEl).css('marginTop', (containerEl.offsetHeight - formConfigEl.offsetHeight) + 'px');
    },

    /**
     * Check form data is validate to call GPT
     * 
     * @returns {boolean}
     */
    isValidateToCallGPT: () => {
      const self = TabSummaryManager;

      if (self.getIdTabActive() == 'one_thread_tab') {
        let originalTextSummary = $(`#${self.idTab} .original_text_summary`).val().trim();

        if (!originalTextSummary || originalTextSummary == '') {
          return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_SUMMARY');
        }
        if (originalTextSummary.length > MAX_LENGTH_ORIGINAL_TEXT_SUMMARY) {
          return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_SUMMARY_MAX_LENGTH_TOKEN');
        }
      } else {
        let originalTextSummary = $(`#${self.idTab} .original_text_summary_all_thread`).val().trim();

        if (!originalTextSummary || originalTextSummary == '') {
          return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_SUMMARY');
        }
        if (originalTextSummary.length > MAX_LENGTH_ORIGINAL_TEXT_SUMMARY) {
          return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_SUMMARY_MAX_LENGTH_TOKEN');
        }
      }

      if (self.formData.gpt_version == 'gemini') {
        return MyLang.getMsg('DES_ERROR_GEMINI_NOT_RELEASED');
      }
      if (self.formData.gpt_version == 'gpt-4-turbo') {
        return MyLang.getMsg('DES_ERROR_GPT4_NOT_RELEASED');
      }
    },

    getIdTabActive: () => {
      const self = TabSummaryManager;

      if ($(`#${self.idTab} div[key_tab="one_thread_tab"]`).hasClass('active')) {
        return 'one_thread_tab'
      } else {
        return 'all_thread_tab'
      }
    },

    // Setter
    setOriginalText: (originalText) => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      let textareaEl = document.body.querySelector(`#${self.idTab} .original_text_summary`);
      $(textareaEl).val(originalText);

      self.original_text_summary = originalText;

      self.setActiveTab('one_thread_tab');
      self.setFocusOriginalText();
    },

    setOriginalTextAllThread: (originalText) => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      let textareaEl = document.body.querySelector(`#${self.idTab} .original_text_summary_all_thread`);
      $(textareaEl).val(originalText);

      self.original_text_summary_all_thread = originalText;

      self.setActiveTab('all_thread_tab');
      self.setFocusOriginalTextAllThread();
    },

    setOriginalTextFromStorage: () => {
      const self = TabSummaryManager;

      _StorageManager.getTextSummarySidePanel(text => {
        self.setActiveTab('one_thread_tab');
        self.setOriginalText(text);

        _StorageManager.removeTextSummarySidePanel();
      });
    },

    setOriginalTextAllThreadFromStorage: () => {
      const self = TabSummaryManager;

      _StorageManager.getTextAllThreadSummarySidePanel(text => {
        self.setOriginalTextAllThread(text);

        _StorageManager.removeTextAllThreadSummarySidePanel();
      });
    },

    /**
     * checkAndSetOriginalText
     * 
     * @param {string} originalText 
     */
    checkAndSetOriginalText: (originalText) => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      let originalTextSummary = $(`#${self.idTab} textarea.original_text_summary`).val().trim();
      let pasteSelectionEl = $(`#${self.idTab} .wrap-original-text-summary .paste-selection`);
      let originalTextSummaryAllThread = $(`#${self.idTab} textarea.original_text_summary_all_thread`).val().trim();
      let pasteSelectionAllThreadEl = $(`#${self.idTab} .wrap-original-text-summary-all-thread .paste-selection`);

      if (originalText == EMPTY_KEY) {
        pasteSelectionEl.removeClass('show');
        pasteSelectionAllThreadEl.removeClass('show');
        return;
      }

      if (self.getIdTabActive() == 'one_thread_tab') {
        if (originalTextSummary == '') {
          self.setOriginalText(originalText);
        } else {
          if (originalTextSummary != originalText) {
            self.originalTextTemp = originalText;
            pasteSelectionEl.addClass('show');
          }
        }
      } else {
        if (originalTextSummaryAllThread == '') {
          self.setOriginalTextAllThread(originalText);
        } else {
          if (originalTextSummaryAllThread != originalText) {
            self.originalTextTemp = originalText;
            pasteSelectionAllThreadEl.addClass('show');
          }
        }
      }

      $(`#${WrapperManager.idEl}`).scrollTop(0);
    },

    /**
     * setFocusOriginalText
     * 
     */
    setFocusOriginalText: () => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      let textareaEl = document.body.querySelector(`#${self.idTab} .original_text_summary`);
      $(textareaEl).focus();
      $(textareaEl).scrollTop(0);
    },

    /**
     * setFocusOriginalText
     * 
     */
    setFocusOriginalTextAllThread: () => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      let textareaEl = document.body.querySelector(`#${self.idTab} .original_text_summary_all_thread`);
      $(textareaEl).focus();
      $(textareaEl).scrollTop(0);
    },

    /**
     * loadFormConfig
     * 
     */
    loadFormConfig: () => {
      const self = TabSummaryManager;

      const data = SUMMARY_LENGTH_SETTING_DATA;

      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        let wrapEl = document.createElement('div');
        wrapEl.className = 'wrap-config-item';

        wrapEl.innerHTML = `
          <input id="summary-length-${item.value}" type="radio" ${i == 0 ? 'checked' : ''} name="summary-length" value="${item.value}">
          <label for="summary-length-${item.value}">${item.display}</label>
        `;

        $(`#${self.idTab} .summary-length .options`).append(wrapEl);
      }
    },

    /**
     * Load and show list option gpt version for user
     * 
     */
    loadVersionGPTConfig: () => {
      const self = TabSummaryManager;

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
     * Show alert
     * 
     * @param {string} type 
     * @param {string} message 
     */
    showAlert: (type, message) => {
      const self = TabSummaryManager;

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
     * Set active tab
     * 
     * @param {string} tabActive 
     */
    setActiveTab: (tabActive) => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      $(`#${self.idTab} .tab .tab-title .item`).removeClass('active');
      $(`#${self.idTab} .tab .tab-title .item[key_tab="${tabActive}"]`).addClass('active');
      $(`#${self.idTab} .tab .tab-body .tab-item`).removeClass('active');
      $(`#${self.idTab} .tab .tab-body #${tabActive}`).addClass('active');

      $(`#${self.idTab} .tab .tab-body #${tabActive} textarea`)[0].focus();
    },

    /**
     * Set event for element in panel
     * 
     */
    resetEvent: () => {
      const self = TabSummaryManager;

      let listClsAndEvent = [
        {
          cls: `#${self.idTab} .options`,
          click: self.onClickOptionComboBox
        },
        {
          cls: `#${self.idTab} .popover-cbx.wrap-item .combobox-item`,
          click: self.onClickItemOptionComboBox
        },
        {
          cls: `#${self.idTab} .tab .tab-title .item`,
          click: self.onClickTitleTab
        },
        {
          cls: `#${self.idTab} #summary-result .result-title .right .prev`,
          click: self.handlerNextOrPrevPagingResult
        },
        {
          cls: `#${self.idTab} #summary-result .result-title .right .next`,
          click: self.handlerNextOrPrevPagingResult
        },
        {
          cls: `#${self.idTab} .submit-summary`,
          click: self.onSubmitSummary
        },
        {
          cls: `#${self.idTab} .result-footer .btn.re-generate`,
          click: self.onSubmitSummary
        },
        {
          cls: `#${self.idTab} .result-footer .btn.copy-content`,
          click: self.onClickCopyContentResult
        },
        {
          cls: `#${self.idTab} .paste-selection`,
          click: self.onClickPasteSelection
        },
      ];

      for (let i = 0; i < listClsAndEvent.length; i++) {
        const itemConfig = listClsAndEvent[i];
        $(document).off('click', itemConfig.cls, itemConfig.click);
        $(document).on('click', itemConfig.cls, itemConfig.click);
      }

      let versionGptComboBox = document.body.querySelector(`#${self.idTab} #version_gpt`);
      if (versionGptComboBox && !versionGptComboBox.onSelect) {
        versionGptComboBox.onSelect = self.onSelectVersionGptConfig;
      }
    },

    /**
     * handlerNextOrPrevPagingResult
     * 
     * @param {Event} event 
     */
    handlerNextOrPrevPagingResult: (event) => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      if (event.target.className.baseVal.indexOf('disable') != -1) {
        return;
      }

      if (event.target.className.baseVal.indexOf('next') != -1) {
        self.result_active++;
      } else {
        self.result_active--;
      }

      $(`#${self.idTab} #summary-result .result-summary .result-item`).removeClass('active');
      let itemActiveEl = $(`#${self.idTab} #summary-result .result-summary .result-item[data-index="${self.result_active}"]`);
      itemActiveEl.addClass('active');

      $(`#${self.idTab} #summary-result .result-summary`).css('height', `${itemActiveEl[0].offsetHeight}px`)

      self.handlerUpdatePaging();
    },

    /**
     * Handler show generate result
     * 
     */
    handlerShowSummaryResult: function () {
      const self = TabSummaryManager;

      const result = self.generate_result_list;
      self.result_active = (result.length - 1);

      $(`#${self.idTab} #summary-result`).removeClass('is-loading');
      $(`#${self.idTab} #summary-result .result-summary .result-item`).remove();

      let resultActiveEl = null;
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        let isActive = (i == self.result_active)

        let textEl = document.createElement('div');
        textEl.classList = ['wrap-content'];
        textEl.innerHTML = item.summary_text_result.replaceAll('\n', '<br/>');

        let resultDivEl = document.createElement('div');
        resultDivEl.classList = ['result-item'];
        resultDivEl.setAttribute('data-index', i);
        if (isActive) {
          resultActiveEl = resultDivEl
          resultDivEl.classList.add('active');
        }

        resultDivEl.append(textEl);

        $(`#${self.idTab} #summary-result .result-summary`).append(resultDivEl);
      }

      self.is_loading = false;

      self.handlerUpdatePaging();
    },

    /**
     * Handler update paging status
     * 
     */
    handlerUpdatePaging: function () {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      const result_list = self.generate_result_list;

      $(`#${self.idTab} #summary-result .result-title .right .text`).html(`${self.result_active + 1}/${result_list.length}`)

      // paging prev
      if (self.result_active <= 0) {
        $(`#${self.idTab} #summary-result .result-title .right .prev`)[0].classList.add('disable');
      } else {
        $(`#${self.idTab} #summary-result .result-title .right .prev`)[0].classList.remove('disable');
      }

      // paging next
      if (self.result_active >= (result_list.length - 1)) {
        $(`#${self.idTab} #summary-result .result-title .right .next`)[0].classList.add('disable');
      } else {
        $(`#${self.idTab} #summary-result .result-title .right .next`)[0].classList.remove('disable');
      }
    },

    /**
     * Process add generate write
     * 
     */
    processAddSummary: () => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      self.is_loading = true;

      let originalTextSummary = $(`#${self.idTab} textarea.original_text_summary`).val()
      let originalTextSummaryAllThread = $(`#${self.idTab} textarea.original_text_summary_all_thread`).val()
      let summaryLength = $('input[name="summary-length"]:checked').val()

      let params = self.formData;
      if (self.getIdTabActive() == 'one_thread_tab') {
        params.original_text_summary = originalTextSummary;
      } else {
        params.original_text_summary = originalTextSummaryAllThread;
      }
      params.summary_length = summaryLength;
      params.language = UserSetting.language_active;

      $(`#${self.idTab} #summary-result .result-footer`).addClass('hidden');
      $(`#${self.idTab} #summary-result .result-title .left .icon`).attr('src', MyUtils.getPropGptByVersion('icon', self.formData.gpt_version));
      $(`#${self.idTab} #summary-result .result-title .left .name-gpt`).text(MyUtils.getPropGptByVersion('name', self.formData.gpt_version));

      const result = self.generate_result_list;
      let indexActive = (result.length);

      // Setup - Add new item tab for this generate 
      self.generate_result_list.push({ original_text_summary: originalTextSummary, summary_length: summaryLength, summary_text_result: '' });
      self.handlerShowSummaryResult();

      let itemActiveEl = null;
      OpenAIManager.summaryOriginalText(params,
        // Response text function callback
        (textRes) => {
          let innerHTML = itemActiveEl.innerHTML;
          innerHTML += textRes.replaceAll('\n', '<br/>');
          $(itemActiveEl).html(innerHTML);

          $(`#${self.idTab} #summary-result .result-summary`).css('height', `${itemActiveEl.offsetHeight}px`)
        },
        // On [DONE] function callback
        (contentRes) => {
          self.generate_result_list[indexActive].summary_text_result = contentRes;

          $(itemActiveEl).removeClass('is-loading');
          // $(`#${WrapperManager.idEl}`).removeClass('is-loading');
          $(`#${self.idTab} #summary-result .result-footer`).removeClass('hidden');

          MyUtils.debugLog("Done!");
        },
        // Call request success function callback
        (success) => {
          itemActiveEl = document.querySelector(`.result-summary .result-item[data-index="${indexActive}"] .wrap-content`);

          $(itemActiveEl).addClass('is-loading');
          $(`#${self.idTab} #summary-result`).removeClass('is-loading');

          MyUtils.debugLog('call request fetch success:' + success);
        });
    },

    /**
     * Handler on storage changed
     * 
     * @param {object} payload 
     * @param {string} type 
     */
    handlerOnStorageOnChanged: (payload, type) => {
      const self = TabSummaryManager;

      if ('text_summary_side_panel' in payload) {
        let textNew = payload.text_summary_side_panel.newValue;
        if (textNew) {
          _StorageManager.removeTextSummarySidePanel();

          self.setOriginalText(textNew);
        }
      }
      if ('text_all_thread_summary_side_panel' in payload) {
        let textNew = payload.text_all_thread_summary_side_panel.newValue;
        if (textNew) {
          _StorageManager.removeTextAllThreadSummarySidePanel();

          self.setOriginalTextAllThread(textNew);
        }
      }
    },

    handlerOnTextSelectedInPage: (textSelection) => {
      const self = TabSummaryManager;

      self.checkAndSetOriginalText(textSelection);
    },

    checkOnStorageChangedNeedToActiveTab: (payload, type) => {
      const self = TabSummaryManager;

      if ('text_summary_side_panel' in payload) {
        return true;
      }
      if ('text_all_thread_summary_side_panel' in payload) {
        return true;
      }

      return false;
    },

    // Event handler
    afterRender: () => {
      const self = TabSummaryManager;

      self.loadFormConfig();
      self.loadVersionGPTConfig();
    },

    /**
     * on Active
     */
    onActive: () => {
      const self = TabSummaryManager;

      self.resetEvent();
      self.setFocusOriginalText();

      WrapperManager.fixHeightContainer();
      $(`#tab_container`).scrollTop(0);

      MyUtils.debugLog(`Active: ${self.idTab}`);
    },

    /**
     * onClickTitleTab
     * 
     * @param {Event} event 
     */
    onClickTitleTab: (event) => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      const targetEl = event.target;
      const keyTab = targetEl.getAttribute('key_tab');

      self.setActiveTab(keyTab);
    },

    /**
     * onClickOptionComboBox
     * 
     * @param {Event} event 
     */
    onClickOptionComboBox: (event) => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      const targetEl = event.target;

      const popoverEl = targetEl.querySelector(`#${self.idTab} .popover-cbx`);
      if (!popoverEl) return;

      $(`#${self.idTab} .popover-cbx`).removeClass('show');
      self.combobox_flag = true;

      popoverEl.classList.add('show');

      if (MyUtils.isRightSideOutOfViewport(popoverEl)) {
        popoverEl.style.left = 'unset'
        popoverEl.style.right = `${targetEl.offsetWidth - 20}px`;
      }
      if (MyUtils.isBottomSideOutOfViewport(popoverEl)) {
        popoverEl.style.top = 'unset'
        popoverEl.style.bottom = `35px`;
      }

      setTimeout(() => {
        self.combobox_flag = false;
      }, 100)
    },

    /**
     * onClickItemOptionComboBox
     * 
     * @param {Event} event 
     */
    onClickItemOptionComboBox: (event) => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      const kind = event.target.getAttribute('kind');
      const value = event.target.getAttribute('value');

      const comboboxEl = $(event.target).parents('button.combobox')[0];
      if (comboboxEl.onSelect) {
        comboboxEl.onSelect(comboboxEl, event.target, kind, value);
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
      const self = TabSummaryManager;
      if (self.is_loading) return;

      let record = GPT_VERSION_SETTING_DATA.find(item => {
        return value == item.value
      });

      if (record) {
        self.formData['gpt_version'] = value;

        $(`#${self.idTab} #version_gpt .content img`).attr('src', record.icon);
      }
    },

    /**
     * On submit summary content
     * 
     * @param {event} event 
     */
    onSubmitSummary: (event) => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      let messValidate = self.isValidateToCallGPT();
      if (messValidate) {
        self.showAlert('error', messValidate);
        return;
      }

      // process add generate write
      self.processAddSummary();
      self.updateHeightTabContainer();

      const containerEl = document.getElementById(WrapperManager.idEl);
      const resultEl = document.body.querySelector(`#${self.idTab} #summary-result`);

      $(resultEl).removeClass('hidden');
      $(resultEl).addClass('is-loading');
      $(containerEl).animate({
        scrollTop: $(resultEl).offset().top + containerEl.scrollTop
      }, 250, 'swing', () => {
        // $(containerEl).addClass('is-loading');
      });
    },

    /**
     * On click copy content result
     * 
     * @param {event} event 
     */
    onClickCopyContentResult: (event) => {
      const self = TabSummaryManager;
      if (self.is_loading) return;

      $(event.target).addClass('done');
      navigator.clipboard.writeText(self.generate_result_list[self.result_active].summary_text_result);

      setTimeout(() => {
        $(event.target).removeClass('done');
      }, 1000);
    },

    /**
     * On click paste selection to text original
     * 
     * @param {Event} event 
     */
    onClickPasteSelection: (event) => {
      const self = TabSummaryManager;

      if (self.getIdTabActive() == 'one_thread_tab') {
        self.setOriginalText(self.originalTextTemp);
      } else {
        self.setOriginalTextAllThread(self.originalTextTemp);
      }

      self.originalTextTemp = null;
      $(`#${self.idTab} .paste-selection`).removeClass('show');
    }
  };

  /**
  * Tab find the problem manager
  * 
  */
  const TabFindProblemManager = {
    idTab: LIST_TAB[2].id,
    indexTab: 2,

    combobox_flag: false,

    is_loading: false,
    formData: {
      gpt_version: null,
    },
    result_active: 0,
    generate_result_list: [],

    original_text_check_problem: '',
    original_text_check_problem_all_thread: '',

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

              <div class="tab">
                <div class="tab-title">
                  <div class="item active" key_tab="check_problem_one_thread_tab">
                    <span>${MyLang.getMsg('TXT_SUMMARY_ONE_THREAD')}</span>
                    <div class="bg-active-icon">
                      ${bg_tab_active_icon}
                    </div>
                  </div>
                  <div class="item" key_tab="check_problem_all_thread_tab">
                    <span>${MyLang.getMsg('TXT_SUMMARY_ALL_THREAD')}</span>
                    <div class="bg-active-icon">
                      ${bg_tab_active_icon}
                    </div>
                  </div>
                </div>

                <div class="tab-body">
                  <span id="check_problem_one_thread_tab" class="tab-item active">
                    <div class="wrap-original-text-check-problem">
                      <textarea class="original_text_check_problem" maxlength="8000" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_CHECK_PROBLEM')}"></textarea>
                      
                      <div class="paste-selection">
                        ${content_paste_icon}
                        ${MyLang.getMsg('TXT_PASTE_SELECTION')}
                      </div>
                    </div>
                  </span>

                  <span id="check_problem_all_thread_tab" class="tab-item">
                    <div class="wrap-original-text-check-problem-all-thread">
                      <textarea class="original_text_check_problem_all_thread" maxlength="8000" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_CHECK_PROBLEM')}"></textarea>
                      
                      <div class="paste-selection">
                        ${content_paste_icon}
                        ${MyLang.getMsg('TXT_PASTE_SELECTION')}
                      </div>
                    </div>
                  </span>
                </div>
              </div>

              <div class="version config">
                <div class="options">
                </div>

                <button class="submit-find-problem">${MyLang.getMsg('TXT_GENERATE_FIND_PROBLEM')}</button>
              </div>

              <div class="alert">
              </div>
            </div>

            <div id="find-problem-result" class="hidden is-loading">

              <div class="result-title">
                <div class="left">
                  <img class="icon" src="./icons/chatgpt-icon.svg" alt="gpt-version-icon">
                  <span class="name-gpt">...</span>
                </div>

                <div class="right">
                  <svg class="icon prev disable" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                  </svg>
                  <span class="text"> _/_ </span>
                  <svg class="icon next disable" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                  </svg>
                </div>
              </div>

              <div class="result-find-problem">
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
      const self = TabFindProblemManager;

      self.result_active = 0;
      self.generate_result_list = [];

      self.formData['gpt_version'] = GPT_VERSION_SETTING_DATA[0].value;

      const panelEl = document.createElement('div');
      panelEl.id = self.idTab
      panelEl.className = 'tab-item'
      panelEl.innerHTML = self.getVHtml();

      LIST_TAB[self.indexTab].onActive = self.onActive;
      panelEl.afterRender = self.afterRender;

      return panelEl;
    },

    /**
    * updateUIResultPanel
    * 
    */
    updateUIResultPanel: () => {
      const self = TabFindProblemManager;

      const containerEl = document.getElementById(WrapperManager.idEl);
      const formConfigEl = document.body.querySelector(`#${self.idTab} .form-config`);

      $((`#${self.idTab} #find-problem-result`)).css('marginTop', (containerEl.offsetHeight - formConfigEl.offsetHeight) + 'px');

      let itemActiveEl = $(`#${self.idTab} #find-problem-result .result-find-problem .result-item.active`);
      if (itemActiveEl.length > 0) {
        $(`#${self.idTab} #find-problem-result .result-find-problem`).css('height', `${itemActiveEl[0].offsetHeight}px`)
      }
    },

    /**
     * updateHeightTabContainer
     * 
     */
    updateHeightTabContainer: () => {
      const self = TabFindProblemManager;

      const containerEl = document.getElementById(WrapperManager.idEl);
      const formConfigEl = document.body.querySelector(`#${self.idTab} .form-config`);
      const resultEl = document.body.querySelector(`#${self.idTab} #find-problem-result`);
      $(resultEl).css('marginTop', (containerEl.offsetHeight - formConfigEl.offsetHeight) + 'px');
    },

    /**
     * Check form data is validate to call GPT
     * 
     * @returns {boolean}
     */
    isValidateToCallGPT: () => {
      const self = TabFindProblemManager;

      if (self.getIdTabActive() == 'check_problem_one_thread_tab') {
        let originalText = $(`#${self.idTab} .original_text_check_problem`).val().trim();

        if (!originalText || originalText == '') {
          return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_CHECK_PROBLEM');
        }
        if (originalText.length > MAX_LENGTH_ORIGINAL_TEXT_CHECK_PROBLEM) {
          return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_CHECK_PROBLEM_MAX_LENGTH_TOKEN');
        }
      } else {
        let originalText = $(`#${self.idTab} .original_text_check_problem_all_thread`).val().trim();

        if (!originalText || originalText == '') {
          return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_CHECK_PROBLEM');
        }
        if (originalText.length > MAX_LENGTH_ORIGINAL_TEXT_CHECK_PROBLEM) {
          return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_CHECK_PROBLEM_MAX_LENGTH_TOKEN');
        }
      }

      if (self.formData.gpt_version == 'gemini') {
        return MyLang.getMsg('DES_ERROR_GEMINI_NOT_RELEASED');
      }
      if (self.formData.gpt_version == 'gpt-4-turbo') {
        return MyLang.getMsg('DES_ERROR_GPT4_NOT_RELEASED');
      }
    },

    getIdTabActive: () => {
      const self = TabFindProblemManager;

      if ($(`#${self.idTab} div[key_tab="check_problem_one_thread_tab"]`).hasClass('active')) {
        return 'check_problem_one_thread_tab'
      } else {
        return 'check_problem_all_thread_tab'
      }
    },

    // Setter
    setOriginalText: (originalText) => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      let textareaEl = document.body.querySelector(`#${self.idTab} .original_text_check_problem`);
      $(textareaEl).val(originalText);

      self.original_text_check_problem = originalText;

      self.setActiveTab('check_problem_one_thread_tab');
      self.setFocusOriginalText();
    },

    setOriginalTextAllThread: (originalText) => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      let textareaEl = document.body.querySelector(`#${self.idTab} .original_text_check_problem_all_thread`);
      $(textareaEl).val(originalText);

      self.original_text_check_problem_all_thread = originalText;

      self.setActiveTab('check_problem_all_thread_tab');
      self.setFocusOriginalTextAllThread();
    },

    setOriginalTextFromStorage: () => {
      const self = TabFindProblemManager;

      _StorageManager.getTextFindProblemSidePanel(text => {
        self.setActiveTab('check_problem_one_thread_tab');
        self.setOriginalText(text);

        _StorageManager.removeTextFindProblemSidePanel();
      });
    },

    setOriginalTextAllThreadFromStorage: () => {
      const self = TabFindProblemManager;

      _StorageManager.getTextAllThreadFindProblemSidePanel(text => {
        self.setOriginalTextAllThread(text);

        _StorageManager.removeTextAllThreadFindProblemSidePanel();
      });
    },

    /**
     * checkAndSetOriginalText
     * 
     * @param {string} originalText 
     */
    checkAndSetOriginalText: (originalText) => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      let originalTextCheckProblem = $(`#${self.idTab} textarea.original_text_check_problem`).val().trim();
      let pasteSelectionEl = $(`#${self.idTab} .wrap-original-text-check-problem .paste-selection`);
      let originalTextCheckProblemAllThread = $(`#${self.idTab} textarea.original_text_check_problem_all_thread`).val().trim();
      let pasteSelectionAllThreadEl = $(`#${self.idTab} .wrap-original-text-check-problem-all-thread .paste-selection`);

      if (originalText == EMPTY_KEY) {
        pasteSelectionEl.removeClass('show');
        pasteSelectionAllThreadEl.removeClass('show');
        return;
      }

      if (self.getIdTabActive() == 'check_problem_one_thread_tab') {
        if (originalTextCheckProblem == '') {
          self.setOriginalText(originalText);
        } else {
          if (originalTextCheckProblem != originalText) {
            self.originalTextTemp = originalText;
            pasteSelectionEl.addClass('show');
          }
        }
      } else {
        if (originalTextCheckProblemAllThread == '') {
          self.setOriginalTextAllThread(originalText);
        } else {
          if (originalTextCheckProblemAllThread != originalText) {
            self.originalTextTemp = originalText;
            pasteSelectionAllThreadEl.addClass('show');
          }
        }
      }

      $(`#${WrapperManager.idEl}`).scrollTop(0);
    },

    /**
     * setFocusOriginalText
     * 
     */
    setFocusOriginalText: () => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      let textareaEl = document.body.querySelector(`#${self.idTab} .original_text_check_problem`);
      $(textareaEl).focus();
      $(textareaEl).scrollTop(0);
    },

    /**
     * setFocusOriginalText
     * 
     */
    setFocusOriginalTextAllThread: () => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      let textareaEl = document.body.querySelector(`#${self.idTab} .original_text_check_problem_all_thread`);
      $(textareaEl).focus();
      $(textareaEl).scrollTop(0);
    },

    /**
     * loadFormConfig
     * 
     */
    loadFormConfig: () => {
      const self = TabFindProblemManager;

    },

    /**
     * Load and show list option gpt version for user
     * 
     */
    loadVersionGPTConfig: () => {
      const self = TabFindProblemManager;

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
     * Show alert
     * 
     * @param {string} type 
     * @param {string} message 
     */
    showAlert: (type, message) => {
      const self = TabFindProblemManager;

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
     * Set active tab
     * 
     * @param {string} tabActive 
     */
    setActiveTab: (tabActive) => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      $(`#${self.idTab} .tab .tab-title .item`).removeClass('active');
      $(`#${self.idTab} .tab .tab-title .item[key_tab="${tabActive}"]`).addClass('active');
      $(`#${self.idTab} .tab .tab-body .tab-item`).removeClass('active');
      $(`#${self.idTab} .tab .tab-body #${tabActive}`).addClass('active');

      $(`#${self.idTab} .tab .tab-body #${tabActive} textarea`)[0].focus();
    },

    /**
     * Set event for element in panel
     * 
     */
    resetEvent: () => {
      const self = TabFindProblemManager;

      let listClsAndEvent = [
        {
          cls: `#${self.idTab} .options`,
          click: self.onClickOptionComboBox
        },
        {
          cls: `#${self.idTab} .popover-cbx.wrap-item .combobox-item`,
          click: self.onClickItemOptionComboBox
        },
        {
          cls: `#${self.idTab} .tab .tab-title .item`,
          click: self.onClickTitleTab
        },
        {
          cls: `#${self.idTab} #find-problem-result .result-title .right .prev`,
          click: self.handlerNextOrPrevPagingResult
        },
        {
          cls: `#${self.idTab} #find-problem-result .result-title .right .next`,
          click: self.handlerNextOrPrevPagingResult
        },
        {
          cls: `#${self.idTab} .submit-find-problem`,
          click: self.onSubmitFindProblem
        },
        {
          cls: `#${self.idTab} .result-footer .btn.re-generate`,
          click: self.onSubmitFindProblem
        },
        {
          cls: `#${self.idTab} .result-footer .btn.copy-content`,
          click: self.onClickCopyContentResult
        },
        {
          cls: `#${self.idTab} .paste-selection`,
          click: self.onClickPasteSelection
        },
      ];

      for (let i = 0; i < listClsAndEvent.length; i++) {
        const itemConfig = listClsAndEvent[i];
        $(document).off('click', itemConfig.cls, itemConfig.click);
        $(document).on('click', itemConfig.cls, itemConfig.click);
      }

      let versionGptComboBox = document.body.querySelector(`#${self.idTab} #version_gpt`);
      if (versionGptComboBox && !versionGptComboBox.onSelect) {
        versionGptComboBox.onSelect = self.onSelectVersionGptConfig;
      }
    },

    /**
     * handlerNextOrPrevPagingResult
     * 
     * @param {Event} event 
     */
    handlerNextOrPrevPagingResult: (event) => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      if (event.target.className.baseVal.indexOf('disable') != -1) {
        return;
      }

      if (event.target.className.baseVal.indexOf('next') != -1) {
        self.result_active++;
      } else {
        self.result_active--;
      }

      $(`#${self.idTab} #find-problem-result .result-find-problem .result-item`).removeClass('active');
      let itemActiveEl = $(`#${self.idTab} #find-problem-result .result-find-problem .result-item[data-index="${self.result_active}"]`);
      itemActiveEl.addClass('active');

      $(`#${self.idTab} #find-problem-result .result-find-problem`).css('height', `${itemActiveEl[0].offsetHeight}px`)

      self.handlerUpdatePaging();
    },

    /**
     * Handler show generate result
     * 
     */
    handlerShowFindProblemResult: function () {
      const self = TabFindProblemManager;

      const result = self.generate_result_list;
      self.result_active = (result.length - 1);

      $(`#${self.idTab} #find-problem-result`).removeClass('is-loading');
      $(`#${self.idTab} #find-problem-result .result-find-problem .result-item`).remove();

      let resultActiveEl = null;
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        let isActive = (i == self.result_active)

        let textEl = document.createElement('div');
        textEl.classList = ['wrap-content'];
        textEl.innerHTML = item.find_problem_text_result.replaceAll('\n', '<br/>');

        let resultDivEl = document.createElement('div');
        resultDivEl.classList = ['result-item'];
        resultDivEl.setAttribute('data-index', i);
        if (isActive) {
          resultActiveEl = resultDivEl
          resultDivEl.classList.add('active');
        }

        resultDivEl.append(textEl);

        $(`#${self.idTab} #find-problem-result .result-find-problem`).append(resultDivEl);
      }

      self.is_loading = false;

      self.handlerUpdatePaging();
    },

    /**
     * Handler update paging status
     * 
     */
    handlerUpdatePaging: function () {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      const result_list = self.generate_result_list;

      $(`#${self.idTab} #find-problem-result .result-title .right .text`).html(`${self.result_active + 1}/${result_list.length}`)

      // paging prev
      if (self.result_active <= 0) {
        $(`#${self.idTab} #find-problem-result .result-title .right .prev`)[0].classList.add('disable');
      } else {
        $(`#${self.idTab} #find-problem-result .result-title .right .prev`)[0].classList.remove('disable');
      }

      // paging next
      if (self.result_active >= (result_list.length - 1)) {
        $(`#${self.idTab} #find-problem-result .result-title .right .next`)[0].classList.add('disable');
      } else {
        $(`#${self.idTab} #find-problem-result .result-title .right .next`)[0].classList.remove('disable');
      }
    },

    /**
     * Process add generate write
     * 
     */
    processAddFindProblem: () => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      self.is_loading = true;

      let originalTextFindProblem = $(`#${self.idTab} textarea.original_text_check_problem`).val()
      let originalTextFindProblemAllThread = $(`#${self.idTab} textarea.original_text_check_problem_all_thread`).val()

      let params = self.formData;
      if (self.getIdTabActive() == 'check_problem_one_thread_tab') {
        params.original_text_find_problem = originalTextFindProblem;
      } else {
        params.original_text_find_problem = originalTextFindProblemAllThread;
      }
      params.language = UserSetting.language_active;

      $(`#${self.idTab} #find-problem-result .result-footer`).addClass('hidden');
      $(`#${self.idTab} #find-problem-result .result-title .left .icon`).attr('src', MyUtils.getPropGptByVersion('icon', self.formData.gpt_version));
      $(`#${self.idTab} #find-problem-result .result-title .left .name-gpt`).text(MyUtils.getPropGptByVersion('name', self.formData.gpt_version));

      const result = self.generate_result_list;
      let indexActive = (result.length);

      // Setup - Add new item tab for this generate 
      self.generate_result_list.push({ original_text_find_problem: originalTextFindProblem, find_problem_text_result: '' });
      self.handlerShowFindProblemResult();

      let itemActiveEl = null;
      let allTextRes = '';
      OpenAIManager.findProblemOriginalText(params,
        // Response text function callback
        (textRes) => {
          allTextRes += textRes;
          
          $(itemActiveEl).html(MyUtils.replaceAsterisksWithDivs(allTextRes));

          $(`#${self.idTab} #find-problem-result .result-find-problem`).css('height', `${itemActiveEl.offsetHeight}px`)
        },
        // On [DONE] function callback
        (contentRes) => {
          self.generate_result_list[indexActive].find_problem_text_result = contentRes;

          $(itemActiveEl).removeClass('is-loading');
          // $(`#${WrapperManager.idEl}`).removeClass('is-loading');
          $(`#${self.idTab} #find-problem-result .result-footer`).removeClass('hidden');

          MyUtils.debugLog("Done!");
        },
        // Call request success function callback
        (success) => {
          itemActiveEl = document.querySelector(`.result-find-problem .result-item[data-index="${indexActive}"] .wrap-content`);

          $(itemActiveEl).addClass('is-loading');
          $(`#${self.idTab} #find-problem-result`).removeClass('is-loading');

          MyUtils.debugLog('call request fetch success:' + success);
        });
    },

    /**
     * Handler on storage changed
     * 
     * @param {object} payload 
     * @param {string} type 
     */
    handlerOnStorageOnChanged: (payload, type) => {
      const self = TabFindProblemManager;

      if ('text_find_problem_side_panel' in payload) {
        let textNew = payload.text_find_problem_side_panel.newValue;
        if (textNew) {
          _StorageManager.removeTextFindProblemSidePanel();

          self.setOriginalText(textNew);
        }
      }
      if ('text_all_thread_find_problem_side_panel' in payload) {
        let textNew = payload.text_all_thread_find_problem_side_panel.newValue;
        if (textNew) {
          _StorageManager.removeTextAllThreadFindProblemSidePanel();

          self.setOriginalTextAllThread(textNew);
        }
      }
    },

    handlerOnTextSelectedInPage: (textSelection) => {
      const self = TabFindProblemManager;

      self.checkAndSetOriginalText(textSelection);
    },

    checkOnStorageChangedNeedToActiveTab: (payload, type) => {
      const self = TabSummaryManager;

      if ('text_find_problem_side_panel' in payload) {
        return true;
      }
      if ('text_all_thread_find_problem_side_panel' in payload) {
        return true;
      }

      return false;
    },

    // Event handler
    afterRender: () => {
      const self = TabFindProblemManager;

      self.loadFormConfig();
      self.loadVersionGPTConfig();
    },

    onActive: () => {
      const self = TabFindProblemManager;

      self.resetEvent();
      self.setFocusOriginalText();

      WrapperManager.fixHeightContainer();
      $(`#tab_container`).scrollTop(0);

      MyUtils.debugLog(`Active: ${self.idTab}`);
    },

    /**
     * onClickTitleTab
     * 
     * @param {Event} event 
     */
    onClickTitleTab: (event) => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      const targetEl = event.target;
      const keyTab = targetEl.getAttribute('key_tab');

      self.setActiveTab(keyTab);
    },

    /**
     * onClickOptionComboBox
     * 
     * @param {Event} event 
     */
    onClickOptionComboBox: (event) => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      const targetEl = event.target;

      const popoverEl = targetEl.querySelector(`#${self.idTab} .popover-cbx`);
      if (!popoverEl) return;

      $(`#${self.idTab} .popover-cbx`).removeClass('show');
      self.combobox_flag = true;

      popoverEl.classList.add('show');

      if (MyUtils.isRightSideOutOfViewport(popoverEl)) {
        popoverEl.style.left = 'unset'
        popoverEl.style.right = `${targetEl.offsetWidth - 20}px`;
      }
      if (MyUtils.isBottomSideOutOfViewport(popoverEl)) {
        popoverEl.style.top = 'unset'
        popoverEl.style.bottom = `35px`;
      }

      setTimeout(() => {
        self.combobox_flag = false;
      }, 100)
    },

    /**
     * onClickItemOptionComboBox
     * 
     * @param {Event} event 
     */
    onClickItemOptionComboBox: (event) => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      const kind = event.target.getAttribute('kind');
      const value = event.target.getAttribute('value');

      const comboboxEl = $(event.target).parents('button.combobox')[0];
      if (comboboxEl.onSelect) {
        comboboxEl.onSelect(comboboxEl, event.target, kind, value);
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
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      let record = GPT_VERSION_SETTING_DATA.find(item => {
        return value == item.value
      });

      if (record) {
        self.formData['gpt_version'] = value;

        $(`#${self.idTab} #version_gpt .content img`).attr('src', record.icon);
      }
    },

    /**
     * On submit find problem content
     * 
     * @param {event} event 
     */
    onSubmitFindProblem: (event) => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      let messValidate = self.isValidateToCallGPT();
      if (messValidate) {
        self.showAlert('error', messValidate);
        return;
      }

      // process add generate write
      self.processAddFindProblem();
      self.updateHeightTabContainer();

      const containerEl = document.getElementById(WrapperManager.idEl);
      const resultEl = document.body.querySelector(`#${self.idTab} #find-problem-result`);

      $(resultEl).removeClass('hidden');
      $(resultEl).addClass('is-loading');
      $(containerEl).animate({
        scrollTop: $(resultEl).offset().top + containerEl.scrollTop
      }, 250, 'swing', () => {
        // $(containerEl).addClass('is-loading');
      });
    },

    /**
     * On click copy content result
     * 
     * @param {event} event 
     */
    onClickCopyContentResult: (event) => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      $(event.target).addClass('done');
      navigator.clipboard.writeText(self.generate_result_list[self.result_active].find_problem_text_result);

      setTimeout(() => {
        $(event.target).removeClass('done');
      }, 1000);
    },

    /**
     * On click paste selection to text original
     * 
     * @param {Event} event 
     */
    onClickPasteSelection: (event) => {
      const self = TabFindProblemManager;

      if (self.getIdTabActive() == 'check_problem_one_thread_tab') {
        self.setOriginalText(self.originalTextTemp);
      } else {
        self.setOriginalTextAllThread(self.originalTextTemp);
      }

      self.originalTextTemp = null;
      $(`#${self.idTab} .paste-selection`).removeClass('show');
    }
  };

  /**
  * Tab check content reply manager
  * 
  */
  const TabCheckContentReplyManager = {
    idTab: LIST_TAB[3].id,
    indexTab: 3,

    combobox_flag: false,

    is_loading: false,
    formData: {
      gpt_version: null,
    },
    result_active: 0,
    generate_result_list: [],

    original_text_check_content_reply: '',


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

              <div class="wrap-original-text-check-content-reply">
                <textarea class="original_text_check_content_reply" maxlength="${MAX_LENGTH_ORIGINAL_TEXT_CHECK_CONTENT_REPLY}" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_CHECK_CONTENT_REPLY')}"></textarea>

                <div class="paste-selection">
                  ${content_paste_icon}
                  ${MyLang.getMsg('TXT_PASTE_SELECTION')}
                </div>

                <!-- <div class="original_text_check_content_reply input-div" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_CHECK_CONTENT_REPLY')}" contenteditable="plaintext-only" spellcheck="false" dir="ltr"></div> -->
              </div>

              <div class="version config">
                <div class="options">
                </div>

                <button class="submit-check-content-reply">${MyLang.getMsg('TXT_GENERATE_CHECK_CONTENT_REPLY')}</button>
              </div>

              <div class="alert">
              </div>
            </div>

            <div id="check-content-reply-result" class="hidden is-loading">

              <div class="result-title">
                <div class="left">
                  <img class="icon" src="./icons/chatgpt-icon.svg" alt="gpt-version-icon">
                  <span class="name-gpt">...</span>
                </div>

                <div class="right">
                  <svg class="icon prev disable" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                  </svg>
                  <span class="text"> _/_ </span>
                  <svg class="icon next disable" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                  </svg>
                </div>
              </div>

              <div class="result-check-content-reply">
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
      const self = TabCheckContentReplyManager;

      self.result_active = 0;
      self.generate_result_list = [];

      self.formData['gpt_version'] = GPT_VERSION_SETTING_DATA[0].value;

      const panelEl = document.createElement('div');
      panelEl.id = self.idTab
      panelEl.className = 'tab-item'
      panelEl.innerHTML = self.getVHtml();

      LIST_TAB[self.indexTab].onActive = self.onActive;
      panelEl.afterRender = self.afterRender;

      return panelEl;
    },

    /**
     * updateUIResultPanel
     * 
     */
    updateUIResultPanel: () => {
      const self = TabCheckContentReplyManager;

      const containerEl = document.getElementById(WrapperManager.idEl);
      const formConfigEl = document.body.querySelector(`#${self.idTab} .form-config`);

      $((`#${self.idTab} #check-content-reply-result`)).css('marginTop', (containerEl.offsetHeight - formConfigEl.offsetHeight) + 'px');

      let itemActiveEl = $(`#${self.idTab} #check-content-reply-result .result-check-content-reply .result-item.active`);
      if (itemActiveEl.length > 0) {
        $(`#${self.idTab} #check-content-reply-result .result-check-content-reply`).css('height', `${itemActiveEl[0].offsetHeight}px`)
      }
    },

    /**
     * Check form data is validate to call GPT
     * 
     * @returns {boolean}
     */
    isValidateToCallGPT: () => {
      const self = TabCheckContentReplyManager;

      let originalText = $(`#${self.idTab} .original_text_check_content_reply`).val().trim();

      if (!originalText || originalText == '') {
        return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_TO_CHECK_CONTENT_REPLY');
      }
      if (originalText.length > MAX_LENGTH_ORIGINAL_TEXT_CHECK_CONTENT_REPLY) {
        return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_CHECK_CONTENT_REPLY_MAX_LENGTH_TOKEN');
      }

      if (self.formData.gpt_version == 'gemini') {
        return MyLang.getMsg('DES_ERROR_GEMINI_NOT_RELEASED');
      }
      if (self.formData.gpt_version == 'gpt-4-turbo') {
        return MyLang.getMsg('DES_ERROR_GPT4_NOT_RELEASED');
      }
    },

    // Setter
    setOriginalText: (originalText) => {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      let originalTextReplyEl = document.body.querySelector(`#${self.idTab} .original_text_check_content_reply`);
      $(originalTextReplyEl).val(originalText);
      self.original_text_check_content_reply = originalText;

      self.setFocusOriginalText();
    },

    setOriginalTextFromStorage: () => {
      const self = TabCheckContentReplyManager;

      _StorageManager.getTextCheckContentReplySidePanel(text => {
        self.setOriginalText(text);

        _StorageManager.removeTextCheckContentReplySidePanel();
      });
    },

    /**
     * checkAndSetOriginalText
     * 
     * @param {string} originalText 
     */
    checkAndSetOriginalText: (originalText) => {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      let originalTextContentCheckReply = $(`#${self.idTab} textarea.original_text_check_content_reply`).val().trim();
      let pasteSelectionEl = $(`#${self.idTab} .wrap-original-text-check-content-reply .paste-selection`);

      if (originalText == EMPTY_KEY) {
        pasteSelectionEl.removeClass('show');
        return;
      }

      if (originalTextContentCheckReply == '') {
        self.setOriginalText(originalText);
      } else {
        if (originalTextContentCheckReply != originalText) {
          self.originalTextTemp = originalText;
          pasteSelectionEl.addClass('show');
        }
      }

      $(`#${WrapperManager.idEl}`).scrollTop(0);
    },

    setFocusOriginalText: () => {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      let originalTextReplyEl = document.body.querySelector(`#${self.idTab} .original_text_check_content_reply`);
      $(originalTextReplyEl).focus();
      $(originalTextReplyEl).scrollTop(0);
    },

    /**
     * loadFormConfig
     * 
     */
    loadFormConfig: () => {
      const self = TabCheckContentReplyManager;

    },

    /**
     * Load and show list option gpt version for user
     * 
     */
    loadVersionGPTConfig: () => {
      const self = TabCheckContentReplyManager;

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
     * Show alert
     * 
     * @param {string} type 
     * @param {string} message 
     */
    showAlert: (type, message) => {
      const self = TabCheckContentReplyManager;

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
      const self = TabCheckContentReplyManager;

      let listClsAndEvent = [
        {
          cls: `#${self.idTab} .options`,
          click: self.onClickOptionComboBox
        },
        {
          cls: `#${self.idTab} .popover-cbx.wrap-item .combobox-item`,
          click: self.onClickItemOptionComboBox
        },
        {
          cls: `#${self.idTab} #check-content-reply-result .result-title .right .prev`,
          click: self.handlerNextOrPrevPagingResult
        },
        {
          cls: `#${self.idTab} #check-content-reply-result .result-title .right .next`,
          click: self.handlerNextOrPrevPagingResult
        },
        {
          cls: `#${self.idTab} .submit-check-content-reply`,
          click: self.onSubmitCheckContentReply
        },
        {
          cls: `#${self.idTab} .result-footer .btn.re-generate`,
          click: self.onSubmitCheckContentReply
        },
        {
          cls: `#${self.idTab} .result-footer .btn.copy-content`,
          click: self.onClickCopyContentResult
        },
        {
          cls: `#${self.idTab} .paste-selection`,
          click: self.onClickPasteSelection
        },
      ];

      for (let i = 0; i < listClsAndEvent.length; i++) {
        const itemConfig = listClsAndEvent[i];
        $(document).off('click', itemConfig.cls, itemConfig.click);
        $(document).on('click', itemConfig.cls, itemConfig.click);
      }

      let versionGptComboBox = document.body.querySelector(`#${self.idTab} #version_gpt`);
      if (versionGptComboBox && !versionGptComboBox.onSelect) {
        versionGptComboBox.onSelect = self.onSelectVersionGptConfig;
      }
    },

    /**
     * handlerNextOrPrevPagingResult
     * 
     * @param {Event} event 
     */
    handlerNextOrPrevPagingResult: (event) => {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      if (event.target.className.baseVal.indexOf('disable') != -1) {
        return;
      }

      if (event.target.className.baseVal.indexOf('next') != -1) {
        self.result_active++;
      } else {
        self.result_active--;
      }

      $(`#${self.idTab} #check-content-reply-result .result-check-content-reply .result-item`).removeClass('active');
      let itemActiveEl = $(`#${self.idTab} #check-content-reply-result .result-check-content-reply .result-item[data-index="${self.result_active}"]`);
      itemActiveEl.addClass('active');

      $(`#${self.idTab} #check-content-reply-result .result-check-content-reply`).css('height', `${itemActiveEl[0].offsetHeight}px`)

      self.handlerUpdatePaging();
    },

    /**
     * Handler show generate result
     * 
     */
    handlerShowCheckContentReplyResult: function () {
      const self = TabCheckContentReplyManager;

      const result = self.generate_result_list;
      self.result_active = (result.length - 1);

      $(`#${self.idTab} #check-content-reply-result`).removeClass('is-loading');
      $(`#${self.idTab} #check-content-reply-result .result-check-content-reply .result-item`).remove();

      let resultActiveEl = null;
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        let isActive = (i == self.result_active)

        let wrapContentImproveEl = document.createElement('div');
        wrapContentImproveEl.className = 'wrap-content wrap-content-improve'

        let titleImprovedEl = document.createElement('div');
        titleImprovedEl.classList = ['title improved-title'];
        titleImprovedEl.innerHTML = MyLang.getMsg('TXT_IMPROVED');

        let contentImproveEl = document.createElement('div');
        contentImproveEl.classList = ['improved-content'];
        contentImproveEl.innerHTML = item.improved.replaceAll('\n', '<br/>');

        wrapContentImproveEl.append(titleImprovedEl)
        wrapContentImproveEl.append(contentImproveEl)

        let wrapContentReasonEl = document.createElement('div');
        wrapContentReasonEl.className = 'wrap-content wrap-content-reason'

        let titleReasonEl = document.createElement('div');
        titleReasonEl.classList = ['title reason-title'];
        titleReasonEl.innerHTML = MyLang.getMsg('TXT_REASON_FOR_THE_CHANGES');

        let contentReasonEl = document.createElement('div');
        contentReasonEl.classList = ['reason-content'];
        if (typeof item.reasons == 'string') {
          contentReasonEl.innerHTML = item.reasons.replaceAll('\n', '<br/>');
        }
        else {
          let listReasonEl = document.createElement('ul');
          listReasonEl.classList = ['reason-list'];
          for (let i = 0; i < item.reasons.length; i++) {
            const reasonItem = item.reasons[i];

            let itemEl = document.createElement('li');
            itemEl.innerHTML = reasonItem.replaceAll('\n', '<br/>');

            listReasonEl.append(itemEl);
          }
          contentReasonEl.append(listReasonEl);
        }

        wrapContentReasonEl.append(titleReasonEl)
        wrapContentReasonEl.append(contentReasonEl)

        let resultDivEl = document.createElement('div');
        resultDivEl.classList = ['result-item'];
        resultDivEl.setAttribute('data-index', i);
        if (isActive) {
          resultActiveEl = resultDivEl
          resultDivEl.classList.add('active');
        }

        resultDivEl.append(wrapContentImproveEl);
        resultDivEl.append(wrapContentReasonEl);

        $(`#${self.idTab} #check-content-reply-result .result-check-content-reply`).append(resultDivEl);
      }

      // let resultActiveEl = null;
      // for (let i = 0; i < result.length; i++) {
      //   const item = result[i];
      //   let isActive = (i == self.result_active)

      //   let textEl = document.createElement('div');
      //   textEl.classList = ['wrap-content'];
      //   textEl.innerHTML = item.check_content_reply_result.replaceAll('\n', '<br/>');

      //   let resultDivEl = document.createElement('div');
      //   resultDivEl.classList = ['result-item'];
      //   resultDivEl.setAttribute('data-index', i);
      //   if (isActive) {
      //     resultActiveEl = resultDivEl
      //     resultDivEl.classList.add('active');
      //   }

      //   resultDivEl.append(textEl);

      //   $(`#${self.idTab} #check-content-reply-result .result-check-content-reply`).append(resultDivEl);
      // }

      self.is_loading = false;

      self.handlerUpdatePaging();
    },

    /**
     * Handler update paging status
     * 
     */
    handlerUpdatePaging: function () {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      const result_list = self.generate_result_list;

      $(`#${self.idTab} #check-content-reply-result .result-title .right .text`).html(`${self.result_active + 1}/${result_list.length}`)

      // paging prev
      if (self.result_active <= 0) {
        $(`#${self.idTab} #check-content-reply-result .result-title .right .prev`)[0].classList.add('disable');
      } else {
        $(`#${self.idTab} #check-content-reply-result .result-title .right .prev`)[0].classList.remove('disable');
      }

      // paging next
      if (self.result_active >= (result_list.length - 1)) {
        $(`#${self.idTab} #check-content-reply-result .result-title .right .next`)[0].classList.add('disable');
      } else {
        $(`#${self.idTab} #check-content-reply-result .result-title .right .next`)[0].classList.remove('disable');
      }
    },

    /**
     * Process add generate write
     * 
     */
    processAddCheckContentReply: () => {
      // const self = TabCheckContentReplyManager;
      // if (self.is_loading) return;

      // self.is_loading = true;

      // let originalTextCheckContentReply = $(`#${self.idTab} textarea.original_text_check_content_reply`).val();

      // let params = self.formData;
      // params.original_text_check_content_reply = originalTextCheckContentReply;
      // params.language = UserSetting.language_active;

      // $(`#${self.idTab} #check-content-reply-result .result-footer`).addClass('hidden');
      // $(`#${self.idTab} #check-content-reply-result .result-title .left .icon`).attr('src', MyUtils.getPropGptByVersion('icon', self.formData.gpt_version));
      // $(`#${self.idTab} #check-content-reply-result .result-title .left .name-gpt`).text(MyUtils.getPropGptByVersion('name', self.formData.gpt_version));

      // OpenAIManager.checkContentReplyByOriginalText(params,
      //   (res) => {
      //     self.generate_result_list.push(res);
      //     self.handlerShowCheckContentReplyResult();

      //     const containerEl = document.getElementById(WrapperManager.idEl);
      //     $(containerEl).removeClass('is-loading');

      //     $(`#${self.idTab} #check-content-reply-result .result-footer`).removeClass('hidden');
      //   }
      // )
      //  ===============================================================================================================================================================================================================

      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      self.is_loading = true;

      let originalTextCheckContentReply = $(`#${self.idTab} textarea.original_text_check_content_reply`).val();

      let params = self.formData;
      params.original_text_check_content_reply = originalTextCheckContentReply;
      params.language = UserSetting.language_active;

      $(`#${self.idTab} #check-content-reply-result .result-footer`).addClass('hidden');
      $(`#${self.idTab} #check-content-reply-result .result-title .left .icon`).attr('src', MyUtils.getPropGptByVersion('icon', self.formData.gpt_version));
      $(`#${self.idTab} #check-content-reply-result .result-title .left .name-gpt`).text(MyUtils.getPropGptByVersion('name', self.formData.gpt_version));

      const result = self.generate_result_list;
      let indexActive = (result.length);

      // Setup - Add new item tab for this generate 
      self.generate_result_list.push({ "improved": '', "reasons": '' });
      self.handlerShowCheckContentReplyResult();

      let itemActiveEl = null;
      let keySplit = '{END}', keySplitNow = '';
      let allText = '', improved = '', reasons = '';

      OpenAIManager.checkContentReplyByOriginalText(params,
        // Response text function callback
        (textRes) => {
          allText += textRes;
          let textResToCheck = textRes.replace(/\n/g, '');

          if (keySplitNow != keySplit && keySplit.indexOf(textResToCheck) == -1) {

            // For process after
            improved += textRes;

            // For html
            let innerHTML = $(itemActiveEl).find('.improved-content').html();
            innerHTML += textRes.replaceAll('\n', '<br/>');
            $(itemActiveEl).find('.improved-content').html(innerHTML);

            self.generate_result_list[indexActive]["improved"] = improved;
          } else {
            if (keySplitNow == keySplit) {
              // When improved is Done and this session for reasons
              $(itemActiveEl).find('.improved-content').removeClass('is-loading');

              // For process after
              reasons += textRes;

              // For html
              let innerHTML = $(itemActiveEl).find('.wrap-content-reason .reason-content').html();
              innerHTML += textRes.replaceAll('\n', '<br/>');
              $(itemActiveEl).find('.wrap-content-reason .reason-content').html(innerHTML);

              self.generate_result_list[indexActive]["reasons"] = reasons;
            } else {
              // This flag for know when session improved end to reasons start
              keySplitNow += textResToCheck;
            }
          }

          $(`#${self.idTab} #check-content-reply-result .result-check-content-reply`).css('height', `${itemActiveEl.offsetHeight}px`)
        },
        // On [DONE] function callback
        (contentRes) => {
          // self.generate_result_list[indexActive].check_content_reply_result = contentRes;

          $(itemActiveEl).find('.wrap-content-reason .reason-content').removeClass('is-loading');
          // $(`#${WrapperManager.idEl}`).removeClass('is-loading');
          $(`#${self.idTab} #check-content-reply-result .result-footer`).removeClass('hidden');

          MyUtils.debugLog("Done!");
        },
        // Call request success function callback
        (success) => {
          itemActiveEl = document.querySelector(`.result-check-content-reply .result-item[data-index="${indexActive}"]`);
          $(itemActiveEl).find('.improved-content').addClass('is-loading');
          $(itemActiveEl).find('.wrap-content-reason .reason-content').addClass('is-loading');

          $(`#${self.idTab} #check-content-reply-result`).removeClass('is-loading');

          MyUtils.debugLog('call request fetch success:' + success);
        });
    },

    /**
     * Process add generate write
     * 
     */
    processAddCheckGrammarContentReply: () => {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      self.is_loading = true;

      let originalTextCheckContentReply = $(`#${self.idTab} .original_text_check_content_reply`).html();

      let params = self.formData;
      params.original_text_check_content_reply = originalTextCheckContentReply;
      params.language = UserSetting.language_active;

      OpenAIManager.checkContentReplyByOriginalText(params,
        async (resultCheck) => {
          let wrapErrorPanel = document.createElement('div');
          wrapErrorPanel.className = 'wrap-error-panel'
          $('.wrap-original-text-check-content-reply').append(wrapErrorPanel);

          let textareaEl = document.body.querySelector('.original_text_check_content_reply');
          wrapErrorPanel.style.height = textareaEl.offsetHeight;

          const { result } = resultCheck;

          let listWordWrong = await result.map(item => item.word_wrong);
          let badWordsIndexOf = MyUtils.getIndicesOfWrongWords(originalTextCheckContentReply, listWordWrong);

          for (let i = 0; i < result.length; i++) {
            const errorItem = result[i];
            errorItem.length = errorItem.word_wrong.length;

            for (let j = 0; (badWordsIndexOf[errorItem.word_wrong] && j < badWordsIndexOf[errorItem.word_wrong].length); j++) {
              errorItem.offset = badWordsIndexOf[errorItem.word_wrong][j];

              let Ke = MyUtils.se(textareaEl, errorItem.offset, errorItem.offset + errorItem.length), Ct = textareaEl.getBoundingClientRect(), ut = [];

              for (let i = 0; i < Ke.length; i++) {
                let posHightLight = Ke[i];

                let wrapHight = document.createElement('div');
                wrapHight.className = 'wrap-highlight'

                let itemHightLight = document.createElement('div');
                itemHightLight.className = 'highlight-item'
                itemHightLight.style.left = posHightLight.left - Ct.left;
                itemHightLight.style.top = posHightLight.top - Ct.top;
                itemHightLight.style.height = posHightLight.height;
                itemHightLight.style.width = posHightLight.width;

                wrapHight.append(itemHightLight);
                wrapErrorPanel.append(wrapHight);
              }
            }

          }
        }
      )
    },

    /**
     * Handler on storage changed
     * 
     * @param {object} payload 
     * @param {string} type 
     */
    handlerOnStorageOnChanged: (payload, type) => {
      const self = TabCheckContentReplyManager;
    },

    handlerOnTextSelectedInPage: (textSelection) => {
      const self = TabCheckContentReplyManager;

      self.checkAndSetOriginalText(textSelection);
    },

    checkOnStorageChangedNeedToActiveTab: (payload, type) => {
      const self = TabCheckContentReplyManager;

      return false;
    },

    // Event handler
    afterRender: () => {
      const self = TabCheckContentReplyManager;

      self.loadFormConfig();
      self.loadVersionGPTConfig();
    },

    // Event handler
    onActive: () => {
      const self = TabCheckContentReplyManager;

      self.resetEvent();
      self.setFocusOriginalText();

      WrapperManager.fixHeightContainer();
      $(`#tab_container`).scrollTop(0);

      MyUtils.debugLog(`Active: ${self.idTab}`);
    },

    /**
     * onClickOptionComboBox
     * 
     * @param {Event} event 
     */
    onClickOptionComboBox: (event) => {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      const targetEl = event.target;

      const popoverEl = targetEl.querySelector(`#${self.idTab} .popover-cbx`);
      if (!popoverEl) return;

      $(`#${self.idTab} .popover-cbx`).removeClass('show');
      self.combobox_flag = true;

      popoverEl.classList.add('show');

      if (MyUtils.isRightSideOutOfViewport(popoverEl)) {
        popoverEl.style.left = 'unset'
        popoverEl.style.right = `${targetEl.offsetWidth - 20}px`;
      }
      if (MyUtils.isBottomSideOutOfViewport(popoverEl)) {
        popoverEl.style.top = 'unset'
        popoverEl.style.bottom = `35px`;
      }

      setTimeout(() => {
        self.combobox_flag = false;
      }, 100)
    },

    /**
     * onClickItemOptionComboBox
     * 
     * @param {Event} event 
     */
    onClickItemOptionComboBox: (event) => {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      const kind = event.target.getAttribute('kind');
      const value = event.target.getAttribute('value');

      const comboboxEl = $(event.target).parents('button.combobox')[0];
      if (comboboxEl.onSelect) {
        comboboxEl.onSelect(comboboxEl, event.target, kind, value);
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
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      let record = GPT_VERSION_SETTING_DATA.find(item => {
        return value == item.value
      });

      if (record) {
        self.formData['gpt_version'] = value;

        $(`#${self.idTab} #version_gpt .content img`).attr('src', record.icon);
      }
    },

    /**
     * On submit find problem content
     * 
     * @param {event} event 
     */
    onSubmitCheckContentReply: (event) => {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      let messValidate = self.isValidateToCallGPT();
      if (messValidate) {
        self.showAlert('error', messValidate);
        return;
      }

      // process add generate write
      self.processAddCheckContentReply();
      self.updateUIResultPanel();

      const containerEl = document.getElementById(WrapperManager.idEl);
      const resultEl = document.body.querySelector(`#${self.idTab} #check-content-reply-result`);

      $(resultEl).removeClass('hidden');
      $(resultEl).addClass('is-loading');
      $(containerEl).animate({
        scrollTop: $(resultEl).offset().top + containerEl.scrollTop
      }, 250, 'swing', () => {
        // $(containerEl).addClass('is-loading');
      });
    },

    /**
     * On click copy content result
     * 
     * @param {event} event 
     */
    onClickCopyContentResult: (event) => {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      $(event.target).addClass('done');
      navigator.clipboard.writeText(self.generate_result_list[self.result_active].improved);

      setTimeout(() => {
        $(event.target).removeClass('done');
      }, 1000);
    },

    /**
     * On click paste selection to text original
     * 
     * @param {Event} event 
     */
    onClickPasteSelection: (event) => {
      const self = TabCheckContentReplyManager;

      self.setOriginalText(self.originalTextTemp);

      self.originalTextTemp = null;
      $(`#${self.idTab} .paste-selection`).removeClass('show');
    },
  };

  /**
  * Tab suggest meeting manager
  * 
  */
  const TabSuggestMeetingManager = {
    idTab: LIST_TAB[4].id,
    indexTab: 4,

    combobox_flag: false,

    is_loading: false,
    formData: {
      gpt_version: null,
    },
    result_active: 0,
    generate_result_list: [],

    original_text_to_suggest_meeting: '',

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

              <div class="wrap-original-text-to-suggest-meeting">
                <textarea class="original_text_to_suggest_meeting" maxlength="8000" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_TO_SUGGEST_MEETING')}"></textarea>

                <div class="paste-selection">
                  ${content_paste_icon}
                  ${MyLang.getMsg('TXT_PASTE_SELECTION')}
                </div>
              </div>

              <div class="version config">
                <div class="options">
                </div>

                <button class="submit-get-suggest">${MyLang.getMsg('TXT_GENERATE_SUGGEST_MEETING')}</button>
              </div>

              <div class="alert">
              </div>
            </div>

            <div id="suggest-meeting-result" class="hidden is-loading">

              <div class="result-title">
                <div class="left">
                  <img class="icon" src="./icons/chatgpt-icon.svg" alt="gpt-version-icon">
                  <span class="name-gpt">...</span>
                </div>

                <div class="right">
                  <svg class="icon prev disable" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                  </svg>
                  <span class="text"> _/_ </span>
                  <svg class="icon next disable" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                  </svg>
                </div>
              </div>

              <div class="result-suggest">
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
      const self = TabSuggestMeetingManager;

      self.result_active = 0;
      self.generate_result_list = [];

      self.formData['gpt_version'] = GPT_VERSION_SETTING_DATA[0].value;

      const panelEl = document.createElement('div');
      panelEl.id = self.idTab
      panelEl.className = 'tab-item'
      panelEl.innerHTML = self.getVHtml();

      LIST_TAB[self.indexTab].onActive = self.onActive;
      panelEl.afterRender = self.afterRender;

      return panelEl;
    },

    /**
     * updateUIResultPanel
     * 
     */
    updateUIResultPanel: () => {
      const self = TabSuggestMeetingManager;

      const containerEl = document.getElementById(WrapperManager.idEl);
      const formConfigEl = document.body.querySelector(`#${self.idTab} .form-config`);

      $((`#${self.idTab} #suggest-meeting-result`)).css('marginTop', (containerEl.offsetHeight - formConfigEl.offsetHeight) + 'px');

      let itemActiveEl = $(`#${self.idTab} #suggest-meeting-result .result-suggest .result-item.active`);
      if (itemActiveEl.length > 0) {
        $(`#${self.idTab} #suggest-meeting-result .result-suggest`).css('height', `${itemActiveEl[0].offsetHeight}px`)
      }
    },

    /**
     * updateHeightTabContainer
     * 
     */
    updateHeightTabContainer: () => {
      const self = TabSuggestMeetingManager;

      const containerEl = document.getElementById(WrapperManager.idEl);
      const formConfigEl = document.body.querySelector(`#${self.idTab} .form-config`);
      const resultEl = document.body.querySelector(`#${self.idTab} #suggest-meeting-result`);
      $(resultEl).css('marginTop', (containerEl.offsetHeight - formConfigEl.offsetHeight) + 'px');
    },

    /**
     * Check form data is validate to call GPT
     * 
     * @returns {boolean}
     */
    isValidateToCallGPT: () => {
      const self = TabSuggestMeetingManager;

      let originalText = $(`#${self.idTab} .original_text_to_suggest_meeting`).val().trim();

      if (!originalText || originalText == '') {
        return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_TO_SUGGEST_MEETING');
      }
      if (originalText.length > MAX_LENGTH_ORIGINAL_TEXT_CHECK_PROBLEM) {
        return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_SUGGEST_MEETING_MAX_LENGTH_TOKEN');
      }

      if (self.formData.gpt_version == 'gemini') {
        return MyLang.getMsg('DES_ERROR_GEMINI_NOT_RELEASED');
      }
      if (self.formData.gpt_version == 'gpt-4-turbo') {
        return MyLang.getMsg('DES_ERROR_GPT4_NOT_RELEASED');
      }
    },

    // Setter
    setOriginalText: (originalText) => {
      const self = TabSuggestMeetingManager;
      if (self.is_loading) return;

      let originalTextReplyEl = document.body.querySelector(`#${self.idTab} .original_text_to_suggest_meeting`);
      $(originalTextReplyEl).val(originalText);
      self.original_text_to_suggest_meeting = originalText;

      self.setFocusOriginalText();
    },

    setOriginalTextFromStorage: () => {
      const self = TabSuggestMeetingManager;

      _StorageManager.getTextSuggestMeetingSidePanel(text => {
        self.setOriginalText(text);

        _StorageManager.removeTextSuggestMeetingSidePanel();
      });
    },

    /**
     * checkAndSetOriginalText
     * 
     * @param {string} originalText 
     */
    checkAndSetOriginalText: (originalText) => {
      const self = TabSuggestMeetingManager;
      if (self.is_loading) return;

      let originalTextSuggestMeeting = $(`#${self.idTab} textarea.original_text_to_suggest_meeting`).val().trim();
      let pasteSelectionEl = $(`#${self.idTab} .wrap-original-text-to-suggest-meeting .paste-selection`);

      if (originalText == EMPTY_KEY) {
        pasteSelectionEl.removeClass('show');
        return;
      }

      if (originalTextSuggestMeeting == '') {
        self.setOriginalText(originalText);
      } else {
        if (originalTextSuggestMeeting != originalText) {
          self.originalTextTemp = originalText;
          pasteSelectionEl.addClass('show');
        }
      }

      $(`#${WrapperManager.idEl}`).scrollTop(0);
    },

    setFocusOriginalText: () => {
      const self = TabSuggestMeetingManager;
      if (self.is_loading) return;

      let originalTextReplyEl = document.body.querySelector(`#${self.idTab} .original_text_to_suggest_meeting`);
      $(originalTextReplyEl).focus();
      $(originalTextReplyEl).scrollTop(0);
    },

    /**
     * loadFormConfig
     * 
     */
    loadFormConfig: () => {
      const self = TabSuggestMeetingManager;

    },

    /**
     * Load and show list option gpt version for user
     * 
     */
    loadVersionGPTConfig: () => {
      const self = TabSuggestMeetingManager;

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
     * Show alert
     * 
     * @param {string} type 
     * @param {string} message 
     */
    showAlert: (type, message) => {
      const self = TabSuggestMeetingManager;

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
      const self = TabSuggestMeetingManager;

      let listClsAndEvent = [
        {
          cls: `#${self.idTab} .options`,
          click: self.onClickOptionComboBox
        },
        {
          cls: `#${self.idTab} .popover-cbx.wrap-item .combobox-item`,
          click: self.onClickItemOptionComboBox
        },
        {
          cls: `#${self.idTab} #suggest-meeting-result .result-title .right .prev`,
          click: self.handlerNextOrPrevPagingResult
        },
        {
          cls: `#${self.idTab} #suggest-meeting-result .result-title .right .next`,
          click: self.handlerNextOrPrevPagingResult
        },
        {
          cls: `#${self.idTab} .submit-get-suggest`,
          click: self.onSubmitSuggestMeeting
        },
        {
          cls: `#${self.idTab} .result-footer .btn.re-generate`,
          click: self.onSubmitSuggestMeeting
        },
        {
          cls: `#${self.idTab} .result-footer .btn.copy-content`,
          click: self.onClickCopyContentResult
        },
        {
          cls: `#${self.idTab} .paste-selection`,
          click: self.onClickPasteSelection
        },
      ];

      for (let i = 0; i < listClsAndEvent.length; i++) {
        const itemConfig = listClsAndEvent[i];
        $(document).off('click', itemConfig.cls, itemConfig.click);
        $(document).on('click', itemConfig.cls, itemConfig.click);
      }

      let versionGptComboBox = document.body.querySelector(`#${self.idTab} #version_gpt`);
      if (versionGptComboBox && !versionGptComboBox.onSelect) {
        versionGptComboBox.onSelect = self.onSelectVersionGptConfig;
      }
    },

    /**
     * handlerNextOrPrevPagingResult
     * 
     * @param {Event} event 
     */
    handlerNextOrPrevPagingResult: (event) => {
      const self = TabSuggestMeetingManager;
      if (self.is_loading) return;

      if (event.target.className.baseVal.indexOf('disable') != -1) {
        return;
      }

      if (event.target.className.baseVal.indexOf('next') != -1) {
        self.result_active++;
      } else {
        self.result_active--;
      }

      $(`#${self.idTab} #suggest-meeting-result .result-suggest .result-item`).removeClass('active');
      let itemActiveEl = $(`#${self.idTab} #suggest-meeting-result .result-suggest .result-item[data-index="${self.result_active}"]`);
      itemActiveEl.addClass('active');

      $(`#${self.idTab} #suggest-meeting-result .result-suggest`).css('height', `${itemActiveEl[0].offsetHeight}px`)

      self.handlerUpdatePaging();
    },

    /**
     * Handler show generate result
     * 
     */
    handlerShowSuggestMeetingResult: function () {
      const self = TabSuggestMeetingManager;

      const result = self.generate_result_list;
      self.result_active = (result.length - 1);

      $(`#${self.idTab} #suggest-meeting-result`).removeClass('is-loading');
      $(`#${self.idTab} #suggest-meeting-result .result-suggest .result-item`).remove();

      let resultActiveEl = null;
      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        let isActive = (i == self.result_active)

        let textEl = document.createElement('div');
        textEl.classList = ['wrap-content'];
        textEl.innerHTML = item.suggest_meeting_text_result.replaceAll('\n', '<br/>');
        // textEl.innerHTML = JSON.stringify(item.suggest_meeting_text_result);

        let resultDivEl = document.createElement('div');
        resultDivEl.classList = ['result-item'];
        resultDivEl.setAttribute('data-index', i);
        if (isActive) {
          resultActiveEl = resultDivEl
          resultDivEl.classList.add('active');
        }

        resultDivEl.append(textEl);

        $(`#${self.idTab} #suggest-meeting-result .result-suggest`).append(resultDivEl);
      }

      self.is_loading = false;

      self.handlerUpdatePaging();
    },

    /**
     * Handler update paging status
     * 
     */
    handlerUpdatePaging: function () {
      const self = TabSuggestMeetingManager;
      if (self.is_loading) return;

      const result_list = self.generate_result_list;

      $(`#${self.idTab} #suggest-meeting-result .result-title .right .text`).html(`${self.result_active + 1}/${result_list.length}`)

      // paging prev
      if (self.result_active <= 0) {
        $(`#${self.idTab} #suggest-meeting-result .result-title .right .prev`)[0].classList.add('disable');
      } else {
        $(`#${self.idTab} #suggest-meeting-result .result-title .right .prev`)[0].classList.remove('disable');
      }

      // paging next
      if (self.result_active >= (result_list.length - 1)) {
        $(`#${self.idTab} #suggest-meeting-result .result-title .right .next`)[0].classList.add('disable');
      } else {
        $(`#${self.idTab} #suggest-meeting-result .result-title .right .next`)[0].classList.remove('disable');
      }
    },

    /**
     * Process add generate write
     * 
     */
    processAddSuggestMeeting: () => {
      const self = TabSuggestMeetingManager;
      if (self.is_loading) return;

      self.is_loading = true;

      let originalTextSuggestMeeting = $(`#${self.idTab} textarea.original_text_to_suggest_meeting`).val();

      let params = self.formData;
      params.original_text_suggest_meeting = originalTextSuggestMeeting;
      params.language = UserSetting.language_active;

      $(`#${self.idTab} #suggest-meeting-result .result-footer`).addClass('hidden');
      $(`#${self.idTab} #suggest-meeting-result .result-title .left .icon`).attr('src', MyUtils.getPropGptByVersion('icon', self.formData.gpt_version));
      $(`#${self.idTab} #suggest-meeting-result .result-title .left .name-gpt`).text(MyUtils.getPropGptByVersion('name', self.formData.gpt_version));

      const result = self.generate_result_list;
      let indexActive = (result.length);

      // Setup - Add new item tab for this generate 
      self.generate_result_list.push({ suggest_meeting_text_result: '' });
      self.handlerShowSuggestMeetingResult();

      let itemActiveEl = null;
      let allTextRes = '';
      OpenAIManager.suggestMeetingByOriginalText(params,
        // Response text function callback
        (textRes) => {
          allTextRes += textRes;

          $(itemActiveEl).html(MyUtils.replaceAsterisksWithDivs(allTextRes));

          $(`#${self.idTab} #suggest-meeting-result .result-suggest`).css('height', `${itemActiveEl.offsetHeight}px`)
        },
        // On [DONE] function callback
        (contentRes) => {
          self.generate_result_list[indexActive].suggest_meeting_text_result = contentRes;

          $(itemActiveEl).removeClass('is-loading');
          // $(`#${WrapperManager.idEl}`).removeClass('is-loading');
          $(`#${self.idTab} #suggest-meeting-result .result-footer`).removeClass('hidden');

          MyUtils.debugLog("Done!");
        },
        // Call request success function callback
        (success) => {
          itemActiveEl = document.querySelector(`.result-suggest .result-item[data-index="${indexActive}"] .wrap-content`);

          $(itemActiveEl).addClass('is-loading');
          $(`#${self.idTab} #suggest-meeting-result`).removeClass('is-loading');

          MyUtils.debugLog('call request fetch success:' + success);
        });
    },

    /**
     * Handler on storage changed
     * 
     * @param {object} payload 
     * @param {string} type 
     */
    handlerOnStorageOnChanged: (payload, type) => {
      const self = TabSuggestMeetingManager;

      if ('text_suggest_meeting_side_panel' in payload) {
        let textNew = payload.text_suggest_meeting_side_panel.newValue;
        if (textNew) {
          _StorageManager.removeTextSuggestMeetingSidePanel();

          self.setOriginalText(textNew);
        }
      }
    },

    handlerOnTextSelectedInPage: (textSelection) => {
      const self = TabSuggestMeetingManager;

      self.checkAndSetOriginalText(textSelection);
    },

    checkOnStorageChangedNeedToActiveTab: (payload, type) => {
      const self = TabSuggestMeetingManager;

      if ('text_suggest_meeting_side_panel' in payload) {
        return true;
      }

      return false;
    },


    // Event handler
    afterRender: () => {
      const self = TabSuggestMeetingManager;

      self.loadFormConfig();
      self.loadVersionGPTConfig();
    },

    // Event handler
    onActive: () => {
      const self = TabSuggestMeetingManager;

      self.resetEvent();
      self.setFocusOriginalText();

      WrapperManager.fixHeightContainer();
      $(`#tab_container`).scrollTop(0);

      MyUtils.debugLog(`Active: ${self.idTab}`);
    },

    /**
     * onClickOptionComboBox
     * 
     * @param {Event} event 
     */
    onClickOptionComboBox: (event) => {
      const self = TabSuggestMeetingManager;
      if (self.is_loading) return;

      const targetEl = event.target;

      const popoverEl = targetEl.querySelector(`#${self.idTab} .popover-cbx`);
      if (!popoverEl) return;

      $(`#${self.idTab} .popover-cbx`).removeClass('show');
      self.combobox_flag = true;

      popoverEl.classList.add('show');

      if (MyUtils.isRightSideOutOfViewport(popoverEl)) {
        popoverEl.style.left = 'unset'
        popoverEl.style.right = `${targetEl.offsetWidth - 20}px`;
      }
      if (MyUtils.isBottomSideOutOfViewport(popoverEl)) {
        popoverEl.style.top = 'unset'
        popoverEl.style.bottom = `35px`;
      }

      setTimeout(() => {
        self.combobox_flag = false;
      }, 100)
    },

    /**
     * onClickItemOptionComboBox
     * 
     * @param {Event} event 
     */
    onClickItemOptionComboBox: (event) => {
      const self = TabSuggestMeetingManager;
      if (self.is_loading) return;

      const kind = event.target.getAttribute('kind');
      const value = event.target.getAttribute('value');

      const comboboxEl = $(event.target).parents('button.combobox')[0];
      if (comboboxEl.onSelect) {
        comboboxEl.onSelect(comboboxEl, event.target, kind, value);
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
      const self = TabSuggestMeetingManager;
      if (self.is_loading) return;

      let record = GPT_VERSION_SETTING_DATA.find(item => {
        return value == item.value
      });

      if (record) {
        self.formData['gpt_version'] = value;

        $(`#${self.idTab} #version_gpt .content img`).attr('src', record.icon);
      }
    },

    /**
     * On submit find problem content
     * 
     * @param {event} event 
     */
    onSubmitSuggestMeeting: (event) => {
      const self = TabSuggestMeetingManager;
      if (self.is_loading) return;

      let messValidate = self.isValidateToCallGPT();
      if (messValidate) {
        self.showAlert('error', messValidate);
        return;
      }

      // process add generate write
      self.processAddSuggestMeeting();
      self.updateHeightTabContainer();

      const containerEl = document.getElementById(WrapperManager.idEl);
      const resultEl = document.body.querySelector(`#${self.idTab} #suggest-meeting-result`);

      $(resultEl).removeClass('hidden');
      $(resultEl).addClass('is-loading');
      $(containerEl).animate({
        scrollTop: $(resultEl).offset().top + containerEl.scrollTop
      }, 250, 'swing', () => {
        // $(containerEl).addClass('is-loading');
      });
    },

    /**
     * On click copy content result
     * 
     * @param {event} event 
     */
    onClickCopyContentResult: (event) => {
      const self = TabSuggestMeetingManager;
      if (self.is_loading) return;

      $(event.target).addClass('done');
      navigator.clipboard.writeText(self.generate_result_list[self.result_active].suggest_meeting_text_result);

      setTimeout(() => {
        $(event.target).removeClass('done');
      }, 1000);
    },

    /**
     * On click paste selection to text original
     * 
     * @param {Event} event 
     */
    onClickPasteSelection: (event) => {
      const self = TabSuggestMeetingManager;

      self.setOriginalText(self.originalTextTemp);

      self.originalTextTemp = null;
      $(`#${self.idTab} .paste-selection`).removeClass('show');
    },
  };

  /**
   * Wrapper manager
   * 
   */
  const WrapperManager = {
    idEl: 'tab_container',
    sidebar_flag: false,

    action_name_after_render_important: null,

    /**
     * Initialize wrapper manager
     */
    _init: () => {
      const self = WrapperManager;

      self.initTab();
    },

    // UI

    /**
     * Set active tab
     * 
     * @param {string} idTab 
     */
    setActiveTab: (idTab) => {
      const self = WrapperManager;

      if (!idTab) idTab = LIST_TAB[0].id;

      // sidebar
      $(`.sidebar .menu .item`).removeClass('active');
      $(`.sidebar .menu .item[tab_id=${idTab}]`).addClass('active');

      // title
      $(`.title .left .title`).removeClass('active');
      $(`.title .left .title[tab_id=${idTab}]`).addClass('active');

      // tab main
      $(`#${self.idEl} .tab-item[item-of="${self.idEl}"]`).removeClass('active');
      $(`#${self.idEl} #${idTab}[item-of="${self.idEl}"]`).addClass('active');

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
     * Get active tab
     * 
     */
    getActiveTab: () => {
      const self = WrapperManager;
      
      let tabActiveEl = document.querySelector(`#${self.idEl} .tab-item[item-of="${self.idEl}"].active`);
      if (tabActiveEl) {
        return tabActiveEl.id;
      } else {
        return LIST_TAB[0].id;
      }
    },

    setEmailFooter: (userEmail) => {
      const self = WrapperManager;

      let spanEl = document.createElement('span');
      spanEl.className = 'user-email';
      spanEl.textContent = userEmail;

      $('footer').append(spanEl);
    },

    /**
     * Fix height container
     * 
     */
    fixHeightContainer: () => {
      const self = WrapperManager;

      const heightMain = document.body.querySelector('.gpt-layout main').offsetHeight;
      const heightTitleMain = document.body.querySelector('.gpt-layout main .title').offsetHeight;
      const heightFooterMain = document.body.querySelector('footer').offsetHeight;

      // $('main .wrap-content').css('height', `${heightMain - heightFooterMain}px`);
      $(`#${self.idEl}`).css('height', `${heightMain - (heightFooterMain + heightTitleMain)}px`);
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
      const listTabManager = [TabWriteManager, TabSummaryManager, TabFindProblemManager, TabCheckContentReplyManager, TabSuggestMeetingManager]
      for (let i = 0; i < listTabManager.length; i++) {
        const itemManager = listTabManager[i];
        let tabItem = itemManager.createPanel();
        $(tabItem).attr('item-of', self.idEl)

        $(`#${self.idEl}`).append(tabItem);

        // Trigger event after render panel for tab manager
        if (itemManager.afterRender) {
          itemManager.afterRender();
        }
      }

      self.initEvent();

      self.callActionImportFromPageSend();
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

    callActionImportFromPageSend: () => {
      const self = WrapperManager;
      if (!self.action_name_after_render_important) {
        setTimeout(() => {
          self.setActiveTab();
          self.fixHeightContainer();
        }, 10);
        return;
      }

      switch (self.action_name_after_render_important) {
        case SET_TEXT_ORIGINAL_THREAD_TO_SUMMARY:
          TabSummaryManager.setOriginalTextFromStorage();
          break;

        case SET_TEXT_ORIGINAL_ALL_THREAD_TO_SUMMARY:
          TabSummaryManager.setOriginalTextAllThreadFromStorage();
          break;

        case SET_TEXT_ORIGINAL_THREAD_TO_FIND_PROBLEM:
          TabFindProblemManager.setOriginalTextFromStorage();
          break;

        case SET_TEXT_ORIGINAL_ALL_THREAD_TO_FIND_PROBLEM:
          TabFindProblemManager.setOriginalTextAllThreadFromStorage();
          break;

        case SET_TEXT_ORIGINAL_TO_SUGGEST_MEETING:
          TabSuggestMeetingManager.setOriginalTextFromStorage();
          break;

        default:
          break;
      }

      _StorageManager.removeActionInSidePanel();
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
        TabWriteManager.updateUIResultPanel();
        TabSummaryManager.updateUIResultPanel();
        TabFindProblemManager.updateUIResultPanel();
        TabCheckContentReplyManager.updateUIResultPanel();
        TabSuggestMeetingManager.updateUIResultPanel();
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

      $(document).on('click', `.sidebar .menu .item`, event => {
        let tab_id = $(event.target).attr('tab_id');

        self.setActiveTab(tab_id);
      });
    },
  };

  /**
   * Handler when storage has value change
   * 
   * @param {Event} event 
   */
  const storageOnChanged = (payload, type) => {
    const self = WrapperManager;

    if (TabWriteManager.checkOnStorageChangedNeedToActiveTab(payload, type)) {
      self.setActiveTab(TabWriteManager.idTab);
    }
    if (TabSummaryManager.checkOnStorageChangedNeedToActiveTab(payload, type)) {
      self.setActiveTab(TabSummaryManager.idTab);
    }
    if (TabFindProblemManager.checkOnStorageChangedNeedToActiveTab(payload, type)) {
      self.setActiveTab(TabFindProblemManager.idTab);
    }
    if (TabSuggestMeetingManager.checkOnStorageChangedNeedToActiveTab(payload, type)) {
      self.setActiveTab(TabSuggestMeetingManager.idTab);
    }

    const idTabActive = self.getActiveTab();
    switch (idTabActive) {
      case TabWriteManager.idTab:
        TabWriteManager.handlerOnStorageOnChanged(payload, type);
        break;

      case TabSummaryManager.idTab:
        TabSummaryManager.handlerOnStorageOnChanged(payload, type);
        break;

      case TabFindProblemManager.idTab:
        TabFindProblemManager.handlerOnStorageOnChanged(payload, type);
        break;

      case TabSuggestMeetingManager.idTab:
        TabSuggestMeetingManager.handlerOnStorageOnChanged(payload, type);
        break;
    }

    if ('text_selected_in_page' in payload) {
      let textSelection = payload.text_selected_in_page.newValue;

      switch (idTabActive) {
        // case TabWriteManager.idTab:
        //   TabWriteManager.handlerOnTextSelectedInPage(payload, type);
        //   break;

        case TabSummaryManager.idTab:
          TabSummaryManager.handlerOnTextSelectedInPage(textSelection);
          break;

        case TabFindProblemManager.idTab:
          TabFindProblemManager.handlerOnTextSelectedInPage(textSelection);
          break;

        case TabCheckContentReplyManager.idTab:
          TabCheckContentReplyManager.handlerOnTextSelectedInPage(textSelection);
          break;

        case TabSuggestMeetingManager.idTab:
          TabSuggestMeetingManager.handlerOnTextSelectedInPage(textSelection);
          break;
      }
    }
    if ('trigger_close_side_panel' in payload) {
      let { is_close, id_popup } = payload.trigger_close_side_panel.newValue;

      if (is_close == true) {
        _StorageManager.setCloseSidePanel(null, null, () => {
          window.close();
        });
      }
    }
    if ('trigger_clear_side_panel' in payload) {
      let { id_popup } = payload.trigger_clear_side_panel.newValue;

      _StorageManager.triggerClearSidePanel(null, () => {
        TabWriteManager.clearForm();
      });
    }
    if ('action_name_page_to_side_panel' in payload) {
      if (typeof(payload.action_name_page_to_side_panel.newValue) != 'undefined') {
        WrapperManager.action_name_after_render_important = payload.action_name_page_to_side_panel.newValue;

        _StorageManager.removeActionInSidePanel();
      }
    }
  }

  /**
   * Initialize side panel
   * 
   */
  const initialize_side = async () => {
    let pallaFinishedCount = 0;
    let NUM_PROCEED_PALLA_FINISHED_COUNT = 4;
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

      for (let i = 0; i < VOICE_SETTING_DATA.length; i++) {
        const configItem = VOICE_SETTING_DATA[i];
        const nameKind = configItem.name_kind, optionsConfig = [...configItem.options];

        let hasConfig = voiceConfig.find(item => item.name_kind == nameKind);
        if (!hasConfig) {
          let optionsDefault = optionsConfig.splice(0, MAX_VOICE_CONFIG_OPTIONS_SHOW);
          optionsDefault[0].isActive = true;
          voiceConfig.push({
            ...configItem,
            options: optionsDefault
          })
        }
      }

      TabWriteManager.voice_config_of_user = voiceConfig;
      UserSetting.language_active = TabWriteManager.getLanguageFromConfig();

      proceedByPallaFinishedCount();
    });

    _StorageManager.getTitleContentMailToWrite(titleContent => {
      TabWriteManager.title_content_mail_to_write = { ...titleContent };

      proceedByPallaFinishedCount();
    });

    _StorageManager.getActionInSidePanel(actionName => {
      WrapperManager.action_name_after_render_important = actionName;

      proceedByPallaFinishedCount();
    });

    chrome.runtime.sendMessage({ method: 'get_user_info' }, (userInfo) => {
      ID_USER_ADDON_LOGIN = userInfo.id;
      USER_ADDON_LOGIN = userInfo.email;

      // WrapperManager.setEmailFooter(USER_ADDON_LOGIN);

      //addon setting
      SateraitoRequest.loadAddOnSetting(userInfo.email, function (result) {
        MyUtils.debugLog(`auto summary chat GPT: domain regist:[${AddOnEmailSetting.is_domain_registered}], permission deny:[${AddOnEmailSetting.is_not_access_list}]`);
      });

      proceedByPallaFinishedCount();
    });

    chrome.storage.onChanged.addListener(storageOnChanged);
  }

  // __main__
  initialize_side();
}());