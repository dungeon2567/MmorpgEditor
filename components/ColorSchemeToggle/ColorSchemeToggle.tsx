'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
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
  );
}
