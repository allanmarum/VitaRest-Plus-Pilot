const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const APP_ROOT = __dirname;
const STATIC_ROOT = APP_ROOT;
const ENTRY_FILE = 'index.html';
const DEFAULT_PORT = 3000;
const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_LOG_LEVEL = 'info';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
};

function now() {
  return new Date().toISOString();
}

function createLogger(level = DEFAULT_LOG_LEVEL) {
  const priority = { debug: 10, info: 20, warn: 30, error: 40 };
  const activeLevel = priority[level] ?? priority.info;

  return {
    debug: (...args) => activeLevel <= priority.debug && console.debug(`[${now()}] DEBUG`, ...args),
    info: (...args) => activeLevel <= priority.info && console.info(`[${now()}] INFO`, ...args),
    warn: (...args) => activeLevel <= priority.warn && console.warn(`[${now()}] WARN`, ...args),
    error: (...args) => activeLevel <= priority.error && console.error(`[${now()}] ERROR`, ...args)
  };
}

function parsePort(rawPort) {
  if (!rawPort) return DEFAULT_PORT;

  const port = Number.parseInt(String(rawPort), 10);
  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: ${rawPort}`);
  }

  return port;
}

function resolveRuntimeConfig(env = process.env) {
  return {
    appBaseUrl: env.APP_BASE_URL || '',
    environment: env.NODE_ENV || 'production',
    host: env.HOST || DEFAULT_HOST,
    logLevel: env.LOG_LEVEL || DEFAULT_LOG_LEVEL,
    port: parsePort(env.PORT),
    startupTimeoutMs: Number.parseInt(env.STARTUP_TIMEOUT_MS || '15000', 10)
  };
}

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function safePathname(urlPathname) {
  const normalizedPath = path.normalize(decodeURIComponent(urlPathname)).replace(/^([.][.][/\\])+/, '');
  return normalizedPath.replace(/^[/\\]+/, '');
}

function readFile(filePath) {
  return fs.promises.readFile(filePath);
}

function fileExists(filePath) {
  return fs.promises
    .access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

async function verifyStartupFiles(logger) {
  const entryPath = path.join(STATIC_ROOT, ENTRY_FILE);
  const requiredFiles = [entryPath, path.join(STATIC_ROOT, 'app.js'), path.join(STATIC_ROOT, 'styles.css')];

  for (const filePath of requiredFiles) {
    const exists = await fileExists(filePath);
    if (!exists) {
      throw new Error(`Required startup asset not found: ${path.relative(APP_ROOT, filePath)}`);
    }
  }

  logger.info('Startup asset verification completed successfully.');
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8'
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, content, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': contentType
  });
  response.end(content);
}

function withSecurityHeaders(headers = {}) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'same-origin',
    ...headers
  };
}

async function createRequestHandler(runtimeConfig, logger) {
  const entryPath = path.join(STATIC_ROOT, ENTRY_FILE);

  return async function requestHandler(request, response) {
    const method = request.method || 'GET';
    const parsedUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

    logger.debug(`${method} ${parsedUrl.pathname}`);

    if (method !== 'GET' && method !== 'HEAD') {
      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }

    if (parsedUrl.pathname === '/health' || parsedUrl.pathname === '/ready') {
      sendJson(response, 200, {
        status: 'ok',
        service: 'vitares-plus-pilot',
        timestamp: now(),
        uptimeSeconds: Number(process.uptime().toFixed(2))
      });
      return;
    }

    if (parsedUrl.pathname === '/config.js') {
      const publicConfig = {
        environment: runtimeConfig.environment,
        appBaseUrl: runtimeConfig.appBaseUrl
      };

      sendText(
        response,
        200,
        `window.__APP_CONFIG__ = ${JSON.stringify(publicConfig, null, 2)};\n`,
        'application/javascript; charset=utf-8'
      );
      return;
    }

    try {
      const candidatePath = safePathname(parsedUrl.pathname === '/' ? `/${ENTRY_FILE}` : parsedUrl.pathname);
      let filePath = path.join(STATIC_ROOT, candidatePath);
      const isStaticAsset = path.extname(filePath) !== '';

      if (!filePath.startsWith(STATIC_ROOT)) {
        sendJson(response, 403, { error: 'Forbidden' });
        return;
      }

      if (!(await fileExists(filePath))) {
        if (isStaticAsset) {
          sendJson(response, 404, { error: 'Not found' });
          return;
        }

        filePath = entryPath;
      }

      const content = await readFile(filePath);
      response.writeHead(200, withSecurityHeaders({ 'Content-Type': getContentType(filePath) }));
      if (method === 'HEAD') {
        response.end();
        return;
      }

      response.end(content);
    } catch (error) {
      logger.error('Request handling failed.', error);
      sendJson(response, 500, { error: 'Internal server error' });
    }
  };
}

async function start() {
  const runtimeConfig = resolveRuntimeConfig();
  const logger = createLogger(runtimeConfig.logLevel);
  const startupTimer = setTimeout(() => {
    logger.error(`Startup exceeded ${runtimeConfig.startupTimeoutMs}ms.`);
    process.exit(1);
  }, runtimeConfig.startupTimeoutMs);

  startupTimer.unref();

  try {
    logger.info('Preparing VitaRest Plus Pilot for startup.');
    await verifyStartupFiles(logger);

    const requestHandler = await createRequestHandler(runtimeConfig, logger);
    const server = http.createServer((request, response) => {
      Promise.resolve(requestHandler(request, response)).catch((error) => {
        logger.error('Unhandled request failure.', error);
        sendJson(response, 500, { error: 'Internal server error' });
      });
    });

    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    const shutdown = (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown.`);
      server.close((closeError) => {
        if (closeError) {
          logger.error('Error while closing the HTTP server.', closeError);
          process.exit(1);
          return;
        }

        logger.info('HTTP server shut down cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled promise rejection detected.', error);
    });
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception detected.', error);
      process.exit(1);
    });

    server.listen(runtimeConfig.port, runtimeConfig.host, () => {
      clearTimeout(startupTimer);
      logger.info(
        `VitaRest Plus Pilot started successfully on http://${runtimeConfig.host}:${runtimeConfig.port}`
      );
      if (runtimeConfig.appBaseUrl) {
        logger.info(`Configured APP_BASE_URL=${runtimeConfig.appBaseUrl}`);
      }
    });
  } catch (error) {
    clearTimeout(startupTimer);
    console.error(`[${now()}] ERROR Startup failed.`, error);
    process.exit(1);
  }
}

start();
