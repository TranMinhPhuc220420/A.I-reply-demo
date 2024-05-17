

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

  let TAB_ID_ACTIVE, USER_ADDON_LOGIN, SECOND_USER_ADDON_LOGIN, ID_USER_ADDON_LOGIN;

  function updateSecondEmail() {
    chrome.storage.local.get('second_email', payload => {
      SECOND_USER_ADDON_LOGIN = payload.second_email;
    });
  }

  /**
   * On message has request
   * 
   * @param {object} request 
   * @param {object} sender 
   * @param {Function} sendResponse 
   * 
   * @returns 
   */
  async function onRequest(request, sender, sendResponse) {
    const { method, payload } = request;

    switch (method) {
      case 'open_side_panel':
        chrome.sidePanel.open({ windowId: sender.tab.windowId });

      case 'get_user_info':
        sendResponse({
          id: ID_USER_ADDON_LOGIN,
          email: USER_ADDON_LOGIN || SECOND_USER_ADDON_LOGIN
        })
    }

    return true;
  }

  function storageOnChanged(payload, type) {
    // on has result send from side panel to add to reply or compose box
    if ('second_email' in payload) {
      const newValue = payload.second_email.newValue;
      SECOND_USER_ADDON_LOGIN = newValue;
    }
  }

  /**
   * Initialize app
   * 
   */
  function initializeApp() {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error));
  }

  chrome.identity.getProfileUserInfo(function (userInfo) {
    USER_ADDON_LOGIN = userInfo.email;
    ID_USER_ADDON_LOGIN = userInfo.id;
  });

  chrome.tabs.onActivated.addListener((event) => {
    TAB_ID_ACTIVE = event.tabId;

    updateSecondEmail();
  })
  chrome.tabs.onUpdated.addListener((tabId) => {
    TAB_ID_ACTIVE = tabId;

    updateSecondEmail();
  })

  chrome.runtime.onMessage.addListener(onRequest);
  chrome.runtime.onInstalled.addListener(initializeApp)
  chrome.storage.onChanged.addListener(storageOnChanged);
}());