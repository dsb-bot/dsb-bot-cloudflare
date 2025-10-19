const COOKIE_NAME = "cf_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 * 365 * 10; // 10 Jahre

function renderLogin(message = "") {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Login</title></head>
<body>
  <h2>Login</h2>
  ${message ? `<p style="color:red">${message}</p>` : ""}
  <form method="post" action="/_login">
    <input type="password" name="password" placeholder="Passwort" required />
    <input type="hidden" name="redirect" value="/" />
    <button type="submit">Anmelden</button>
  </form>
</body>
</html>`;
}

async function handleLogin(request, env) {
  const form = await request.formData();
  const pw = form.get("password") || "";
  if (pw === env.SHARED_PASSWORD) {
    const redirectTo = form.get("redirect") || "/";
    const headers = new Headers();
    headers.append("Set-Cookie",
      `${COOKIE_NAME}=1; HttpOnly; Secure; Path=/; Max-Age=${COOKIE_MAX_AGE}`);
    headers.append("Location", redirectTo);
    return new Response(null, { status: 302, headers });
  } else {
    return new Response(renderLogin("Falsches Passwort"), { headers: { "Content-Type": "text/html" } });
  }
}

async function fetchFromGitHub(path, env) {
  const apiUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;
  const resp = await fetch(apiUrl, {
    headers: {
      "Authorization": `token ${env.GITHUB_TOKEN}`,
      "Accept": "application/vnd.github.v3.raw"
    }
  });
  if (!resp.ok) return new Response("Fehler beim Laden", { status: resp.status });
  const text = await resp.text();
  return new Response(text, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Login POST
    if (url.pathname === "/_login" && request.method === "POST") {
      return handleLogin(request, env);
    }

    // Cookie prüfen
    const cookie = request.headers.get("Cookie") || "";
    if (!cookie.includes(`${COOKIE_NAME}=1`)) {
      return new Response(renderLogin(), { headers: { "Content-Type": "text/html" } });
    }

    // JSON-Liste aller Pläne
    if (url.pathname === "/plans") {
      const apiUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/plans`;
      const resp = await fetch(apiUrl, {
        headers: {
          "Authorization": `token ${env.GITHUB_TOKEN}`,
          "Accept": "application/vnd.github.v3+json"
        }
      });

      if (!resp.ok) {
        return new Response(JSON.stringify({ error: "Fehler beim Laden der Pläne" }), {
          status: resp.status,
          headers: { "Content-Type": "application/json" }
        });
      }

      const json = await resp.json();
      return new Response(JSON.stringify(json), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Proxy für Pläne
    if (url.pathname.startsWith("/plans/")) {
      const relPath = url.pathname.replace(/^\/plans\//, "");
      return fetchFromGitHub(relPath, env);
    }

    // Standard: statische Website
    return env.ASSETS.fetch(request);
  }
}
