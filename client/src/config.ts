const isDev = import.meta.env.DEV;
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isDev ? "" : "https://touchconnectpro-api.onrender.com");
