import { Icon } from "@iconify/react";
import { AppShell, Group, Text, Anchor } from "@mantine/core";

function copyright() {
  /** Render the copyright notice. */
  const year: number = new Date().getFullYear();
  const left_year: number = 2025;
  const right_segment: string = year > left_year ? `&ndash;${year}` : "";
  const years = `${left_year.toString()}${right_segment}`;
  return (
    <Text>
      © {years} Anandarup Mukherjee & Yin-Chi Chan, Institute for Manufacturing, University of
      Cambridge
    </Text>
  );
}

function MyAppFooter() {
  /** Render the footer section of the app. */
  return (
    <AppShell.Footer miw={1200} bg={"dark"} c="white">
      <Group justify="space-between" flex={1} h="100%" px="sm" pt={10} pb={5}>
        {copyright()}
        <Anchor href="https://github.com/yinchi/dt-demo-gcp" target="_blank">
          <Icon icon="octicon:mark-github-16" />
          &nbsp;GitHub
        </Anchor>
      </Group>
    </AppShell.Footer>
  );
}

export default MyAppFooter;
