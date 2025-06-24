import { z } from 'zod';

// OnHit callback types (tagged unions)
const DamageCallbackSchema = z.object({
  type: z.literal('Damage').describe('{"description": "Callback type", "specialType": "hidden"}'),
  Potency: z.number().describe('{"description": "Damage potency value", "specialType": "number"}'),
});

const EffectCallbackSchema = z.object({
  type: z.literal('Effect').describe('{"description": "Callback type", "specialType": "hidden"}'),
  Name: z.string().describe('{"description": "Effect name", "specialType": "effectSelect"}'),
  Duration: z.number().describe('{"description": "Effect duration in seconds", "specialType": "number"}'),
});

// OnHit callbacks (tagged union)
const OnHitCallbackSchema = z.discriminatedUnion('type', [
  DamageCallbackSchema,
  EffectCallbackSchema,
]);

// Query action types (tagged unions)
const CircleQueryActionSchema = z.object({
  type: z.literal('CircleQuery').describe('{"description": "Action type", "specialType": "hidden"}'),
  Radius: z.number().describe('{"description": "Query radius", "specialType": "number"}'),
  Target: z.enum(['Enemy', 'Ally', 'Self', 'All']).describe('{"description": "Target type", "specialType": "enum"}'),
  OnHit: z.array(OnHitCallbackSchema).describe('{"description": "Callbacks to execute on hit", "specialType": "array"}'),
});

const ConeQueryActionSchema = z.object({
  type: z.literal('ConeQuery').describe('{"description": "Action type", "specialType": "hidden"}'),
  Radius: z.number().describe('{"description": "Cone radius", "specialType": "number"}'),
  Angle: z.number().describe('{"description": "Cone angle in degrees", "specialType": "number"}'),
  Target: z.enum(['Enemy', 'Ally', 'Self', 'All']).describe('{"description": "Target type", "specialType": "enum"}'),
  OnHit: z.array(OnHitCallbackSchema).describe('{"description": "Callbacks to execute on hit", "specialType": "array"}'),
});

// Union of all possible actions that can be in a trigger (tagged union)
const ActionSchema = z.discriminatedUnion('type', [
  CircleQueryActionSchema,
  ConeQueryActionSchema,
]);

// Trigger schema
const TriggerSchema = z.object({
  Time: z.number().describe('{"description": "Trigger time in seconds", "specialType": "number"}'),
  Actions: z.array(ActionSchema).describe('{"description": "Actions to execute at this time", "specialType": "array"}'),
});

// Main Actor schema
export const ActorSchema = z.object({
  '!Actor': z.literal(true).optional(),
  Name: z.string().describe('{"description": "Actor name", "specialType": "string"}'),
  Asset: z.string().describe('{"description": "Asset path for the actor", "specialType": "string"}'),
  Lifetime: z.number().describe('{"description": "Actor lifetime in seconds", "specialType": "number"}'),
  Triggers: z.array(TriggerSchema).describe('{"description": "List of time-based triggers", "specialType": "array"}'),
});

export type Actor = z.infer<typeof ActorSchema>; 