export const defaultBaseUrl = 'http://localhost:3200';

const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

const getLocationOrigin = () => {
  const location = globalThis.location;

  if (location && HTTP_PROTOCOLS.has(location.protocol)) {
    return location.origin;
  }

  return defaultBaseUrl;
};

export const getInitialBaseUrl = () => {
  const location = globalThis.location;

  if (location && HTTP_PROTOCOLS.has(location.protocol)) {
    return location.origin;
  }

  return defaultBaseUrl;
};

export const normalizeBaseUrl = value => {
  const trimmed = String(value || '').trim();

  if (!trimmed) {
    return defaultBaseUrl;
  }

  try {
    const candidate = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `http://${trimmed.replace(/^\/+/, '')}`;
    const parsed = new URL(candidate, getLocationOrigin());

    if (!HTTP_PROTOCOLS.has(parsed.protocol)) {
      return defaultBaseUrl;
    }

    return parsed.origin.replace(/\/+$/, '');
  } catch {
    return defaultBaseUrl;
  }
};

export const normalizePath = value => {
  const trimmed = String(value || '').trim();

  if (!trimmed) {
    return '/';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      return `${url.pathname}${url.search}${url.hash}` || '/';
    } catch {
      return '/';
    }
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export const normalizeQuery = value => String(value || '').trim().replace(/^\?/, '');

export const buildRequestUrl = ({ baseUrl, path = '/', query = '' }) => {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  const normalizedPath = normalizePath(path);
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return `${normalizedBase}${normalizedPath}`;
  }

  const separator = normalizedPath.includes('?') ? '&' : '?';
  return `${normalizedBase}${normalizedPath}${separator}${normalizedQuery}`;
};

export const buildFetchOptions = ({ method = 'GET', cookie = '', body = '', signal } = {}) => {
  const normalizedMethod = String(method || 'GET').toUpperCase();
  const headers = {};
  const trimmedCookie = String(cookie || '').trim();
  const options = {
    method: normalizedMethod,
    headers
  };

  if (signal) {
    options.signal = signal;
  }

  if (trimmedCookie) {
    headers['X-Custom-Cookie'] = trimmedCookie;
  }

  if (normalizedMethod !== 'GET' && String(body || '').trim()) {
    headers['Content-Type'] = 'application/json';
    options.body = body;
  }

  return options;
};

export const formatResponseText = (text, fallbackText = '') => {
  if (!text) {
    return fallbackText;
  }

  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text || fallbackText;
  }
};

export const formatBytes = bytes => {
  if (!bytes) {
    return '0 B';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
};

export const isAbortError = error => error instanceof DOMException && error.name === 'AbortError';

export const getErrorMessage = error => error instanceof Error ? error.message : String(error);

export const fetchPlaygroundRequest = async ({ url, options }) => {
  const startedAt = performance.now();
  const response = await fetch(url, options);
  const rawText = await response.text();
  const elapsedMs = Math.round(performance.now() - startedAt);
  const statusText = `${response.status} ${response.statusText || 'OK'}`;

  return {
    elapsedMs,
    formattedText: formatResponseText(rawText, statusText),
    ok: response.ok,
    rawText,
    sizeBytes: new Blob([rawText]).size,
    statusText
  };
};
