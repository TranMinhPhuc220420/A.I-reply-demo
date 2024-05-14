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
 * Get data to show popup in mail request
 * 
 * @param {object} params 
 * @param {Function} callback 
 * @param {NUmber|null} retry 
 * @returns 
 */
async function getDataToShowPopupInMailRequest(params, callback, retry) {
  if (typeof retry == 'undefined') retry = 0;
  if (retry > 3) {
    callback({
      summarize: '',
      answer_suggest: [],
      language: '',
      key_points: [],
    })
    return false;
  }

  let is_use_prompt = (retry % 2) == 1;

  const { gpt_ai_key, gpt_model, title_mail, content_mail, lang } = params;

  const messages = [
    { role: "system", content: `You are a helpful assistant designed to output JSON` },
    { role: 'user', content: `Language in ${lang}.\nFormat: {summarize: "", key_points: [3 items], language: "", answer_suggest: [3 items]}.` },
    { role: 'assistant', content: 'Ok' },
    {
      role: 'user', content: `
Title: ${title_mail}
Content: ${content_mail}

Summarize the letter's content in a single paragraph, summarize the letter's content according to 3 main points, language of body mail, suggest 3 ways to answer\nOutput in ${lang}`
    },
  ];

  const prompt = `Title: ${title_mail}
Body: ${content_mail}
json: {summarize: "", key_points: [], language: "", answer_suggest: []}
Summarize the letter's content in a single paragraph, summarize the letter's content according to 3 main points, language of body mail, suggest 3 ways to answer.
Output in ${lang}`

  try {
    const response = await callGPT(gpt_ai_key, (is_use_prompt ? prompt : messages), gpt_model, false, null, { "type": "json_object" })
    const contentRes = response.choices[0].message.content;

    callback(JSON.parse(contentRes));

    //Save log summary chat
    let question = prompt;
    if (!is_use_prompt) {
      question = getContentByRoleInMessage('user', messages);
    }
    saveLog(question, contentRes, 'email');

  } catch (error) {
    retry++;
    getDataToShowPopupInMailRequest(params, callback, retry);
  }
}

/**
 * Generate content reply mail request
 * 
 * @param {object} params 
 * @param {Function} callback 
 * @param {Number|null} retry 
 */
async function generateContentReplyMailRequest(params, callback, retry) {
  if (typeof retry == 'undefined') retry = 0;
  if (retry > 3) {
    callback({
      title: '',
      body: '',
    })
    return false;
  }

  let is_use_prompt = (retry % 2) == 1;

  const { gpt_ai_key, gpt_model, title_mail, content_mail, voice_config, reply_suggested } = params;

  let content_user = `
Title: ${title_mail}
Body: ${content_mail}`

  let promptForMess = `Write a ${voice_config.formality} `;
  if (voice_config.your_role.trim() != '') {
    promptForMess = `Write an ${voice_config.formality} as a ${voice_config.your_role} `
  }
  promptForMess += `to reply to the original text. Ensure your response has a ${voice_config.tone} tone with and a ${voice_config.email_length} length. The key points of the write is "${reply_suggested}"\nOutput in ${voice_config.your_lang}`
  const messages = [
    { role: "system", content: "You are a helpful assistant designed to output JSON" },
    { role: 'user', content: `Language in ${voice_config.your_lang}.\nFormat: {title: "", body: ""}` },
    { role: 'assistant', content: 'Ok' },
    { role: 'user', content: content_user },
    { role: 'assistant', content: 'Ok' },
    { role: 'user', content: promptForMess },
  ];

  let anOra = 'a', prompt = '', prompt_start = '';
  if (voice_config.your_role.trim() != '') {
    prompt_start = `as a ${voice_config.your_role}`
    anOra = 'an'
  }

  prompt_start = `Write ${anOra} ${voice_config.formality} ${prompt_start}`;
  prompt = `${prompt_start} to reply to the original text. Ensure your response has a ${voice_config.tone} tone with and a ${voice_config.email_length} length. Draw inspiration from the key points provided, but adapt them thoughtfully without merely repeating.\nRespond in the ${voice_config.your_lang} language.\n\n-----\n\nOriginal text:\n\"\"\"\n${content_user}\n\"\"\"\n\nThe key points of the reply:\n\"\"\"\n${reply_suggested}\n\"\"\"`
  prompt += `\n\njson:\n\"\"\"\n{title: "", body: ""}\n\"\"\"\n\nOutput in ${voice_config.your_lang}`

  try {
    const response = await callGPT(gpt_ai_key, (is_use_prompt ? prompt : messages), gpt_model, false, null, { "type": "json_object" })
    const contentRes = response.choices[0].message.content;

    callback(JSON.parse(contentRes));

    //Save log summary chat
    let question = prompt;
    if (!is_use_prompt) {
      question = getContentByRoleInMessage('user', messages);
    }
    saveLog(question, contentRes, 'email');

  } catch (error) {
    retry++;
    generateContentReplyMailRequest(params, callback, retry);
  }
}

/**
 * Summary content mail
 * 
 * @param {object} params 
 * @param {Function} callback 
 * @param {NUmber|null} retry 
 * @returns 
 */
async function summaryContentMailRequest(params, callback, retry) {
  if (typeof retry == 'undefined') retry = 0;
  if (retry > 3) {
    callback({
      summarize: '',
      answer_suggest: [],
      language: '',
      key_points: [],
    })
    return false;
  }

  // callback({
  //   summarize: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. `,
  //   answer_suggest: [
  //     'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  //     'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
  //     'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour',
  //   ],
  //   language: 'Tiếng Việt',
  //   key_points: [
  //     'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour',
  //     'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  //     'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
  //   ],
  // })
  // return;

  let is_use_prompt = (retry % 2) == 1;

  const { gpt_ai_key, gpt_model, title_mail, content_mail, lang } = params;

  const messages = [
    { role: "system", content: `You are a helpful assistant designed to output JSON` },
    { role: 'user', content: `Language in ${lang}.\nFormat: {summarize: "", key_points: [3 items], language: "", answer_suggest: [3 items]}.` },
    { role: 'assistant', content: 'Ok' },
    {
      role: 'user', content: `
Title: ${title_mail}
Content: ${content_mail}

Summarize the letter's content in a single paragraph, summarize the letter's content according to 3 main points, language of body mail, suggest 3 ways to answer\nOutput in ${lang}`
    },
  ];

  const prompt = `Title: ${title_mail}
Body: ${content_mail}
json: {summarize: "", key_points: [], language: "", answer_suggest: []}
Summarize the letter's content in a single paragraph, summarize the letter's content according to 3 main points, language of body mail, suggest 3 ways to answer.
Output in ${lang}`

  try {
    const response = await callGPT(gpt_ai_key, (is_use_prompt ? prompt : messages), gpt_model, false, null, { "type": "json_object" })
    const contentRes = response.choices[0].message.content;

    callback(JSON.parse(contentRes));

    //Save log summary chat
    let question = prompt;
    if (!is_use_prompt) {
      question = getContentByRoleInMessage('user', messages);
    }
    saveLog(question, contentRes, 'email');

  } catch (error) {
    retry++;
    getDataToShowPopupInMailRequest(params, callback, retry);
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
    callback('')
    return false;
  }

  const {
    gpt_ai_key, gpt_version, type_generate,

    topic_compose, formality,
    general_content_reply, original_text_reply, formality_reply,

    tone, email_length, your_role, your_language
  } = params;


  let anOra = 'a', prompt = '', prompt_start = '';

  if (your_role.trim() != '') {
    prompt_start = `as a ${your_role}`
    anOra = 'an'
  }

  if (type_generate == 'compose') {
    prompt_start = `Write ${anOra} ${formality} ${prompt_start}`;
    prompt += `${prompt_start}, with a ${tone} tone and a ${email_length} length.\nRespond in the ${your_language} language.\n\n The topic is:\n\"\"\"\n${topic_compose}\n\"\"\"`
  } else {
    prompt_start = `Write ${anOra} ${formality_reply} ${prompt_start}`;
    prompt += `${prompt_start} to reply to the original text, with a ${tone} tone with and a ${email_length} length. Draw inspiration from the key points provided, but adapt them thoughtfully without merely repeating.\nRespond in the ${your_language} language.\n\n-----\n\nOriginal text:\n\"\"\"\n${original_text_reply}\n\"\"\"\n\nThe key points of the reply:\n\"\"\"\n${general_content_reply}\n\"\"\"`
  }
  prompt += `\n\njson:\n\"\"\"\n{title: "", body: ""}\n\"\"\"\nOutput in ${your_language}\n\n`

  try {
    const response = await callGPT(gpt_ai_key, prompt, gpt_version, false, null, { "type": "json_object" })
    const contentRes = response.choices[0].message.content;

    callback(JSON.parse(contentRes));

    //Save log summary chat
    saveLog(prompt, contentRes, 'email');
  } catch (error) {
    retry++;
    generateContentRequest(params, callback, retry);
  }
}