import { useEffect, useState } from "react";

import "@mantine/core/styles.css";
import { MantineProvider, AppShell, Group, Paper, Select, Stack, Text, Title, ActionIcon } from "@mantine/core";
import { useCookies } from "react-cookie";
import { Icon } from "@iconify/react";

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

/** Mock return value for `GET /api/home/links`. Will fetch the list of links available to
 * the user based on their permissions, defined in the `scopes` field of their JWT.
 */
const mockedLinks = [
  {
    title: "User admin",
    tag: "admin",
    href: "/admin",
    summary: "Create, update, delete users",
  },
  {
    title: "User settings",
    tag: "other",
    href: "/settings",
    summary: "Manage your account settings",
  },
  {
    title: "Developer documentation",
    tag: "other",
    href: "/dev-docs",
    summary: "Instructions for managing and adding services to the DT platform",
  },
];

function MainSection() {
  const [sortBy, setSortBy] = useState<string | null>("tag");
  const [linksLoaded] = useState<boolean>(true); // TODO: load actual data (currently mocked)
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  return (
    <>
      <Title order={2}>Home</Title>
      <Stack gap="md">
        <Group>
          <Text>Sort by:</Text>
          <Select
            data={[
              { value: "tag", label: "Tag" },
              { value: "title", label: "Title" },
            ]}
            value={sortBy}
            onChange={setSortBy}
          />
          <ActionIcon onClick={() => setSortAsc(!sortAsc)}>
            <Icon icon={sortAsc ? "mdi:sort-alphabetical-ascending" : "mdi:sort-alphabetical-descending"} />
          </ActionIcon>
        </Group>
        {linksLoaded ? (
          sortBy == "title" ? (
            <LinksByTitle links={mockedLinks} sortAsc={sortAsc} />
          ) : (
            <LinksByTag links={mockedLinks} sortAsc={sortAsc} />
          )
        ) : (
          <Text>Loading...</Text>
        )}
      </Stack>
    </>
  );
}

function LinksByTitle({ links, sortAsc }: { links: typeof mockedLinks; sortAsc: boolean }) {
  const sortedLinks = [...links].sort((a, b) => a.title.localeCompare(b.title));
  if (!sortAsc) sortedLinks.reverse();
  return (
    // Create a Mantine card for each link
    <Stack gap="lg">
      {sortedLinks.map((link) => (
        <Paper p="md" shadow="sm" radius="md" withBorder component="a" href={link.href}>
          <Text w={500}>{link.title}</Text>
          <Text size="sm" c="dimmed">
            {link.summary}
          </Text>
        </Paper>
      ))}
    </Stack>
  );
}

function LinksByTag({ links, sortAsc }: { links: typeof mockedLinks; sortAsc: boolean }) {
  // Get unique tags
  const tags = Array.from(new Set(links.map((link) => link.tag)));
  const sortedTags = tags.sort((a, b) => a.localeCompare(b));
  if (!sortAsc) sortedTags.reverse();
  return (
    <Stack gap="lg">
      {sortedTags.map((tag) => (
        <>
          <Title order={3}>{tag}</Title>
          {/* Links with this tag */}
          <LinksByTitle links={links.filter((link) => link.tag === tag)} sortAsc={true} />
        </>
      ))}
    </Stack>
  );
}

export default Home;
