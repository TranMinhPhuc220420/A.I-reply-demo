

/*global window, chrome */
/*jslint white: true */
/*jslint indent: 2 */
/*jslint browser: true */
/*jslint plusplus: true */
//console.log('===========LOAD BACKGROUND==============')
let StorageArea = chrome.storage.local;

/** @define {boolean} */
let DEBUG_MODE = true;

(function () {
  'use strict';

  const language_mail_test = 'Vietnamese'
  const key_points_test = [
    'Request for progress update on assigned tasks',
    'Acknowledgement of contributions and importance of professional approach',
    'Offer of support and additional resources if needed',
  ];
  const title_test = [
    `The standard Lorem Ipsum passage, used since the 1500s`,
    `Why do we use it?`,
    `What is Lorem Ipsum?`,
    `Where does it come from?`,
    `Where can I get some?`
  ]
  const summary_test = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.`
  const content_reply_test = [
    `Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
    when an unknown printer took a galley of type and scrambled it to make
    a type specimen book.`,
    `Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
    Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. 
    Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..",
    comes from a line in section 1.10.32.
    `
  ]
  const recommend_test = [
    'Contrary to popular belief, Lorem Ipsum',
    'There are many variations of passages of Lorem Ipsum available',
    'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'
  ]

  function debugLog(strMsg) {
    if (DEBUG_MODE === true) {
      console.log(chrome.i18n.getMessage('@@extension_id') + ':' + strMsg);
    }
  }

  function randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const GptRequest = {
    summaryContent: function (content, callback) {
      callback(summary_test);
    },

    getLanguageContent: function (content, callback) {
      callback(language_mail_test);
    },

    getKeyPoints: function (content, callback) {
      callback(key_points_test);
    },

    recommendReplyContent: function (content, callback) {
      callback(recommend_test);
    },

    generateContentReplyMail: function (content, callback) {
      const data = {
        title: title_test[randomIntFromInterval(0, title_test.length - 1)],
        body: content_reply_test[randomIntFromInterval(0, content_reply_test.length - 1)]
      }
      callback(data);
    },
  }

  function onRequest(request, sender, sendResponse) {
    switch (request.method) {
      case 'summary_content_mail':
        GptRequest.summaryContent(request.data, function (summary) {
          sendResponse(summary);
        })
        break;

      case 'get_language_content_mail':
        GptRequest.getLanguageContent(request.data, function (summary) {
          sendResponse(summary);
        })
        break;
      
      case 'get_key_points_content_mail':
        GptRequest.getKeyPoints(request.data, function (summary) {
          sendResponse(summary);
        })
        break;

      case 'suggestion_list_reply_content_mail':
        GptRequest.recommendReplyContent(request.data, function (recommendList) {
          sendResponse(recommendList);
        })
        break;

      case 'generate_content_reply_mail':
        GptRequest.generateContentReplyMail(request.data, function (recommendList) {
          sendResponse(recommendList);
        })
        break;
    }
  }

  function initializeApp() {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error));
  }

  chrome.runtime.onMessage.addListener(onRequest);
  chrome.runtime.onInstalled.addListener(initializeApp)
}());