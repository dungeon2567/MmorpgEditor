"use client"

import { ScrollArea } from '@mantine/core';
import {
  IconGauge,
  IconFingerprint,
  IconActivity,
  IconChartPie3,
  IconPresentationAnalytics,
  IconFileText,
  IconAdjustments,
  IconLock,
} from '@tabler/icons-react';
import { LinksGroup } from './LinksGroup';
import classes from './Navbar.module.css';

const mockdata = [
  { label: 'Dashboard', icon: IconGauge, link: '/' },
  {
    label: 'Game Data',
    icon: IconFingerprint,
    links: [
      { label: 'Actors', link: '/actors' },
      { label: 'Attributes', link: '/attributes' },
      { label: 'Effects', link: '/effects' },
      { label: 'Items', link: '/items' },
      { label: 'Skills', link: '/skills' },
      { label: 'Classes', link: '/classes' },
    ],
  },
  {
    label: 'Content',
    icon: IconActivity,
    links: [
      { label: 'Quests', link: '/quests' },
      { label: 'NPCs', link: '/npcs' },
      { label: 'Locations', link: '/locations' },
      { label: 'Dialogue', link: '/dialogue' },
    ],
  },
  { label: 'Analytics', icon: IconChartPie3, link: '/analytics' },
  { label: 'Reports', icon: IconPresentationAnalytics, link: '/reports' },
  { label: 'Documentation', icon: IconFileText, link: '/docs' },
  { label: 'Settings', icon: IconAdjustments, link: '/settings' },
  { label: 'Security', icon: IconLock, link: '/security' },
];

export function Navbar() {
  const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);

  return (
    <ScrollArea className={classes.navbar}>
      <div style={{ padding: 'var(--mantine-spacing-sm)' }}>
        {links}
      </div>
    </ScrollArea>
  );
} 