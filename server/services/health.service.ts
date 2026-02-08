export async function checkHealth() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}
