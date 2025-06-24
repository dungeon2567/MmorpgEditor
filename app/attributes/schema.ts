import { z } from 'zod';

// To handle recursion, we need to define the base type first.
// Using 'any' for recursive types to avoid circular reference issues with Zod v3 and deep nesting.
const baseAttributeSchema = z.object({
    id: z.number().describe('The unique identifier for the attribute.'),
    name: z.string().min(1, 'Name is required.').describe('The name of the attribute.'),
    type: z.enum(['Physical', 'Mental', 'Social']).describe('The type of the attribute.'),
    baseValue: z.number().min(0, 'Base value must be a positive number.').describe('The base value.'),
    status: z.enum(['Active', 'Draft', 'Testing']).describe('The status of the attribute.'),
    maxValue: z.number().min(0, 'Max value must be a positive number.').describe('The maximum value.'),
    description: z.string().optional().describe('A description of the attribute.'),
});

// We can define a schema for modifiers
const modifierSchema = z.object({
    source: z.string().describe('The source of the modifier.'),
    // Let's imagine this value could be a formula, we can use .describe to hint the UI
    value: z.string().describe(JSON.stringify({ specialType: 'formula', description: 'The formula for the modifier value.' })), 
});

type Modifier = z.infer<typeof modifierSchema>;

export const attributesSchema: z.ZodType<any> = baseAttributeSchema.extend({
  modifiers: z.array(modifierSchema).optional().describe('A list of modifiers.'),
  relatedAttribute: z.lazy(() => attributesSchema).optional().describe('A related attribute.'),
});

export type Attributes = z.infer<typeof attributesSchema>; 