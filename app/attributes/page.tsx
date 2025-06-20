"use client"

import { useState } from 'react';
import { GenericTable } from '../../components/GenericTable/GenericTable';
import schemaData from './schema.json';

const initialData = [
  {
    id: 1,
    name: 'Strength',
    type: 'Physical',
    baseValue: 10,
    status: 'Active',
    maxValue: 100,
    description: 'Increases physical damage and carrying capacity',
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

  const handleEdit = (item: any) => {
    console.log('Edit item:', item);
    // Add edit logic here
  };

  const handleDelete = (item: any) => {
    console.log('Delete item:', item);
    setData(data.filter(d => d.id !== item.id));
  };

  const handleCreate = () => {
    console.log('Create new attribute');
    const newItem = {
      id: Math.max(...data.map(d => d.id)) + 1,
      name: 'New Attribute',
      type: 'Physical',
      baseValue: 10,
      status: 'Draft',
      maxValue: 100,
      description: 'Description for new attribute',
    };
    setData([...data, newItem]);
  };

  const handleSave = (item: any) => {
    console.log('Save item:', item);
    setData(data.map(d => d.id === item.id ? item : d));
  };

  return (
    <GenericTable
      schema={schemaData as any}
      data={data}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      onSave={handleSave}
    />
  );
} 