# Getting your API keys

Learn how to obtain your API keys and understand the supported authentication strategies for securely accessing Hume APIs.

## API keys

Each Hume account is provisioned with an **API key** and **Secret key**. These keys are accessible from the Hume Portal.

1. **Sign in**: Visit the **Hume Portal** and log in, or create an account.
2. **View your API keys**: Navigate to the **API keys page** to view your keys.

![Open the API keys page from the left sidebar](https://example.com/api-keys-page.png)

## Authentication strategies

Hume APIs support two authentication strategies:

1. **API key strategy**: Use API key authentication for making **server-side requests**. API key authentication allows you to make authenticated requests by supplying a single secret using the `X-Hume-Api-Key` header. Do not expose your API key in client-side code. All Hume APIs support this authentication strategy.

2. **Token strategy**: Use Token authentication for making **client-side** requests. With Token authentication you first obtain a temporary **access token** by making a server-side request first, and use the access token when making client-side requests. This allows you to avoid exposing the API key to the client. Access tokens expire after 30 minutes, and you must obtain a new one. Today, only our **Empathic Voice Interface** (EVI) and **Text-to-speech** APIs support this authentication strategy.

## API key authentication

To use API key authentication on **REST API** endpoints, include the API key in the `X-Hume-Api-Key` request header.

### EVI example

```bash
curl https://api.hume.ai/v0/evi/{path} \
  --header 'Accept: application/json; charset=utf-8' \
  --header "X-Hume-Api-Key: <YOUR API KEY>"
```

### TTS example

```bash
curl https://api.hume.ai/v0/tts/{path} \
  --header 'Accept: application/json; charset=utf-8' \
  --header "X-Hume-Api-Key: <YOUR API KEY>"
```

### Expression Measurement example

```bash
curl https://api.hume.ai/v0/batch/jobs/{path} \
  --header 'Accept: application/json; charset=utf-8' \
  --header "X-Hume-Api-Key: <YOUR API KEY>"
```

For **WebSocket** endpoints, include the API key as a query parameter in the URL.

### EVI example

```javascript
const ws = new WebSocket(`wss://api.hume.ai/v0/evi/chat?api_key=${apiKey}`);
```

### Expression Measurement example

```bash
const ws = new WebSocket(`wss://api.hume.ai/v0/stream/models?api_key=${apiKey}`);
```

## Token authentication

To use Token authentication you must first obtain an Access Token from the `POST /oauth2-cc/token` endpoint.

This is a unique endpoint that uses the **"Basic" authentication scheme**, with your API key as the username and the Secret key as the password. This means you must concatenate your API key and Secret key, separated by a colon (`:`), base64 encode this value, and then put the result in the `Authorization` header of the request, prefixed with `Basic`.

You must also supply the `grant_type=client_credentials` parameter in the request body.

### cURL example

```bash
# Assumes `HUME_API_KEY` and `HUME_SECRET_KEY` are defined as environment variables
response=$(curl -s 'https://api.hume.ai/oauth2-cc/token' \
  -u "${HUME_API_KEY}:${HUME_SECRET_KEY}" \
  -d 'grant_type=client_credentials')

# Uses `jq` to extract the access token from the JSON response body
accessToken=$(echo $response | jq -r '.access_token')
```

### TypeScript example

```typescript
import {fetchAccessToken} from 'hume';

// Reads `HUME_API_KEY` and `HUME_SECRET_KEY` from environment variables
const HUME_API_KEY = process.env.HUME_API_KEY;
const HUME_SECRET_KEY = process.env.HUME_SECRET_KEY;

const accessToken = await fetchAccessToken({
  apiKey: HUME_API_KEY,
  secretKey: HUME_SECRET_KEY
});
```

### Python example

```python
import os
import httpx
import base64

# Reads `HUME_API_KEY` and `HUME_SECRET_KEY` from environment variables
HUME_API_KEY = os.getenv('HUME_API_KEY')
HUME_SECRET_KEY = os.getenv('HUME_SECRET_KEY');

auth = f"{HUME_API_KEY}:{HUME_SECRET_KEY}"
encoded_auth = base64.b64encode(auth.encode()).decode()
resp = httpx.request(
    method="POST",
    url="https://api.hume.ai/oauth2-cc/token",
    headers={"Authorization": f"Basic {encoded_auth}"},
    data={"grant_type": "client_credentials"},
)

access_token = resp.json()['access_token']
```

## Using the token

On the client side, open an authenticated WebSocket by including the access token as a query parameter in the URL.

```javascript
const ws = new WebSocket(`wss://api.hume.ai/v0/evi/chat?access_token=${accessToken}`);
```

Or, make a REST request by including the access token in the `Authorization` header.

```javascript
fetch('https://api.hume.ai/v0/evi/chats', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

The Hume **Python** and **TypeScript** SDKs will use the API key authentication strategy if you provide only the API key, but will use the Token authentication strategy if you provide both the API key and Secret key.

## Regenerating API keys

API keys can be regenerated by clicking the **Regenerate keys** button on the API keys page. This permanently invalidates the current keys, requiring you to update any applications using them.
