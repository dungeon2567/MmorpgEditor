"use client"

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import classes from './Navbar.module.css';

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
  const pathname = usePathname();
  
  // Check if any sub-links are active
  const hasActiveSubLink = hasLinks && links?.some(link => pathname === link.link);
  
  // Auto-open group if it contains an active link, or use initiallyOpened
  const [opened, setOpened] = useState(initiallyOpened || hasActiveSubLink || false);
  
  const items = (hasLinks ? links : []).map((link) => {
    const isActive = pathname === link.link;
    
    return (
      <Text
        component={Link}
        href={link.link}
        key={link.label}
        size="sm"
        fw={isActive ? 600 : 500}
        style={{
          display: 'block',
          textDecoration: 'none',
          padding: `${rem(4)} ${rem(8)}`,
          marginLeft: rem(24),
          borderRadius: 'var(--mantine-radius-sm)',
        }}
        className={`${classes.navbarLink} ${classes.navbarSubLink} ${isActive ? classes.navbarSubLinkActive : ''}`}
      >
        {link.label}
      </Text>
    );
  });

  if (hasDirectLink) {
    const isActive = pathname === link;
    
    return (
      <Text
        component={Link}
        href={link}
        fw={isActive ? 600 : 500}
        size="sm"
        style={{
          display: 'block',
          textDecoration: 'none',
          padding: `${rem(6)} ${rem(8)}`,
          paddingLeft: rem(8),
          marginLeft: rem(8),
          borderRadius: 'var(--mantine-radius-sm)',
        }}
        className={`${classes.navbarLink} ${isActive ? classes.navbarLinkActive : ''}`}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant="light" size={24}>
              <Icon style={{ width: rem(14), height: rem(14) }} />
            </ThemeIcon>
            <Box ml="sm">{label}</Box>
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
          fontWeight: hasActiveSubLink ? 600 : 500,
          display: 'block',
          width: '100%',
          padding: `${rem(6)} ${rem(8)}`,
          paddingLeft: rem(8),
          marginLeft: rem(8),
          borderRadius: 'var(--mantine-radius-sm)',
        }}
        className={`${classes.navbarGroupHeader} ${hasActiveSubLink ? classes.navbarLinkActive : ''}`}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon variant="light" size={24}>
              <Icon style={{ width: rem(14), height: rem(14) }} />
            </ThemeIcon>
            <Box ml="sm">{label}</Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              stroke={1.5}
              style={{
                width: rem(14),
                height: rem(14),
                transform: opened ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
} 