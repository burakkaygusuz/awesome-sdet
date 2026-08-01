import http from 'node:http';
import {
  handleCdpNetworkInterception,
  handleSeleniumWait,
  type CdpNetworkInterceptionArgs,
  type SeleniumWaitArgs,
} from '@/selenium/index.js';

const PORT = Number(process.env.PORT) || 3000;

export async function handleStatelessHttpRequest(reqBody: string) {
  const jsonRpcRequest = JSON.parse(reqBody);
  const { id, method, params } = jsonRpcRequest;

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'execute_selenium_wait',
            description:
              'Statelessly verifies a Selenium ExpectedConditions explicit wait condition',
            inputSchema: {
              type: 'object',
              properties: {
                targetUrl: { type: 'string' },
                condition: {
                  type: 'string',
                  enum: [
                    'elementToBeClickable',
                    'visibilityOfElementLocated',
                    'presenceOfElementLocated',
                    'invisibilityOfElementLocated',
                    'textToBePresentInElement',
                    'textToBePresentInElementLocated',
                    'textToBe',
                    'titleIs',
                    'titleContains',
                    'urlToBe',
                    'urlContains',
                    'urlMatches',
                    'alertIsPresent',
                    'frameToBeAvailableAndSwitchToIt',
                    'elementToBeSelected',
                    'stalenessOf',
                    'numberOfElementsToBe',
                    'numberOfElementsToBeMoreThan',
                    'numberOfElementsToBeLessThan',
                    'numberOfWindowsToBe',
                    'attributeToBe',
                    'attributeContains',
                    'attributeToBeNotEmpty',
                    'domAttributeToBe',
                    'domPropertyToBe',
                  ],
                },
                locator: {
                  type: 'object',
                  properties: {
                    by: {
                      type: 'string',
                      enum: [
                        'id',
                        'name',
                        'className',
                        'class',
                        'cssSelector',
                        'css',
                        'xpath',
                        'tagName',
                        'tag',
                        'linkText',
                        'link',
                        'partialLinkText',
                        'partialLink',
                      ],
                    },
                    value: { type: 'string' },
                  },
                  required: ['by', 'value'],
                },
                timeoutSeconds: { type: 'number' },
              },
              required: ['targetUrl', 'condition', 'locator'],
            },
          },
          {
            name: 'execute_cdp_network_interception',
            description:
              'Statelessly configures or verifies Chrome DevTools Protocol (CDP) network request interception',
            inputSchema: {
              type: 'object',
              properties: {
                targetUrl: { type: 'string' },
                urlPattern: { type: 'string' },
                action: {
                  type: 'string',
                  enum: [
                    'mockResponse',
                    'blockRequest',
                    'failRequest',
                    'continueRequest',
                    'modifyHeaders',
                    'injectBasicAuth',
                    'recordTraffic',
                  ],
                },
                mockStatus: { type: 'number' },
                mockResponseBody: { type: 'string' },
                headers: { type: 'object' },
                authCredentials: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                  },
                  required: ['username', 'password'],
                },
                errorReason: {
                  type: 'string',
                  enum: ['Failed', 'Aborted', 'AccessDenied', 'ConnectionRefused'],
                },
              },
              required: ['targetUrl', 'urlPattern', 'action'],
            },
          },
        ],
      },
    };
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    if (name === 'execute_selenium_wait') {
      const toolResult = handleSeleniumWait(args as SeleniumWaitArgs);
      return {
        jsonrpc: '2.0',
        id,
        result: toolResult,
      };
    }
    if (name === 'execute_cdp_network_interception') {
      const toolResult = handleCdpNetworkInterception(args as CdpNetworkInterceptionArgs);
      return {
        jsonrpc: '2.0',
        id,
        result: toolResult,
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}

const httpServer = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/mcp') {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const result = await handleStatelessHttpRequest(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid request';
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32600, message: msg } }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(
      `[MCP 2026-07-28 Spec] Stateless SDET Selenium MCP Server running on http://localhost:${PORT}/mcp`
    );
  });
}
