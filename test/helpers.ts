import type http from 'node:http';
import type { AddressInfo } from 'node:net';

export const MCP_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
  'Mcp-Protocol-Version': '2026-07-28',
};

/**
 * Helper that mirrors the JSON-RPC method into the mandatory Mcp-Method header
 * and, for tools/call, resources/read, and prompts/get, also sets Mcp-Name.
 */
export function mcpFetch(
  url: string,
  body: { jsonrpc: string; id: number; method: string; params?: Record<string, unknown> },
  extraHeaders?: Record<string, string>
): Promise<Response> {
  const MCP_NAME_METHODS = new Set(['tools/call', 'resources/read', 'prompts/get']);
  const mcpName =
    MCP_NAME_METHODS.has(body.method) && body.params
      ? ((body.params.name ?? body.params.uri) as string | undefined)
      : undefined;

  const standardMeta = {
    'io.modelcontextprotocol/protocolVersion': '2026-07-28',
    'io.modelcontextprotocol/clientCapabilities': {},
    ...((body.params?._meta as Record<string, unknown>) || {}),
  };

  const payload = {
    ...body,
    params: {
      ...(body.params || {}),
      _meta: standardMeta,
    },
  };

  return fetch(url, {
    method: 'POST',
    headers: {
      ...MCP_HEADERS,
      'Mcp-Method': body.method,
      ...(mcpName ? { 'Mcp-Name': mcpName } : {}),
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  });
}

export interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: {
    resultType?: string;
    protocolVersion?: string;
    serverInfo?: { name: string; version: string; description?: string };
    capabilities?: Record<string, unknown>;
    tools?: Array<{
      name: string;
      description?: string;
      annotations?: {
        readOnlyHint?: boolean;
        destructiveHint?: boolean;
        idempotentHint?: boolean;
        openWorldHint?: boolean;
      };
    }>;
    resources?: Array<{ uri: string; name?: string; mimeType?: string }>;
    prompts?: Array<{
      name: string;
      description?: string;
      arguments?: Array<{ name: string; required?: boolean }>;
    }>;
    contents?: Array<{ uri: string; text?: string; mimeType?: string }>;
    messages?: Array<{ role: string; content: { type: string; text?: string } }>;
    content?: Array<{ type: string; text?: string }>;
    ttlMs?: number;
    cacheScope?: string;
    isError?: boolean;
  };
  error?: { code: number; message: string };
}

export async function parseMcpResponse(res: Response): Promise<JsonRpcResponse> {
  const rawText = await res.text();
  if (rawText.includes('data: ')) {
    const jsonStr = rawText.substring(rawText.indexOf('{'));
    return JSON.parse(jsonStr);
  }
  return JSON.parse(rawText);
}

export async function listenServer(server: http.Server): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo;
      resolve(`http://127.0.0.1:${address.port}/mcp`);
    });
  });
}

export async function closeServer(server: http.Server): Promise<void> {
  return new Promise<void>((resolve, reject) =>
    server.close((error?: Error) => (error ? reject(error) : resolve()))
  );
}
