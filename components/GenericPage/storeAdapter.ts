import { useGameDataStore } from '../../lib/store';
import { Effect } from '../../app/effects/schema';
import { Actor } from '../../app/actors/schema';
import { Attributes } from '../../app/attributes/schema';

export type EntityType = 'effects' | 'actors' | 'attributes';

interface StoreAdapter<T> {
  data: T[];
  add: (item: T) => void;
  update: (id: string, item: T) => void;
  delete: (id: string) => void;
  getById: (id: string) => T | undefined;
}

// Generic hook to get store operations for any entity type
export function useEntityStore<T>(entityType: EntityType): StoreAdapter<T> {
  const store = useGameDataStore();

  switch (entityType) {
    case 'effects':
      return {
        data: store.effects as T[],
        add: store.addEffect as (item: T) => void,
        update: store.updateEffect as (id: string, item: T) => void,
        delete: store.deleteEffect,
        getById: store.getEffectByName as (id: string) => T | undefined,
      };
    
    case 'actors':
      return {
        data: store.actors as T[],
        add: store.addActor as (item: T) => void,
        update: store.updateActor as (id: string, item: T) => void,
        delete: store.deleteActor,
        getById: store.getActorByName as (id: string) => T | undefined,
      };
    
    case 'attributes':
      return {
        data: store.attributes as T[],
        add: store.addAttribute as (item: T) => void,
        update: store.updateAttribute as (id: string, item: T) => void,
        delete: store.deleteAttribute,
        getById: store.getAttributeByName as (id: string) => T | undefined,
      };
    
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }
}

// Helper function to get the ID field name for different entity types
export function getEntityIdField(entityType: EntityType): string {
  switch (entityType) {
    case 'effects':
    case 'actors':
    case 'attributes':
      return 'Name'; // All entities use 'Name' as the ID field
    default:
      return 'id';
  }
}

// Helper function to extract ID from an entity
export function getEntityId(entity: any, entityType: EntityType): string {
  const idField = getEntityIdField(entityType);
  return entity[idField] || entity.id || '';
} 