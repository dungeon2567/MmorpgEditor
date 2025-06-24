// This is a template for creating new entity pages
// Simply copy this to app/[entity-name]/page.tsx

import { AutoEntityPage } from '../../components/GenericPage/AutoEntityPage';

export default function Page() {
  return <AutoEntityPage />;
}

/*
To create a new entity page:

1. Create a new folder: app/[entity-name]/
2. Copy this file to: app/[entity-name]/page.tsx  
3. Create your schema: app/[entity-name]/schema.ts
4. Add your entity config to: components/GenericPage/entityConfigs.ts
5. Add store operations to: components/GenericPage/storeAdapter.ts (if using store)

That's it! Your new entity page is ready with full CRUD operations and drawer editing.

Example for a "spells" entity:
- Folder: app/spells/
- File: app/spells/page.tsx (copy this template)
- Schema: app/spells/schema.ts 
- Config: Add to entityConfigs.ts
- Done!
*/ 