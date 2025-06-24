import '@mantine/core/styles.css';

import React from 'react';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import { AppShellLayout } from '../components/AppShellLayout/AppShellLayout';

export const metadata = {
  title: 'MMORPG Editor',
  description: 'A comprehensive editor for MMORPG game data and content management',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <AppShellLayout>
            {children}
          </AppShellLayout>
        </MantineProvider>
      </body>
    </html>
  );
}
