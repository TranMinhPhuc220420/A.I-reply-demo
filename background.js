

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

  let TAB_ID_ACTIVE;


  function onRequest(request, sender, sendResponse) {
    switch (request.method) {
      case 'open_side_panel':
        chrome.sidePanel.open({ windowId: sender.tab.windowId });
        return true;
      case 'side_panel_send_result':
        chrome.tabs.sendMessage(TAB_ID_ACTIVE, { action: "side_panel_add_result", payload: request.payload });
        return true;

      default:
        return true;
    }
  }

  function initializeApp() {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error));

    chrome.tabs.onActivated.addListener((event) => {
      TAB_ID_ACTIVE = event.tabId;
    })
    chrome.tabs.onUpdated.addListener((tabId) => {
      TAB_ID_ACTIVE = tabId;
    })
  }

  chrome.runtime.onMessage.addListener(onRequest);
  chrome.runtime.onInstalled.addListener(initializeApp)
}());