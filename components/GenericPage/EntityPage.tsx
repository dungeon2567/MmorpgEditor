"use client"

import { ZodTypeAny, z } from 'zod';
import { GenericPage } from './GenericPage';
import { useEntityStore, EntityType, getEntityId } from './storeAdapter';

interface EntityPageConfig<T extends ZodTypeAny> {
  // Entity configuration
  entityType: EntityType;
  schema: T;
  
  // Page configuration
  title: string;
  createButtonText?: string;
  
  // Optional configuration
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTitle?: boolean;
  
  // Optional data override (for static data like actors page)
  staticData?: z.infer<T>[];
  useStaticData?: boolean;
}

export function EntityPage<T extends ZodTypeAny>({
  entityType,
  schema,
  title,
  createButtonText,
  containerSize = 'xl',
  showTitle = true,
  staticData,
  useStaticData = false,
}: EntityPageConfig<T>) {
  const entityStore = useEntityStore<z.infer<T>>(entityType);
  
  // Use static data if provided and useStaticData is true, otherwise use store data
  const data = useStaticData && staticData ? staticData : entityStore.data;
  
  const handleSave = (item: z.infer<T>) => {
    const itemId = getEntityId(item, entityType);
    
    if (useStaticData) {
      // For static data, just log (as in the original actors page)
      console.log(`Saving ${entityType.slice(0, -1)}:`, item);
      return;
    }
    
    // Check if item exists
    const existingItem = entityStore.getById(itemId);
    
    if (existingItem) {
      // Update existing item
      entityStore.update(itemId, item);
    } else {
      // Add new item
      entityStore.add(item);
    }
  };

  const handleDelete = (item: z.infer<T>) => {
    const itemId = getEntityId(item, entityType);
    
    if (useStaticData) {
      // For static data, just log (as in the original actors page)
      console.log(`Deleting ${entityType.slice(0, -1)}:`, item);
      return;
    }
    
    entityStore.delete(itemId);
  };

  const handleCreate = (item: z.infer<T>) => {
    if (useStaticData) {
      // For static data, just log
      console.log(`Creating ${entityType.slice(0, -1)}:`, item);
      return;
    }
    
    entityStore.add(item);
  };

  return (
    <GenericPage
      schema={schema}
      title={title}
      createButtonText={createButtonText}
      data={data}
      onSave={handleSave}
      onDelete={handleDelete}
      onCreate={handleCreate}
      containerSize={containerSize}
      showTitle={showTitle}
    />
  );
} 