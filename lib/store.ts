import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Effect } from '../app/effects/schema';
import { Actor } from '../app/actors/schema';
import { Attributes } from '../app/attributes/schema';

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
  attributes: Attributes[];
  addAttribute: (attribute: Attributes) => void;
  updateAttribute: (name: string, attribute: Attributes) => void;
  deleteAttribute: (name: string) => void;
  getAttributeByName: (name: string) => Attributes | undefined;
  
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
              Potency: 'Level * 2 + 15',
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
              Potency: 'Wisdom * 3 + 20',
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
        { Name: 'Health', Min: '0', Max: 'MaxHealth' },
        { Name: 'MaxHealth', Min: '10', Max: 'MAX(100, Level * 10)' },
        { Name: 'Mana', Min: '0', Max: 'MaxMana' },
        { Name: 'MaxMana', Min: '5', Max: 'MAX(50, Intelligence * 5)' },
        { Name: 'Strength', Min: '1', Max: 'CLAMP(BaseStrength + StrengthModifiers, 1, 100)' },
        { Name: 'Intelligence', Min: '1', Max: 'CLAMP(BaseIntelligence + IntelligenceModifiers, 1, 100)' },
        { Name: 'Level', Min: '1', Max: '100' },
        { Name: 'Dexterity', Min: '1', Max: 'CLAMP(BaseDexterity + DexterityModifiers, 1, 100)' },
        { Name: 'Wisdom', Min: '1', Max: 'CLAMP(BaseWisdom + WisdomModifiers, 1, 100)' },
      ],
      
      addAttribute: (attribute) => set((state) => ({
        attributes: [...state.attributes, attribute]
      })),
      
      updateAttribute: (name, attribute) => set((state) => ({
        attributes: state.attributes.map((a) => 
          a.Name === name ? attribute : a
        )
      })),
      
      deleteAttribute: (name) => set((state) => ({
        attributes: state.attributes.filter((a) => a.Name !== name)
      })),
      
      getAttributeByName: (name) => {
        return get().attributes.find((a) => a.Name === name);
      },
      
      // Utility functions
      getAllEffectNames: () => {
        return get().effects.map((e) => e.Name);
      },
      
      getAllActorNames: () => {
        return get().actors.map((a) => a.Name);
      },
      
      getAllAttributeNames: () => {
        return get().attributes.map((a) => a.Name);
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