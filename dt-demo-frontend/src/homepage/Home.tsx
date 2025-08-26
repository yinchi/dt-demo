import { useEffect, useState } from "react";

import "@mantine/core/styles.css";
import { MantineProvider, AppShell, Title, Text } from "@mantine/core";
import { useCookies } from "react-cookie";

import MyAppHeader from "../common/MyAppHeader.tsx";
import MyAppFooter from "../common/MyAppFooter.tsx";
import checkAccessToken from "../auth/checkAccessToken.ts";
import { whoami } from "../auth/checkAccessToken.ts";

interface CookieValues {
  access_token?: string;
}

async function initHomePage(
  setUsername: React.Dispatch<React.SetStateAction<string | null>>,
  setLoaded: React.Dispatch<React.SetStateAction<boolean>>,
  cookie: CookieValues,
) {
  console.log("Cookie (initHomePage):", cookie);
  const response = await checkAccessToken(false, cookie);
  if (response && response.ok) {
    // Token is valid, proceed with home page initialization
    console.log("Token is valid");
    const user = await whoami(cookie);
    setUsername(user);
    setLoaded(true);
  } else {
    // Token is invalid or not found, redirect to login
    console.log("Token is invalid or missing");
    console.log(response?.json());

    setLoaded(true);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    window.location.href = "/login";
  }
}

function Home() {
  // States
  const [username, setUsername] = useState<string | null>(null);
  const [cookie] = useCookies<"access_token", CookieValues>(["access_token"]);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    initHomePage(setUsername, setLoaded, cookie);
  }, []);

  // Layout
  return (
    <MantineProvider>
      <AppShell header={{ height: 90 }} footer={{ height: 40 }} padding="md" miw={1200}>
        <MyAppHeader user={username} />
        <AppShell.Main w={1200 - 35}>
          {username ? (
            <MainSection />
          ) : loaded ? (
            <Text c="red">Error: not logged in. Redirecting...</Text>
          ) : (
            <></>
          )}
        </AppShell.Main>
        <MyAppFooter />
      </AppShell>
    </MantineProvider>
  );
}

function MainSection() {
  return (
    <>
      <Title order={2}>Home</Title>
    </>
  );
}

export default Home;
