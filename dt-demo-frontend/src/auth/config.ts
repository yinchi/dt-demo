/** Set configuration values for the authentication frontend.
 * Note that VITE_BACKEND_URL is only read at build time (`yarn build`).
 */

const baseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost/api";

export const tokenUrl = `${baseUrl}/auth/token`;
export const validateUrl = `${baseUrl}/auth/validate`;
export const whoamiUrl = `${baseUrl}/auth/whoami`;
