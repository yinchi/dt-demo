import { AppShell, Group, Title, Text, Button } from "@mantine/core";
import { Icon } from "@iconify/react";

import { useCookies } from "react-cookie";

function MyAppHeader({ user }: { user: string | null }) {
  const [, , removeCookie] = useCookies(["access_token"]);
  return (
    <AppShell.Header miw={1200}>
      <Group justify="space-between" flex={1} h="100%" px="md" bg="dark" c="white">
        <Title order={1}>Hospital DT Demo</Title>
        {user && (
          <Group align="center" gap="md">
            <Group gap={5}>
              <Icon icon="mdi:account" fontSize={16} />
              <Text size="lg">{user}</Text>
            </Group>
            <Button
              size="md"
              bg="red"
              onClick={() => {
                // Clear the access token and redirect to login
                removeCookie("access_token");
                window.location.href = "/login";
              }}
            >
              Logout
            </Button>
          </Group>
        )}
      </Group>
    </AppShell.Header>
  );
}

export default MyAppHeader;
