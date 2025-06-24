"use client"

import { usePathname } from 'next/navigation';
import { ConfigurableEntityPage } from './ConfigurableEntityPage';

/**
 * Automatically detects the entity type from the current route
 * and renders the appropriate entity page.
 */
export function AutoEntityPage() {
  const pathname = usePathname();
  
  // Extract entity key from pathname (e.g., '/actors' -> 'actors')
  const entityKey = pathname.split('/').filter(Boolean).pop() || '';
  
  return <ConfigurableEntityPage entityKey={entityKey} />;
} 