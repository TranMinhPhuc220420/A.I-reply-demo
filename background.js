

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

  const GptRequest = {
    OPEN_AI_API_KEY: "",
    OPEN_AI_MODEL: "gpt-3.5-turbo",

    _executeRequest: async (messages) => {
      const self = GptRequest;
      
      const data = {
        model: self.OPEN_AI_MODEL,
        messages: messages,
        response_format: { "type": "json_object" },
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${self.OPEN_AI_API_KEY}`
        }
      });

      return await response.json();
    },

    getDataToShowPopup: async function (params, callback, retry) {
      const self = GptRequest;

      if (typeof retry == 'undefined') retry = 0;
      if (retry > 5) {
        callback({
          summary: '',
          reply_suggestions: [],
          language: '',
          key_points: [],
        })
        return false;
      }

      const { title_mail, content_mail, lang } = params;

      const messages = [
        { role: "system", content: `You are a helpful assistant designed to output JSON` },
        { role: 'user', content: `Language in ${lang}.\nFormat: {summarize: "", key_points: [3 items], language: "", answer_suggest: [3 items]}.` },
        { role: 'assistant', content: 'Ok' },
        { role: 'user', content: `
Title: ${title_mail}
Content: ${content_mail}

I want you to always answer in ${lang}.
Summarize the letter's content in a single paragraph, summarize the letter's content according to 3 main points, language of body mail, suggest 3 ways to answer`
        },
      ];

      try {
        const response = await self._executeRequest(messages)
        const result = JSON.parse(response.choices[0].message.content)

        callback(result);
      } catch (error) {
        retry++;
        GptRequest.getDataToShowPopup(params, callback, retry);
      }
    },

    generateContentReplyMail: async function (params, callback, retry) {
      const self = GptRequest;

      if (typeof retry == 'undefined') retry = 0;
      if (retry > 5) {
        callback({
          title: '',
          body: '',
        })
        return false;
      }

      const { title_mail, content_mail, voice_config, reply_suggested, lang } = params;
      let content_user = `
        Title: ${title_mail}
        Body: ${content_mail}
    
        I want you to always answer in ${lang}.
      `
      const messages = [
        { role: "system", content: "You are a helpful assistant designed to output JSON" },
        { role: 'user', content: `Language in ${lang}.\nFormat: {title: "", body: ""}` },
        { role: 'assistant', content: 'Ok' },
        { role: 'user', content: content_user },
        { role: 'assistant', content: 'Ok' },
        { role: 'user', content: `${voice_config.your_role ? `I'm the ${voice_config.your_role}` : '' }. Help me write a ${voice_config.email_length}, ${voice_config.tone}, ${voice_config.formality} in ${lang} email in response to the message. The content of the answer revolves around the story "${reply_suggested}"` },
      ];

      try {
        const response = await self._executeRequest(messages)
        const result = JSON.parse(response.choices[0].message.content)

        callback(result);
      } catch (error) {
        retry++;
        GptRequest.generateContentReplyMail(params, callback, retry);
      }
    },

    generateContentReply: async function (params, callback, retry) {
      if (typeof retry == 'undefined') retry = 0;
      if (retry > 5) {
        callback('empty')
        return false;
      }

      callback(`
Title: Why would you want to build URLs using the URL
Body: Why would you want to build URLs using the URL reversing function url_for() instead of hard-coding them into your templates?

Reversing is often more descriptive than hard-coding the URLs.

You can change your URLs in one go instead of needing to remember to manually change hard-coded URLs.

URL building handles escaping of special characters transparently.

The generated paths are always absolute, avoiding unexpected behavior of relative paths in browsers.

If your application is placed outside the URL root, for example, in /myapplication instead of /, url_for() properly handles that for you.
      `)
      return;

      const data = new URLSearchParams();
      for (const key in params) {
        if (Object.hasOwnProperty.call(params, key)) {
          data.append(key, params[key]);
        }
      }

      const response = await fetch('http://localhost:8083/generate-content-reply', {
        method: "POST",
        body: data,
      });

      try {
        const dataRes = await response.json();
        callback(dataRes);
      } catch (error) {
        retry++;
        GptRequest.generateContentReply(params, callback, retry);
      }
    },
  }

  function onRequest(request, sender, sendResponse) {
    switch (request.method) {
      case 'get_data_to_show_popup':
        GptRequest.getDataToShowPopup(request.data, function (summary) {
          sendResponse(summary);
        })
        return true;

      case 'generate_content_reply_mail':
        GptRequest.generateContentReplyMail(request.data, function (recommendList) {
          sendResponse(recommendList);
        })
        return true;

      case 'generate_content_reply':
        GptRequest.generateContentReply(request.data, function (recommendList) {
          sendResponse(recommendList);
        })
        return true;
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