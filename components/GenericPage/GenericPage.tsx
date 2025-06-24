"use client"

import { Container, Title, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { GenericTable, GenericTableRef } from '../GenericTable/GenericTable';
import { ZodTypeAny, z } from 'zod';
import { useRef } from 'react';

interface GenericPageConfig<T extends ZodTypeAny> {
  // Schema and type configuration
  schema: T;
  
  // Page configuration
  title: string;
  createButtonText?: string;
  
  // Data and operations
  data: z.infer<T>[];
  onSave?: (item: z.infer<T>) => void;
  onDelete?: (item: z.infer<T>) => void;
  onCreate?: (item: z.infer<T>) => void;
  
  // Optional container configuration
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTitle?: boolean;
}

export function GenericPage<T extends ZodTypeAny>({
  schema,
  title,
  createButtonText = 'Create New',
  data,
  onSave,
  onDelete,
  onCreate,
  containerSize = 'xl',
  showTitle = true,
}: GenericPageConfig<T>) {
  
  const tableRef = useRef<GenericTableRef>(null);
  
  const handleCreate = () => {
    if (tableRef.current) {
      tableRef.current.triggerCreate();
    }
  };
  
  return (
    <Container size={containerSize} p="md">
      {showTitle && (
        <Group justify="space-between" align="center" mb="lg">
          <Title order={1}>{title}</Title>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={handleCreate}
          >
            {createButtonText}
          </Button>
        </Group>
      )}
      <GenericTable
        ref={tableRef}
        zodSchema={schema}
        data={data}
        title={title}
        createButtonText={createButtonText}
        onSave={onSave}
        onDelete={onDelete}
        onCreate={onCreate}
      />
    </Container>
  );
} 