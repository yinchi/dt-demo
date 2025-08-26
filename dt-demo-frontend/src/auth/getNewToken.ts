type SuccessPayload = {
  access_token: string;
  token_type: string;
};

type ErrorPayload = {
  detail: string;
};

type AuthResponse =
  | {
      success: true;
      payload: SuccessPayload;
    }
  | {
      success: false;
      error: ErrorPayload;
    };

async function getNewToken(
  values: { username: string; password: string },
  tokenUrl: string,
): Promise<AuthResponse> {
  /** Request a new access token using the given login credentials. */

  const { username, password } = values; // unpack values

  const urlEncodedBody = new URLSearchParams({
    grant_type: "password",
    username,
    password,
  }).toString();

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlEncodedBody,
    });
    const data = (await response.json()) as SuccessPayload | ErrorPayload;
    if (response.ok) {
      return {
        success: true,
        payload: data as SuccessPayload,
      };
    } else {
      return {
        success: false,
        error: data as ErrorPayload,
      };
    }
  } catch {
    return {
      success: false,
      error: {
        detail: "An error occurred while calling the token API",
      },
    };
  }
}

export default getNewToken;
