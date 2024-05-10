/** @define {boolean} デバッグモード */
let DEBUG_MODE = true;

(function () {
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
    language_output_list_config: [],

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
              <div class="tab">
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
                  </span>
                </div>
              </div>

              <div class="voice-config">
              </div>

              <div class="your-language config">
                <div class="title">
                  <img class="icon" src="./icons/translate.svg" alt="account-circle-icon">
                  <span class="text">${MyLang.getMsg('TXT_LANGUAGE')}:</span>
                </div>
                <div class="options">
                </div>
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

    // Setter

    /**
     * Load and show data to panel
     * 
     */
    loadData: () => {
      const self = TabWriteManager;

      $(`#${self.idTab} .voice-config .config`).remove();

      for (let i = 0; i < VOICE_SETTING_DATA.length; i++) {
        const config_item = VOICE_SETTING_DATA[i];

        const configEl = document.createElement('div');
        configEl.className = `${config_item.name_kind} config`;

        let vHtmlOption = ``;
        for (let j = 0; j < config_item.options.length; j++) {
          const optionItem = config_item.options[j];
          const voiceConfigItem = self.formData[config_item.name_kind];

          let isActive = false;
          if (!voiceConfigItem && j == 0) {
            self.formData[config_item.name_kind] = optionItem.value;
            isActive = true;
          }
          if (voiceConfigItem == optionItem.value) {
            isActive = true;
          }

          vHtmlOption += `<button kind="${config_item.name_kind}" value="${optionItem.value}" class="item ${isActive ? 'active' : ''}">
                            ${optionItem.name}
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

    /**
     * Load and show list language user config
     * 
     */
    loadLangConfig: () => {
      const self = TabWriteManager;

      let lang_default = LANGUAGE_SETTING_DATA[0];

      // Get and set to your_lang with lang was used before
      let langActive = USER_SETTING.language_write_active || lang_default;
      self.formData.your_lang = langActive.value;

      // User is begin open side panel or not generate before
      if (self.language_output_list_config.length == 0) {
        self.language_output_list_config.push(lang_default);
        _StorageManager.addLanguageWriteList(lang_default.value);
      }

      // Shows all previously added langs
      let lang_config = '';
      for (let i = 0; i < self.language_output_list_config.length; i++) {
        const configItem = self.language_output_list_config[i];

        lang_config += `
        <button kind="your_lang" value="${configItem.value}" class="item text ${langActive.value == configItem.value ? 'active' : ''}">
          ${configItem.name}
          <div class="close">
            <img class="icon" src="./icons/cancel.svg">
          </div>
        </button>
      `
      }

      // Add lang not use to option combobox
      let lang_option = '';
      for (let i = 0; i < LANGUAGE_SETTING_DATA.length; i++) {
        const item = LANGUAGE_SETTING_DATA[i];

        let hasInConfig = self.language_output_list_config.find(configItem => configItem.value == item.value);
        lang_option += `
          <li class="combobox-item ${hasInConfig ? 'hidden' : ''}" value="${item.value}">
            <div class="name">${item.name}</div>
            <div class="sub">${item.sub}</div>
          </li>
        `;
      }

      // Button combobox
      let vHtml_init = `
      ${lang_config}
      <button class="item text combobox" id="language_cbx">
          <span class="space">...</span>
          <ul class="popover-cbx wrap-item">
            ${lang_option}
          </ul>
      </button>
    `

      // Add to html side panel
      $(`#${self.idTab} .your-language .options`).html(vHtml_init);

      // Set event on select item in combobox language
      document.body.querySelector(`#${self.idTab} #language_cbx`).onSelect = self.onSelectLanguageConfig;

      // Hidden combobox language element when add all language to html side panel
      if ($(`#${self.idTab} .your-language .combobox-item.hidden`).length == $(`#${self.idTab} .your-language .combobox-item`).length) {
        $('#language_cbx').addClass('hidden');
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

        setTimeout(() => {
          self.combobox_flag = false;
        }, 100)
      });
      $(document).on('click', `#${self.idTab} .popover-cbx.wrap-item .combobox-item`, function (event) {
        if (self.is_loading) return;
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
      $(document).on('click', `#${self.idTab} .config .options .item`, self.onClickConfigItem);

      // Remove and save language config
      $(document).on('click', `#${self.idTab} .form-config .your-language .item .close`, (event) => {
        if (self.is_loading) return;
        const targetEl = event.target;

        // There is always an optional language
        if ((self.language_output_list_config.length - 1) == 0) return;
        let listLangClone = [...self.language_output_list_config];

        const parentBtnEl = $(targetEl).parents('button.item.text');
        const value = parentBtnEl.attr('value');

        _StorageManager.removeLanguageWriteList(value);

        parentBtnEl.remove();

        $(`#language_cbx .combobox-item[value="${value}"]`).removeClass('hidden');
        $(`#${self.idTab} #language_cbx`).removeClass('hidden');

        // Reset to default
        for (let i = 0; i < listLangClone.length; i++) {
          if (listLangClone[i].value == value) {
            listLangClone.splice(i, 1);
          }
        }
        _StorageManager.setLanguageWrite(listLangClone[0].value);
      });

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

      // Save language used
      _StorageManager.setLanguageWrite(params.your_lang)
      _StorageManager.setVoiceConfigWrite({
        ...self.formData,
        // delete parameters that do not need to be saved in the voice config
        gpt_ai_key: null,
        gpt_version: null,
        type_generate: null,
        topic_compose: null,
        original_text_reply: null,
        general_content_reply: null,
      })

      _SendMessageManager.generateContentReply(params, (data) => {
        self.generate_result_list.push(data);

        self.handlerShowGenerateResult();
      });
    },

    // Event

    /**
     * On active tab
     * 
     */
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
      const kind = event.target.getAttribute('kind');
      const value = event.target.getAttribute('value');

      if (!value || !kind) return;
      self.formData[kind] = value;

      if (kind == 'your_lang') {
        _StorageManager.setLanguageWrite(value);
      }

      const parent = $(targetEl).parents('.options')[0];
      $(parent).children('.item').removeClass('active');
      $(targetEl).addClass('active');
    },

    /**
     * On select language config
     * 
     * @param {Element} comboboxEl 
     * @param {Element} itemEl 
     * @param {string} value 
     */
    onSelectLanguageConfig: (comboboxEl, itemEl, value) => {
      const self = TabWriteManager;
      if (self.is_loading) return;

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

        $(buttonEl).click(self.onClickConfigItem);

        buttonEl.append(closeBtnEl);
        $(buttonEl).insertBefore(comboboxEl);

        setTimeout(() => {
          self.formData['your_lang'] = value;
          $(buttonEl).addClass('active');
        }, 100);

        _StorageManager.setLanguageWrite(value);
        _StorageManager.addLanguageWriteList(value);
      }

      if ($(`#${self.idTab} .your-language .combobox-item.hidden`).length == $(`#${self.idTab} .your-language .combobox-item`).length) {
        $(comboboxEl).addClass('hidden');
      }
    },

    /**
     * On select version GPT config
     * 
     * @param {Element} comboboxEl 
     * @param {Element} itemEl 
     * @param {string} value 
     */
    onSelectVersionGptConfig: (comboboxEl, itemEl, value) => {
      const self = TabWriteManager;
      if (self.is_loading) return;

      let record = GPT_VERSION_SETTING_DATA.find(item => {
        return value == item.value
      });

      if (record) {
        self.formData.gpt_version = value;

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
    // on list language user config has changed
    if ('write_language_output_list' in payload) {
      TabWriteManager.language_output_list_config = payload.write_language_output_list.newValue;
      TabWriteManager.loadLangConfig();
    }

    // on language (your_lang) user config has changed
    else if ('write_language_output_active' in payload) {
      let record = payload.write_language_output_active.newValue;

      TabWriteManager.formData['your_lang'] = record.value;
      USER_SETTING.language_write_active = record;

      $('.your-language .item').removeClass('active');
      $('.your-language .item[value="' + record.value + '"]').addClass('active');
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

    _StorageManager.getLanguageWrite(recordLang => {
      if (!recordLang) {
        recordLang = LANGUAGE_SETTING_DATA[0]
      }
      USER_SETTING.language_write_active = recordLang;

      proceedByPallaFinishedCount();
    })

    _StorageManager.getVoiceConfigWrite(voiceConfig => {
      if (!voiceConfig) {
        voiceConfig = {}
        voiceConfig.your_lang = 'japanese';
        for (let i = 0; i < VOICE_SETTING_DATA.length; i++) {
          const item = VOICE_SETTING_DATA[i];
          voiceConfig[item.name_kind] = item.options[0].value;
        }
      }
      voiceConfig.gpt_version = GPT_VERSION_SETTING_DATA[0].value;

      // when init tab write
      TabWriteManager.formData = voiceConfig;

      proceedByPallaFinishedCount();
    })

    _StorageManager.getLanguageWriteList(config => {
      TabWriteManager.language_output_list_config = config;

      proceedByPallaFinishedCount();
    });

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
}());