"use client"

import { ScrollArea, rem } from '@mantine/core';
import {
  IconNotes,
  IconCalendarStats,
  IconGauge,
  IconPresentationAnalytics,
  IconFileAnalytics,
  IconAdjustments,
  IconLock,
} from '@tabler/icons-react';
import { LinksGroup } from './LinksGroup';

const mockdata = [
  { label: 'Attributes', icon: IconGauge, link: '/attributes' },
  {
    label: 'Market news',
    icon: IconNotes,
    initiallyOpened: true,
    links: [
      { label: 'Overview', link: '/' },
      { label: 'Forecasts', link: '/' },
      { label: 'Outlook', link: '/' },
      { label: 'Real time', link: '/' },
    ],
  },
  {
    label: 'Releases',
    icon: IconCalendarStats,
    links: [
      { label: 'Upcoming releases', link: '/' },
      { label: 'Previous releases', link: '/' },
      { label: 'Releases schedule', link: '/' },
    ],
  },
  { label: 'Analytics', icon: IconPresentationAnalytics, link: '/' },
  { label: 'Contracts', icon: IconFileAnalytics, link: '/' },
  { label: 'Settings', icon: IconAdjustments, link: '/' },
  {
    label: 'Security',
    icon: IconLock,
    links: [
      { label: 'Enable 2FA', link: '/' },
      { label: 'Change password', link: '/' },
      { label: 'Recovery codes', link: '/' },
    ],
  },
];

export function NavbarNested() {
  const links = mockdata.map((item) => <LinksGroup {...item} key={item.label} />);

  return (
    <nav style={{
      height: 'calc(100vh - 60px)',
      width: rem(300),
      padding: 'var(--mantine-spacing-md)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: `${rem(1)} solid var(--mantine-color-gray-3)`,
    }}>
      <ScrollArea style={{
        flex: 1,
        marginLeft: 'calc(var(--mantine-spacing-md) * -1)',
        marginRight: 'calc(var(--mantine-spacing-md) * -1)',
      }}>
        <div style={{
          paddingTop: 'var(--mantine-spacing-xl)',
          paddingBottom: 'var(--mantine-spacing-xl)',
        }}>
          {links}
        </div>
      </ScrollArea>
    </nav>
  );
} 