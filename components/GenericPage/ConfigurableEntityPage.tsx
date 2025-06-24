"use client"

import { EntityPage } from './EntityPage';
import { getEntityConfig } from './entityConfigs';

interface ConfigurableEntityPageProps {
  entityKey: string;
}

/**
 * A simplified component for creating entity pages based on configuration.
 * Just pass the entity key and everything else is handled automatically.
 */
export function ConfigurableEntityPage({ entityKey }: ConfigurableEntityPageProps) {
  const config = getEntityConfig(entityKey);
  
  return (
    <EntityPage
      entityType={config.entityType}
      schema={config.schema}
      title={config.title}
      createButtonText={config.createButtonText}
      staticData={config.staticData}
      useStaticData={config.useStaticData}
      containerSize={config.containerSize}
      showTitle={config.showTitle}
    />
  );
} 