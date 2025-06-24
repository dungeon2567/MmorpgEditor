'use client';

import { Container, Grid, Title } from '@mantine/core';
import { GenericTable } from '../../components/GenericTable/GenericTable';
import { EffectSchema, Effect } from './schema';
import { useGameDataStore } from '../../lib/store';

export function EffectsPage() {
  const { effects, updateEffect } = useGameDataStore();

  const handleSave = (effect: Effect) => {
    updateEffect(effect.Name, effect);
  };

  return (
    <Container size="xl" p="md">
      <Title order={1} mb="lg">Effects Editor</Title>
      <Grid>
        <Grid.Col span={12}>
          <GenericTable
            zodSchema={EffectSchema}
            data={effects}
            title="Effects"
            onSave={handleSave}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
} 