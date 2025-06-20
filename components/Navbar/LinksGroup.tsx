"use client"

import { useState } from 'react';
import Link from 'next/link';
import {
  Group,
  Box,
  Collapse,
  ThemeIcon,
  Text,
  UnstyledButton,
  rem,
} from '@mantine/core';
import { IconCalendarStats, IconChevronRight } from '@tabler/icons-react';

interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
  link?: string;
}

export function LinksGroup({ icon: Icon, label, initiallyOpened, links, link }: LinksGroupProps) {
  const hasLinks = Array.isArray(links);
  const hasDirectLink = !!link;
  const [opened, setOpened] = useState(initiallyOpened || false);
  
  const items = (hasLinks ? links : []).map((link) => (
    <Text
      component={Link}
      style={{
        display: 'block',
        textDecoration: 'none',
        fontSize: 'var(--mantine-font-size-sm)',
        color: 'var(--mantine-color-gray-7)',
        padding: `${rem(8)} var(--mantine-spacing-sm)`,
        marginLeft: rem(30),
        borderTopRightRadius: 'var(--mantine-radius-sm)',
        borderBottomRightRadius: 'var(--mantine-radius-sm)',
        fontWeight: 500,
        '&:hover': {
          backgroundColor: 'var(--mantine-color-gray-0)',
          color: 'var(--mantine-color-black)',
        },
      }}
      href={link.link}
      key={link.label}
    >
      {link.label}
    </Text>
  ));

  if (hasDirectLink) {
    return (
      <Text
        component={Link}
        style={{
          fontWeight: 500,
          display: 'block',
          textDecoration: 'none',
          padding: `${rem(8)} var(--mantine-spacing-sm)`,
          paddingLeft: 'var(--mantine-spacing-md)',
          marginLeft: 'var(--mantine-spacing-md)',
          fontSize: 'var(--mantine-font-size-sm)',
          color: 'var(--mantine-color-gray-7)',
          borderTopRightRadius: 'var(--mantine-radius-sm)',
          borderBottomRightRadius: 'var(--mantine-radius-sm)',
          '&:hover': {
            backgroundColor: 'var(--mantine-color-gray-0)',
            color: 'var(--mantine-color-black)',
          },
        }}
        href={link}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant="light" size={30}>
              <Icon style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <Box ml="md">{label}</Box>
          </Box>
        </Group>
      </Text>
    );
  }

  return (
    <>
      <UnstyledButton 
        onClick={() => setOpened((o) => !o)} 
        style={{
          fontWeight: 500,
          display: 'block',
          width: '100%',
          padding: `${rem(8)} var(--mantine-spacing-sm)`,
          paddingLeft: 'var(--mantine-spacing-md)',
          marginLeft: 'var(--mantine-spacing-md)',
          fontSize: 'var(--mantine-font-size-sm)',
          color: 'var(--mantine-color-gray-7)',
          borderTopRightRadius: 'var(--mantine-radius-sm)',
          borderBottomRightRadius: 'var(--mantine-radius-sm)',
          '&:hover': {
            backgroundColor: 'var(--mantine-color-gray-0)',
            color: 'var(--mantine-color-black)',
          },
        }}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant="light" size={30}>
              <Icon style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              stroke={1.5}
              style={{
                width: rem(16),
                height: rem(16),
                transform: opened ? 'rotate(90deg)' : 'none',
                transition: 'transform 200ms ease',
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
} 