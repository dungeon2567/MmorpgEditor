"use client"

import { useState } from 'react';
import { GenericTable } from '../../components/GenericTable/GenericTable';
import { attributesSchema, Attributes } from './schema';

const initialData: Attributes[] = [
  {
    id: 1,
    name: 'Strength',
    type: 'Physical',
    baseValue: 10,
    status: 'Active',
    maxValue: 100,
    description: 'Increases physical damage and carrying capacity',
    modifiers: [
      { source: 'Amulet of Power', value: '5' },
      { source: 'Potion of Giant Strength', value: 'level * 2' },
    ],
    relatedAttribute: {
      id: 101,
      name: 'Base Strength',
      type: 'Physical',
      baseValue: 10,
      status: 'Active',
      maxValue: 10,
      description: 'The character\'s innate strength.'
    }
  },
  {
    id: 2,
    name: 'Dexterity',
    type: 'Physical',
    baseValue: 8,
    status: 'Active',
    maxValue: 100,
    description: 'Improves accuracy and evasion',
  },
  {
    id: 3,
    name: 'Intelligence',
    type: 'Mental',
    baseValue: 12,
    status: 'Active',
    maxValue: 100,
    description: 'Enhances magical power and spell efficiency',
  },
  {
    id: 4,
    name: 'Wisdom',
    type: 'Mental',
    baseValue: 9,
    status: 'Active',
    maxValue: 100,
    description: 'Increases mana regeneration and resistance',
  },
  {
    id: 5,
    name: 'Charisma',
    type: 'Social',
    baseValue: 7,
    status: 'Draft',
    maxValue: 100,
    description: 'Affects NPC interactions and party bonuses',
  },
];

export default function AttributesPage() {
  const [data, setData] = useState(initialData);

  const handleDelete = (item: Attributes) => {
    console.log('Delete item:', item);
    // This is now handled optimistically in the table, but you can still sync with your backend here.
  };

  const handleSave = (item: Attributes) => {
    console.log('Save item:', item);
     // This is now handled optimistically in the table, but you can still sync with your backend here.
  };

  return (
    <GenericTable
      zodSchema={attributesSchema}
      data={data}
      title="Attributes"
      createButtonText="Create New Attribute"
      onDelete={handleDelete}
      onSave={handleSave}
    />
  );
} 