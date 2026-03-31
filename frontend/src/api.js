const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function buildApiUrl(path) {
  if (!path.startsWith("/")) {
    return `${apiBaseUrl}/${path}`;
  }

  return `${apiBaseUrl}${path}`;
}

export async function apiFetch(path, options) {
  return fetch(buildApiUrl(path), options);
}
