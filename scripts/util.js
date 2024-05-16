var timeout_fetch = 60000
// var chat_gpt_model = "gpt-3.5-turbo"
var chat_gpt_model = "gpt-3.5-turbo-0125"
var chuck_size_text = 4000
var retry_call_gpt = true
// var USER_ADDON_LOGIN = ''
var DOMAIN_ADDON_LOGIN = ''
var MAXIMIZE_TIME_AUTO = 1000 * 60 * 5 //milisecond 5p == 1000*60*5
var is_domain_regist_addon = false

/**
 * Check chat gpt access list
 * 
 * @param {*} accesslist_str 
 * @returns {boolean}
 */
function checkChatGptAccesslist(accesslist_str) {
  // console.log('============checkChatGptAccesslist==============')
  var is_allow = true, is_not_access_list = false

  if (USER_ADDON_LOGIN && accesslist_str) {
    is_allow = false
    var accesslist = accesslist_str.split(';')
    for (var i in accesslist) {
      var user_email = accesslist[i].trim()
      if (USER_ADDON_LOGIN == user_email) {
        is_allow = true;
        break;
      }
    }
  }

  if (!is_allow) is_not_access_list = true;
  // console.log(is_not_access_list)
  return is_not_access_list
}

/**
 * Load add on setingg
 * 
 * @param {string} email 
 * @param {Function} callback 
 */
function loadAddOnSetting(email, callback) {
  var result = {
    is_auto_sum: true,
    times: MAXIMIZE_TIME_AUTO,
    is_domain_regist: false,
    is_not_access_list: false
  }
  //check domain
  if (email) {
    USER_ADDON_LOGIN = email
    const suffix = email.match(/.+@(.+)/);
    if (suffix) {
      DOMAIN_ADDON_LOGIN = suffix.pop();
    }
  }
  // console.log(USER_ADDON)
  console.log(`domain login: ${DOMAIN_ADDON_LOGIN}`)
  if (USER_ADDON_LOGIN) {
    fetchChatGPTSetting(DOMAIN_ADDON_LOGIN, function (data) {
      // if ('is_summary_auto_flag' in data){
      //     result.is_auto_sum = data['is_summary_auto_flag']
      // }
      // if ('auto_time' in data){
      //     var auto_time = data['auto_time']
      //     result.times = auto_time*1000*60
      // }
      if ('is_domain_regist' in data) {
        result.is_domain_regist = data['is_domain_regist']
      }

      if ('chat_gpt_accesslist' in data) {
        result.is_not_access_list = checkChatGptAccesslist(data['chat_gpt_accesslist'])
      }

      //if not regist
      if (!result.is_domain_regist) {
        result.is_auto_sum = false
      }

      //save staus domain
      is_domain_regist_addon = result.is_domain_regist

      callback(result)
    });
  } else {
    //user unavariable
    result.is_auto_sum = false
    callback(result)
  }
}

/**
 * Get content by role in message
 * 
 * @param {string} role 
 * @param {Array} messages 
 * @returns {string}
 */
function getContentByRoleInMessage(role, messages) {
  let content_all = '';
  for (let i = 0; i < messages.length; i++) {
    const item = messages[i];

    if (item.role == role) {
      content_all += item.content + '\n\n';
    }
  }

  return content_all;
}

/**
 * Save log
 * 
 * @param {string} question 
 * @param {string} answer 
 * @param {string} type_chat 
 * @param {string} error 
 */
function saveLog(question, answer, type_chat, error = '') {
  //save log
  var data = {
    user_id: USER_ADDON_LOGIN,
    question: question,
    answer: answer,
    // answer_html: '',
    model: chat_gpt_model,
    error_info: error,
    memo: type_chat,
    environment_type: type_chat,
    // options: options,
  }
  // console.log(data)
  // console.log(DOMAIN_ADDON_LOGIN)
  if (DOMAIN_ADDON_LOGIN) {
    fetchChatGPTAddLog(DOMAIN_ADDON_LOGIN, data, function (res) {
      console.log(res)
    })
  }
}

/**
 * Save count request
 * 
 * @param {string} prompt 
 * @param {string} error 
 */
async function saveCountRequest(prompt, error = '') {
  // console.log('=======saveCountRequest=========')
  // console.log(is_domain_regist_addon)
  if (!is_domain_regist_addon) return
  //saveCountRequest
  var data = {
    user_id: USER_ADDON_LOGIN,
    prompt: prompt,
    model: chat_gpt_model,
    error_info: error,
    // environment_type: type_chat
  }
  // console.log(data)
  // console.log(DOMAIN_ADDON_LOGIN)
  if (DOMAIN_ADDON_LOGIN) {
    fetchChatGPTCountRequest(DOMAIN_ADDON_LOGIN, data, function (res) {
      console.log(res)
    })
  }
}

/**
 * Call GPT
 * 
 * @param {string} key_api 
 * @param {string|Array<string>} prompt_or_messages 
 * @param {string} gpt_model 
 * @param {boolean} return_fetch 
 * @param {string} role 
 * @param {object} response_format 
 * @returns 
 */
async function callGPT(key_api, prompt_or_messages = null, gpt_model = false, return_fetch = false, role = false, response_format = null) {
  let model = chat_gpt_model
  if (gpt_model) model = gpt_model

  let url = "https://api.openai.com/v1/chat/completions"

  // call chatGPT    
  var myHeaders = new Headers();
  try {
    myHeaders.append("Authorization", "Bearer " + key_api);
    myHeaders.append("Content-Type", "application/json");
  } catch (err) {
    console.log(err)
    return false
  }

  const payload = {
    model: model,
    // messages: ?,
    temperature: 1,
    // response_format: ?
  }

  if (typeof (prompt_or_messages) == 'string') {
    prompt_or_messages = [
      {
        "role": role ? role : "system",
        "content": prompt_or_messages
      }
    ]
  }
  payload.messages = prompt_or_messages;

  if (response_format) {
    payload.response_format = response_format;
  }

  const signal = AbortSignal.timeout(timeout_fetch)
  const options = {
    method: "post",
    headers: myHeaders,
    body: JSON.stringify(payload),
    signal: signal
  }

  if (return_fetch) return fetch(url, options);

  try {
    let response = await fetch(url, options);
    let posts = await response.json();
    if (!response.ok) {
      return false;
    }

    //count request charge
    saveCountRequest(prompt_or_messages[prompt_or_messages.length - 1].content)

    return posts;
  } catch (e) {
    if (retry_call_gpt) {
      try {
        options["signal"] = signal
        let response_try = await fetch(url, options);
        let posts = await response_try.json();
        if (!response_try.ok) {
          return false;
        }
        return posts;
      } catch (err) {
        return false;
      }
    } else return false;
  }
}

/**
 * Get suggest reply content mail request
 * 
 * @param {object} params 
 * @param {Function} callback 
 * @param {NUmber|null} retry 
 * @returns 
 */
async function getSuggestReplyMailRequest(params, callback, retry) {
  if (typeof retry == 'undefined') retry = 0;
  if (retry > 3) {
    callback({answer_suggest: []})
    return false;
  }

  const { gpt_ai_key, gpt_model, title_mail, content_mail, lang } = params;

  const messages = [
    { role: "system", content: `You are a helpful assistant designed to output JSON` },
    { role: 'user', content: `Language in ${lang}.` },
    { role: 'assistant', content: 'Ok' },
    {
      role: 'user', content: `"""
Title: ${title_mail}
Content: ${content_mail}
"""

Suggest three different ways to answer the above passage without using bullet points.
Json: {answer_suggest: [3 item<string>]}.
Output in ${lang}`
    },
  ];

  try {
    const response = await callGPT(gpt_ai_key, messages, gpt_model, false, null, { "type": "json_object" })
    const contentRes = response.choices[0].message.content;
    const dataJson = JSON.parse(contentRes);

    //Save log summary chat
    let question = getContentByRoleInMessage('user', messages);
    saveLog(question, contentRes, 'email');

    if (dataJson.answer_suggest && dataJson.answer_suggest.length) {
      callback(dataJson);

    } else {
      retry++;
      getSuggestReplyMailRequest(params, callback, retry);
    }

  } catch (error) {
    retry++;
    getSuggestReplyMailRequest(params, callback, retry);
  }
}

/**
 * Generate content request
 * 
 * @param {object} params 
 * @param {Function} callback 
 * @param {Number|null} retry 
 */
async function generateContentRequest(params, callback, retry) {
  if (typeof retry == 'undefined') retry = 0;
  if (retry > 3) {
    callback({ title: 'error', body: 'error' })
    return false;
  }

  const {
    gpt_ai_key, gpt_version, type_generate,

    topic_compose, formality,
    general_content_reply, original_text_reply, formality_reply,

    tone, email_length, your_role, your_language
  } = params;

  let prompt = '';
  if (type_generate == 'compose') {
    prompt = `Help me write a ${formality}, with a ${tone} tone and a ${email_length} length.\n\n The topic is:\n\"\"\"\n${topic_compose}\n\"\"\"`
  } else {
    prompt += `Help me write a ${formality_reply} to reply to the original text, with a ${tone} tone with and a ${email_length} length. Draw inspiration from the key points provided, but adapt them thoughtfully without merely repeating.\n\n-----\n\nOriginal text:\n\"\"\"\n${original_text_reply}\n\"\"\"\n\nThe key points of the reply:\n\"\"\"\n${general_content_reply}\n\"\"\"`
  }
  prompt += `\nJson: {title: "", body: ""}`
  prompt += `\nOutput in ${your_language}`

  const messages = [
    { role: "system", content: `You are a helpful assistant designed to output JSON.` },
    { role: 'user', content: `Language in ${your_language}.` },
    { role: 'assistant', content: 'Ok' },
  ];
  if (your_role.trim() != '') {
    messages.push({role: 'user', content: `I am the ${your_role}`})
    messages.push({ role: 'assistant', content: 'I remembered!' })
  }
  messages.push({ role: 'user', content: prompt })

  try {
    const response = await callGPT(gpt_ai_key, messages, gpt_version, false, null, { "type": "json_object" })
    const contentRes = response.choices[0].message.content;
    const dataJson = JSON.parse(contentRes);

    //Save log summary chat
    let question = getContentByRoleInMessage('user', messages);
    saveLog(question, contentRes, 'email');

    if (dataJson.title && dataJson.title != '' && dataJson.body && dataJson.body != '') {
      callback(dataJson);

    } else {
      retry++;
      generateContentRequest(params, callback, retry);
    }

  } catch (error) {
    retry++;
    generateContentRequest(params, callback, retry);
  }
}