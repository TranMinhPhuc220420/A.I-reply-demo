/** @define {boolean} デバッグモード */
let DEBUG_MODE = true;

/** @define {object} GLOBALS_GMAIL*/
let GLOBALS_GMAIL = null;

//==========CREATE HANDLE TO GET [GLOBALS] VARIABLE GMAIL=================
//CREATE HANDLE TO GET [GLOBALS] VARIABLE GMAIL
var s = document.createElement('script');
s.src = chrome.runtime.getURL('scripts/script.js');
(document.head || document.documentElement).appendChild(s);
s.onload = function () {
  s.remove();
};

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
  let NODE_ID_EXTENSION_INSTALLED = '__sateraito_import_file_is_installed';

  let BTN_AI_REPLY_ID = 'SATERAITO_AI_REPLY_MAIL';
  let BTN_AI_REPLY_CLS = 'sateraito-ai-reply';
  let BTN_BOX_AI_REPLY_CLS = 'bbar-sateraito-ai-reply';

  let FoDoc;
  let FBoolMail;
  let flagHasSetCloseSidePanel = false;
  let flagHasSetClearSidePanel = false;

  /**
   * Get new id popup
   * 
   * @returns {string}
   */
  const getNewIdPopup = function () {
    let idNew = randomId();

    if ($(`#${idNew}`).length == 0) {
      return idNew;
    }

    return getNewIdPopup();
  }

  function getCurrentUser() {
    var current_user = '';
    if (GLOBALS_GMAIL != null) {
      if (typeof (GLOBALS_GMAIL) != "undefined") {
        if (GLOBALS_GMAIL.length > 10) {
          current_user = GLOBALS_GMAIL[10];
          if (typeof (current_user) == "undefined") current_user = '';
        }
      }
    }
    return current_user;
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

  /**
   * Handler when storage has value change
   * 
   * @param {Event} event 
   */
  function storageOnChanged(payload, type) {
    // on has result send from side panel to add to reply or compose box
    if ('side_panel_send_result' in payload) {
      const newValue = payload.side_panel_send_result.newValue;
      if (newValue.title && newValue.body) {
        _MailAIGenerate.setTitleContentMail(newValue);
      }
      setTimeout(() => {
        chrome.storage.local.set({ side_panel_send_result: {} });
      }, 1000);
    }
  }

  /**
   * Debug log
   * @param {string} strMsg
   */
  const debugLog = (strMsg) => {
    if (DEBUG_MODE === true) {
      console.log(chrome.i18n.getMessage('@@extension_id') + ' ' + (new Date()).toLocaleString() + ':', strMsg);
    }
  }

  const setOpenSidePanel = () => {
    // open side panel when action for compose
    chrome.runtime.sendMessage({
      method: 'open_side_panel',
    })
  };

  const setCloseSidePanel = (idTarget) => {
    if (flagHasSetCloseSidePanel) return;
    debugLog('setCloseSidePanel');

    flagHasSetCloseSidePanel = true;
    _StorageManager.setCloseSidePanel(idTarget, true, () => {
      flagHasSetCloseSidePanel = false;
    });
  };

  const setClearSidePanel = (idTarget) => {
    if (flagHasSetClearSidePanel) return;
    debugLog('setClearSidePanel');

    flagHasSetClearSidePanel = true;
    _StorageManager.triggerClearSidePanel(idTarget, () => {
      flagHasSetClearSidePanel = false;
    });
  };

  /**
   * Mail Add-on
   * 
   */
  const _MailAIGenerate = {
    actionsMailEl: null,
    AIReplyBtnEl: null,
    bodyMailEl: null,
    detectInterval_100: null,

    trackingBoxReplyInterval: null,
    trackingBoxComposeInterval: null,

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

      function gText(e) {
        let sessionEl = (document.all) ? document.selection.createRange().text : document.getSelection();
        _StorageManager.setOriginalTextSidePanel(sessionEl.toString());
      }
      document.onmouseup = gText;
      if (!document.all) document.captureEvents(Event.MOUSEUP);
    },

    // Setter

    /**
     * Set title and body to box compose opening
     * 
     * @param {json} params 
     */
    setTitleContentMail: function (params) {
      let self = _MailAIGenerate;
      const { id_popup, title, body } = params;

      if (id_popup && $(`.sateraito-${id_popup}`).length > 0) {
        let bodyMailEl = $(`.sateraito-${id_popup}`)[0];
        let titleMailEl = $(bodyMailEl).parents('.AD').find('.aoD input[name="subjectbox"]');

        $(titleMailEl).val(title)
        $(bodyMailEl).html(body.replaceAll('\n', '</br>'));
        $(bodyMailEl).focus();
      } else {
        self.setTitleContentMailCompose(params);
      }
    },

    /**
     * Set title content mail compose first
     * 
     * @param {string} idTarget 
     */
    setTitleContentMailCompose: function (params) {
      const { title, body } = params;

      let bodyConvert = body.replaceAll('\n', '</br>');

      // For popup full screen box reply/compose
      if ($('.aSs .aSt .nH').length > 0) {
        $('.aSs .aSt .nH .aoD input[name="subjectbox"]').val(title);
        $('.aSs .aSt .nH .Am.Al.editable.LW-avf').html(bodyConvert);
        $('.aSs .aSt .nH .Am.Al.editable.LW-avf').focus();
      }
      // For pop out box reply/compose
      else if ($('.dw .nH.nn .AD').length > 0) {
        $('.dw .nH.nn .AD .aoD input[name="subjectbox"]').val(title);
        $('.dw .nH.nn .AD .Am.Al.editable.LW-avf').html(bodyConvert);
        $('.dw .nH.nn .AD .Am.Al.editable.LW-avf').focus();
      }
      // For box reply
      else if ($('.aoP.HM .iN .cf.An').length > 0) {
        $('.aoP.HM .iN .cf.An .aoD input[name="subjectbox"]').val(title);
        $('.aoP.HM .iN .cf.An .Am.Al.editable.LW-avf').html(bodyConvert);
        $('.aoP.HM .iN .cf.An .Am.Al.editable.LW-avf').focus();
      } else {
        $('.aoD input[name="subjectbox"]').val(title);
        $('.Am.Al.editable.LW-avf').html(bodyConvert);
        $('.Am.Al.editable.LW-avf').focus();
      }
    },

    /**
     * Set id target mail reply
     * 
     * @param {string} idTarget 
     */
    setIDTargetMailReply: function (idTarget) {
      let self = _MailAIGenerate;

      if (self.trackingBoxReplyInterval != null) return;

      if (!self.isHasElToSetIDTargetMailReply()) {
        setTimeout(() => {
          self.setIDTargetMailReply(idTarget);
        }, 500);
        return;
      }

      let isAdded = false;

      // This handle for popup out reply
      let listAllBoxCompose = $('.nH.nn .AD .nH .aaZ .M9 .aoP.aoC')
      for (let i = 0; i < listAllBoxCompose.length; i++) {
        const item = listAllBoxCompose[i];

        let isCompose = ($(item).parents('.AD').find('.aoP .I5 .bAs table[role="presentation"]').length == 0)
        if (!isCompose) {

          $(item).find('.Am.Al.editable.LW-avf').addClass(`sateraito-${idTarget}`);

          isAdded = true;
        }
      }

      // This handle for popup normal reply
      if (!isAdded) {
        $('.Am.Al.editable.LW-avf').addClass(`sateraito-${idTarget}`);
      }

      // Tracking to show popup event
      self.trackingBoxReplyInterval = setInterval(() => {
        let boxReply = document.body.querySelector('.LW-avf.tS-tW');
        if (!boxReply) {
          setTimeout(() => {
            if (self.isReplyBoxClose()) {
              // Process close side panel
              setClearSidePanel(idTarget);

              clearInterval(self.trackingBoxReplyInterval)
              self.trackingBoxReplyInterval = null;
            } else {
              self.setIDTargetMailReply(idTarget);
            }
          }, 50);
        }
      }, 100);
    },

    /**
     * Check is has element to set id target mail reply
     * 
     * @param {string} idTarget 
     */
    isHasElToSetIDTargetMailReply: function (idTarget) {

      // This handle for popup out reply
      let listAllBoxCompose = $('.nH.nn .AD .nH .aaZ .M9 .aoP.aoC')
      if (listAllBoxCompose.length > 0) {
        for (let i = 0; i < listAllBoxCompose.length; i++) {
          const item = listAllBoxCompose[i];

          let isCompose = ($(item).parents('.AD').find('.aoP .I5 .bAs table[role="presentation"]').length == 0)
          if (!isCompose) {
            return true;
          }
        }
      }

      // This handle for popup normal reply
      return $('.Am.Al.editable.LW-avf').length > 0;
    },

    /**
     * Set id target mail compose
     * 
     * @param {string} idTarget 
     */
    setIDTargetMailCompose: function (idTarget) {
      let self = _MailAIGenerate;

      if (self.trackingBoxComposeInterval != null) return;

      if (!self.isHasElToSetIDTargetMailCompose()) {
        setTimeout(() => {
          self.setIDTargetMailCompose(idTarget);
        }, 500);
        return;
      }

      // This handle for popup out compose
      let listAllBoxCompose = $('.nH.nn .AD .nH .aaZ .M9 .aoP.aoC')
      for (let i = 0; i < listAllBoxCompose.length; i++) {
        const item = listAllBoxCompose[i];

        let isCompose = ($(item).parents('.AD').find('.aoP .I5 .bAs table[role="presentation"]').length == 0)
        if (isCompose) {
          // Set title
          let findEl = $(item).find('.iN .Am.Al.editable.LW-avf');
          $(findEl).addClass(`sateraito-${idTarget}`);
        }
      }

      // Tracking to show popup event
      self.trackingBoxComposeInterval = setInterval(() => {
        let boxReply = document.body.querySelector('.LW-avf.tS-tW');
        if (!boxReply) {
          setTimeout(() => {
            if (self.isReplyBoxClose()) {
              // Process close side panel
              setClearSidePanel(idTarget);

              clearInterval(self.trackingBoxComposeInterval)
              self.trackingBoxComposeInterval = null;
            } else {
              self.setIDTargetMailCompose(idTarget);
            }
          }, 50);
        }
      }, 100);
    },

    /**
     * Check is has element to set id target mail compose
     * 
     * @param {string} idTarget 
     */
    isHasElToSetIDTargetMailCompose: function (idTarget) {

      // This handle for popup out compose
      let listAllBoxCompose = $('.nH.nn .AD .nH .aaZ .M9 .aoP.aoC')
      for (let i = 0; i < listAllBoxCompose.length; i++) {
        const item = listAllBoxCompose[i];

        let isCompose = ($(item).parents('.AD').find('.aoP .I5 .bAs table[role="presentation"]').length == 0)
        if (isCompose) {
          return true;
        }
      }

      return false;
    },

    /**
     * Check is popup reply is closed
     * 
     * @returns {boolean}
     */
    isReplyBoxClose: () => {
      let listAllBoxCompose = $('.nH.nn .AD .nH .aaZ .M9 .aoP.aoC')
      if (listAllBoxCompose.length > 0) {
        // This handle for popup out reply
        for (let i = 0; i < listAllBoxCompose.length; i++) {
          const item = listAllBoxCompose[i];
          let isReplyBoxClose = ($(item).parents('.AD').find('.aoP .I5 .bAs table[role="presentation"]').length == 0)
          if (!isReplyBoxClose) {
            return false
          }
        }
      }

      return $('.Am.Al.editable.LW-avf').length == 0;
    },

    // Getter

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
        elmBtn.className = BTN_BOX_AI_REPLY_CLS + ' wG J-Z-I'

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

    /**
     * Process add button A.I reply to bottom bar and menu for all box compose mail
     * 
     */
    processAddAIReplyBtnForListBoxCompose: function () {
      let self = _MailAIGenerate;

      // process for add button to bottom bar
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

        elmBtn.className = BTN_BOX_AI_REPLY_CLS + ' wG J-Z-I'

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

      // process for add button to menu bar
      let lisMenuReplyEl = FoDoc.querySelectorAll('.J-M.Gj.jQjAxd .SK.AX');
      for (let i = 0; i < lisMenuReplyEl.length; i++) {
        let itemBBarEl = lisMenuReplyEl[i];

        if (itemBBarEl.querySelector('.bbar-sateraito-ai-reply')) continue;

        let elmBtn = document.createElement('div');
        elmBtn.addEventListener('click', self.handlerReplyBoxBtnClick);

        let is_really_reply = ($(itemBBarEl).parents('.M9').find('.aoP .I5 .bAs table[role="presentation"]').length > 0)
        elmBtn.setAttribute('role_btn', is_really_reply ? 'reply' : 'compose');

        elmBtn.className = BTN_BOX_AI_REPLY_CLS + ' J-N'

        let vHtml = `
            <div class="J-N-Jz">
              <img class="nF-aMA-ato-Kp-JX J-N-JX" src="${FAVICON_URL}">
              ${MyLang.getMsg('TXT_AI_REPLY')}
            </div>
          `;
        elmBtn.innerHTML = vHtml;

        itemBBarEl.append(elmBtn);
      }
    },

    /**
     * Process request to show popup
     * 
     * @param {string} titleMail 
     * @param {string} contentMail 
     */
    processRequestToShowPopup: function (titleMail, contentMail) {
      let self = _MailAIGenerate;
      const idPopup = getNewIdPopup();

      let emailInPage = getCurrentUser();
      _StorageManager.setSecondEmail(emailInPage);

      let btnReplyMailEl = FoDoc.body.querySelector('.ams.bkH');
      if (btnReplyMailEl) {
        btnReplyMailEl.click();
      }

      self.setIDTargetMailReply(idPopup);

      // _StorageManager.setIdPopupActive(idPopup);
      _StorageManager.setTitleContentMailToWrite(idPopup, titleMail, contentMail);
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

    /**
     * Handler reply button click
     * 
     * @param {Event} event 
     */
    handlerReplyBtnClick: function (event) {
      const self = _MailAIGenerate;

      let titleMail = _MailAIGenerate.getTitleMail();
      let contentMail = _MailAIGenerate.getContentBodyMail();
      self.processRequestToShowPopup(titleMail, contentMail);

      // open side panel when action for compose
      setOpenSidePanel();
    },

    /**
     * Handler reply box button click
     * 
     * @param {Event} event 
     */
    handlerReplyBoxBtnClick: function (event) {
      const self = _MailAIGenerate;
      const btnEl = event.target;

      if (btnEl.getAttribute('role_btn') == 'reply') {
        let titleMail = _MailAIGenerate.getTitleMail();
        let contentMail = _MailAIGenerate.getContentBodyMail();
        self.processRequestToShowPopup(titleMail, contentMail);

      } else {
        const idPopup = getNewIdPopup();

        let emailInPage = getCurrentUser();
        _StorageManager.setSecondEmail(emailInPage);

        self.setIDTargetMailCompose(idPopup);

        // _StorageManager.setIdPopupActive(idPopup);
        _StorageManager.setTitleContentMailToWrite(idPopup, '', '');
      }

      // open side panel when action for compose
      setOpenSidePanel();
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

        chrome.storage.onChanged.addListener(storageOnChanged);
      }
    }

    debugLog('▲▲▲ initilize ended ! ');
  }

  // __main__
  initialize();
}());