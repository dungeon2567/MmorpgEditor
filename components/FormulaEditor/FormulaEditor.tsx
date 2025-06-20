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
  variables?: Record<string, { type: string; description: string; currentValue?: any }>;
  label?: string;
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
    name: 'min',
    description: 'Returns the minimum of two or more values',
    syntax: 'min(a, b, ...)',
    examples: ['min(10, 5)', 'min(level, 100)']
  },
  {
    name: 'max',
    description: 'Returns the maximum of two or more values',
    syntax: 'max(a, b, ...)',
    examples: ['max(0, damage)', 'max(strength, dexterity)']
  },
  {
    name: 'floor',
    description: 'Rounds down to the nearest integer',
    syntax: 'floor(value)',
    examples: ['floor(10.7)', 'floor(damage / 2)']
  },
  {
    name: 'ceil',
    description: 'Rounds up to the nearest integer',
    syntax: 'ceil(value)',
    examples: ['ceil(10.3)', 'ceil(health / 10)']
  },
  {
    name: 'round',
    description: 'Rounds to the nearest integer',
    syntax: 'round(value)',
    examples: ['round(10.5)', 'round(damage * 1.5)']
  },
  {
    name: 'abs',
    description: 'Returns the absolute value',
    syntax: 'abs(value)',
    examples: ['abs(-10)', 'abs(damage - armor)']
  },
  {
    name: 'sqrt',
    description: 'Returns the square root',
    syntax: 'sqrt(value)',
    examples: ['sqrt(16)', 'sqrt(strength * 2)']
  },
  {
    name: 'pow',
    description: 'Raises a number to a power',
    syntax: 'pow(base, exponent)',
    examples: ['pow(2, 3)', 'pow(level, 1.5)']
  },
  {
    name: 'clamp',
    description: 'Clamps a value between min and max',
    syntax: 'clamp(value, min, max)',
    examples: ['clamp(damage, 0, 100)', 'clamp(level, 1, 50)']
  },
  {
    name: 'lerp',
    description: 'Linear interpolation between two values',
    syntax: 'lerp(a, b, t)',
    examples: ['lerp(0, 100, 0.5)', 'lerp(minDamage, maxDamage, 0.5)']
  }
];

export function FormulaEditor({ value, onChange, variables = {}, label = "Formula" }: FormulaEditorProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteItems, setAutocompleteItems] = useState<AutocompleteItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert variables prop to VariableDefinition array
  const variableDefinitions: VariableDefinition[] = Object.entries(variables).map(([name, def]) => ({
    name,
    type: def.type,
    description: def.description,
    currentValue: def.currentValue
  }));

  // Create autocomplete data
  const autocompleteData: AutocompleteItem[] = [
    ...BUILTIN_FUNCTIONS.map(func => ({
      value: func.name,
      label: func.name,
      type: 'function' as const,
      description: func.description,
      syntax: func.syntax,
      icon: IconFunction,
      color: 'blue' as const
    })),
    ...variableDefinitions.map(variable => ({
      value: variable.name,
      label: variable.name,
      type: 'variable' as const,
      description: variable.description,
      icon: IconVariable,
      color: 'green' as const
    }))
  ];

  useEffect(() => {
    validateFormula(value);
  }, [value]);

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
      if (!validChars.test(formula.replace(/\s/g, ''))) {
        throw new Error('Invalid characters in formula');
      }

      // Check for unknown variables/functions
      const knownIdentifiers = autocompleteData.map(item => item.value.toLowerCase());
      const words = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
      const unknownWords = words.filter(word => {
        const wordLower = word.toLowerCase();
        return !knownIdentifiers.includes(wordLower) && 
               !['min', 'max', 'floor', 'ceil', 'round', 'abs', 'sqrt', 'pow', 'clamp', 'lerp'].includes(wordLower);
      });

      if (unknownWords.length > 0) {
        throw new Error(`Unknown identifier(s): ${unknownWords.join(', ')}`);
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
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);
    
    // Find if we're replacing a partial word
    const wordMatch = beforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
    let newValue: string;
    let newCursorPosition: number;
    
    if (wordMatch) {
      // Replace the partial word
      const startPos = cursorPosition - wordMatch[0].length;
      newValue = value.slice(0, startPos) + item.value + value.slice(cursorPosition);
      newCursorPosition = startPos + item.value.length;
    } else {
      // Insert at cursor position
      newValue = value.slice(0, cursorPosition) + item.value + value.slice(cursorPosition);
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
      const newValue = value.slice(0, cursorPosition) + '()' + value.slice(cursorPosition);
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
            value={value}
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