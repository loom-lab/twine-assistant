# twine-assistant
A LLM-based assistant to support the creation of Twine stories.

## Install/Run
After cloning the repo, install dependencies.
```
npm install
```

To start dev server:
```
npm start
```

To build:
```
npm build
```

Currently only Gemini is implemented (has a free tier).

To set the api key:
```
localStorage.setItem('gemini_api_key', 'api-key-here')
```

To collect telemetry:
```
node tools/telemetry-collector.js
```
This listens on `http://localhost:3100/events` by default and outputs to `/events.jsonl`.