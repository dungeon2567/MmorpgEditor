"use client"

import { GenericTable } from '../../components/GenericTable/GenericTable';
import { attributesSchema, Attributes } from './schema';
import { useGameDataStore } from '../../lib/store';

export default function AttributesPage() {
  const { attributes, updateAttribute, deleteAttribute, addAttribute } = useGameDataStore();

  const handleDelete = (item: Attributes) => {
    console.log('Delete item:', item);
    deleteAttribute(item.Name);
  };

  const handleSave = (item: Attributes) => {
    console.log('Save item:', item);
    updateAttribute(item.Name, item);
  };

  return (
    <GenericTable
      zodSchema={attributesSchema}
      data={attributes}
      title="Attributes"
      createButtonText="Create New Attribute"
      onDelete={handleDelete}
      onSave={handleSave}
    />
  );
} 