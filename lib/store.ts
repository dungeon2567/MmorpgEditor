import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Effect } from '../app/effects/schema';
import { Actor } from '../app/actors/schema';

// Import the attribute schema (we'll need to export it from the attributes page)
// For now, create a simple attribute type
export interface Attribute {
  id: number;
  name: string;
  type: string;
  baseValue: number;
  status: string;
  maxValue: number;
  description: string;
}

interface GameDataStore {
  // Effects
  effects: Effect[];
  addEffect: (effect: Effect) => void;
  updateEffect: (id: string, effect: Effect) => void;
  deleteEffect: (id: string) => void;
  getEffectByName: (name: string) => Effect | undefined;
  
  // Actors
  actors: Actor[];
  addActor: (actor: Actor) => void;
  updateActor: (id: string, actor: Actor) => void;
  deleteActor: (id: string) => void;
  getActorByName: (name: string) => Actor | undefined;
  
  // Attributes
  attributes: Attribute[];
  addAttribute: (attribute: Attribute) => void;
  updateAttribute: (id: number, attribute: Attribute) => void;
  deleteAttribute: (id: number) => void;
  getAttributeByName: (name: string) => Attribute | undefined;
  
  // Utility functions
  getAllEffectNames: () => string[];
  getAllActorNames: () => string[];
  getAllAttributeNames: () => string[];
}

export const useGameDataStore = create<GameDataStore>()(
  persist(
    (set, get) => ({
      // Effects state and actions
      effects: [
        {
          '!Effect': true,
          Name: 'Burning',
          Asset: 'Assets/Effects/Burning',
          Period: 0.5,
          Duration: 10.0,
          MaxStacks: 3,
          OnTick: [
            {
              type: 'Damage',
              Type: 'Fire',
              Potency: 25,
            },
          ],
        },
        {
          '!Effect': true,
          Name: 'Regeneration',
          Asset: 'Assets/Effects/Regeneration',
          Period: 1.0,
          Duration: 15.0,
          OnTick: [
            {
              type: 'Heal',
              Potency: 50,
            },
          ],
        },
        {
          '!Effect': true,
          Name: 'Strength Boost',
          Asset: 'Assets/Effects/StrengthBoost',
          Period: 0.0,
          Duration: 30.0,
          OnTick: [
            {
              type: 'StatModifier',
              Attribute: 'Strength',
              Value: 10,
              Operation: 'Add',
            },
          ],
        },
      ],
      
      addEffect: (effect) => set((state) => ({
        effects: [...state.effects, effect]
      })),
      
      updateEffect: (id, effect) => set((state) => ({
        effects: state.effects.map((e, index) => 
          e.Name === id ? effect : e
        )
      })),
      
      deleteEffect: (id) => set((state) => ({
        effects: state.effects.filter((e) => e.Name !== id)
      })),
      
      getEffectByName: (name) => {
        return get().effects.find((e) => e.Name === name);
      },
      
      // Actors state and actions
      actors: [],
      
      addActor: (actor) => set((state) => ({
        actors: [...state.actors, actor]
      })),
      
      updateActor: (id, actor) => set((state) => ({
        actors: state.actors.map((a) => 
          a.Name === id ? actor : a
        )
      })),
      
      deleteActor: (id) => set((state) => ({
        actors: state.actors.filter((a) => a.Name !== id)
      })),
      
      getActorByName: (name) => {
        return get().actors.find((a) => a.Name === name);
      },
      
      // Attributes state and actions
      attributes: [
        { id: 1, name: 'Strength', type: 'Physical', baseValue: 10, status: 'Active', maxValue: 100, description: 'Increases physical damage and carrying capacity' },
        { id: 2, name: 'Dexterity', type: 'Physical', baseValue: 8, status: 'Active', maxValue: 100, description: 'Improves accuracy and evasion' },
        { id: 3, name: 'Intelligence', type: 'Mental', baseValue: 12, status: 'Active', maxValue: 100, description: 'Enhances magical power and spell efficiency' },
        { id: 4, name: 'Wisdom', type: 'Mental', baseValue: 9, status: 'Active', maxValue: 100, description: 'Increases mana regeneration and resistance' },
      ],
      
      addAttribute: (attribute) => set((state) => ({
        attributes: [...state.attributes, attribute]
      })),
      
      updateAttribute: (id, attribute) => set((state) => ({
        attributes: state.attributes.map((a) => 
          a.id === id ? attribute : a
        )
      })),
      
      deleteAttribute: (id) => set((state) => ({
        attributes: state.attributes.filter((a) => a.id !== id)
      })),
      
      getAttributeByName: (name) => {
        return get().attributes.find((a) => a.name === name);
      },
      
      // Utility functions
      getAllEffectNames: () => {
        return get().effects.map((e) => e.Name);
      },
      
      getAllActorNames: () => {
        return get().actors.map((a) => a.Name);
      },
      
      getAllAttributeNames: () => {
        return get().attributes.map((a) => a.name);
      },
    }),
    {
      name: 'game-data-store',
      partialize: (state) => ({
        effects: state.effects,
        actors: state.actors,
        attributes: state.attributes,
      }),
    }
  )
); 