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
    Body: ${content_mail}
  `
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant designed to output JSON" },
      { role: 'user', content: 'Format: {detailed_summary: "", key_points: [3 items], language: "", reply_suggestions: [3 items]}' },
      { role: 'assistant', content: 'Ok, i remembered' },
      { role: 'user', content: 'I want you to answer Vietnamese' },
      { role: 'assistant', content: 'Ok, i remembered' },
      { role: 'user', content: content_user },
    ],
    model: OPEN_AI_MODEL,
    response_format: { type: "json_object" },
  });

  res.send(completion.choices[0].message.content)
})

app.post('/generate-content-reply-mail', async (req, res) => {
  const { title_mail, content_mail, voice_config, reply_suggested } = req.body;

  let voiceConfigStr = '';
  let config = JSON.parse(voice_config)
  for (const key in config) {
    if (Object.hasOwnProperty.call(config, key)) {
      const element = config[key];

      if (key == "email_length") {
        voiceConfigStr += `Email length is ${element}, `
      } if (key == "your_role") {
        voiceConfigStr += `My role is ${element}, `
      } else {
        voiceConfigStr += `${key} is ${element}, `
      }
    }
  }

  let content_user = `
    Title: ${title_mail}
    Body: ${content_mail}
  `
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant designed to output JSON" },
      { role: 'user', content: 'Format: {title: "", body: ""}' },
      { role: 'assistant', content: 'Ok, i remembered' },
      { role: 'user', content: content_user },
      { role: 'assistant', content: 'Ok, i remembered' },
      { role: 'user', content: 'I want you to answer Vietnamese' },
      { role: 'assistant', content: 'Ok, i remembered' },
      { role: 'user', content: `I want you to reply according to these ${reply_suggested} and ${voiceConfigStr}` },
      { role: 'assistant', content: 'Ok, i remembered' },
      { role: 'user', content: "Help reply mail" },
    ],
    model: OPEN_AI_MODEL,
    response_format: { type: "json_object" },
  });

  res.send(completion.choices[0].message.content)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})