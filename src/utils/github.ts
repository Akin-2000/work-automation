const OWNER = import.meta.env.VITE_GITHUB_OWNER;
const REPO = import.meta.env.VITE_GITHUB_REPO;
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Robust base64 for UTF-8 in browser
function toBase64(str: string) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(str: string) {
  return decodeURIComponent(escape(window.atob(str)));
}

async function githubFetch(path: string, options: RequestInit = {}) {
  if (!TOKEN || !OWNER || !REPO) {
    throw new Error('GitHub configuration is missing. Check your environment variables.');
  }

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      ...options.headers,
    },
  });

  if (!response.ok && response.status !== 404) {
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = `: ${errorJson.message}`;
    } catch (e) {
      errorDetail = `: ${response.statusText}`;
    }
    throw new Error(`GitHub API error (${response.status})${errorDetail}`);
  }
  return response;
}

export async function getFile(path: string) {
  const response = await githubFetch(path);
  if (response.status === 404) return null;
  const data = await response.json();
  const content = fromBase64(data.content);
  return {
    content: JSON.parse(content),
    sha: data.sha,
  };
}

export async function listDirectory(path: string) {
  const response = await githubFetch(path);
  if (response.status === 404) return [];
  const data = await response.json();
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

export async function saveFile(path: string, content: any, message: string, sha?: string) {
  const body = {
    message,
    content: toBase64(JSON.stringify(content, null, 2)),
    sha,
  };

  const response = await githubFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  return response.json();
}

// Local data loading (Vite specific)
const localForms = import.meta.glob('../data/forms/*.json', { eager: true });
const localSubmissions = import.meta.glob('../data/submissions/**/*.json', { eager: true });

export function getLocalForms() {
  return Object.values(localForms).map((module: any) => module.default || module);
}

export function getLocalSubmissions() {
  return Object.values(localSubmissions).map((module: any) => module.default || module);
}
