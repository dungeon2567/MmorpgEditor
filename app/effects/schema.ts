import { z } from 'zod';

// OnTick callback types (tagged unions)
const DamageTickCallbackSchema = z.object({
  type: z.literal('Damage').describe('{"description": "Callback type", "specialType": "hidden"}'),
  Type: z.enum(['Physical', 'Magical', 'Fire', 'Ice', 'Lightning', 'Poison']).describe('{"description": "Damage type", "specialType": "enum"}'),
  Potency: z.number().optional().describe('{"description": "Damage potency value", "specialType": "number"}'),
});

const HealTickCallbackSchema = z.object({
  type: z.literal('Heal').describe('{"description": "Callback type", "specialType": "hidden"}'),
  Potency: z.number().describe('{"description": "Heal potency value", "specialType": "number"}'),
});

const StatModifierTickCallbackSchema = z.object({
  type: z.literal('StatModifier').describe('{"description": "Callback type", "specialType": "hidden"}'),
  Attribute: z.string().describe('{"description": "Attribute to modify", "specialType": "string"}'),
  Value: z.number().describe('{"description": "Modifier value", "specialType": "number"}'),
  Operation: z.enum(['Add', 'Multiply', 'Set']).describe('{"description": "Modifier operation", "specialType": "enum"}'),
});

// OnTick callbacks (tagged union)
const OnTickCallbackSchema = z.discriminatedUnion('type', [
  DamageTickCallbackSchema,
  HealTickCallbackSchema,
  StatModifierTickCallbackSchema,
]);

// Main Effect schema
export const EffectSchema = z.object({
  '!Effect': z.literal(true).optional(),
  Name: z.string().describe('{"description": "Effect name", "specialType": "string"}'),
  Asset: z.string().describe('{"description": "Asset path for the effect", "specialType": "string"}'),
  Period: z.number().describe('{"description": "Time between ticks in seconds", "specialType": "number"}'),
  Duration: z.number().optional().describe('{"description": "Total effect duration in seconds", "specialType": "number"}'),
  MaxStacks: z.number().optional().describe('{"description": "Maximum number of stacks", "specialType": "number"}'),
  OnTick: z.array(OnTickCallbackSchema).describe('{"description": "Callbacks to execute each tick", "specialType": "array"}'),
});

export type Effect = z.infer<typeof EffectSchema>; 