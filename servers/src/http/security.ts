import type http from 'node:http';

import { payloadTooLargeReply, writeJsonRpcError } from './jsonrpc.js';

export const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export interface HostAndOriginInfo {
  hostName: string;
  originHeader?: string;
  originName?: string;
}

export function extractHostAndOrigin(req: http.IncomingMessage): HostAndOriginInfo {
  const hostHeader = req.headers.host || '';
  const hostName = hostHeader.startsWith('[::1]') ? '[::1]' : hostHeader.split(':')[0];

  const originHeader = req.headers.origin;
  let originName: string | undefined;
  if (originHeader) {
    try {
      originName = new URL(originHeader).hostname;
    } catch {
      // ignore parsing errors
    }
  }

  return { hostName, originHeader, originName };
}

export function isLocalHostAndOrigin(req: http.IncomingMessage): boolean {
  const { hostName, originHeader, originName } = extractHostAndOrigin(req);
  if (!ALLOWED_HOSTS.has(hostName)) return false;
  if (originHeader && (!originName || !ALLOWED_HOSTS.has(originName))) return false;
  return true;
}

export function handleCorsPreflight(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  originHeader?: string
): boolean {
  if (req.method !== 'OPTIONS') return false;

  res.writeHead(204, {
    'Access-Control-Allow-Origin': originHeader || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, Mcp-Method, Mcp-Name, Mcp-Protocol-Version',
    'Access-Control-Max-Age': '86400',
  });
  res.end();
  return true;
}

const BASE64_SENTINEL = /^=\?base64\?([A-Za-z0-9+/=]+)\?=$/;

/**
 * Decodes the RFC 9110-compatible base64 sentinel format (`=?base64?...?=`)
 * that MCP 2026-07-28 clients MUST use for header values that are not plain
 * ASCII (Mcp-Name, Mcp-Param-*). Spec: servers MUST decode before comparing
 * against the request body value.
 */
export function decodeHeaderValue(raw: string): string {
  const match = BASE64_SENTINEL.exec(raw);
  return match ? Buffer.from(match[1], 'base64').toString('utf8') : raw;
}

/**
 * Collects the request body as a string, enforcing the streaming 10MB limit.
 * Resolves with null when the limit was exceeded (413 already sent).
 */
export function collectBodyWithinLimit(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<string | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let receivedBytes = 0;
    let exceeded = false;
    let settled = false;

    const finalize = (result: string | null) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    req.on('data', (chunk: Buffer | string) => {
      if (exceeded || settled) return;
      const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
      receivedBytes += buf.length;

      if (receivedBytes > MAX_BODY_BYTES) {
        exceeded = true;
        if (!res.headersSent) writeJsonRpcError(res, payloadTooLargeReply());
        req.resume();
        finalize(null);
        return;
      }

      chunks.push(buf);
    });

    req.on('end', () => {
      if (!exceeded) {
        finalize(Buffer.concat(chunks).toString('utf8'));
      }
    });

    req.on('error', () => finalize(null));
    req.on('close', () => {
      if (!req.complete) {
        finalize(null);
      }
    });
  });
}
