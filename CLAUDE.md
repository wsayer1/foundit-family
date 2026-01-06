# Sidewalk - Project Guidelines

## Documentation Requirements

**MANDATORY**: When modifying any component in `src/components/`, you MUST update its corresponding documentation file in `docs/components/`.

### Rules

1. **Before modifying a component**: Check if documentation exists in `docs/components/[ComponentName].md`
2. **If documentation exists**: Update it to reflect your changes
3. **If documentation does not exist**: Create it using the template at `docs/COMPONENT_TEMPLATE.md`
4. **Changes requiring doc updates**:
   - Adding, removing, or renaming props
   - Changing component behavior or state handling
   - Modifying accessibility features
   - Adding or removing dependencies
   - Changing usage patterns

### Documentation Index

See `docs/README.md` for the complete list of documented and undocumented components.

## Project Structure

```
src/
  components/     # React components (each requires documentation)
  contexts/       # React contexts (Auth, Filter, Location, Theme)
  hooks/          # Custom hooks
  lib/            # Library configurations (Supabase client)
  pages/          # Page components
  types/          # TypeScript type definitions
  utils/          # Utility functions
docs/
  components/     # Component documentation files
  COMPONENT_TEMPLATE.md  # Template for new component docs
supabase/
  functions/      # Edge functions
  migrations/     # Database migrations
```

## Tech Stack

- React 18 with TypeScript
- Vite for bundling
- Tailwind CSS for styling
- Supabase for database and auth
- Mapbox GL for maps
- Lucide React for icons

## Coding Standards

- Use Tailwind CSS classes; do not install additional UI libraries
- Use Lucide React for all icons
- Follow existing component patterns and file structure
- Keep components focused and single-purpose
