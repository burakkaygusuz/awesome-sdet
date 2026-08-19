import type http from 'node:http';

import {
  isValidRequestId,
  validateRequestEnvelope,
  writeJsonRpcError,
  type JsonRpcErrorReply,
  type RpcPayload,
} from './jsonrpc.js';
import {
  PROTOCOL_VERSION_2026_07_28,
  SERVER_DESCRIPTION,
  SERVER_NAME,
  SERVER_VERSION,
} from '../version.js';

export const SUPPORTED_PROTOCOL_VERSIONS = new Set([PROTOCOL_VERSION_2026_07_28]);

const MCP_NAME_METHODS = new Set(['tools/call', 'resources/read', 'prompts/get']);
export const SUPPORTED_MCP_METHODS = new Set([
  'server/discover',
  'ping',
  'logging/setLevel',
  'notifications/cancelled',
  'notifications/initialized',
  'notifications/message',
  'tools/list',
  'tools/call',
  'resources/list',
  'resources/templates/list',
  'resources/read',
  'prompts/list',
  'prompts/get',
]);

export function protocolVersionHeaderError(
  protocolVersionHeader: string | undefined,
  jsonPayload: RpcPayload
): JsonRpcErrorReply | undefined {
  if (!protocolVersionHeader) {
    return {
      status: 400,
      id: jsonPayload.id ?? null,
      error: { code: -32020, message: 'Missing required header: Mcp-Protocol-Version' },
    };
  }

  if (!SUPPORTED_PROTOCOL_VERSIONS.has(protocolVersionHeader)) {
    return {
      status: 400,
      id: jsonPayload.id ?? null,
      error: {
        code: -32022,
        message: `Unsupported protocol version: '${protocolVersionHeader}'. Supported version: '${PROTOCOL_VERSION_2026_07_28}'`,
        data: {
          supported: Array.from(SUPPORTED_PROTOCOL_VERSIONS),
          requested: protocolVersionHeader,
        },
      },
    };
  }

  return undefined;
}

export function jsonRpcShapeError(jsonPayload: RpcPayload): JsonRpcErrorReply | undefined {
  if (jsonPayload.jsonrpc !== undefined && jsonPayload.jsonrpc !== '2.0') {
    return {
      status: 400,
      id: jsonPayload.id ?? null,
      error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' },
    };
  }

  if (jsonPayload.id !== undefined && !isValidRequestId(jsonPayload.id)) {
    return {
      status: 400,
      id: null,
      error: {
        code: -32600,
        message: 'Invalid Request: id must be a string or integer (null is not allowed)',
      },
    };
  }

  return undefined;
}

export function methodHeaderError(
  mcpMethodHeader: string | undefined,
  effectiveMethod: string | undefined,
  jsonPayload: RpcPayload
): JsonRpcErrorReply | undefined {
  if (!mcpMethodHeader) {
    return {
      status: 400,
      id: jsonPayload.id ?? null,
      error: { code: -32020, message: 'Missing required header: Mcp-Method' },
    };
  }

  if (jsonPayload.method && mcpMethodHeader !== jsonPayload.method) {
    return {
      status: 400,
      id: jsonPayload.id ?? null,
      error: {
        code: -32020,
        message: `Header mismatch: Mcp-Method header '${mcpMethodHeader}' does not match JSON-RPC method '${jsonPayload.method}'`,
      },
    };
  }

  if (effectiveMethod === undefined || !SUPPORTED_MCP_METHODS.has(effectiveMethod)) {
    return {
      status: 404,
      id: jsonPayload.id ?? null,
      error: { code: -32601, message: 'Method not found' },
    };
  }

  return undefined;
}

export function nameHeaderError(
  mcpNameHeader: string | undefined,
  effectiveMethod: string,
  jsonPayload: RpcPayload
): JsonRpcErrorReply | undefined {
  if (MCP_NAME_METHODS.has(effectiveMethod) && !mcpNameHeader) {
    return {
      status: 400,
      id: jsonPayload.id ?? null,
      error: { code: -32020, message: 'Missing required header: Mcp-Name' },
    };
  }

  if (mcpNameHeader) {
    const paramTarget = (
      (jsonPayload.params?.name ?? jsonPayload.params?.uri) as string | undefined
    )?.trim();
    if (paramTarget && paramTarget !== mcpNameHeader) {
      return {
        status: 400,
        id: jsonPayload.id ?? null,
        error: {
          code: -32020,
          message: `Header mismatch: Mcp-Name header '${mcpNameHeader}' does not match body parameter '${paramTarget}'`,
        },
      };
    }
  }

  return undefined;
}

export function requestEnvelopeError(
  jsonPayload: RpcPayload,
  protocolVersionHeader: string
): JsonRpcErrorReply | undefined {
  const isRequest = jsonPayload.method !== undefined && jsonPayload.id !== undefined;
  if (!isRequest) return undefined;

  const envelope = validateRequestEnvelope(jsonPayload);
  if (!envelope.ok) {
    return {
      status: 400,
      id: jsonPayload.id ?? null,
      error: { code: envelope.code ?? -32602, message: envelope.message ?? 'Invalid params' },
    };
  }

  if (envelope.protocolVersion && envelope.protocolVersion !== protocolVersionHeader) {
    return {
      status: 400,
      id: jsonPayload.id ?? null,
      error: {
        code: -32020,
        message: `Header mismatch: Mcp-Protocol-Version header '${protocolVersionHeader}' does not match body metadata version '${envelope.protocolVersion}'`,
      },
    };
  }

  return undefined;
}

export function handleServerDiscover(res: http.ServerResponse, jsonPayload: RpcPayload): void {
  if (jsonPayload.jsonrpc !== '2.0') {
    writeJsonRpcError(res, {
      status: 400,
      id: null,
      error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' },
    });
    return;
  }

  if (jsonPayload.id === undefined) {
    res.writeHead(202);
    res.end();
    return;
  }

  if (!isValidRequestId(jsonPayload.id)) {
    writeJsonRpcError(res, {
      status: 400,
      id: null,
      error: {
        code: -32600,
        message: 'Invalid Request: id must be a string or integer (null is not allowed)',
      },
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      jsonrpc: '2.0',
      id: jsonPayload.id,
      result: {
        resultType: 'complete',
        protocolVersion: PROTOCOL_VERSION_2026_07_28,
        serverInfo: {
          name: SERVER_NAME,
          version: SERVER_VERSION,
          description: SERVER_DESCRIPTION,
        },
        capabilities: {
          tools: { listChanged: false },
          resources: { subscribe: false, listChanged: false },
          prompts: { listChanged: false },
        },
      },
    })
  );
}
