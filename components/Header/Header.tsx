"use client"

import { useState } from 'react';
import {
  Group,
  Text,
  UnstyledButton,
  rem,
  TextInput,
  ActionIcon,
  useMantineColorScheme,
  Container,
  Burger,
  Drawer,
  Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSearch,
  IconSun,
  IconMoon,
  IconBell,
  IconUser,
} from '@tabler/icons-react';
import classes from './Header.module.css';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Add search logic here
    console.log('Searching for:', value);
  };

  return (
    <>
      <header className={classes.header}>
        <Container size="lg" className={classes.inner}>
          <Group>
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size="lg" fw={700}>
              MMORPG Editor
            </Text>
          </Group>

          <Group gap="xs">
            <TextInput
              placeholder="Search..."
              value={searchQuery}
              onChange={(event) => handleSearch(event.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              size="sm"
              w={300}
              visibleFrom="sm"
            />
            
            <ActionIcon
              variant="default"
              onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
              size="lg"
            >
              {colorScheme === 'light' ? (
                <IconMoon size={18} />
              ) : (
                <IconSun size={18} />
              )}
            </ActionIcon>

            <ActionIcon variant="default" size="lg">
              <IconBell size={18} />
            </ActionIcon>

            <UnstyledButton className={classes.user}>
              <Group gap={7}>
                <IconUser size={20} />
                <Text size="sm" fw={500} visibleFrom="xs">
                  User
                </Text>
              </Group>
            </UnstyledButton>
          </Group>
        </Container>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <Stack>
          <TextInput
            placeholder="Search..."
            value={searchQuery}
            onChange={(event) => handleSearch(event.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            size="sm"
          />
        </Stack>
      </Drawer>
    </>
  );
} 