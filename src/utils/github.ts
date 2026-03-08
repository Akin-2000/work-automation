const OWNER = import.meta.env.VITE_GITHUB_OWNER;
const REPO = import.meta.env.VITE_GITHUB_REPO;
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

async function githubFetch(path: string, options: RequestInit = {}) {
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
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  return response;
}

export async function getFile(path: string) {
  const response = await githubFetch(path);
  if (response.status === 404) return null;
  const data = await response.json();
  const content = atob(data.content);
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
    content: btoa(JSON.stringify(content, null, 2)),
    sha,
  };

  const response = await githubFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to save file: ${errorData.message}`);
  }

  return response.json();
}
