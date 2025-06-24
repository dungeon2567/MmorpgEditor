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
import dynamic from 'next/dynamic';

const ColorSchemeToggle = dynamic(() => import('../ColorSchemeToggle/ColorSchemeToggle').then(mod => mod.ColorSchemeToggle), {
  ssr: false,
});

interface HeaderProps {
  burger?: React.ReactNode;
}

export function Header({ burger }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Add search logic here
    console.log('Searching for:', value);
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        {burger}
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
        
        <ColorSchemeToggle />

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
    </Group>
  );
} 