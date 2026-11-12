export interface Env {
  BACKEND_HEALTH_URL?: string;
}

export default {
  async scheduled(event: any, env: Env, ctx: any) {
    const healthUrl =
      env.BACKEND_HEALTH_URL ||
      "https://open-trash-tech-be.onrender.com/api/healthz";

    try {
      const start = Date.now();
      const res = await fetch(healthUrl, {
        method: "GET",
        headers: {
          "User-Agent": "OpenIdear-Cloudflare-KeepAlive/1.0",
        },
      });
      const duration = Date.now() - start;

      console.log(
        `[KeepAlive] Ping to ${healthUrl} finished in ${duration}ms with status HTTP ${res.status}`
      );
    } catch (err: any) {
      console.error(
        `[KeepAlive] Error pinging backend at ${healthUrl}:`,
        err?.message || err
      );
    }
  },

  async fetch(req: Request, env: Env) {
    return new Response(
      JSON.stringify({
        status: "active",
        service: "OpenIdear Render KeepAlive Worker",
        cron: "*/9 * * * *",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};
