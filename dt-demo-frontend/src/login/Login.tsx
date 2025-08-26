import { useEffect, useState } from "react";

import "@mantine/core/styles.css";
import {
  MantineProvider,
  AppShell,
  Stack,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
} from "@mantine/core";

import MyAppHeader from "../common/MyAppHeader.tsx";
import MyAppFooter from "../common/MyAppFooter.tsx";
import doLogin from "../auth/doLogin.ts";
import checkAccessToken from "../auth/checkAccessToken.ts";
import { useForm } from "@mantine/form";
import { useCookies } from "react-cookie";

function Login() {
  /** On component mount, check for an existing access token in local storage.
   *   - If found and valid, redirect to the home page.
   *   - If not found or invalid, stay on the login page.
   */

  // Layout
  return (
    <MantineProvider>
      <AppShell header={{ height: 90 }} footer={{ height: 40 }} padding="md" miw={1200}>
        <MyAppHeader user={null} />
        <MainSection />
        <MyAppFooter />
      </AppShell>
    </MantineProvider>
  );
}

function MainSection() {
  const [errMsg, setErrMsg] = useState<string>("");
  const [errMsgDisplay, setErrMsgDisplay] = useState<"block" | "none">("none");

  interface CookieValues {
    access_token?: string;
  }
  const [cookie, setCookie] = useCookies<"access_token", CookieValues>(["access_token"]);
  const [loaded, setLoaded] = useState<boolean>(false);

  const loginForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (value) => (value ? null : "Username is required"),
      password: (value) => (value ? null : "Password is required"),
    },
  });

  useEffect(() => {
    // Check for existing access token and redirect if found/valid.
    // Else, stay on the login page and mark as loaded to render main section.
    checkAccessToken(true, cookie);
    setLoaded(true);
  }, []);

  return (
    <AppShell.Main w={1200 - 35}>
      {loaded ? (
        <form
          onSubmit={loginForm.onSubmit(async (values) => {
            doLogin(values, setErrMsg, setErrMsgDisplay, setCookie);
          })}
        >
          <Stack gap="md">
            <Title order={2}>Login</Title>
            <Text c="red" size="lg" style={{ display: errMsgDisplay }}>
              {errMsg}
            </Text>
            <TextInput
              label="Username"
              placeholder="Enter your username"
              size="lg"
              width="100%"
              key={loginForm.key("username")}
              {...loginForm.getInputProps("username")}
            />
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              size="lg"
              width="100%"
              key={loginForm.key("password")}
              {...loginForm.getInputProps("password")}
            />
            <Button size="lg" c="primary" type="submit">
              Login
            </Button>
          </Stack>
        </form>
      ) : (
        <></>
      )}
    </AppShell.Main>
  );
}

export default Login;
