export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const apiFile = (url) =>
  url && url.startsWith('/api') ? `${API_BASE_URL}${url}` : url
