const express = require('express')
const cors = require('cors')
const OpenAI = require('openai')

var bodyParser = require('body-parser')

const app = express()
app.use(cors())
const port = 8083

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
}));

const OPEN_AI_API_KEY = "";
const OPEN_AI_MODEL = "gpt-3.5-turbo";
const openai = new OpenAI({
  apiKey: OPEN_AI_API_KEY, // This is the default and can be omitted
});

app.post('/get-json-summary', async (req, res) => {

  const { title_mail, content_mail, lang } = req.body;

  let content_user = `
    Title: ${title_mail}
    Content: ${content_mail}
    
    I want you to always answer in ${lang}.
    Summarize the letter's content in a single paragraph, summarize the letter's content according to 3 main points, language of body mail, suggest 3 ways to answer
  `
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: `You are a helpful assistant designed to output JSON` },
      { role: 'user', content: `Language in ${lang}.\nFormat: {summarize: "", key_points: [3 items], language: "", answer_suggest: [3 items]}.` },
      { role: 'assistant', content: 'Ok' },
      { role: 'user', content: content_user },
    ],
    model: OPEN_AI_MODEL,
    response_format: { type: "json_object" },
  });

  res.send(completion.choices[0].message.content)
})

app.post('/generate-content-reply-mail', async (req, res) => {
  const { title_mail, content_mail, voice_config, reply_suggested, lang } = req.body;

  const voiceConfig = JSON.parse(voice_config)
  let content_user = `
    Title: ${title_mail}
    Body: ${content_mail}

    I want you to always answer in ${lang}.
  `
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant designed to output JSON" },
      { role: 'user', content: 'Language in ${lang}.\nFormat: {title: "", body: ""}' },
      { role: 'assistant', content: 'Ok' },
      { role: 'user', content: content_user },
      { role: 'assistant', content: 'Ok' },
      { role: 'user', content: `${voiceConfig.your_role ? `I'm the ${voiceConfig.your_role}` : '' }. Help me write a ${voiceConfig.email_length}, ${voiceConfig.tone}, ${voiceConfig.formality} in ${lang} email in response to the message. The content of the answer revolves around the story "${reply_suggested}"` },
    ],
    model: OPEN_AI_MODEL,
    response_format: { type: "json_object" },
  });

  res.send(completion.choices[0].message.content)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})