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
     * Fix height for session result
     * 
     */
    fixHeightResult: () => {
      const self = TabWriteManager;

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
          $(`#${WrapperManager.idEl}`).removeClass('is-loading');
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
        $(containerEl).addClass('is-loading');
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

      // chrome.runtime.sendMessage({method: 'get_tab_info'}, (tabEmailInfoInBrowser) => {
      //   if (tabEmailInfoInBrowser) {
      //     try {
      //       chrome.tabs.update(tabEmailInfoInBrowser.id, {active: true});
      //     } catch (error) {
      //       console.log(error);
      //     }
      //   }
      // });
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
                      <textarea class="original_text_summary" maxlength="8000" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_SUMMARY')}"></textarea>
                    </div>
                  </span>

                  <span id="all_thread_tab" class="tab-item">
                    <div class="wrap-original-text-summary">
                      <textarea class="original_text_summary_all_thread" maxlength="8000" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_SUMMARY')}"></textarea>
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

                <button class="submit-summary">Summary</button>
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
     * Fix height for session result
     * 
     */
    fixHeightResult: () => {
      const self = TabSummaryManager;

      const tabContainerEl = document.getElementById(`write_tab`);
      const resultEl = document.body.querySelector(`#${self.idTab} #summary-result`);
      $(resultEl).css('height', tabContainerEl.offsetHeight + 'px');
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

      let originalTextSummary = $(`#${self.idTab} .original_text_summary`).val().trim();

      if (!originalTextSummary || originalTextSummary == '') {
        return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_SUMMARY');
      }
      if (originalTextSummary.length > MAX_LENGTH_TOPIC_COMPOSE) {
        return MyLang.getMsg('DES_ERROR_ORIGINAL_TEXT_SUMMARY_MAX_LENGTH_TOKEN');
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

      self.setFocusOriginalText();
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
      let summaryLength = $('input[name="summary-length"]:checked').val()

      let params = self.formData;
      params.original_text_summary = originalTextSummary;
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
          $(`#${WrapperManager.idEl}`).removeClass('is-loading');
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
        $(containerEl).addClass('is-loading');
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
    original_text_check_problem: '',

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
                    </div>
                  </span>

                  <span id="check_problem_all_thread_tab" class="tab-item">
                    <div class="wrap-original-text-check-problem">
                      <textarea class="original_text_check_problem_all_thread" maxlength="8000" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_CHECK_PROBLEM')}"></textarea>
                    </div>
                  </span>
                </div>
              </div>

              <div class="version config">
                <div class="options">
                </div>

                <button class="submit-summary">Summary</button>
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

      let originalTextReplyEl = document.body.querySelector(`#${self.idTab} .original_text_check_problem`);
      $(originalTextReplyEl).val(originalText);
      self.original_text_check_problem = originalText;

      self.setFocusOriginalText();
    },

    setFocusOriginalText: () => {
      const self = TabFindProblemManager;
      if (self.is_loading) return;

      let originalTextReplyEl = document.body.querySelector(`#${self.idTab} .original_text_check_problem`);
      $(originalTextReplyEl).focus();
      $(originalTextReplyEl).scrollTop(0);
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

    // Event handler
    afterRender: () => {
      const self = TabFindProblemManager;

      self.loadVersionGPTConfig();
    },

    onActive: () => {
      const self = TabFindProblemManager;

      self.resetEvent();
      self.setFocusOriginalText();

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

              <div class="wrap-original-text-summary">
                <textarea class="original_text_check_content_reply" maxlength="8000" placeholder="${MyLang.getMsg('TXT_PLACEHOLDER_ORIGINAL_TEXT_CHECK_CONTENT_REPLY')}"></textarea>
              </div>

              <div class="version config">
                <div class="options">
                </div>

                <button class="submit-summary">Summary</button>
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

    // Setter
    setOriginalText: (originalText) => {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      let originalTextReplyEl = document.body.querySelector(`#${self.idTab} .original_text_check_content_reply`);
      $(originalTextReplyEl).val(originalText);
      self.original_text_check_content_reply = originalText;

      self.setFocusOriginalText();
    },

    setFocusOriginalText: () => {
      const self = TabCheckContentReplyManager;
      if (self.is_loading) return;

      let originalTextReplyEl = document.body.querySelector(`#${self.idTab} .original_text_check_content_reply`);
      $(originalTextReplyEl).focus();
      $(originalTextReplyEl).scrollTop(0);
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

    // Event handler
    afterRender: () => {
      const self = TabCheckContentReplyManager;

      self.loadVersionGPTConfig();
    },

    // Event handler
    onActive: () => {
      const self = TabCheckContentReplyManager;

      self.resetEvent();
      self.setFocusOriginalText();

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
  };

  /**
  * Tab suggest meeting manager
  * 
  */
  const TabSuggestMeetingManager = {
    idTab: LIST_TAB[4].id,
    indexTab: 4,

    /**
     * Get inner html for tab write
     * 
     * @returns {string}
     */
    getVHtml: () => {
      return `<div>
                <h1>Suggest meeting tab</h1>
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

      const panelEl = document.createElement('div');
      panelEl.id = self.idTab
      panelEl.className = 'tab-item'
      panelEl.innerHTML = self.getVHtml();

      LIST_TAB[self.indexTab].onActive = self.onActive;

      return panelEl;
    },

    // Event handler
    onActive: () => {
      const self = TabSuggestMeetingManager;

      MyUtils.debugLog(`Active: ${self.idTab}`);
    }
  };

  /**
   * Wrapper manager
   * 
   */
  const WrapperManager = {
    idEl: 'tab_container',
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
      return document.querySelector(`#${self.idEl} .tab-item.active`).id;
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

      $('main .wrap-content').css('height', `${heightMain - heightFooterMain}px`);
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
    
    const idTabActive = self.getActiveTab();

    if (idTabActive == TabWriteManager.idTab) {
      TabWriteManager.handlerOnStorageOnChanged(payload, type)
    }

    if (idTabActive == TabSummaryManager.idTab) {
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
    })

    _StorageManager.getTitleContentMailToWrite(titleContent => {
      TabWriteManager.title_content_mail_to_write = { ...titleContent };

      proceedByPallaFinishedCount();
    })

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