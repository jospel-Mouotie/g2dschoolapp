export function success<T>(data: T, status = 200) {
  return new Response(JSON.stringify({ success: true, data }), { status, headers: { 'Content-Type': 'application/json' } });
}

export function error(message: string, code = 'UNKNOWN_ERROR', status = 500) {
  return new Response(JSON.stringify({ success: false, error: { message, code } }), { status, headers: { 'Content-Type': 'application/json' } });
}
