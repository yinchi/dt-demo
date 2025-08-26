import { validateUrl, whoamiUrl } from "./config";

interface CookieValues {
  access_token?: string;
}

async function checkAccessToken(
  login: boolean = false,
  cookie: CookieValues,
): Promise<Response | null> {
  /** Retrieve the access token from local storage and validate it.
   * If the token is valid and `login` is true, redirect to the home page.
   * If the token is found but invalid, or `login` is false, return the API response.
   * If the token is not found, skip the API call and return null.
   */
  console.log("Cookie (checkAccessToken):", cookie);
  const token = cookie.access_token;
  if (token) {
    try {
      const response = await fetch(validateUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Token is valid, proceed to the home page
        if (login) {
          window.location.href = "/home";
        }
        console.log("Valid token:", await response.text());
      } else {
        // Token is invalid, stay on the login page
        console.log("Invalid token:", await response.text());
      }
      return response;
    } catch (error) {
      // On error, stay on the login page
      console.log("Error validating token:", error);
      return null;
    }
  } else {
    // No token found, stay on the login page
    console.log("No token found");
    return null;
  }
}

async function whoami(cookie: CookieValues): Promise<string | null> {
  const token = cookie.access_token;
  if (token) {
    try {
      const response = await fetch(whoamiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.username) {
          return data.username as string;
        }
      }
    } catch {
      return null;
    }
  }
  return null;
}

export default checkAccessToken;
export { whoami };
