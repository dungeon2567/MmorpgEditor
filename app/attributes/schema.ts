import { z } from 'zod';

// Attribute schema matching the specification:
// - !Attribute
//   Name: Health
//   Min: 0
//   Max: $MaxHealth
export const attributesSchema = z.object({
  Name: z.string().min(1, 'Name is required.').describe('The name of the attribute.'),
  Min: z.string().describe(JSON.stringify({ 
    specialType: 'formula', 
    description: 'The minimum value formula. Can reference other attributes with $ prefix (e.g., $MaxHealth).' 
  })),
  Max: z.string().describe(JSON.stringify({ 
    specialType: 'formula', 
    description: 'The maximum value formula. Can reference other attributes with $ prefix (e.g., $MaxHealth).' 
  })),
});

export type Attributes = z.infer<typeof attributesSchema>; 