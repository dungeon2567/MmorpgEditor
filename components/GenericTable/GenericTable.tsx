"use client"

import {
  Table,
  Title,
  Container,
  Group,
  Button,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Box,
  ScrollArea,
  Divider,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Paper,
  Grid,
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { FormulaEditor } from '../FormulaEditor/FormulaEditor';

interface ColumnSchema {
  key: string;
  label: string;
  type: 'text' | 'number' | 'badge' | 'actions';
  sortable?: boolean;
  searchable?: boolean;
  badgeColors?: Record<string, string>;
  maxWidth?: number;
  actions?: Array<{
    name: string;
    icon: string;
    color: string;
    variant: string;
  }>;
}

interface TableSchema {
  title: string;
  createButtonText: string;
  columns: ColumnSchema[];
}

interface GenericTableProps {
  schema: TableSchema;
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onCreate?: () => void;
  onSave?: (item: any) => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  IconEdit,
  IconTrash,
  IconPlus,
  IconX,
};

export function GenericTable({ schema, data, onEdit, onDelete, onCreate, onSave }: GenericTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setEditingItem({ ...item });
    setIsCreating(false);
  };

  const handleCreate = () => {
    // Create a new empty item with default values
    const newItem = {
      id: Date.now(), // Temporary ID
      name: '',
      type: 'Physical',
      baseValue: '',
      maxValue: '',
      status: 'Draft',
      description: '',
    };
    setSelectedItem(newItem);
    setEditingItem({ ...newItem });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (editingItem) {
      if (isCreating) {
        // Call onCreate for new items
        if (onCreate) {
          onCreate();
        }
      } else {
        // Call onSave for existing items
        if (onSave) {
          onSave(editingItem);
        }
      }
      setSelectedItem(editingItem);
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    if (isCreating) {
      // If creating, close the editor completely
      setSelectedItem(null);
      setEditingItem(null);
      setIsCreating(false);
    } else {
      // If editing, reset to original values
      setEditingItem(selectedItem ? { ...selectedItem } : null);
    }
  };

  const handleCloseEditor = () => {
    setSelectedItem(null);
    setEditingItem(null);
    setIsCreating(false);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const column = schema.columns.find(col => col.key === sortColumn);
    if (!column?.sortable) return 0;

    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    if (column.type === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    } else {
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? comparison : -comparison;
    }
  });

  const renderCell = (item: any, column: ColumnSchema) => {
    const value = item[column.key];

    switch (column.type) {
      case 'text':
        return (
          <Text 
            size="sm" 
            c="dimmed" 
            style={{ maxWidth: column.maxWidth }}
          >
            {value}
          </Text>
        );
      
      case 'number':
        return <Text>{value}</Text>;
      
      case 'badge':
        if (column.badgeColors && value in column.badgeColors) {
          return (
            <Badge variant="light" color={column.badgeColors[value]}>
              {value}
            </Badge>
          );
        }
        return <Text>{value}</Text>;
      
      case 'actions':
        return (
          <Group gap="xs">
            {column.actions?.map((action) => {
              const IconComponent = iconMap[action.icon];
              return (
                <ActionIcon
                  key={action.name}
                  variant={action.variant as any}
                  color={action.color}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (action.name === 'edit' && onEdit) {
                      onEdit(item);
                    } else if (action.name === 'delete' && onDelete) {
                      onDelete(item);
                    }
                  }}
                >
                  {IconComponent && <IconComponent size={16} />}
                </ActionIcon>
              );
            })}
          </Group>
        );
      
      default:
        return <Text>{value}</Text>;
    }
  };

  const renderHeaderCell = (column: ColumnSchema) => {
    if (column.type === 'actions') {
      return <Table.Th>{column.label}</Table.Th>;
    }

    return (
      <Table.Th
        style={{ cursor: column.sortable ? 'pointer' : 'default' }}
        onClick={() => column.sortable && handleSort(column.key)}
      >
        <Group gap="xs">
          <Text>{column.label}</Text>
          {column.sortable && sortColumn === column.key && (
            <Text size="xs" c="dimmed">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </Text>
          )}
        </Group>
      </Table.Th>
    );
  };

  const renderEditorField = (column: ColumnSchema) => {
    if (column.type === 'actions') return null;

    const value = editingItem?.[column.key];

    switch (column.type) {
      case 'text':
        if (column.key === 'description') {
          return (
            <Textarea
              key={column.key}
              value={value || ''}
              onChange={(e) => setEditingItem({ ...editingItem, [column.key]: e.target.value })}
              minRows={3}
              placeholder={`Enter ${column.label.toLowerCase()}`}
            />
          );
        }
        return (
          <TextInput
            key={column.key}
            value={value || ''}
            onChange={(e) => setEditingItem({ ...editingItem, [column.key]: e.target.value })}
            placeholder={`Enter ${column.label.toLowerCase()}`}
          />
        );
      
      case 'number':
        if (column.key === 'baseValue' || column.key === 'maxValue') {
          return (
            <FormulaEditor
              key={column.key}
              value={value || ''}
              onChange={(val) => setEditingItem({ ...editingItem, [column.key]: val })}
              variables={{
                level: { type: 'number', description: 'Character level', currentValue: 1 },
                strength: { type: 'number', description: 'Strength attribute', currentValue: 10 },
                dexterity: { type: 'number', description: 'Dexterity attribute', currentValue: 8 },
                intelligence: { type: 'number', description: 'Intelligence attribute', currentValue: 12 },
                wisdom: { type: 'number', description: 'Wisdom attribute', currentValue: 9 },
                charisma: { type: 'number', description: 'Charisma attribute', currentValue: 7 },
                baseValue: { type: 'number', description: 'Base value for this attribute', currentValue: 10 },
                maxValue: { type: 'number', description: 'Maximum value for this attribute', currentValue: 100 },
              }}
            />
          );
        }
        return (
          <NumberInput
            key={column.key}
            value={value || 0}
            onChange={(val) => setEditingItem({ ...editingItem, [column.key]: val })}
            placeholder={`Enter ${column.label.toLowerCase()}`}
          />
        );
      
      case 'badge':
        if (column.badgeColors) {
          const options = Object.keys(column.badgeColors).map(key => ({ value: key, label: key }));
          return (
            <Select
              key={column.key}
              value={value || ''}
              onChange={(val) => setEditingItem({ ...editingItem, [column.key]: val })}
              data={options}
              placeholder={`Select ${column.label.toLowerCase()}`}
            />
          );
        }
        return (
          <TextInput
            key={column.key}
            value={value || ''}
            onChange={(e) => setEditingItem({ ...editingItem, [column.key]: e.target.value })}
            placeholder={`Enter ${column.label.toLowerCase()}`}
          />
        );
      
      default:
        return (
          <TextInput
            key={column.key}
            value={value || ''}
            onChange={(e) => setEditingItem({ ...editingItem, [column.key]: e.target.value })}
            placeholder={`Enter ${column.label.toLowerCase()}`}
          />
        );
    }
  };

  const rows = sortedData.map((item, index) => (
    <Table.Tr 
      key={item.id || index}
      onClick={() => handleRowClick(item)}
      style={{ 
        cursor: 'pointer',
        backgroundColor: selectedItem?.id === item.id ? 'var(--mantine-color-blue-light)' : undefined
      }}
    >
      {schema.columns.map((column) => (
        <Table.Td key={column.key}>
          {renderCell(item, column)}
        </Table.Td>
      ))}
    </Table.Tr>
  ));

  return (
    <Box style={{ height: 'calc(100vh - 120px)', display: 'flex' }}>
      <Box style={{ flex: 1, overflow: 'hidden' }}>
        <Box p="xl" style={{ height: '100%' }}>
          <Stack gap="lg" style={{ height: '100%' }}>
            <Group justify="space-between">
              <Title order={1}>{schema.title}</Title>
              <Button 
                leftSection={<IconPlus size={16} />} 
                variant="filled"
                onClick={handleCreate}
              >
                {schema.createButtonText}
              </Button>
            </Group>

            <Box style={{ flex: 1, overflow: 'hidden' }}>
              <Table striped highlightOnHover style={{ height: '100%' }}>
                <Table.Thead>
                  <Table.Tr>
                    {schema.columns.map((column) => renderHeaderCell(column))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </Box>
          </Stack>
        </Box>
      </Box>

      {selectedItem && (
        <Paper 
          shadow="sm" 
          style={{ 
            width: 500,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box p="md" style={{ borderBottom: '1px solid' }}>
            <Group justify="space-between">
              <Title order={3}>
                {isCreating ? `Create New ${schema.title.slice(0, -1)}` : `Edit ${schema.title.slice(0, -1)}`}
              </Title>
              <ActionIcon variant="subtle" onClick={handleCloseEditor}>
                <IconX size={16} />
              </ActionIcon>
            </Group>
          </Box>
          
          <ScrollArea style={{ flex: 1 }}>
            <Box p="md">
              <Table>
                <Table.Tbody>
                  {schema.columns
                    .filter(col => col.type !== 'actions')
                    .map(column => (
                      <Table.Tr key={column.key}>
                        <Table.Td style={{ width: '30%', verticalAlign: 'top', paddingTop: '1rem' }}>
                          <Text size="sm" fw={500}>
                            {column.label}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ width: '70%', verticalAlign: 'top' }}>
                          {renderEditorField(column)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </Box>
          </ScrollArea>
          
          <Box p="md" style={{ borderTop: '1px solid' }}>
            <Group justify="flex-end">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {isCreating ? 'Create' : 'Save'}
              </Button>
            </Group>
          </Box>
        </Paper>
      )}
    </Box>
  );
} 