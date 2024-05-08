/** @define {boolean} デバッグモード */
let DEBUG_MODE = true;

/** @define {object} GLOBALS_GMAIL*/
let GLOBALS_GMAIL = null;

// Event listener
document.addEventListener('RW759_connectExtension', function (e) {
  // e.detail contains the transferred data (can be anything, ranging
  // from JavaScript objects to strings).
  // Do something, for example:
  if (typeof (e.detail) != "undefined") {
    GLOBALS_GMAIL = e.detail;
  }
});
//=============================END HANDLE===================================

(function () {
  'use strict';

  // ==== main ====
  let FAVICON_URL = chrome.runtime.getURL("images/favicon.png");
  let cancelIconUrl = chrome.runtime.getURL("icons/cancel.svg");
  let NODE_ID_EXTENSION_INSTALLED = '__sateraito_import_file_is_installed';

  let BTN_AI_REPLY_ID = 'SATERAITO_AI_REPLY_MAIL';
  let BTN_AI_REPLY_CLS = 'sateraito-ai-reply';
  let BTN_BOX_AI_REPLY_CLS = 'bbar-sateraito-ai-reply wG J-Z-I';

  let chat_gpt_api_key = null
  let is_domain_regist = false
  let is_not_access_list = false

  let FoDoc;
  let FBoolMail;

  /**
   * Debug log
   * @param {string} strMsg
   */
  function debugLog(strMsg) {
    if (DEBUG_MODE === true) {
      console.log(chrome.i18n.getMessage('@@extension_id') + ' ' + (new Date()).toLocaleString() + ':' + strMsg);
    }
  }

  const randomId = () => {
    return Math.random().toString(36).slice(-8);
  }

  const getNewIdPopup = function () {
    let idNew = randomId();

    if ($(`#${idNew}`).length == 0) {
      return idNew;
    }

    return getNewIdPopup();
  }

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
   *
   * @return {boolean} 拡張機能がインストール済みかを返す
   */
  function isExtensionInstalled() {
    let domNode;

    if (!document.getElementById(NODE_ID_EXTENSION_INSTALLED)) {
      domNode = document.createElement('div');
      domNode.id = NODE_ID_EXTENSION_INSTALLED;
      document.body.appendChild(domNode);
    } else {
      debugLog('Already, Extension is installed!');
      return true;
    }
    return false;
  }

  function find(queryFind, callback, time) {
    let timeSetInterval = setInterval(() => {
      let elFind = document.body.querySelector(queryFind);
      if (elFind) {
        clearInterval(timeSetInterval);
        callback(elFind);
      }
    }, time ? time : 0);
  }

  function loadChatGPTAIKey() {
    if (!chat_gpt_api_key) {
      fetchChatGPTAIKey(function (api_key, version_ext) {
        if (typeof (api_key) != "undefined") {
          chat_gpt_api_key = api_key;
        }
      })
    }
  }

  function getChatGPTAIKey(callback) {
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

  function getCurrentUser() {
    if (USER_ADDON_LOGIN != '') {
      return {
        id: ID_USER_ADDON_LOGIN,
        email: USER_ADDON_LOGIN,
      }
    } else {
      var current_user = '';
      if (GLOBALS_GMAIL != null) {
        if (typeof (GLOBALS_GMAIL) != "undefined") {
          if (GLOBALS_GMAIL.length > 10) {
            current_user = GLOBALS_GMAIL[10];
            if (typeof (current_user) == "undefined") current_user = '';
          }
        }
      }

      return {
        id: '',
        email: current_user,
      };
    }
  }

  /**
   * Handler when storage has value change
   * 
   * @param {Event} event 
   */
  function storageOnChanged(payload, type) {
    if ('side_panel_send_result' in payload) {
      const newValue = payload.side_panel_send_result.newValue;
      if (newValue.title && newValue.body) {
        _MailAIGenerate.setMailCompose(newValue);
      }
      setTimeout(() => {
        chrome.storage.sync.set({ side_panel_send_result: {} });
      }, 1000);
    }

    else if ('user_setting' in payload) {
      USER_SETTING = payload.user_setting.newValue;
    }
  }

  const _SendMessageManager = {
    /**
     * Get data json to show popup in mail
     * 
     * @param {string} titleMail 
     * @param {string} contentMail 
     * @param {Function} callback 
     */
    getDataToShowPopup: function (titleMail, contentMail, callback) {
      // Get open ai KEY
      getChatGPTAIKey((gptAiKey) => {
        let params = {
          title_mail: titleMail,
          content_mail: contentMail,
          gpt_ai_key: gptAiKey,
          lang: USER_SETTING.language_write_active.value
        };

        // Call request get data to show popup in mail
        getDataToShowPopupInMailRequest(params, (response) => {
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
     * Generate content reply mail with config
     * 
     * @param {JSON} params 
     * @param {Function} callback 
     */
    generateContentReplyMail: function (params, callback) {
      // Get open ai KEY
      getChatGPTAIKey((gptAiKey) => {
        params.gpt_ai_key = gptAiKey;

        // Call request generate content reply mail with config
        generateContentReplyMailRequest(params, (response) => {
          callback(response);
        })
      })
    }
  };

  const _MyPopup = {
    _list_popup_el: {},
    stillBoxReplyIntervalRealtime: null,

    combobox_flag: false,

    is_loading: false,

    formData: {
      voice_setting: {},
    },
    result_active: 0,
    generate_result_list: [],
    language_output_list_config: [],

    /**
     * Get inner HTML in popup
     * 
     * @returns {string}
     */
    getVHtml: function () {
      let transformX = window.innerWidth - 800;
      let transformY = window.innerHeight - 575;

      let listAllBoxCompose = $('.nH.nn .AD .nH .aaZ .M9 .aoP.aoC')
      for (let i = 0; i < listAllBoxCompose.length; i++) {
        const item = listAllBoxCompose[i];

        let isReplyInBox = false;
        let elContainerReply = $(item).parents('.AD')[0];
        isReplyInBox = ($(elContainerReply).find('.aoP .I5 .bAs table[role="presentation"]').length > 0)

        if (isReplyInBox) {
          transformX = transformX - (elContainerReply.offsetWidth - 120);
        }
      }

      let reloadIconUrl = chrome.runtime.getURL("icons/refresh-icon.png");
      let closeIconUrl = chrome.runtime.getURL("icons/close-icon.png");
      let sendIconUrl = chrome.runtime.getURL("icons/send-icon.png")
      let translateIconUrl = chrome.runtime.getURL("icons/translate.svg")
      let voidConfigIconUrl = chrome.runtime.getURL("icons/graphic-eq.svg");
      let reGenerateIconUrl = chrome.runtime.getURL("icons/refresh-icon.png");
      let copyIconUrl = chrome.runtime.getURL("icons/content-copy-icon.png");
      let backIconUrl = chrome.runtime.getURL("icons/black-icon.png");

      return `
      <div id="ai_reply_popup" class="show-form form-loading" style="transform:translateX(${transformX}px) translateY(${transformY}px) translateZ(0px)">
        <div class="title">
          <div class="wrap-title">
            <div class="left">
              <img class="logo" src="${FAVICON_URL}" alt="logo">
              <span class="name">${MyLang.getMsg('TXT_AI_REPLY')}</span>
            </div>
            <div class="right">
              <button class="reload">
                <img src="${reloadIconUrl}" alt="">
              </button>
              <button class="close">
                <img src="${closeIconUrl}" alt="">
              </button>
            </div>
          </div>
        </div>

        <div class="body">
          <div class="main">
            <div class="summary-content-mail">
              <div class="top">
                <div class="tab">
                  <h5 data-key-tab="tab1" class="active">${MyLang.getMsg('TXT_SUMMARY')}</h5>
                  <h5 data-key-tab="tab2">${MyLang.getMsg('TXT_KEY_POINTS')}</h5>
                </div>
                <div class="language">
                  <span>${MyLang.getMsg('TXT_ORIGINAL_LANGUAGE')}:</span>
                </div>
              </div>

              <div class="body-tab">
                <div id="tab1" class="tab-item loading active">
                  <p id="summary"></p>
                </div>
                <div id="tab2" class="tab-item loading">
                  <ul id="key_points"></ul>
                </div>
              </div>
            </div>

            <div class="reply-suggestions">
              <h5>${MyLang.getMsg('TXT_REPLY_SUGGESTIONS')}</h5>

              <div class="voice-config" title="${MyLang.getMsg('DES_CLICK_TO_CONFIG_VOICE')}">
                <div class="icon">
                  <img src="${voidConfigIconUrl}" alt="">
                </div>
                <div class="config">
                </div>
              </div>

              <div class="popup-voice-config">
                <div class="title">
                  <div class="wrap-title">
                    <div class="left">
                      <img src="${voidConfigIconUrl}">
                      <span class="name">${MyLang.getMsg('TXT_VOICE_SETTING')}</span>
                    </div>
                    <div class="right">
                      <button class="close">
                        <img src="${closeIconUrl}" alt="">
                      </button>
                    </div>
                  </div>
                </div>

                <div class="body">
                </div>

                <div class="your-language config">
                  <div class="title">
                    <img class="icon" src="${translateIconUrl}" alt="translate-icon">
                    <span class="text">${MyLang.getMsg('TXT_LANGUAGE')}:</span>
                  </div>
                  <div class="options">
                  </div>
                </div>
                
              </div>

              <div class="option loading">
                <p></p>
              </div>
              <div class="option loading">
                <p></p>
              </div>
              <div class="option loading">
                <p></p>
              </div>
            </div>

            <div class="result-generate">
              <div class="top">
                <div class="left">
                  <h5>${MyLang.getMsg('TXT_RESULT')}</h5>
                </div>

                <div class="right">
                  <div class="paging">
                    <svg class="icon prev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                    <span class="text"> 1/3 </span>
                    <svg class="icon next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="title-email"></div>

              <div class="body-mail">
                <textarea></textarea>
              </div>
            </div>

          </div>

          <form id="form_tell_sider">
            <button class="back" type="button">
              <img src="${backIconUrl}" alt="">
            </button>
            <input type="text" placeholder="${MyLang.getMsg('DES_TELL_SIDER_TO_REPLY')}">
            <button type="submit">
              <img src="${sendIconUrl}" alt="">
            </button>
          </form>
          <div class="action-btn">
            <div class="left">
              <p>${MyLang.getMsg('TXT_CONTINUE_IMPROVING')}</p>
            </div>
            <div class="right">
              <button class="re-generate icon">
                <img src="${reGenerateIconUrl}" alt="">
              </button>
              <button class="copy-cotnent icon">
                <img src="${copyIconUrl}" alt="">
              </button>
              <button class="insert-btn">
                <span>${MyLang.getMsg('TXT_INSERT')}</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>`;
    },

    /**
     * Focus input
     * 
     * @param {string} idPopup id popup want to focus input
     */
    focusInput: function (idPopup) {
      find(`#root_ai_reply_popup[s_popup_id="${idPopup}"] #form_tell_sider input`, (elFind) => {
        elFind.focus();
      });
    },

    /**
     * Fix position popup when some action resize
     * 
     */
    fixPosition: function () {
      let transformX = window.innerWidth - 800;
      let transformY = window.innerHeight - 575;

      let listAllBoxCompose = $('.nH.nn .AD .nH .aaZ .M9 .aoP.aoC')
      for (let i = 0; i < listAllBoxCompose.length; i++) {
        const item = listAllBoxCompose[i];

        let isReplyInBox = false;
        let elContainerReply = $(item).parents('.AD')[0];
        isReplyInBox = ($(elContainerReply).find('.aoP .I5 .bAs table[role="presentation"]').length > 0)

        if (isReplyInBox) {
          transformX = transformX - (elContainerReply.offsetWidth - 70);
        }
      }

      find('#ai_reply_popup', (elFind) => {
        elFind.style.top = 'unset';
        elFind.style.left = 'unset';
        elFind.style.transform = `translateX(${transformX}px) translateY(${transformY}px) translateZ(0px)`;
      });
    },

    /**
     * Handler show generate result
     * 
     */
    handlerShowGenerateResult: function () {
      const self = _MyPopup;

      $('#ai_reply_popup').removeClass('show-form');
      $('#ai_reply_popup').removeClass('show-to-re-generate');
      $('#ai_reply_popup').addClass('show-result');

      const result = self.generate_result_list;
      self.result_active = (result.length - 1);

      find('.result-generate .title-email', elFind => {
        elFind.innerHTML = '';

        for (let i = 0; i < result.length; i++) {
          const item = result[i];
          let isActive = (i == self.result_active)
          let textEl = document.createElement('p');
          textEl.setAttribute('data-index', i);
          if (isActive) {
            textEl.className = 'active';
            renderTextStyleChatGPT(textEl, item.title);
          } else {
            textEl.innerHTML = item.title;
          }
          elFind.append(textEl);
        }
      });
      find('.result-generate .body-mail', elFind => {
        elFind.innerHTML = '';

        for (let i = 0; i < result.length; i++) {
          const item = result[i];
          let isActive = (i == self.result_active)
          let textareaEl = document.createElement('textarea');
          textareaEl.setAttribute('data-index', i);
          if (isActive) {
            textareaEl.className = 'active';
            renderTextStyleChatGPT(textareaEl, item.body);
          } else {
            textareaEl.innerHTML = item.body;
          }
          elFind.append(textareaEl);
        }
      });

      self.handlerUpdatePaging();
      self.is_loading = false;
    },

    /**
     * Handler update paging status
     * 
     */
    handlerUpdatePaging: function () {
      const self = _MyPopup;
      const result_list = self.generate_result_list;

      find('.result-generate .text', elFind => {
        elFind.innerHTML = `${self.result_active + 1}/${result_list.length}`
      });

      // paging prev
      if (self.result_active <= 0) {
        FoDoc.body.querySelector('.result-generate .paging .prev').classList.add('disable');
      } else {
        FoDoc.body.querySelector('.result-generate .paging .prev').classList.remove('disable');
      }

      // paging next
      if (self.result_active >= (result_list.length - 1)) {
        FoDoc.body.querySelector('.result-generate .paging .next').classList.add('disable');
      } else {
        FoDoc.body.querySelector('.result-generate .paging .next').classList.remove('disable');
      }
    },

    /**
     * Show popup handler
     * 
     * @param {string} idPopup id popup
     */
    showPopup: function (idPopup) {
      const self = _MyPopup;

      self.result_active = 0;
      self.generate_result_list = [];
      // for (let i = 0; i < VOICE_SETTING_DATA.length; i++) {
      //   const item = VOICE_SETTING_DATA[i];
      //   self.formData.voice_setting[item.name_kind] = item.options[0];
      // }

      if (self._list_popup_el[idPopup]) {
        self.focusInput(idPopup);
        return;
      }

      let root = document.createElement('div');
      root.id = 'root_ai_reply_popup'
      root.innerHTML = self.getVHtml();
      root.setAttribute('s_popup_id', idPopup);
      FoDoc.body.append(root);

      self._list_popup_el[idPopup] = root;

      self.reLoadVoiceConfig();
      self.addEventUIForDialog(idPopup);

      _StorageManager.getLanguageWriteList(config => {
        _MyPopup.language_output_list_config = config;
        self.loadLangConfig();
      });
    },

    /**
     * Close popup handler
     * 
     * @param {string} idPopup id popup
     */
    closePopup: function (idPopup) {
      const self = _MyPopup;
      // if (self.is_loading) return;

      clearInterval(self.stillBoxReplyIntervalRealtime);
      self.stillBoxReplyIntervalRealtime = null;

      if (self._list_popup_el[idPopup]) {
        self._list_popup_el[idPopup].remove();
        delete self._list_popup_el[idPopup];
      }
    },

    /**
     * Add event for action
     * 
     * @param {string} idPopup id popup
     */
    addEventForAction: function (idPopup) {
      const self = _MyPopup;
      let clsTemplate;

      // For combobox component
      clsTemplate = '.popup-voice-config .combobox';
      $(document).off('click', clsTemplate, self.onClickCombobox);
      $(document).on('click', clsTemplate, self.onClickCombobox);

      clsTemplate = `.popup-voice-config .popover-cbx.wrap-item .combobox-item`;
      $(document).off('click', clsTemplate, self.onClickItemCombobox);
      $(document).on('click', clsTemplate, self.onClickItemCombobox);

      // For items options voice config
      clsTemplate = '.popup-voice-config .your-language.config .options .item';
      $(document).off('click', clsTemplate, self.onClickConfigItem);
      $(document).on('click', clsTemplate, self.onClickConfigItem);

      clsTemplate = '#ai_reply_popup .option';
      $(document).off('click', clsTemplate, self.onClickOptionItem);
      $(document).on('click', clsTemplate, self.onClickOptionItem);

      // Button voice-config
      clsTemplate = '.reply-suggestions .popup-voice-config .config .options button.item';
      $(document).off('click', clsTemplate, self.onClickOptionVoiceConfigItem);
      $(document).on('click', clsTemplate, self.onClickOptionVoiceConfigItem);

      // Remove and save language config
      clsTemplate = `.reply-suggestions .popup-voice-config .your-language .item .close`;
      $(document).off('click', clsTemplate, self.onClickRemoveLanguageConfig);
      $(document).on('click', clsTemplate, self.onClickRemoveLanguageConfig);

      $('.action-btn button.re-generate').click((event) => {
        if (self.is_loading) return;

        self.handlerReloadGenerateReplyAgain();
      });

      $('.action-btn button.copy-cotnent').click((event) => {
        if (self.is_loading) return;

        navigator.clipboard.writeText(self.generate_result_list[self.result_active].body);
      });

      $('.action-btn button.insert-btn').click((event) => {
        if (self.is_loading) return;

        _MailAIGenerate.setMailReply(self.generate_result_list[self.result_active]);
        self.closePopup(idPopup);
      });

      find('form#form_tell_sider', (elFind) => {
        elFind.addEventListener('submit', (event) => {
          event.preventDefault();

          if (self.is_loading) return;

          self.handlerSubmitForm(idPopup);
        })
      });

      // Close popup event
      find('#ai_reply_popup .reload', (elFind) => {
        elFind.addEventListener('click', () => {
          if (self.is_loading) return;

          self.closePopup(idPopup);
          _MailAIGenerate.handlerReplyBtnClick();
        })
      });
    },

    /**
     * Add event or UI
     * 
     * @param {string} idPopup id popup
     */
    addEventForUI: function (idPopup) {
      const self = _MyPopup;

      // Tab summary
      $('.summary-content-mail h5').click((event) => {
        const idItemTab = event.target.getAttribute('data-key-tab');

        $('.summary-content-mail h5').removeClass('active');
        $(event.target).addClass('active');

        $('.summary-content-mail .body-tab .tab-item').removeClass('active');
        $(`.summary-content-mail .body-tab #${idItemTab}`).addClass('active');
      });

      // Voice-config
      $('.reply-suggestions .voice-config').click((event) => {
        $('#ai_reply_popup').addClass('show-voice-config');
      });
      // Button close voice-config
      $('.popup-voice-config button.close').click((event) => {
        $('#ai_reply_popup').removeClass('show-voice-config');
      });

      // Button open re generate reply email
      $('#form_tell_sider button.back').click((event) => {
        $('#ai_reply_popup').removeClass('show-to-re-generate');
      });
      $('.action-btn .left p').click((event) => {
        $('#ai_reply_popup').addClass('show-to-re-generate');
      });

      // Paging for generate list
      find('.result-generate .paging', elFind => {
        const handlerActive = () => {
          $('.result-generate .title-email p').removeClass('active');
          $(`.result-generate .title-email p[data-index="${self.result_active}"]`).addClass('active');

          $('.result-generate .body-mail textarea').removeClass('active');
          $(`.result-generate .body-mail textarea[data-index="${self.result_active}"]`).addClass('active');

          self.handlerUpdatePaging();
        };

        $('.result-generate .paging .prev').click((event) => {
          if (event.target.className.baseVal.indexOf('disable') != -1) {
            return;
          }
          self.result_active--;
          handlerActive();
        })
        $('.result-generate .paging .next').click((event) => {
          if (event.target.className.baseVal.indexOf('disable') != -1) {
            return;
          }
          self.result_active++;
          handlerActive();
        })
      });
    },

    /**
     * Add event UI for dialog
     * 
     * @param {string} idPopup id popup
     */
    addEventUIForDialog: (idPopup) => {
      const self = _MyPopup;

      find('form#form_tell_sider', (elFind) => {
        elFind.addEventListener('submit', (event) => {
          event.preventDefault();
        })
      });

      // Down Drag event
      find('#ai_reply_popup', (elFind) => {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (elFind.querySelector(".title")) {
          /* if present, the header is where you move the DIV from:*/
          elFind.querySelector(".title").onmousedown = dragMouseDown;
        } else {
          /* otherwise, move the DIV from anywhere inside the DIV:*/
          elFind.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          // get the mouse cursor position at startup:
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();
          elFind.classList.add('move');
          // calculate the new cursor position:
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          // set the element's new position:
          elFind.style.top = (elFind.offsetTop - pos2) + "px";
          elFind.style.left = (elFind.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
          /* stop moving when mouse button is released:*/
          document.onmouseup = null;
          document.onmousemove = null;

          elFind.classList.remove('move');
        }
      })
      // Close popup event
      find('#ai_reply_popup .close', (elFind) => {
        elFind.addEventListener('click', () => {
          if (self.is_loading) return;

          self.closePopup(idPopup);
        })
      });
      // Resize popup event
      window.addEventListener("resize", (event) => {
        self.fixPosition();
      });

      // Tracking to show popup event
      self.stillBoxReplyIntervalRealtime = setInterval(() => {
        let boxReply = document.body.querySelector('.LW-avf.tS-tW');
        if (!boxReply) {
          self.closePopup(idPopup);
        }
      });
    },

    /**
     * Reload and show voice config to popup
     *  
     */
    reLoadVoiceConfig: function () {
      const self = _MyPopup;
      find('.voice-config .config', (elFind) => {
        elFind.innerHTML = '';

        let list_name_kind = VOICE_SETTING_DATA.map(item => item.name_kind);
        list_name_kind.push('your_lang');

        for (let i = 0; i < list_name_kind.length; i++) {
          const kindNameItem = list_name_kind[i];

          let voiceConfig = self.formData.voice_setting[kindNameItem];
          if (!voiceConfig) {
            continue
          }

          let record;
          if (kindNameItem != 'your_lang') {
            let kind = VOICE_SETTING_DATA.find(kindItem => kindItem.name_kind == kindNameItem);
            if (kind) {
              record = kind.options.find(item => item.value == voiceConfig);

              if (!record) {
                continue
              }
            } else {
              continue
            }
          } else {
            record = LANGUAGE_SETTING_DATA.find(langItem => langItem.value == voiceConfig);
          }

          $(`.popup-voice-config button.item[kind="${kindNameItem}"]`).removeClass('active');
          $(`.popup-voice-config button.item[value="${record.value}"]`).addClass('active');

          if (record.value.trim() != '') {
            let spanEl = document.createElement('span');
            spanEl.innerText = record.name;
            elFind.append(spanEl);
          }
        }
      });
    },

    /**
     * Load data to popup
     * 
     * @param {string} idPopup id popup
     * @param {object} data data need
     */
    loadData: function (idPopup, data) {
      const self = _MyPopup;

      // Show language of content email
      find('#ai_reply_popup .summary-content-mail .language span', (elFind) => {
        elFind.innerHTML = `${MyLang.getMsg('TXT_ORIGINAL_LANGUAGE')}: ${data.lang_content}`;
      });

      // Show text summary content email
      find('#ai_reply_popup #summary', (elFind) => {
        // elFind.innerHTML = data.summary;
        renderTextStyleChatGPT(elFind, data.summary)
      });

      // Show key points of content mail
      find('#ai_reply_popup #key_points', (elFind) => {
        for (let i = 0; i < data.key_points_list.length; i++) {
          const item = data.key_points_list[i];
          const liEl = document.createElement('li');
          liEl.textContent = item;
          elFind.append(liEl);
        }
      });

      // Show suggestion list to reply content mail
      find('#ai_reply_popup .reply-suggestions', (elFind) => {
        $('#ai_reply_popup .reply-suggestions .option').remove();

        let suggestionList = data.suggestion_list;
        for (let i = 0; i < suggestionList.length; i++) {
          let itemSugg = suggestionList[i];

          let optionEl = document.createElement('div');
          optionEl.setAttribute('data-sugg', itemSugg)
          optionEl.className = 'option'

          let pEl = document.createElement('p');
          renderTextStyleChatGPT(pEl, itemSugg, (elRendered) => {
            let spanEl = document.createElement('span');
            spanEl.innerHTML = '→'
            elRendered.append(spanEl);
          });

          optionEl.append(pEl);
          elFind.append(optionEl);
        }
      });

      // Load data for voice setting
      find('.popup-voice-config .body', (elFind) => {
        for (let i = 0; i < VOICE_SETTING_DATA.length; i++) {
          const config_item = VOICE_SETTING_DATA[i];
          // important
          if (config_item.name_kind == 'formality') continue;

          const configEl = document.createElement('div');
          configEl.className = `${config_item.name_kind} config`;

          let vHtmlOption = ``;
          for (let j = 0; j < config_item.options.length; j++) {
            const optionItem = config_item.options[j];

            let isActive = false;
            if (self.formData.voice_setting[config_item.name_kind].value == optionItem.value) {
              isActive = true;
            }

            vHtmlOption += `<button kind="${config_item.name_kind}" value="${optionItem.value}" class="item ${isActive ? 'active' : ''}">
                              ${optionItem.display}
                            </button>`
          }
          let vHtml = `
            <div class="title">
              <img class="icon" src="${config_item.icon}" alt="${config_item.name_kind}">
              <span class="text">${config_item.name}:</span>
            </div>
            <div class="options">
              ${vHtmlOption}
            </div>
          `;

          configEl.innerHTML = vHtml;
          elFind.append(configEl);
        }

      });

      $('#ai_reply_popup').removeClass('form-loading');
      $('.summary-content-mail .body-tab .tab-item').removeClass('loading');

      // add event
      self.addEventForUI(idPopup);
      self.addEventForAction(idPopup);
      self.reLoadVoiceConfig();

      _MyPopup.is_loading = false;
    },

    loadLangConfig: () => {
      const self = _MyPopup;

      let lang_default = LANGUAGE_SETTING_DATA[0];

      // Get and set to your_lang with lang was used before
      let langActive = USER_SETTING.language_write_active || lang_default;
      self.formData.voice_setting.your_lang = langActive.value;

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
            <img class="icon" src="${cancelIconUrl}">
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
      $(`.popup-voice-config .your-language .options`).html(vHtml_init);

      // Set event on select item in combobox language
      document.body.querySelector(`.popup-voice-config #language_cbx`).onSelect = self.onSelectLanguageConfig;

      // Hidden combobox language element when add all language to html side panel
      if ($(`.popup-voice-config .your-language .combobox-item.hidden`).length == $(`.popup-voice-config .your-language .combobox-item`).length) {
        $('.popup-voice-config #language_cbx').addClass('hidden');
      }
    },

    // Handler func

    /**
     * Handler submit form
     * 
     * @param {string} idPopup id popup
     */
    handlerSubmitForm: function (idPopup) {
      const self = _MyPopup;
      if (self.is_loading) return;

      let contentMail = _MailAIGenerate.getContentBodyMail();

      let suggestionReply = FoDoc.body.querySelector('form#form_tell_sider input').value.trim();
      if (suggestionReply == '') return;

      self.processAddGenerateReplyMail(contentMail, suggestionReply);
    },

    /**
     * Handler reload generate reply again
     * 
     * @param {string} idPopup id popup
     */
    handlerReloadGenerateReplyAgain: function (idPopup) {
      const self = _MyPopup;
      if (self.is_loading) return;

      self.processAddGenerateReplyMail(self.formData.content_mail, self.formData.suggestion_old);
    },

    /**
     * Process add generate reply mail
     * 
     * @param {string} contentMail 
     * @param {string} suggestionReply 
     */
    processAddGenerateReplyMail: function (contentMail, suggestionReply) {
      const self = _MyPopup;
      if (self.is_loading) return;

      self.is_loading = true;
      $('#ai_reply_popup').addClass('form-loading');

      $('.result-generate .title-email').addClass('loading');
      $('.result-generate .body-mail').addClass('loading');
      $('#form_tell_sider').addClass('loading');

      let voiceConfig = {};
      for (const key in self.formData.voice_setting) {
        if (Object.hasOwnProperty.call(self.formData.voice_setting, key)) {
          const item = self.formData.voice_setting[key];
          voiceConfig[key] = item;
        }
      }

      // Save language used
      _StorageManager.setLanguageWrite(voiceConfig.your_lang)
      _StorageManager.setVoiceConfigWrite(voiceConfig);

      self.formData.content_mail = contentMail;
      self.formData.suggestion_old = suggestionReply;

      const params = {
        title_mail: _MailAIGenerate.getTitleMail(),
        content_mail: contentMail,
        voice_config: voiceConfig,
        reply_suggested: suggestionReply,
        // lang: LOCALE_CODES.getNameLocale(),
      }

      _SendMessageManager.generateContentReplyMail(params, (replyContent) => {
        self.generate_result_list.push(replyContent);

        self.handlerShowGenerateResult();

        $('.result-generate .title-email').removeClass('loading');
        $('.result-generate .body-mail').removeClass('loading');
        $('#form_tell_sider').removeClass('loading');
        $('#ai_reply_popup').removeClass('form-loading');
      });
    },

    onClickCombobox: (event) => {
      const self = _MyPopup;

      $(`.popup-voice-config .popover-cbx`).removeClass('show');
      const popoverEl = event.target.querySelector(`.popup-voice-config .popover-cbx`);
      if (!popoverEl) return;

      self.combobox_flag = true;

      popoverEl.classList.add('show');
      popoverEl.style.top = `-${popoverEl.offsetHeight - 10}px`;
      popoverEl.style.left = `${event.target.offsetWidth - 20}px`;

      setTimeout(() => {
        self.combobox_flag = false;
      }, 100)
    },

    onClickItemCombobox: (event) => {
      const self = _MyPopup;

      const value = event.target.getAttribute('value');
      const comboboxEl = $(event.target).parents('button.combobox')[0];
      if (comboboxEl.onSelect) {
        comboboxEl.onSelect(comboboxEl, event.target, value);
      }
    },

    onClickOptionItem: (event) => {
      const self = _MyPopup;
      if (self.is_loading) return;

      let contentMail = _MailAIGenerate.getContentBodyMail();
      let suggestionReply = event.target.getAttribute('data-sugg');

      event.target.classList.add('selected');

      find('form#form_tell_sider input', (findEl) => {
        findEl.value = suggestionReply;
        self.processAddGenerateReplyMail(contentMail, suggestionReply);
      })
    },

    onClickOptionVoiceConfigItem: (event) => {
      const self = _MyPopup;
      const kind = event.target.getAttribute('kind');
      const value = event.target.getAttribute('value');

      if (!kind || !value) return;

      if (kind == 'your_lang') {
        let recordLang = LANGUAGE_SETTING_DATA.find(item => item.value == value);
        if (!recordLang) return;

        USER_SETTING.language_write_active = recordLang;
        _StorageManager.setLanguageWrite(recordLang);
        
        self.formData.voice_setting[kind] = recordLang.value;

      } else {
        let options = VOICE_SETTING_DATA.find(item => item.name_kind == kind).options;
        if (!options) return;
        self.formData.voice_setting[kind] = options.find(item => item.value == value).value;
      }

      self.reLoadVoiceConfig();
    },

    onClickRemoveLanguageConfig: (event) => {
      const self = _MyPopup;
      const targetEl = event.target;

      const parentBtnEl = $(targetEl).parents('button.item.text');
      const value = parentBtnEl.attr('value');

      _StorageManager.removeLanguageWriteList(value);

      parentBtnEl.remove();

      $(`#language_cbx .combobox-item[value="${value}"]`).removeClass('hidden');
      $(`.reply-suggestions #language_cbx`).removeClass('hidden');
    },

    onClickConfigItem: (event) => {
      const self = _MyPopup;

      const targetEl = event.target;
      const kind = event.target.getAttribute('kind');
      const value = event.target.getAttribute('value');

      if (!value || !kind) return;
      self.formData.voice_setting[kind] = value;

      const parent = $(targetEl).parents('.options')[0];
      $(parent).children('.item').removeClass('active');
      $(targetEl).addClass('active');
    },

    onSelectLanguageConfig: (comboboxEl, itemEl, value) => {
      const self = _MyPopup;

      let record = LANGUAGE_SETTING_DATA.find(item => {
        return value == item.value
      });

      if (record) {
        $(itemEl).addClass('hidden');

        $(`.popup-voice-config .your-language .item`).removeClass('active');

        const buttonEl = document.createElement('button');
        buttonEl.setAttribute('kind', 'your_lang');
        buttonEl.setAttribute('value', record.value);
        buttonEl.className = 'item text';
        buttonEl.innerHTML = record.name;

        const closeBtnEl = document.createElement('div');
        closeBtnEl.className = 'close';
        closeBtnEl.innerHTML = '<img class="icon" src="' + cancelIconUrl + '">';

        $(buttonEl).click(self.onClickConfigItem);

        buttonEl.append(closeBtnEl);
        $(buttonEl).insertBefore(comboboxEl);

        setTimeout(() => {
          self.formData.voice_setting['your_lang'] = value;
          $(buttonEl).addClass('active');
        }, 100);

        _StorageManager.addLanguageWriteList(value);
      }

      if ($(`.popup-voice-config .your-language .combobox-item.hidden`).length == $(`.popup-voice-config .your-language .combobox-item`).length) {
        $(comboboxEl).addClass('hidden');
      }
    },
  };

  /**
   * Mail Add-on
   */
  const _MailAIGenerate = {
    actionsMailEl: null,
    AIReplyBtnEl: null,
    bodyMailEl: null,
    detectInterval_100: null,

    /**
     * Initialize the add-on when running in mail
     * 
     */
    _init: function () {
      let self = _MailAIGenerate;
      if (self.detectInterval_100 != null) {
        clearInterval(self.detectInterval_100);
      }
      self.detectInterval_100 = setInterval(self.handleDetect);
    },

    // Setter
    setMailReply: function (params) {
      const { title, body } = params;

      let isAdded = false;

      let listAllBoxCompose = $('.nH.nn .AD .nH .aaZ .M9 .aoP.aoC')
      if (listAllBoxCompose.length > 0) {
        // This handle for popup out reply
        for (let i = 0; i < listAllBoxCompose.length; i++) {
          const item = listAllBoxCompose[i];

          let isCompose = ($(item).parents('.AD').find('.aoP .I5 .bAs table[role="presentation"]').length == 0)
          if (!isCompose) {
            let findEl = $(item).find('.Am.Al.editable.LW-avf')[0];
            findEl.innerHTML = body.replaceAll('\n', '</br>');
            findEl.focus();

            isAdded = true;
          }
        }
      }

      if (!isAdded) {
        // This handle for popup normal reply
        find('.Am.Al.editable.LW-avf', (findEl) => {
          findEl.innerHTML = body.replaceAll('\n', '</br>');
          findEl.focus();
        });
      }
    },

    setMailCompose: function (params) {
      const { title, body } = params;

      let listAllBoxCompose = $('.nH.nn .AD .nH .aaZ .M9 .aoP.aoC')
      for (let i = 0; i < listAllBoxCompose.length; i++) {
        const item = listAllBoxCompose[i];

        let isCompose = ($(item).parents('.AD').find('.aoP .I5 .bAs table[role="presentation"]').length == 0)
        if (isCompose) {
          let findEl = $(item).find('.aoD input[name="subjectbox"]');
          findEl.val(title)

          findEl = $(item).find('.iN .Am.Al.editable.LW-avf');
          findEl.html(body.replaceAll('\n', '</br>'));
          findEl.focus();
        }
      }

    },

    // Getter

    /**
     * Get id inbox mail
     * 
     * @returns {string}
     */
    getIdInbox: function () {
      let url = window.location.href;
      let regex = /\/([^\/#\?]+)$/; // Matches any characters after the last "/", but before "#" or "?"
      let match = url.match(regex);
      let desiredSubstring = match ? match[1] : null;
      console.log(desiredSubstring);

      return desiredSubstring;
    },

    /**
     * Get body mail
     * 
     * @returns {Element}
     */
    getBodyMail: function () {
      let el = $('.adn.ads .a3s.aiL div[dir="ltr"]');
      if (el.length == 0) {
        el = $('.adn.ads .a3s.aiL');
      }
      if (el.length == 0) {
        el = $('.adn.ads .gs');
      }
      if (el.length == 0) {
        el = $('.adn.ads');
      }
      return el;
    },

    /**
     * Get content mail
     * 
     * @returns {string}
     */
    getContentBodyMail: function () {
      let self = _MailAIGenerate;
      let selection = window.getSelection();
      let range = document.createRange();
      range.setStartBefore(self.bodyMailEl.first()[0]);
      range.setEndAfter(self.bodyMailEl.last()[0]);
      selection.removeAllRanges();
      selection.addRange(range);

      let contentMail = document.getSelection().toString();
      selection.removeAllRanges();
      return contentMail;
    },


    /**
     * Get title mail
     * 
     * @returns {string}
     */
    getTitleMail: function () {
      return FoDoc.body.querySelector('.V8djrc .hP').innerHTML;
    },

    // Process func

    /**
     * Process add button A.I reply to action mail active
     * 
     */
    processAddAIReplyButton: function () {
      let self = _MailAIGenerate;
      let elmBtn = document.createElement('div');
      elmBtn.id = BTN_AI_REPLY_ID
      elmBtn.addEventListener('click', self.handlerReplyBtnClick);
      elmBtn.classList = BTN_AI_REPLY_CLS

      let vHtml = `
        <img src="${FAVICON_URL}">
        <span class="text">${MyLang.getMsg('TXT_AI_REPLY')}</span>
      `;

      elmBtn.innerHTML = vHtml;

      self.AIReplyBtnEl = elmBtn;
      self.actionsMailEl.append(elmBtn);
    },

    /**
     * Process add button A.I reply to bottom bar for all box reply mail
     * 
     */
    processAddAIReplyBtnForListBoxReply: function () {
      let self = _MailAIGenerate;
      let lisBBarReplyEl = FoDoc.querySelectorAll('.G3.G2 .IZ .btC');

      for (let i = 0; i < lisBBarReplyEl.length; i++) {
        let itemBBarEl = lisBBarReplyEl[i];

        if (itemBBarEl.querySelector('.bbar-sateraito-ai-reply')) continue;

        let elmBtn = document.createElement('div');
        elmBtn.addEventListener('click', self.handlerReplyBoxBtnClick);
        elmBtn.setAttribute('data-tooltip', MyLang.getMsg('TXT_AI_REPLY'));
        elmBtn.setAttribute('data-label', MyLang.getMsg('TXT_AI_REPLY'));
        elmBtn.setAttribute('role_btn', 'reply');
        elmBtn.className = BTN_BOX_AI_REPLY_CLS

        let vHtml = `
          <img style="pointer-events:none" src="${FAVICON_URL}">
          `;

        elmBtn.innerHTML = vHtml;

        if (itemBBarEl.querySelector('.gU .bAK')) {
          itemBBarEl.querySelector('.gU .bAK').append(elmBtn);
        }
        else if (itemBBarEl.querySelector('.gU.aYL')) {
          itemBBarEl.insertBefore(elmBtn, itemBBarEl.querySelector('.gU.aYL'));
        }
        else if (itemBBarEl.querySelector('.gU.a0z')) {
          itemBBarEl.insertBefore(elmBtn, itemBBarEl.querySelector('.gU.a0z'));
        } else {
          itemBBarEl.append(elmBtn);
        }
      }
    },

    processAddAIReplyBtnForListBoxCompose: function () {
      let self = _MailAIGenerate;
      let lisBBarComposeEl = FoDoc.querySelectorAll('.nH .aaZ .btC');

      for (let i = 0; i < lisBBarComposeEl.length; i++) {
        let itemBBarEl = lisBBarComposeEl[i];

        if (itemBBarEl.querySelector('.bbar-sateraito-ai-reply')) continue;

        let elmBtn = document.createElement('div');
        elmBtn.addEventListener('click', self.handlerReplyBoxBtnClick);
        elmBtn.setAttribute('data-tooltip', MyLang.getMsg('TXT_AI_REPLY'));
        elmBtn.setAttribute('data-label', MyLang.getMsg('TXT_AI_REPLY'));

        let is_really_compose = ($(itemBBarEl).parents('.AD').find('.aoP .I5 .bAs table[role="presentation"]').length == 0)
        elmBtn.setAttribute('role_btn', is_really_compose ? 'compose' : 'reply');

        elmBtn.className = BTN_BOX_AI_REPLY_CLS

        let vHtml = `
          <img style="pointer-events:none" src="${FAVICON_URL}">
          `;

        elmBtn.innerHTML = vHtml;

        if (itemBBarEl.querySelector('.gU .bAK')) {
          itemBBarEl.querySelector('.gU .bAK').append(elmBtn);
        }
        else if (itemBBarEl.querySelector('.gU.aYL')) {
          itemBBarEl.insertBefore(elmBtn, itemBBarEl.querySelector('.gU.aYL'));
        }
        else if (itemBBarEl.querySelector('.gU.a0z')) {
          itemBBarEl.insertBefore(elmBtn, itemBBarEl.querySelector('.gU.a0z'));
        } else {
          itemBBarEl.append(elmBtn);
        }
      }
    },

    processRequestToShowPopup: function (titleMail, contentMail) {
      let btnReplyMailEl = FoDoc.body.querySelector('.ams.bkH');
      if (btnReplyMailEl) {
        btnReplyMailEl.click();
      }

      const idPopup = getNewIdPopup();
      find('.LW-avf.tS-tW', (elFind) => {
        _MyPopup.is_loading = true;
        _MyPopup.showPopup(idPopup);

        _SendMessageManager.getDataToShowPopup(titleMail, contentMail, (data) => {
          _MyPopup.loadData(idPopup, data);
        });

        elFind.focus();
      });

      find('.G3.G2', (elFind) => {
        elFind.setAttribute('s_popup_id', idPopup);
      });
    },

    // Handler func

    /**
     * Handler detect add-on when running in mail
     *  
     */
    handleDetect: function () {
      let self = _MailAIGenerate;

      self.bodyMailEl = self.getBodyMail();
      let hasBody = (self.bodyMailEl.length != 0);

      // Render button AI reply for mail active
      self.actionsMailEl = FoDoc.querySelector('div.gA.gt.acV .amn');
      if (hasBody && self.actionsMailEl) {
        let btnRendered = self.actionsMailEl.querySelector('#' + BTN_AI_REPLY_ID)
        if (!btnRendered) {
          self.processAddAIReplyButton();
        }
      }

      // Render button AI reply for all box reply
      self.processAddAIReplyBtnForListBoxReply();
      // Render button AI reply for all box compose
      self.processAddAIReplyBtnForListBoxCompose();
    },

    handlerReplyBtnClick: function (event) {
      const self = _MailAIGenerate;

      let current_user = getCurrentUser();
      //addon setting
      loadAddOnSetting(current_user.email, function (result) {
        is_domain_regist = result.is_domain_regist
        is_not_access_list = result.is_not_access_list
        console.log(`auto summary chat GPT: domain regist:[${is_domain_regist}], permission deny:[${is_not_access_list}]`)
      })

      let titleMail = _MailAIGenerate.getTitleMail();
      let contentMail = _MailAIGenerate.getContentBodyMail();
      self.processRequestToShowPopup(titleMail, contentMail);
    },

    handlerReplyBoxBtnClick: function (event) {
      const self = _MailAIGenerate;

      if (event.target.getAttribute('role_btn') == 'reply') {
        let mainContentEl = FoDoc.body.querySelector('.G3.G2');
        const idPopup = mainContentEl.getAttribute('s_popup_id');

        if (idPopup && _MyPopup._list_popup_el[idPopup]) {
          _MyPopup.focusInput(idPopup);
        } else {
          let titleMail = _MailAIGenerate.getTitleMail();
          let contentMail = _MailAIGenerate.getContentBodyMail();
          self.processRequestToShowPopup(titleMail, contentMail);
        }
      } else {
        chrome.runtime.sendMessage({
          method: 'open_side_panel',
        })
      }
    },
  };

  /**
   * Initialize add on
   * 
   */
  function initialize() {
    debugLog('▼▼▼ initialize started ! ');

    let strUrl = document.URL;
    if ((window === window.top) && (isExtensionInstalled() === false)) {
      FoDoc = document;

      FBoolMail = (strUrl.indexOf('//mail.google.com/') >= 0);
      if (FBoolMail) {
        _MailAIGenerate._init();
      }
    }

    chrome.storage.onChanged.addListener(storageOnChanged);

    _StorageManager.getLanguageWrite(recordLang => {
      if (!recordLang) {
        recordLang = LANGUAGE_SETTING_DATA[0]
      }
      USER_SETTING.language_write_active = recordLang;
    })

    _StorageManager.getVoiceConfigWrite(voiceConfig => {
      if (!voiceConfig) {
        voiceConfig = {}
        voiceConfig.your_lang = 'english';
        voiceConfig.gpt_version = GPT_VERSION_SETTING_DATA[0].value;
        for (let i = 0; i < VOICE_SETTING_DATA.length; i++) {
          const item = VOICE_SETTING_DATA[i];
          // important
          if (item.name_kind == 'formality') continue;

          voiceConfig[item.name_kind] = item.options[0].value;
        }
      }

      delete voiceConfig.gpt_ai_key
      delete voiceConfig.gpt_version
      delete voiceConfig.type_generate
      delete voiceConfig.topic_compose
      delete voiceConfig.original_text_reply
      delete voiceConfig.general_content_reply

      // Init voice config
      _MyPopup.formData.voice_setting = voiceConfig;
    })

    chrome.runtime.sendMessage({ method: 'get_user_info' }, (userInfo) => {
      ID_USER_ADDON_LOGIN = userInfo.id;
      USER_ADDON_LOGIN = userInfo.email;

      //addon setting
      loadAddOnSetting(userInfo.email, function (result) {
        is_domain_regist = result.is_domain_regist
        is_not_access_list = result.is_not_access_list
        console.log(`auto summary chat GPT: domain regist:[${is_domain_regist}], permission deny:[${is_not_access_list}]`)
      });

    });

    debugLog('▲▲▲ initilize ended ! ');
  }

  // __main__
  initialize();
}());