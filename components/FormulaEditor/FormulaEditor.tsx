"use client"

import { useState, useRef, useEffect } from 'react';
import {
  TextInput,
  Box,
  Text,
  Alert,
  Code,
  Group,
  Badge,
  Menu,
  Stack,
  ScrollArea,
} from '@mantine/core';
import { IconFunction, IconVariable, IconCheck, IconX } from '@tabler/icons-react';

interface FormulaEditorProps {
  value: string;
  onChange: (value: string) => void;
  availableAttributes?: string[]; // List of available attribute names
}

interface FunctionDefinition {
  name: string;
  description: string;
  syntax: string;
  examples: string[];
}

interface VariableDefinition {
  name: string;
  type: string;
  description: string;
  currentValue?: any;
}

interface AutocompleteItem {
  value: string;
  label: string;
  type: 'function' | 'variable';
  description: string;
  syntax?: string;
  icon: any;
  color: 'blue' | 'green';
}

const BUILTIN_FUNCTIONS: FunctionDefinition[] = [
  {
    name: 'MIN',
    description: 'Returns the minimum of two or more values',
    syntax: 'MIN(a, b, ...)',
    examples: ['MIN(10, 5)', 'MIN($Level, 100)']
  },
  {
    name: 'MAX',
    description: 'Returns the maximum of two or more values',
    syntax: 'MAX(a, b, ...)',
    examples: ['MAX(0, $Damage)', 'MAX($Strength, $Dexterity)']
  },
  {
    name: 'FLOOR',
    description: 'Rounds down to the nearest integer',
    syntax: 'FLOOR(value)',
    examples: ['FLOOR(10.7)', 'FLOOR($Damage / 2)']
  },
  {
    name: 'CEIL',
    description: 'Rounds up to the nearest integer',
    syntax: 'CEIL(value)',
    examples: ['CEIL(10.3)', 'CEIL($Health / 10)']
  },
  {
    name: 'ROUND',
    description: 'Rounds to the nearest integer',
    syntax: 'ROUND(value)',
    examples: ['ROUND(10.5)', 'ROUND($Damage * 1.5)']
  },
  {
    name: 'ABS',
    description: 'Returns the absolute value',
    syntax: 'ABS(value)',
    examples: ['ABS(-10)', 'ABS($Damage - $Armor)']
  },
  {
    name: 'SQRT',
    description: 'Returns the square root',
    syntax: 'SQRT(value)',
    examples: ['SQRT(16)', 'SQRT($Strength * 2)']
  },
  {
    name: 'POW',
    description: 'Raises a number to a power',
    syntax: 'POW(base, exponent)',
    examples: ['POW(2, 3)', 'POW($Level, 1.5)']
  },
  {
    name: 'CLAMP',
    description: 'Clamps a value between min and max',
    syntax: 'CLAMP(value, min, max)',
    examples: ['CLAMP($Damage, 0, 100)', 'CLAMP($Level, 1, 50)']
  },
  {
    name: 'LERP',
    description: 'Linear interpolation between two values',
    syntax: 'LERP(a, b, t)',
    examples: ['LERP(0, 100, 0.5)', 'LERP($MinDamage, $MaxDamage, 0.5)']
  }
];

export function FormulaEditor({ value, onChange, availableAttributes = [] }: FormulaEditorProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteItems, setAutocompleteItems] = useState<AutocompleteItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create autocomplete data - prioritize attributes over functions
  const autocompleteData: AutocompleteItem[] = [
    // Attributes first (higher priority) - no $ prefix
    ...availableAttributes.map(attr => ({
      value: attr,
      label: attr,
      type: 'variable' as const,
      description: `Reference to ${attr} attribute`,
      icon: IconVariable,
      color: 'green' as const
    })),
    // Functions second
    ...BUILTIN_FUNCTIONS.map(func => ({
      value: func.name,
      label: func.name,
      type: 'function' as const,
      description: func.description,
      syntax: func.syntax,
      icon: IconFunction,
      color: 'blue' as const
    })),
  ];

  useEffect(() => {
    validateFormula(value || '');
  }, [value, availableAttributes]);

  // Keep cursor position in sync with input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [cursorPosition]);

  const validateFormula = (formula: string) => {
    try {
      // Basic syntax validation
      let parenthesesCount = 0;
      let inString = false;
      let lastChar = '';

      for (let i = 0; i < formula.length; i++) {
        const char = formula[i];
        
        if (char === '"' && lastChar !== '\\') {
          inString = !inString;
        }
        
        if (!inString) {
          if (char === '(') parenthesesCount++;
          if (char === ')') parenthesesCount--;
          
          if (parenthesesCount < 0) {
            throw new Error('Unmatched closing parenthesis');
          }
        }
        
        lastChar = char;
      }

      if (parenthesesCount > 0) {
        throw new Error('Unmatched opening parenthesis');
      }

      // Check for valid characters
      const validChars = /^[a-zA-Z0-9\s+\-*/()=,._]+$/;
      if (formula && !validChars.test(formula.replace(/\s/g, ''))) {
        throw new Error('Invalid characters in formula');
      }

      // Check for unknown functions (uppercase only, followed by parentheses)
      const knownFunctions = BUILTIN_FUNCTIONS.map(item => item.name);
      const functionMatches = formula.match(/[A-Z_][A-Z0-9_]*(?=\s*\()/g) || [];
      const unknownFunctions = functionMatches.filter(func => 
        !knownFunctions.includes(func)
      );

      if (unknownFunctions.length > 0) {
        throw new Error(`Unknown function(s): ${unknownFunctions.join(', ')}`);
      }

      // Check for unknown variables (attribute references without $ prefix)
      const variableMatches = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*(?!\s*\()/g) || [];
      const unknownVariables = variableMatches.filter(variable => 
        !availableAttributes.includes(variable) && 
        !knownFunctions.includes(variable) &&
        !/^\d/.test(variable) // Not a number
      );

      if (unknownVariables.length > 0) {
        throw new Error(`Unknown variable(s): ${unknownVariables.join(', ')}`);
      }

      setIsValid(true);
      setValidationError(null);
    } catch (error) {
      setIsValid(false);
      setValidationError(error instanceof Error ? error.message : 'Invalid formula');
    }
  };

  // Format formula with one space between variables, operators, and numbers
  const formatFormula = (formula: string) => {
    // Add spaces around operators, but not inside function parentheses or numbers
    // 1. Add space around operators
    let formatted = formula.replace(/([+\-*/=(),])/g, ' $1 ');
    // 2. Collapse multiple spaces to one
    formatted = formatted.replace(/\s+/g, ' ');
    // 3. Remove space after ( and before )
    formatted = formatted.replace(/\( /g, '(').replace(/ \)/g, ')');
    // 4. Remove space before , and after ,
    formatted = formatted.replace(/ ,/g, ',').replace(/, /g, ', ');
    // 5. Trim
    return formatted.trim();
  };

  const getAutocompleteSuggestions = (input: string, position: number) => {
    const beforeCursor = input.slice(0, position);
    const wordMatch = beforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
    
    let suggestions: AutocompleteItem[] = [];
    
    // Only show autocomplete if at least one character is typed
    if (!wordMatch || wordMatch[0].length < 1) {
      closeAutocomplete();
      return;
    }
    const partialWord = wordMatch[0];
    
    suggestions = autocompleteData.filter(item => 
      item.label.toLowerCase().startsWith(partialWord.toLowerCase())
    );

    // If only one match and it's an exact match, don't show dropdown
    if (
      suggestions.length === 1 &&
      suggestions[0].label.toLowerCase() === partialWord.toLowerCase()
    ) {
      closeAutocomplete();
      return;
    }

    if (suggestions.length > 0) {
      setAutocompleteItems(suggestions);
      setSelectedIndex(0);
      setShowAutocomplete(true);
    } else {
      closeAutocomplete();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const newPosition = event.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(newPosition);
    
    // Show autocomplete if we have items to show
    if (autocompleteData.length > 0) {
      getAutocompleteSuggestions(newValue, newPosition);
    }
  };

  const handleItemSelect = (item: AutocompleteItem) => {
    const currentValue = value || '';
    const beforeCursor = currentValue.slice(0, cursorPosition);
    const afterCursor = currentValue.slice(cursorPosition);
    
    // Find if we're replacing a partial word
    const wordMatch = beforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
    let newValue: string;
    let newCursorPosition: number;
    
    if (wordMatch) {
      // Replace the partial word
      const startPos = cursorPosition - wordMatch[0].length;
      newValue = currentValue.slice(0, startPos) + item.value + currentValue.slice(cursorPosition);
      newCursorPosition = startPos + item.value.length;
    } else {
      // Insert at cursor position
      newValue = currentValue.slice(0, cursorPosition) + item.value + currentValue.slice(cursorPosition);
      newCursorPosition = cursorPosition + item.value.length;
    }
    
    // Add parentheses for functions
    if (item.type === 'function') {
      const insertPos = newCursorPosition;
      newValue = newValue.slice(0, insertPos) + '()' + newValue.slice(insertPos);
      newCursorPosition = insertPos + 1; // Position cursor inside parentheses
    }
    
    onChange(newValue);
    closeAutocomplete();
    
    // Set cursor position after the value has been updated
    const finalCursorPosition = newCursorPosition;
    setCursorPosition(finalCursorPosition);
    
    // Use requestAnimationFrame to ensure DOM is updated before setting cursor
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(finalCursorPosition, finalCursorPosition);
      }
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (showAutocomplete && autocompleteItems.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < autocompleteItems.length - 1 ? prev + 1 : 0
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : autocompleteItems.length - 1
        );
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (autocompleteItems[selectedIndex]) {
          handleItemSelect(autocompleteItems[selectedIndex]);
        }
      } else if (event.key === 'Tab') {
        event.preventDefault();
        if (autocompleteItems[selectedIndex]) {
          handleItemSelect(autocompleteItems[selectedIndex]);
        }
      } else if (event.key === 'Escape') {
        closeAutocomplete();
      }
    }

    // Auto-insert closing parenthesis
    if (event.key === '(') {
      const currentValue = value || '';
      const newValue = currentValue.slice(0, cursorPosition) + '()' + currentValue.slice(cursorPosition);
      onChange(newValue);
      const newCursorPosition = cursorPosition + 1;
      
      // Set cursor position after the value has been updated
      setCursorPosition(newCursorPosition);
      
      // Use requestAnimationFrame to ensure DOM is updated before setting cursor
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      });
      
      event.preventDefault();
    }
  };

  // Helper to close autocomplete
  const closeAutocomplete = () => {
    setShowAutocomplete(false);
    setAutocompleteItems([]);
    setSelectedIndex(0);
  };

  // Format formula on blur
  const handleInputBlur = () => {
    if (value) {
      const formatted = formatFormula(value);
      if (formatted !== value) {
        onChange(formatted);
      }
    }
    closeAutocomplete();
  };

  // Update autocomplete on cursor move (selection change)
  const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const newPosition = input.selectionStart || 0;
    setCursorPosition(newPosition);
    if (autocompleteData.length > 0) {
      getAutocompleteSuggestions(input.value, newPosition);
    }
  };

  // Update autocomplete on click
  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const newPosition = input.selectionStart || 0;
    setCursorPosition(newPosition);
    if (autocompleteData.length > 0) {
      getAutocompleteSuggestions(input.value, newPosition);
    }
  };

  // Update autocomplete on focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const newPosition = input.selectionStart || 0;
    setCursorPosition(newPosition);
    if (autocompleteData.length > 0) {
      getAutocompleteSuggestions(input.value, newPosition);
    }
  };

  // On save/cancel, close autocomplete
  useEffect(() => {
    return () => {
      closeAutocomplete();
    };
  }, []);

  return (
    <Box>
      <Menu
        opened={showAutocomplete}
        onClose={closeAutocomplete}
        position="bottom-start"
        shadow="md"
        width="target"
        closeOnClickOutside={true}
        closeOnEscape={true}
        trapFocus={false}
        returnFocus={false}
        closeOnItemClick={false}
      >
        <Menu.Target>
          <TextInput
            ref={inputRef}
            value={value || ''}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onSelect={handleSelect}
            placeholder="Enter formula (e.g., 10 + level * 2)"
            rightSection={
              <Group gap="xs">
                {isValid ? (
                  <IconCheck size={16} color="green" />
                ) : (
                  <IconX size={16} color="red" />
                )}
              </Group>
            }
          />
        </Menu.Target>

        <Menu.Dropdown>
          <ScrollArea h={200}>
            <Stack gap={0}>
              {autocompleteItems.map((item, index) => (
                <Menu.Item
                  key={item.value}
                  onClick={() => handleItemSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    backgroundColor: index === selectedIndex ? 'var(--mantine-color-blue-0)' : 'transparent',
                  }}
                  leftSection={
                    <Group gap="xs">
                      <item.icon size={16} color={item.color} />
                      <Text size="sm" fw={500}>
                        {item.label}
                      </Text>
                      <Badge size="xs" variant="light" color={item.color}>
                        {item.type === 'function' ? 'Function' : item.type}
                      </Badge>
                    </Group>
                  }
                >
                  <Box>
                    <Text size="xs" c="dimmed" mt={4}>
                      {item.description}
                    </Text>
                    {item.syntax && (
                      <Code mt={4}>
                        {item.syntax}
                      </Code>
                    )}
                  </Box>
                </Menu.Item>
              ))}
            </Stack>
          </ScrollArea>
        </Menu.Dropdown>
      </Menu>

      {validationError && (
        <Alert color="red" mt="xs">
          {validationError}
        </Alert>
      )}
    </Box>
  );
} 