import getNewToken from "./getNewToken.ts";
import { tokenUrl } from "./config.ts";

async function doLogin(
  values: { username: string; password: string },
  setErrMsg: React.Dispatch<React.SetStateAction<string>>,
  setErrMsgDisplay: React.Dispatch<React.SetStateAction<"block" | "none">>,
  setCookie: (name: "access_token", value: string) => void,
) {
  /** Call the login API endpoint.
   * On success, store the access token and redirect to the home page.
   * On failure, display an error message.
   */
  console.log("Logging in with", values);
  const result = await getNewToken(values, tokenUrl);
  if (result.success) {
    // Handle successful login
    setCookie("access_token", result.payload.access_token);
    window.location.href = "/home";
  } else {
    // Handle login error
    setErrMsg(result.error.detail);
    setErrMsgDisplay("block");
  }
}

export default doLogin;
