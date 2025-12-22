import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;

  // OPTIONSリクエストへの即時応答
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://starlight25.pages.dev',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
      },
    });
  }

  // 本番のリクエストを実行してレスポンスを取得
  const response = await next();

  // 本番のレスポンスにCORSヘッダーを注入
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', 'starlight25.pages.dev');
  newHeaders.set('Vary', 'Origin');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
});