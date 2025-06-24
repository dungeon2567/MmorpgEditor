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
  JsonInput,
  Switch,
  Accordion,
  Collapse,
  useMantineTheme,
  useMantineColorScheme,
  MantineTheme,
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconX, IconDeviceFloppy, IconArrowBackUp, IconChevronDown, IconChevronRight, IconGripVertical } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { z, ZodTypeAny, ZodObject, ZodString, ZodNumber, ZodEnum, ZodBoolean, ZodArray, ZodAny, ZodLazy, ZodOptional, ZodNullable, ZodUnion, ZodDiscriminatedUnion } from 'zod';
import { FormulaEditor } from '../FormulaEditor/FormulaEditor';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useGameDataStore } from '../../lib/store';

// Helper to get keys from a Zod schema
const getShape = (schema: ZodTypeAny): Record<string, ZodTypeAny> | null => {
  if (schema instanceof ZodObject) {
    return schema.shape;
  }
  if (schema instanceof z.ZodLazy) {
    return getShape(schema.schema);
  }
  return null;
}

// Helper to determine the actual schema for a union type based on data
const getUnionSchema = (unionSchema: ZodUnion<any> | ZodDiscriminatedUnion<any, any>, data: any): ZodTypeAny | null => {
  if (!unionSchema || !data) return null;
  
  // Handle discriminated unions
  if (unionSchema instanceof ZodDiscriminatedUnion) {
    const discriminator = unionSchema.discriminator;
    const discriminatorValue = data[discriminator];
    
    if (discriminatorValue) {
      // Find the option that matches the discriminator value
      for (const option of unionSchema.options) {
        if (option instanceof ZodObject) {
          const shape = option.shape;
          const discriminatorSchema = shape[discriminator];
          
          // Check if this option matches the discriminator value
          if (discriminatorSchema && 
              (discriminatorSchema._def?.value === discriminatorValue ||
               (discriminatorSchema instanceof z.ZodLiteral && discriminatorSchema.value === discriminatorValue))) {
            return option;
          }
        }
      }
    }
    
    // Fallback to first option
    return unionSchema.options[0] || null;
  }
  
  // Handle regular unions
  if (unionSchema instanceof ZodUnion) {
    // Try to find which union option matches the data
    for (const option of unionSchema.options) {
      try {
        option.parse(data);
        return option;
      } catch (e) {
        // This option doesn't match, try the next one
      }
    }
    
    // If no option matches, return the first one as fallback
    return unionSchema.options[0] || null;
  }
  
  return null;
}



interface BuildEditorRowsParams {
    schema: ZodTypeAny;
    data: any;
    onChange: (data: any) => void;
    depth: number;
    pathPrefix: string;
    expanded: Record<string, boolean>;
    toggleExpand: (key: string) => void;
    theme: MantineTheme;
    colorScheme: 'light' | 'dark';
    listeners?: ReturnType<typeof useSortable>['listeners'];
    effectNames?: string[];
}

function buildEditorRows({
    schema,
    data,
    onChange,
    depth = 0,
    pathPrefix = '',
    expanded,
    toggleExpand,
    theme,
    colorScheme,
    effectNames = [],
}: BuildEditorRowsParams): React.ReactNode[] {
    const rows: React.ReactNode[] = [];
    const levelColors = [
        theme.colors.blue[5],
        theme.colors.green[5],
        theme.colors.violet[5],
        theme.colors.orange[5],
        theme.colors.red[5],
    ];
    const borderColor = depth > 0 ? levelColors[(depth - 1) % levelColors.length] : 'transparent';

    if (depth > 10) { // Safety break
        return [<Table.Tr key="max-depth"><Table.Td colSpan={2}>Max depth reached</Table.Td></Table.Tr>];
    }
    
    const shape = getShape(schema);
    if (!shape) {
        return [];
    }

    Object.entries(shape).forEach(([key, fieldSchema]) => {
        const path = pathPrefix ? `${pathPrefix}.${key}` : key;
        const value = data?.[key];
        const handleChange = (newValue: any) => {
            onChange({ ...data, [key]: newValue });
        };
        
        let currentSchema = fieldSchema;
        if (currentSchema instanceof z.ZodOptional || currentSchema instanceof z.ZodNullable) {
            currentSchema = currentSchema.unwrap();
        }

        let label = fieldSchema.description || key;
        let specialType: string | undefined;

        if (fieldSchema.description) {
            try {
                const meta = JSON.parse(fieldSchema.description);
                if (meta.specialType) {
                    specialType = meta.specialType;
                    label = meta.description || key;
                }
            } catch (e) { /* Not a JSON description */ }
        }
        
        // Skip hidden fields
        if (specialType === 'hidden') {
            return;
        }
        
        const isComplexObject = currentSchema instanceof ZodLazy || currentSchema instanceof ZodObject;
        const isComplexArray = currentSchema instanceof ZodArray && (
            currentSchema.element instanceof ZodObject || 
            currentSchema.element instanceof ZodLazy ||
            currentSchema.element instanceof ZodUnion ||
            currentSchema.element instanceof ZodDiscriminatedUnion
        );
        const isExpanded = expanded[path] || false;

        const tdStyle = {
            paddingLeft: `calc(var(--mantine-spacing-md) * ${depth + 1})`,
            verticalAlign: 'top',
            borderLeft: depth > 0 ? `3px solid ${borderColor}` : 'none',
        };

        if (isComplexObject) {
            const nestedSchema = currentSchema instanceof ZodLazy ? currentSchema.schema : currentSchema;
            const nestedShape = getShape(nestedSchema);
            const memberCount = nestedShape ? Object.keys(nestedShape).length : 0;

            rows.push(
                <Table.Tr key={path}>
                    <Table.Td style={tdStyle}>
                        <Text size="sm" fw={500}>{label}</Text>
                    </Table.Td>
                    <Table.Td>
                         <Group justify="flex-end" gap="xs">
                            <Text size="xs" c="dimmed">{memberCount} members</Text>
                            <ActionIcon size="sm" variant="subtle" onClick={() => toggleExpand(path)}>
                                {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                            </ActionIcon>
                        </Group>
                    </Table.Td>
                </Table.Tr>
            );
            if (isExpanded) {
                const nestedRows = buildEditorRows({ schema: nestedSchema, data: value || {}, onChange: handleChange, depth: depth + 1, pathPrefix: path, expanded, toggleExpand, theme, colorScheme, effectNames });
                rows.push(...nestedRows);
            }
        } else if (isComplexArray) {
            const arrayValue = value || [];
            const elementType = (currentSchema as ZodArray<any>).element;
            const handleAddItem = () => {
                let newItem: any = {};
                
                // If the element type is a discriminated union, create a default item based on the first option
                if (elementType instanceof ZodDiscriminatedUnion && elementType.options.length > 0) {
                    const firstOption = elementType.options[0];
                    const discriminator = elementType.discriminator;
                    
                    if (firstOption instanceof ZodObject) {
                        const shape = firstOption.shape;
                        const typeValue = shape[discriminator]?._def?.value;
                        
                        if (typeValue) {
                            newItem[discriminator] = typeValue;
                            
                            // Add default values for other fields
                            Object.entries(shape).forEach(([key, fieldSchema]: [string, any]) => {
                                if (key !== discriminator) {
                                    if (fieldSchema instanceof ZodString) {
                                        newItem[key] = '';
                                    } else if (fieldSchema instanceof ZodNumber) {
                                        newItem[key] = 0;
                                    } else if (fieldSchema instanceof ZodArray) {
                                        newItem[key] = [];
                                    } else if (fieldSchema instanceof ZodBoolean) {
                                        newItem[key] = false;
                                    }
                                }
                            });
                        }
                    }
                }
                // If the element type is a regular union, create a default item based on the first option
                else if (elementType instanceof ZodUnion && elementType.options.length > 0) {
                    const firstOption = elementType.options[0];
                    if (firstOption instanceof ZodObject) {
                        const shape = firstOption.shape;
                        // Create a default object with the required fields
                        Object.entries(shape).forEach(([key, fieldSchema]: [string, any]) => {
                            if (key.startsWith('!')) {
                                newItem[key] = true;
                            }
                        });
                    }
                }
                
                handleChange([...arrayValue, newItem]);
            };
            const handleClearArray = () => handleChange([]);

            rows.push(
                <Table.Tr key={path}>
                    <Table.Td style={tdStyle}>
                       <Text size="sm" fw={500}>{label}</Text>
                    </Table.Td>
                    <Table.Td>
                        <Group justify="flex-end" gap="xs">
                            <Text size="xs" c="dimmed">{arrayValue.length} Array elements</Text>
                            <ActionIcon size="sm" variant="subtle" onClick={handleAddItem}><IconPlus size={16} /></ActionIcon>
                            <ActionIcon size="sm" variant="subtle" onClick={handleClearArray}><IconTrash size={16} /></ActionIcon>
                            <ActionIcon size="sm" variant="subtle" onClick={() => toggleExpand(path)}>
                                {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                            </ActionIcon>
                        </Group>
                    </Table.Td>
                </Table.Tr>
            );
            
            if (isExpanded) {
                arrayValue.forEach((item: any, index: number) => {
                    const itemPath = `${path}[${index}]`;
                    const isItemExpanded = expanded[itemPath] || false;
                    
                    const handleItemChange = (newItem: any) => {
                        const newArray = [...arrayValue];
                        newArray[index] = newItem;
                        handleChange(newArray);
                    };
                    
                    const handleItemDelete = () => {
                        const newArray = arrayValue.filter((_: any, i: number) => i !== index);
                        handleChange(newArray);
                    };

                    // Check if this is a discriminated union and create type selector
                    let typeSelector = null;
                    if (elementType instanceof ZodDiscriminatedUnion) {
                        const discriminator = elementType.discriminator;
                        const currentType = item[discriminator];
                        const typeOptions = elementType.options.map((option: any) => {
                            if (option instanceof ZodObject) {
                                const shape = option.shape;
                                const typeValue = shape[discriminator]?._def?.value;
                                return { value: typeValue, label: typeValue };
                            }
                            return null;
                        }).filter(Boolean);

                        const handleTypeChange = (newType: string | null) => {
                            if (!newType) return;
                            
                            // Find the schema for the new type
                            const newSchema = elementType.options.find((option: any) => {
                                if (option instanceof ZodObject) {
                                    const shape = option.shape;
                                    const discriminatorSchema = shape[discriminator];
                                    return discriminatorSchema?._def?.value === newType || 
                                           (discriminatorSchema instanceof z.ZodLiteral && discriminatorSchema.value === newType);
                                }
                                return false;
                            });

                            if (newSchema && newSchema instanceof ZodObject) {
                                // Create a new item with the new type, preserving existing values where possible
                                const newItem: any = { [discriminator]: newType };
                                
                                // Add default values for required fields, but preserve existing values if they exist
                                Object.entries(newSchema.shape).forEach(([key, fieldSchema]: [string, any]) => {
                                    if (key !== discriminator) {
                                        // Try to preserve existing value first
                                        if (item[key] !== undefined) {
                                            newItem[key] = item[key];
                                        } else {
                                            // Set default values based on field type
                                            if (fieldSchema instanceof ZodString) {
                                                newItem[key] = '';
                                            } else if (fieldSchema instanceof ZodNumber) {
                                                newItem[key] = 0;
                                            } else if (fieldSchema instanceof ZodArray) {
                                                newItem[key] = [];
                                            } else if (fieldSchema instanceof ZodBoolean) {
                                                newItem[key] = false;
                                            }
                                        }
                                    }
                                });
                                
                                handleItemChange(newItem);
                            }
                        };

                        typeSelector = (
                            <Select
                                data={typeOptions}
                                value={currentType}
                                onChange={handleTypeChange}
                                size="xs"
                                w={120}
                                placeholder="Select type"
                                allowDeselect={false}
                            />
                        );
                    }

                    rows.push(
                        <Table.Tr key={itemPath}>
                            <Table.Td style={{ ...tdStyle, paddingLeft: `calc(var(--mantine-spacing-md) * ${depth + 2})` }}>
                                <Group gap="xs">
                                    <IconGripVertical size={16} style={{ color: theme.colors.gray[5] }} />
                                    <Text size="sm" fw={500}>Item {index + 1}</Text>
                                </Group>
                            </Table.Td>
                            <Table.Td>
                                <Group justify="flex-end" gap="xs">
                                    {typeSelector}
                                    <ActionIcon size="sm" variant="subtle" onClick={handleItemDelete}>
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                    <ActionIcon size="sm" variant="subtle" onClick={() => toggleExpand(itemPath)}>
                                        {isItemExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                                    </ActionIcon>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    );
                    
                    if (isItemExpanded) {
                        let itemSchema = elementType;
                        
                        // If the element type is a discriminated union, determine the actual schema for this item
                        if (elementType instanceof ZodDiscriminatedUnion) {
                            const actualSchema = getUnionSchema(elementType, item);
                            if (actualSchema) {
                                itemSchema = actualSchema;
                            } else {
                                // Fallback: if we can't determine the schema, use the first option
                                itemSchema = elementType.options[0] || elementType;
                            }
                        }
                        // If the element type is a regular union, determine the actual schema for this item
                        else if (elementType instanceof ZodUnion) {
                            const actualSchema = getUnionSchema(elementType, item);
                            if (actualSchema) {
                                itemSchema = actualSchema;
                            } else {
                                // Fallback: if we can't determine the schema, use the first option
                                itemSchema = elementType.options[0] || elementType;
                            }
                        }
                        
                        // Only render nested rows if we have a valid schema that can be expanded
                        if (getShape(itemSchema)) {
                            const nestedRows = buildEditorRows({ schema: itemSchema, data: item, onChange: handleItemChange, depth: depth + 2, pathPrefix: itemPath, expanded, toggleExpand, theme, colorScheme, effectNames });
                            rows.push(...nestedRows);
                        }
                    }
                });
            }
        } else {
            let editor;
            if (currentSchema instanceof ZodString) {
                if (specialType === 'formula') {
                    editor = <FormulaEditor value={value || ''} onChange={handleChange} />;
                } else if (specialType === 'effectSelect') {
                    editor = <Select 
                        data={effectNames} 
                        value={value || ''} 
                        onChange={handleChange} 
                        placeholder="Select an effect"
                        searchable
                        allowDeselect={false}
                    />;
                } else {
                    editor = <TextInput value={value || ''} onChange={(e) => handleChange(e.currentTarget.value)} />;
                }
            } else if (currentSchema instanceof ZodNumber) {
                editor = <NumberInput value={value ?? null} onChange={(val) => handleChange(val)} />;
            } else if (currentSchema instanceof ZodEnum) {
                editor = <Select data={currentSchema.options as any} value={value} onChange={handleChange} allowDeselect={false} />;
            } else if (currentSchema instanceof ZodBoolean) {
                editor = <Switch checked={value || false} onChange={(e) => handleChange(e.currentTarget.checked)} />;
            } else if (currentSchema instanceof ZodArray) {
                editor = <JsonInput
                    value={value ? JSON.stringify(value, null, 2) : '[]'}
                    onChange={(val) => { try { handleChange(JSON.parse(val)); } catch (e) {}}}
                    formatOnBlur
                    autosize
                    minRows={2}
                />;
            } else {
                editor = <Text c="dimmed" fs="italic">Unknown type</Text>
            }
            rows.push(
                <Table.Tr key={path}>
                    <Table.Td style={tdStyle}>
                        <Text size="sm">{label}</Text>
                    </Table.Td>
                    <Table.Td>
                        {editor}
                    </Table.Td>
                </Table.Tr>
            );
        }
    });

    return rows;
}

const getByPath = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const setByPath = (obj: any, path: string, value: any) => {
    const newObj = { ...obj };
    const keys = path.split('.');
    let current = newObj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = { ...current[key] };
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
    return newObj;
};

function ObjectEditor({ schema, data, onChange }: { schema: ZodTypeAny, data: any, onChange: (data: any) => void }) {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
    }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const activeId = active.id.toString();
            const overId = over.id.toString();
            
            const activePath = activeId.substring(0, activeId.lastIndexOf('.'));
            const overPath = overId.substring(0, overId.lastIndexOf('.'));

            if (activePath === overPath) {
                const array = getByPath(data, activePath);
                if (Array.isArray(array)) {
                    const oldIndex = parseInt(activeId.substring(activeId.lastIndexOf('.') + 1), 10);
                    const newIndex = parseInt(overId.substring(overId.lastIndexOf('.') + 1), 10);
                    
                    if (!isNaN(oldIndex) && !isNaN(newIndex)) {
                        const newArray = arrayMove(array, oldIndex, newIndex);
                        const newData = setByPath(data, activePath, newArray);
                        onChange(newData);
                    }
                }
            }
        }
    };

    const toggleExpand = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

    if (!getShape(schema)) {
        return <Text p="md">No fields available for this object.</Text>;
    }

    const finalColorScheme = colorScheme === 'auto' ? 'light' : colorScheme;
    const { getAllEffectNames } = useGameDataStore();
    const effectNames = getAllEffectNames();
    const rows = buildEditorRows({ schema, data, onChange, expanded, toggleExpand, theme, colorScheme: finalColorScheme, depth: 0, pathPrefix: '', effectNames });

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <Table withColumnBorders withRowBorders verticalSpacing="xs">
                <Table.Tbody>
                    {rows}
                </Table.Tbody>
            </Table>
        </DndContext>
    );
}

interface GenericTableProps<T extends ZodTypeAny> {
  zodSchema: T;
  data: z.infer<T>[];
  title: string;
  createButtonText?: string;
  onEdit?: (item: z.infer<T>) => void;
  onDelete?: (item: z.infer<T>) => void;
  onCreate?: (item: z.infer<T>) => void;
  onSave?: (item: z.infer<T>) => void;
}

export function GenericTable<T extends ZodTypeAny>({
  zodSchema,
  data,
  title,
  createButtonText = 'Create New',
  onDelete,
  onSave
}: GenericTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedItem, setSelectedItem] = useState<z.infer<T> | null>(null);
  const [editingItem, setEditingItem] = useState<z.infer<T> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tableData, setTableData] = useState(data);

  const columns = useMemo(() => {
    const shape = getShape(zodSchema);
    if (!shape) return [];
    
    const visibleColumns = Object.keys(shape).filter(key => {
        const fieldSchema = shape[key];
        let currentSchema = fieldSchema;
        if (currentSchema instanceof z.ZodOptional || currentSchema instanceof z.ZodNullable) {
            currentSchema = currentSchema.unwrap();
        }
        return !(currentSchema instanceof ZodObject || currentSchema instanceof ZodArray || currentSchema instanceof ZodLazy);
    });

    return [
        ...visibleColumns.map(key => {
            const fieldSchema = (shape as any)[key];
            let label = fieldSchema.description || key;
            if (fieldSchema.description) {
                try {
                    const meta = JSON.parse(fieldSchema.description);
                    if (meta.description) {
                        label = meta.description;
                    }
                } catch (e) { /* Not JSON */ }
            }
            return { key, label, sortable: true };
        }),
        { key: 'actions', label: 'Actions', sortable: false }
    ];
  }, [zodSchema]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (item: z.infer<T>) => {
    setSelectedItem(item);
    setEditingItem(JSON.parse(JSON.stringify(item))); // Deep copy
    setIsCreating(false);
  };

  const handleCreate = () => {
    // Create a new empty item based on the schema
    const newId = Math.max(0, ...tableData.map((d: any) => d.id || 0)) + 1;
    const newItem = { id: newId }; // Add other default values based on schema if needed.
    setSelectedItem(newItem as any);
    setEditingItem(newItem as any);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (editingItem) {
        if (onSave) {
            onSave(editingItem);
        }
        if (isCreating) {
            setTableData([...tableData, editingItem]);
        } else {
            setTableData(tableData.map((d: any) => (d.id === (editingItem as any).id ? editingItem : d)));
        }
        handleCloseEditor();
    }
  };

  const handleCancel = () => {
    handleCloseEditor();
  };

  const handleCloseEditor = () => {
    setSelectedItem(null);
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleDeleteClick = (item: z.infer<T>) => {
    if (onDelete) {
        onDelete(item);
        setTableData(tableData.filter((d: any) => d.id !== (item as any).id));
    }
  }

  const sortedData = useMemo(() => [...tableData].sort((a, b) => {
    if (!sortColumn) return 0;

    const aVal = (a as any)[sortColumn];
    const bVal = (b as any)[sortColumn];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    } 
    const comparison = String(aVal ?? '').localeCompare(String(bVal ?? ''));
    return sortDirection === 'asc' ? comparison : -comparison;
  }), [tableData, sortColumn, sortDirection]);

  const renderCell = (item: any, columnKey: string) => {
    const value = item[columnKey];
    let fieldSchema = (getShape(zodSchema) as any)?.[columnKey];
    if (fieldSchema instanceof z.ZodOptional || fieldSchema instanceof z.ZodNullable) {
        fieldSchema = fieldSchema.unwrap();
    }

    if (fieldSchema instanceof ZodEnum) {
        return <Badge>{value}</Badge>
    }

    if (value instanceof Object) {
        return <Text size="sm" c="dimmed">[Object]</Text>
    }

    return (
      <Text size="sm" c="dimmed">
        {String(value ?? '')}
      </Text>
    );
  };

  return (
    <Grid>
        <Grid.Col span="auto">
            <Group justify="space-between" align="center" mb="md">
                <Title order={2}>{title}</Title>
                <Button onClick={handleCreate} leftSection={<IconPlus size={16} />}>
                  {createButtonText}
                </Button>
            </Group>
            <Paper withBorder radius="md">
                <ScrollArea>
                  <Table miw={800} verticalSpacing="sm" highlightOnHover withColumnBorders withRowBorders>
                    <Table.Thead>
                      <Table.Tr>
                        {columns.map((column) => (
                          <Table.Th
                            key={column.key}
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
                        ))}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {sortedData.map((item: any) => (
                        <Table.Tr key={item.id} onClick={() => handleRowClick(item)} style={{ cursor: 'pointer' }}>
                          {columns.map((column) => (
                            <Table.Td key={column.key}>
                              {column.key === 'actions' ? (
                                <Group gap="xs">
                                  <ActionIcon variant="subtle" color="blue" size="sm" onClick={(e) => { e.stopPropagation(); handleRowClick(item); }}>
                                    <IconEdit size={16} />
                                  </ActionIcon>
                                  <ActionIcon variant="subtle" color="red" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}>
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Group>
                              ) : (
                                renderCell(item, column.key)
                              )}
                            </Table.Td>
                          ))}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
            </Paper>
        </Grid.Col>
        
        {selectedItem && editingItem && (
            <Grid.Col span={4}>
                 <Paper withBorder p="md" radius="md" style={{ minWidth: 600 }}>
                  <Group justify="space-between" align="center" mb="md">
                      <Title order={4}>{isCreating ? 'Create Item' : `Edit ${(editingItem as any).name || 'Item'}`}</Title>
                      <ActionIcon onClick={handleCloseEditor} variant="subtle" color="red">
                        <IconX size={20} />
                      </ActionIcon>
                  </Group>
                  <Divider mb="md" />
                  <ScrollArea style={{ flex: 1 }}>
                    <ObjectEditor
                      schema={zodSchema}
                      data={editingItem}
                      onChange={setEditingItem}
                    />
                  </ScrollArea>
                  <Group justify="flex-end" mt="md">
                    <Button onClick={handleCancel} variant="default">Cancel</Button>
                    <Button onClick={handleSave} leftSection={<IconDeviceFloppy size={16}/>}>{isCreating ? 'Create' : 'Save'}</Button>
                  </Group>
                </Paper>
            </Grid.Col>
        )}
    </Grid>
  );
} 