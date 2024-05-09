

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

  let TAB_ID_ACTIVE, USER_ADDON_LOGIN, ID_USER_ADDON_LOGIN;


  async function onRequest(request, sender, sendResponse) {

    switch (request.method) {
      case 'open_side_panel':
        chrome.sidePanel.open({ windowId: sender.tab.windowId });

      case 'get_user_info':
        sendResponse({
          id: ID_USER_ADDON_LOGIN,
          email: USER_ADDON_LOGIN
        })
    }

    return true;
  }

  function saveUserInfo() {
    chrome.identity.getProfileUserInfo(function (userInfo) {
      USER_ADDON_LOGIN = userInfo.email;
      ID_USER_ADDON_LOGIN = userInfo.id;
    });
  }

  function initializeApp() {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error));

    chrome.tabs.onActivated.addListener((event) => {
      TAB_ID_ACTIVE = event.tabId;
      saveUserInfo();
    })
    chrome.tabs.onUpdated.addListener((tabId) => {
      TAB_ID_ACTIVE = tabId;
      saveUserInfo();
    })
  }

  chrome.runtime.onMessage.addListener(onRequest);
  chrome.runtime.onInstalled.addListener(initializeApp)
}());