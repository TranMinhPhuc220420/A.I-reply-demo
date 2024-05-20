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

  const getCurrentUser = () => {
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
  };

  /**
   *
   * @return {boolean} 拡張機能がインストール済みかを返す
   */
  const isExtensionInstalled = () => {
    let domNode;

    if (!document.getElementById(NODE_ID_EXTENSION_INSTALLED)) {
      domNode = document.createElement('div');
      domNode.id = NODE_ID_EXTENSION_INSTALLED;
      document.body.appendChild(domNode);
    } else {
      MyUtils.debugLog('Already, Extension is installed!');
      return true;
    }
    return false;
  };

  const PromptBuilder = {
    shared_prompt_builders: [],
    prompt_labels: [],
    groupPrompts: [],
    formBuilder: null,
    modal_id: "ai_user_builder_popup_modal",

    _init: () => {
      const self = PromptBuilder;

      self.renderHTMLAddOn();

      self.setEvent();
    },

    findPromptLabelDetail: (label_name) => {
      const self = PromptBuilder;

      let labelDetail = {
        bg_color: GROUP_PROMPT_LABEL_BG_COLOR,
        text_color: GROUP_PROMPT_LABEL_TEXT_COLOR,
      };
      let results = self.prompt_labels.filter(function (item) {
        return item.label_name === label_name;
      });
      if (results.length) {
        labelDetail = results[0];
      }
      return labelDetail;
    },

    // Setter

    toggleSide: (isClose) => {
      const self = PromptBuilder;

      if ($('#stateraito_addon_suggestion').hasClass("show") || isClose) {
        $('#stateraito_addon_suggestion').addClass('hidden');
        $('#stateraito_addon_suggestion').removeClass('show');
      } else {
        $('#stateraito_addon_suggestion').addClass('show');
        $('#stateraito_addon_suggestion').removeClass('hidden');
      }
    },

    showHidePopup: (state) => {
      const self = PromptBuilder;

      if (state) {
        $(`#${self.modal_id}`).show()
      } else {
        $(`#${self.modal_id}`).hide()
      }
    },

    mergePromptGroup: (callback) => {
      const self = PromptBuilder;

      let newGroupPrompts = [];
      self.prompt_labels.forEach(function (prompt_label) {
        let prompts = self.shared_prompt_builders.filter((prompt_builder) => {
          return prompt_builder.label_id == prompt_label.label_name;
        });

        let labelDetail = self.findPromptLabelDetail(prompt_label.label_name);
        newGroupPrompts.push({
          name: prompt_label.label_name,
          bg_color: labelDetail.bg_color,
          text_color: labelDetail.text_color,
          prompts: [...prompts],
        });
      });

      newGroupPrompts.push({
        name: "ラベルの指定なし",
        bg_color: GROUP_PROMPT_LABEL_BG_COLOR,
        text_color: GROUP_PROMPT_LABEL_TEXT_COLOR,
        prompts: self.shared_prompt_builders.filter((prompt_builder) => {
          return !prompt_builder.label_id;
        }),
      });

      self.groupPrompts = newGroupPrompts
      callback()
    },

    setEvent: () => {
      self = PromptBuilder;

      $(document).on('click', `#stateraito_addon_suggestion .close-suggestion`, function (event) {
        self.toggleSide(true);
      });
    },

    // Loader

    renderHTMLAddOn: () => {
      const self = PromptBuilder;

      self.createModalHtml()

      let chevron_icon = '<svg viewBox="0 0 24 24" ><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>';

      let elmSuggestion = FoDoc.createElement('div');
      elmSuggestion.setAttribute("id", 'stateraito_addon_suggestion');
      elmSuggestion.setAttribute("class", "content-suggestion sate-addon hidden");

      let pencil_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14.1,9L15,9.9L5.9,19H5V18.1L14.1,9M17.7,3C17.5,3 17.2,3.1 17,3.3L15.2,5.1L18.9,8.9L20.7,7C21.1,6.6 21.1,6 20.7,5.6L18.4,3.3C18.2,3.1 17.9,3 17.7,3M14.1,6.2L3,17.2V21H6.8L17.8,9.9L14.1,6.2M7,2V5H10V7H7V10H5V7H2V5H5V2H7Z"/></svg>';
      let yourtab_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6M12,13C14.67,13 20,14.33 20,17V20H4V17C4,14.33 9.33,13 12,13M12,14.9C9.03,14.9 5.9,16.36 5.9,17V18.1H18.1V17C18.1,16.36 14.97,14.9 12,14.9Z"/></svg>';
      let sharetab_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13.07 10.41A5 5 0 0 0 13.07 4.59A3.39 3.39 0 0 1 15 4A3.5 3.5 0 0 1 15 11A3.39 3.39 0 0 1 13.07 10.41M5.5 7.5A3.5 3.5 0 1 1 9 11A3.5 3.5 0 0 1 5.5 7.5M7.5 7.5A1.5 1.5 0 1 0 9 6A1.5 1.5 0 0 0 7.5 7.5M16 17V19H2V17S2 13 9 13 16 17 16 17M14 17C13.86 16.22 12.67 15 9 15S4.07 16.31 4 17M15.95 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13Z"/></svg>';
      let buildertab_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.5 2H5.5C3.6 2 2 3.6 2 5.5V18.5C2 20.4 3.6 22 5.5 22H16L22 16V5.5C22 3.6 20.4 2 18.5 2M20.1 15H18.6C16.7 15 15.1 16.6 15.1 18.5V20H5.8C4.8 20 4 19.2 4 18.2V5.8C4 4.8 4.8 4 5.8 4H18.3C19.3 4 20.1 4.8 20.1 5.8V15M7 7H17V9H7V7M7 11H17V13H7V11M7 15H13V17H7V15Z"/></svg>';
      let header_suggest_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z"/></svg>';

      let vhtml = '<div class="header-suggestion">'
      vhtml += '<span class="header-text-suggestion"><i class="item-icon ">' + header_suggest_icon + '</i>プロンプト一覧</span>'
      vhtml += '<div class="close-suggestion">'
      vhtml += '<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      vhtml += '</div>'
      vhtml += '</div>'
      vhtml += '<div class="detail-suggestion">'

      vhtml += '<div class="container-tab">'

      vhtml += '<div class="content-tab" >'
      vhtml += '  <a class="show"><i class="item-icon ">' + buildertab_icon + '</i>ビルダーで利用</a>'
      vhtml += '  <section>'
      vhtml += '      <ul id="shared_prompt_builders_list" ></ul>'
      vhtml += '  </section>'
      vhtml += '</div>'

      vhtml += '</div>'

      vhtml += '</div>'
      elmSuggestion.innerHTML = vhtml;
      document.body.appendChild(elmSuggestion)

      self.loadPromptSuggest();
    },

    renderHTMLPrompt: () => {
      const self = PromptBuilder;

      let chevron_icon = '<svg viewBox="0 0 24 24" ><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path></svg>';
      let texts_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path  fill="currentColor"d="M16,15H9V13H16M19,11H9V9H19M19,7H9V5H19M21,1H7C5.89,1 5,1.89 5,3V17C5,18.11 5.9,19 7,19H21C22.11,19 23,18.11 23,17V3C23,1.89 22.1,1 21,1M3,5V21H19V23H3A2,2 0 0,1 1,21V5H3Z"/></svg>';
      let text_icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path  fill="currentColor" d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/></svg>';

      let vHTML = ''
      self.groupPrompts.map((groupPrompt, group_prompt_index) => {
        let color = '#8d5bef' || groupPrompt.bg_color;
        let text_color = '#fff' || groupPrompt.text_color;
        let style_group = `style="background-color: ${color};color: ${text_color};"`
        vHTML += `
          <div class="accordion-item" align="center">
              <h2 class="promt-lbl-header accordion-header" ${style_group}>
                  <button type="button" aria-expanded="true" class="accordion-button">
                      <i class="item-icon " style=" color: ${text_color}!important;">${texts_icon}</i>
                      ${groupPrompt.name}
                      <i class=" item-icon  chevron_icon " style=" color: ${text_color}!important;">${chevron_icon}</i>
                  </button>
              </h2>`

        // detail
        groupPrompt.prompts.map(
          (suggestion, index) => {
            vHTML += `
                      <div class="accordion-collapse  show">
                          <div class="accordion-body">
                              <div class="list-group">
                                  <div class="list-group-item item-detail-builder" data-group="${group_prompt_index}"  data-index="${index}" data-key="${suggestion.prompt_builder_id}">
                                      <i class="item-icon ">${text_icon}</i>
                                      <div class="block-title">${suggestion.title}</div>
                                  </div>
                              </div>
                          </div>
                      </div>`
          })

        vHTML += '</div>'
      })

      self.detectPromptBuilder(vHTML)
    },

    createModalHtml: () => {
      const self = PromptBuilder;

      if ($(document).find('#' + self.modal_id).length) {
        return;
      }
      var ico_close = '<svg viewBox="0 0 24 24" ><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></svg>';

      let vHtml = '';
      // <!-- The Modal -->
      vHtml += '<div id="' + self.modal_id + '" class="sateraito_ai_modal st-ui modal-large sateraito_ai_builder">';

      // <!-- Modal content -->
      vHtml += '  <div class="modal-content">';
      vHtml += '		<div class="modal-header">';
      vHtml += '  	  <i class="mdi mdi-sticker-text-outline ico"></i>';
      vHtml += '  	  <h2>プロンプトビルダーで利用して質問を作成する</h2>';
      vHtml += '  	  <i class="item-icon close-modal">' + ico_close + '</i>';
      vHtml += '  	</div>';

      // START modal-body
      vHtml += '  	<div class="modal-body">';
      vHtml += '    <div class="block-wrap">'

      // START template_builder
      vHtml += '    <div class="content-item template_builder" data-content_type="template_builder">';
      vHtml += '    </div>'
      // END template_builder

      vHtml += '  	</div>';
      vHtml += '  	</div>';
      // END modal-body

      vHtml += '  	<div class="modal-footer">';
      vHtml += '  	  <button type="button" class="btn-cancel st-btn-material-outline">戻る</button>';

      // switch auto send
      vHtml += '<div class="custom-switch auto-summary form-check">';
      vHtml += '  <input type="checkbox" class="form-check-input" name="direct_send">';
      vHtml += '  <label title="" class="form-check-label">ChatGPTへの問い合わせまで自動実行する</label>';
      vHtml += "</div>";
      // end switch auto send

      vHtml += '  	  <button type="button" class="btn-submit st-btn-material" >上の質問内容を採用する</button>';
      vHtml += '  	</div>';
      vHtml += '  </div>';
      vHtml += '</div>';
      $(document.body).append(vHtml);

      $(`#${self.modal_id} .close-modal`).click(function () {
        self.showHidePopup(false)
      })

      $(`#${self.modal_id} .btn-cancel`).click(function () {
        self.showHidePopup(false)
      })

      $(`#${self.modal_id} .btn-submit`).click(function () {
        self.handlerOnSubmitForm()
      })
    },

    detectPromptBuilder: (vhtml) => {
      const self = PromptBuilder;

      let elmTmp = document.getElementById("shared_prompt_builders_list");
      if (elmTmp) {
        elmTmp.innerHTML = vhtml
        //add event
        var items = document.querySelectorAll('div.item-detail-builder');
        if (items) {
          for (let i = 0; i < items.length; i++) {
            items[i].addEventListener('click', self.onclickItemPromptBuilder);
          }
        }

        $('.accordion-header').click(function () {
          // $('.content-tab a').removeClass('show');
          $(this).toggleClass('show');
        })
        return;
      }

      setTimeout(function () {
        self.detectPromptBuilder(vhtml)
      }, 300)
    },

    renderPromptList: (data) => {
      const self = PromptBuilder;

      if (data.prompt_labels) {
        self.prompt_labels = data.prompt_labels
      }
      if (data.shared_prompt_builders) {
        self.shared_prompt_builders = data.shared_prompt_builders
      }

      self.mergePromptGroup(function () {
        self.renderHTMLPrompt()
      })
    },

    loadPromptSuggest: () => {
      const self = PromptBuilder;

      SateraitoRequest.getPrompts({}, data => {
        self.renderPromptList(data)
      });
    },

    //

    onclickItemPromptBuilder: (e) => {
      const self = PromptBuilder;
      const targetEl = event.target;

      let group_index = parseInt(targetEl.getAttribute('data-group'));
      let prompt_index = parseInt(targetEl.getAttribute('data-index'));
      let prompt_id = targetEl.getAttribute('data-key');

      if (self.groupPrompts.length > 0 && group_index < self.groupPrompts.length) {
        let group_prompt = self.groupPrompts[group_index]
        if (group_prompt.prompts.length > 0 && prompt_index < group_prompt.prompts.length) {
          let prompt = group_prompt.prompts[prompt_index]
          let template_builder_div = document.querySelector('.content-item[data-content_type="template_builder"]');
          if (template_builder_div) {
            self.formBuilder = new sateraitoAI.BuilderTemplate.initFormBuilder(template_builder_div, {
              template_name: prompt.title,
              template_body: prompt.content
            });

            //direct_send
            $(`#${self.modal_id} :input[name="direct_send"]`).prop("checked", prompt.direct_send);

            self.showHidePopup(true)
          }
        }
      }
    },

    handlerOnSubmitForm: (event) => {
      const self = PromptBuilder;

      var templateBody = self.formBuilder.getPrompt();
      MyUtils.debugLog(templateBody)

      let is_direct_send = $(`#${self.modal_id} :input[name="direct_send"]`).is(":checked");

      StorageManager.setGeneralContentReplySidePanel(templateBody, is_direct_send);

      self.showHidePopup(false)
      //close-suggestion
      $('#stateraito_addon_suggestion').addClass('hidden');
      $('#stateraito_addon_suggestion').removeClass('show');
    }
  }

  /**
   * Mail Add-on
   * 
   */
  const MailAIGenerate = {
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
      let self = MailAIGenerate;
      if (self.detectInterval_100 != null) {
        clearInterval(self.detectInterval_100);
      }
      self.detectInterval_100 = setInterval(self.handleDetect);

      function gText(e) {
        let sessionEl = (document.all) ? document.selection.createRange().text : document.getSelection();
        StorageManager.setOriginalTextSidePanel(sessionEl.toString());
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
      let self = MailAIGenerate;
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
      let self = MailAIGenerate;

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
              MyUtils.setClearSidePanel(idTarget);

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
      let self = MailAIGenerate;

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
              MyUtils.setClearSidePanel(idTarget);

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
      let self = MailAIGenerate;
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
      let self = MailAIGenerate;
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
      let self = MailAIGenerate;
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
      let self = MailAIGenerate;

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
      let self = MailAIGenerate;
      const idPopup = MyUtils.getNewIdPopup();

      let emailInPage = getCurrentUser();
      StorageManager.setSecondEmail(emailInPage);

      let btnReplyMailEl = FoDoc.body.querySelector('.ams.bkH');
      if (btnReplyMailEl) {
        btnReplyMailEl.click();
      }

      self.setIDTargetMailReply(idPopup);

      // StorageManager.setIdPopupActive(idPopup);
      StorageManager.setTitleContentMailToWrite(idPopup, titleMail, contentMail);
    },

    // Handler func

    /**
     * Handler detect add-on when running in mail
     *  
     */
    handleDetect: function () {
      let self = MailAIGenerate;

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
      const self = MailAIGenerate;

      let titleMail = MailAIGenerate.getTitleMail();
      let contentMail = MailAIGenerate.getContentBodyMail();
      self.processRequestToShowPopup(titleMail, contentMail);

      // open side panel when action for compose
      MyUtils.setOpenSidePanel();
    },

    /**
     * Handler reply box button click
     * 
     * @param {Event} event 
     */
    handlerReplyBoxBtnClick: function (event) {
      const self = MailAIGenerate;
      const btnEl = event.target;

      if (btnEl.getAttribute('role_btn') == 'reply') {
        let titleMail = MailAIGenerate.getTitleMail();
        let contentMail = MailAIGenerate.getContentBodyMail();
        self.processRequestToShowPopup(titleMail, contentMail);

      } else {
        const idPopup = MyUtils.getNewIdPopup();

        let emailInPage = getCurrentUser();
        StorageManager.setSecondEmail(emailInPage);

        self.setIDTargetMailCompose(idPopup);

        // StorageManager.setIdPopupActive(idPopup);
        StorageManager.setTitleContentMailToWrite(idPopup, '', '');
      }

      // open side panel when action for compose
      MyUtils.setOpenSidePanel();
    },
  };

  /**
   * Handler when storage has value change
   * 
   * @param {Event} event 
   */
  const storageOnChanged = (payload, type) => {
    // on has result send from side panel to add to reply or compose box
    if ('side_panel_send_result' in payload) {
      const newValue = payload.side_panel_send_result.newValue;
      if (newValue.title && newValue.body) {
        MailAIGenerate.setTitleContentMail(newValue);
      }
      setTimeout(() => {
        chrome.storage.local.set({ side_panel_send_result: {} });
      }, 1000);
    }
    if ('toggle_side_prompt_builder' in payload) {
      const newValue = payload.toggle_side_prompt_builder.newValue;

      if (newValue) {
        PromptBuilder.toggleSide();
      }

      setTimeout(() => {
        StorageManager.removeToggleSidePromptBuilder();
      }, 1000);
    }
  };

  /**
   * Initialize add on
   * 
   */
  function initialize() {
    MyUtils.debugLog('▼▼▼ initialize started ! ');

    let strUrl = document.URL;
    if ((window === window.top) && (isExtensionInstalled() === false)) {
      FoDoc = document;

      FBoolMail = (strUrl.indexOf('//mail.google.com/') >= 0);
      if (FBoolMail) {
        chrome.runtime.sendMessage({ method: 'get_user_info' }, (userInfo) => {
          ID_USER_ADDON_LOGIN = userInfo.id;
          USER_ADDON_LOGIN = userInfo.email;

          //addon setting
          SateraitoRequest.loadAddOnSetting(userInfo.email, function () {

            if (MyUtils.checkUseExtension()) {
              MailAIGenerate._init();

              PromptBuilder._init();

              MyUtils.loadSkin();
            }

            MyUtils.debugLog(`auto summary chat GPT: domain regist:[${AddOnEmailSetting.is_domain_registered}], permission deny:[${AddOnEmailSetting.is_not_access_list}]`);
          });
        });

        chrome.storage.onChanged.addListener(storageOnChanged);
      }
    }

    MyUtils.debugLog('▲▲▲ initilize ended ! ');
  }

  // __main__
  initialize();
}());