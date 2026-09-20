import type { Config, Context } from '@netlify/functions'
import serverlessHttp from 'serverless-http'

type LambdaResponse = {
  statusCode?: number
  headers?: Record<string, string | number | undefined>
  cookies?: string[]
  body?: string
  isBase64Encoded?: boolean
}

let expressHandler: ReturnType<typeof serverlessHttp> | undefined

async function getExpressHandler() {
  if (!expressHandler) {
    const { createApp } = await import('../../artifacts/api-server/src/app.ts')
    expressHandler = serverlessHttp(createApp())
  }

  return expressHandler
}

function createLambdaEvent(request: Request, context: Context, body: string) {
  const url = new URL(request.url)

  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: url.pathname,
    rawQueryString: url.searchParams.toString(),
    headers: Object.fromEntries(request.headers.entries()),
    requestContext: {
      accountId: context.account.id,
      requestId: context.requestId,
      domainName: url.hostname,
      domainPrefix: url.hostname.split('.')[0],
      http: {
        method: request.method,
        path: url.pathname,
        protocol: 'HTTP/1.1',
        sourceIp: context.ip,
        userAgent: request.headers.get('user-agent') ?? '',
      },
      routeKey: '$default',
      stage: '$default',
      time: new Date().toISOString(),
      timeEpoch: Date.now(),
    },
    body,
    isBase64Encoded: false,
  }
}

export default async function api(request: Request, context: Context) {
  const body = request.method === 'GET' || request.method === 'HEAD'
    ? ''
    : await request.text()
  const handler = await getExpressHandler()
  const result = await handler(createLambdaEvent(request, context, body), {}) as LambdaResponse
  const headers = new Headers()

  for (const [name, value] of Object.entries(result.headers ?? {})) {
    if (value !== undefined) headers.set(name, String(value))
  }
  for (const cookie of result.cookies ?? []) headers.append('set-cookie', cookie)

  const responseBody = result.body
    ? result.isBase64Encoded
      ? Buffer.from(result.body, 'base64')
      : result.body
    : null

  return new Response(responseBody, {
    status: result.statusCode ?? 200,
    headers,
  })
}

export const config: Config = {
  path: '/api/*',
}
