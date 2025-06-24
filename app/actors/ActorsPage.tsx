"use client"

import { GenericTable } from '../../components/GenericTable/GenericTable';
import { ActorSchema, Actor } from './schema';

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
                Potency: 80,
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
                Potency: 120,
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
                Potency: 150,
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
                Potency: 100,
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

export default function ActorsPage() {
  const handleSave = (actor: Actor) => {
    console.log('Saving actor:', actor);
    // Here you would typically save to your backend
  };

  const handleDelete = (actor: Actor) => {
    console.log('Deleting actor:', actor);
    // Here you would typically delete from your backend
  };

  return (
    <GenericTable
      zodSchema={ActorSchema}
      data={sampleActors}
      title="Actors"
      createButtonText="Create New Actor"
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
} 