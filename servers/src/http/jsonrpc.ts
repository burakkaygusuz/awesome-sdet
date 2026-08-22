import type http from 'node:http';

import { PROTOCOL_VERSION_2026_07_28 } from '../version.js';

export type RpcPayload = {
  jsonrpc?: string;
  id?: unknown;
  method?: string;
  params?: Record<string, unknown>;
};

export const PROTOCOL_VERSION_META_KEY = 'io.modelcontextprotocol/protocolVersion';
export const CLIENT_CAPABILITIES_META_KEY = 'io.modelcontextprotocol/clientCapabilities';

export function safeJsonParse<T = unknown>(text: string): T {
  return JSON.parse(text, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidRequestId(id: unknown): boolean {
  return typeof id === 'string' || (typeof id === 'number' && Number.isInteger(id));
}

export interface JsonRpcErrorReply {
  status: number;
  id: unknown;
  error: { code: number; message: string; data?: unknown };
}

export function writeJsonRpcError(res: http.ServerResponse, reply: JsonRpcErrorReply): void {
  res.writeHead(reply.status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ jsonrpc: '2.0', id: reply.id, error: reply.error }));
}

export function payloadTooLargeReply(): JsonRpcErrorReply {
  return {
    status: 413,
    id: null,
    error: { code: -32600, message: 'Payload Too Large: request body exceeds 10MB limit' },
  };
}

export interface EnvelopeValidationResult {
  ok: boolean;
  code?: number;
  message?: string;
  protocolVersion?: string;
}

export function extractBodyProtocolVersion(payload: Record<string, unknown>): string | undefined {
  if (!isPlainObject(payload?.params)) return undefined;
  const meta = payload.params._meta;
  if (!isPlainObject(meta)) return undefined;

  const version = meta[PROTOCOL_VERSION_META_KEY];
  return typeof version === 'string' && version.trim().length > 0 ? version.trim() : undefined;
}

export function validateRequestEnvelope(
  payload: Record<string, unknown>
): EnvelopeValidationResult {
  if (!isPlainObject(payload)) {
    return {
      ok: false,
      code: -32600,
      message: 'Invalid Request: payload must be an object',
    };
  }

  if (!isPlainObject(payload.params) || !isPlainObject(payload.params._meta)) {
    return { ok: true };
  }

  const meta = payload.params._meta;

  const protocolVersion = meta[PROTOCOL_VERSION_META_KEY];
  if (typeof protocolVersion !== 'string' || protocolVersion.trim().length === 0) {
    return {
      ok: false,
      code: -32602,
      message: `Invalid _meta envelope for protocol revision ${PROTOCOL_VERSION_2026_07_28}: ${PROTOCOL_VERSION_META_KEY}: missing`,
    };
  }

  if (!isPlainObject(meta[CLIENT_CAPABILITIES_META_KEY])) {
    return {
      ok: false,
      code: -32602,
      message: `Invalid _meta envelope for protocol revision ${PROTOCOL_VERSION_2026_07_28}: ${CLIENT_CAPABILITIES_META_KEY}: missing`,
    };
  }

  return {
    ok: true,
    protocolVersion: protocolVersion.trim(),
  };
}
