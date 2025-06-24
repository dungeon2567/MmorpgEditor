import { ZodTypeAny } from 'zod';
import { EntityType } from './storeAdapter';

// Import schemas
import { ActorSchema } from '../../app/actors/schema';
import { EffectSchema } from '../../app/effects/schema';
import { attributesSchema } from '../../app/attributes/schema';

// Import sample data for actors
import { Actor } from '../../app/actors/schema';

const sampleActors: Actor[] = [
  {
    '!Actor': true,
    Name: 'Sword Strike',
    Asset: 'Assets/Effects/Sword Strike',
    Lifetime: 3.5,
    Triggers: [
      {
        Time: 0.25,
        Actions: [
          {
            type: 'CircleQuery',
            Radius: 0.5,
            Target: 'Enemy',
            OnHit: [
              {
                type: 'Damage',
                Potency: '$Strength * 2 + 20',
              },
              {
                type: 'Effect',
                Name: 'Stunned',
                Duration: 0.75,
              },
            ],
          },
        ],
      },
      {
        Time: 1.25,
        Actions: [
          {
            type: 'CircleQuery',
            Radius: 1,
            Target: 'Enemy',
            OnHit: [
              {
                type: 'Damage',
                Potency: 'MAX(100, $Strength * 3)',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    '!Actor': true,
    Name: 'Fireball',
    Asset: 'Assets/Effects/Fireball',
    Lifetime: 2.0,
    Triggers: [
      {
        Time: 0.1,
        Actions: [
          {
            type: 'CircleQuery',
            Radius: 1.5,
            Target: 'Enemy',
            OnHit: [
              {
                type: 'Damage',
                Potency: '$Intelligence * 4 + 50',
              },
              {
                type: 'Effect',
                Name: 'Burning',
                Duration: 3.0,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    '!Actor': true,
    Name: 'Cone Attack',
    Asset: 'Assets/Effects/Cone Attack',
    Lifetime: 2.5,
    Triggers: [
      {
        Time: 0.3,
        Actions: [
          {
            type: 'ConeQuery',
            Radius: 3.0,
            Angle: 45,
            Target: 'Enemy',
            OnHit: [
              {
                type: 'Damage',
                Potency: 'CLAMP($Strength + $Dexterity, 50, 200)',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    '!Actor': true,
    Name: 'Heal Aura',
    Asset: 'Assets/Effects/Heal Aura',
    Lifetime: 5.0,
    Triggers: [
      {
        Time: 0.5,
        Actions: [
          {
            type: 'CircleQuery',
            Radius: 2.0,
            Target: 'Ally',
            OnHit: [
              {
                type: 'Effect',
                Name: 'Regeneration',
                Duration: 10.0,
              },
            ],
          },
        ],
      },
      {
        Time: 2.5,
        Actions: [
          {
            type: 'CircleQuery',
            Radius: 2.0,
            Target: 'Ally',
            OnHit: [
              {
                type: 'Effect',
                Name: 'Regeneration',
                Duration: 10.0,
              },
            ],
          },
        ],
      },
    ],
  },
];

export interface EntityConfig {
  entityType: EntityType;
  schema: ZodTypeAny;
  title: string;
  createButtonText: string;
  useStaticData?: boolean;
  staticData?: any[];
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTitle?: boolean;
}

export const entityConfigs: Record<string, EntityConfig> = {
  actors: {
    entityType: 'actors',
    schema: ActorSchema,
    title: 'Actors',
    createButtonText: 'Create New Actor',
    useStaticData: true,
    staticData: sampleActors,
  },
  effects: {
    entityType: 'effects',
    schema: EffectSchema,
    title: 'Effects',
    createButtonText: 'Create New Effect',
  },
  attributes: {
    entityType: 'attributes',
    schema: attributesSchema,
    title: 'Attributes',
    createButtonText: 'Create New Attribute',
  },
};

// Helper function to get entity config
export function getEntityConfig(entityKey: string): EntityConfig {
  const config = entityConfigs[entityKey];
  if (!config) {
    throw new Error(`Entity config not found for: ${entityKey}`);
  }
  return config;
} 