var timeout_fetch = 60000
// var chat_gpt_model = "gpt-3.5-turbo"
var chat_gpt_model = "gpt-3.5-turbo-0125"
var chuck_size_text = 4000
var retry_call_gpt = true
var USER_ADDON_LOGIN = ''
var DOMAIN_ADDON_LOGIN = ''
var MAXIMIZE_TIME_AUTO = 1000 * 60 * 5 //milisecond 5p == 1000*60*5
var is_domain_regist_addon = false

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

async function getDataToShowPopupInMailRequest(params, callback, retry) {
    if (typeof retry == 'undefined') retry = 0;
    if (retry > 3) {
        callback({
            summary: '',
            reply_suggestions: [],
            language: '',
            key_points: [],
        })
        return false;
    }

    const { gpt_ai_key, gpt_model, title_mail, content_mail, lang } = params;

    const messages = [
        { role: "system", content: `You are a helpful assistant designed to output JSON` },
        { role: 'user', content: `Language in ${lang}.\nFormat: {summarize: "", key_points: [3 items], language: "", answer_suggest: [3 items]}.` },
        { role: 'assistant', content: 'Ok' },
        {
            role: 'user', content: `
Title: ${title_mail}
Content: ${content_mail}

I want you to always answer in ${lang}.
Summarize the letter's content in a single paragraph, summarize the letter's content according to 3 main points, language of body mail, suggest 3 ways to answer`
        },
    ];

//     const prompt = `Title: ${title_mail}
// Body: ${content_mail}
// json: {summarize: "", key_points: [], language: "", answer_suggest: []}
// Summarize the letter's content in a single paragraph, summarize the letter's content according to 3 main points, language of body mail, suggest 3 ways to answer.
// Output in ${lang}`

    try {
        const response = await callGPT(gpt_ai_key, messages, gpt_model, false, null, { "type": "json_object" })
        const contentRes = response.choices[0].message.content;

        callback(JSON.parse(contentRes));

        //Save log summary chat
        let question = messages[messages.length - 1].content;
        saveLog(question, contentRes, 'email');

    } catch (error) {
        retry++;
        getDataToShowPopupInMailRequest(params, callback, retry);
    }
}

async function generateContentReplyMailRequest(params, callback, retry) {
    if (typeof retry == 'undefined') retry = 0;
    if (retry > 3) {
        callback({
            title: '',
            body: '',
        })
        return false;
    }

    const { gpt_ai_key, gpt_model, title_mail, content_mail, voice_config, reply_suggested, lang } = params;

    //     let content_user = `
    // Title: ${title_mail}
    // Body: ${content_mail}

    // I want you to always answer in ${lang}.`
    //     const messages = [
    //         { role: "system", content: "You are a helpful assistant designed to output JSON" },
    //         { role: 'user', content: `Language in ${lang}.\nFormat: {title: "", body: ""}` },
    //         { role: 'assistant', content: 'Ok' },
    //         { role: 'user', content: content_user },
    //         { role: 'assistant', content: 'Ok' },
    //         { role: 'user', content: `${voice_config.your_role ? `I'm the ${voice_config.your_role}` : ''}. Help me write a ${voice_config.email_length}, ${voice_config.tone}, ${voice_config.formality} in ${lang} email in response to the message. The content of the answer revolves around the story "${reply_suggested}"` },
    //     ];

    const prompt = `Title: ${title_mail}\nBody: ${content_mail}
json: {title: "", body: ""}
${voice_config.your_role ? `I'm the ${voice_config.your_role}` : ''}. Help me write a ${voice_config.email_length}, ${voice_config.tone}, ${voice_config.formality} in ${lang} email in response to the message. The content of the answer revolves around the story "${reply_suggested}"
Output in ${lang}`

    try {
        const response = await callGPT(gpt_ai_key, prompt, gpt_model, false, null, { "type": "json_object" })
        const contentRes = response.choices[0].message.content;

        callback(JSON.parse(contentRes));

        //Save log summary chat
        saveLog(prompt, contentRes, 'email');

    } catch (error) {
        retry++;
        generateContentReplyMailRequest(params, callback, retry);
    }
}

async function generateContentRequest(params, callback, retry) {
    if (typeof retry == 'undefined') retry = 0;
    if (retry > 3) {
        callback('')
        return false;
    }

    const {
        gpt_ai_key, gpt_version, type_generate,

        topic_compose, format,
        general_content_reply, original_text_reply, format_reply,

        tone, email_length, your_lang
    } = params;


    let prompt = '';

    if (type_generate == 'compose') {
        prompt += `Write a ${format}, with ${tone} tone and ${email_length} length. The topic is:\n\"\"\"\n${topic_compose}\n\"\"\"\nOutput in ${your_lang}`
    } else {
        prompt += `Write a ${format_reply} to reply to the original text. Ensure your response has a ${tone} tone and a ${email_length} length. Draw inspiration from the key points provided, but adapt them thoughtfully without merely repeating.\nRespond in the ${your_lang} language.\n\n-----\n\nOriginal text:\n\"\"\"\n${original_text_reply}\n\"\"\"\n\nThe key points of the reply:\n\"\"\"\n${general_content_reply}\n\"\"\"`
    }
    prompt += '\n\njson:\n\"\"\"\n{title: "", body: ""}\n\"\"\"\n\n'

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