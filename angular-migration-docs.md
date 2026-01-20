# Angular to React Migration Plan - Atomic Design Component Library

## Overview

Migrate 21 Angular components from `/app/designs/ui` to React following atomic design principles. Target: Next.js app with React 19, Tailwind CSS 4, TypeScript.

### Confirmed Decisions

- **Output path**: `components/ui/` at project root
- **Scope**: Full setup including hooks and contexts
- **Form strategy**: React Hook Form with forwardRef pattern
- **Localization**: `next-intl` (Next.js best practice) with existing `en.json` and `pt-BR.json` files moved to `messages/` directory

---

## React Directory Structure

```
components/
└── ui/
    ├── atoms/           # Basic UI primitives
    │   ├── Button/
    │   ├── Input/
    │   ├── Spinner/
    │   └── InputSelect/
    ├── molecules/       # Combinations of atoms
    │   ├── Card/
    │   ├── Modal/
    │   ├── Tabs/
    │   ├── Pagination/
    │   ├── InputCalendar/
    │   ├── MenuItem/
    │   └── LanguageSelector/
    ├── organisms/       # Complex components
    │   └── DataTable/
    │       └── cells/
    │           ├── CellActionButton
    │           ├── CellFavorite
    │           ├── CellLink
    │           ├── CellTextButton
    │           ├── ProcessNumberCell
    │           ├── SortableHeader
    │           └── TruncatedTextCell
    ├── templates/       # Layout components
    │   ├── Header/
    │   ├── Sidenav/
    │   └── Warning/
    └── pages/           # Page-level components
        ├── TableProcess/
        ├── TableSearch/
        ├── TableOngoing/
        └── TableProtocols/
hooks/
    ├── useClickOutside.ts
    ├── useDebounce.ts
    ├── usePagination.ts
    └── useMediaQuery.ts
contexts/
    └── SidenavContext.tsx
messages/                # Localization (next-intl)
    ├── en.json          # Move from root
    └── pt-BR.json       # Move from root
i18n/
    ├── request.ts       # next-intl config
    └── routing.ts       # Locale routing
lib/utils/
    └── cn.ts            # clsx + tailwind-merge
```

---

## Implementation Order

### Phase 1: Foundation

1. Install dependencies: `lucide-react`, `clsx`, `tailwind-merge`, `react-hook-form`, `next-intl`
2. Create `cn()` utility
3. Create hooks: `useClickOutside`, `useDebounce`, `usePagination`, `useMediaQuery`
4. Set up `next-intl`:
   - Move `en.json` and `pt-BR.json` to `messages/`
   - Create `i18n/request.ts` and `i18n/routing.ts`
   - Configure middleware for locale detection
5. Create context: `SidenavContext`

### Phase 2: Atoms (No dependencies)

| #   | Component   | Source File                              |
| --- | ----------- | ---------------------------------------- |
| 1   | Button      | `button/button.component.ts`             |
| 2   | Spinner     | `spinner/spinner.component.ts`           |
| 3   | Input       | `input/input.component.ts`               |
| 4   | InputSelect | `input-select/input-select.component.ts` |

### Phase 3: Molecules (Depend on Atoms)

| #   | Component        | Source File                                        |
| --- | ---------------- | -------------------------------------------------- |
| 5   | Card             | `card/card.component.ts`                           |
| 6   | Modal            | `modal/modal.component.ts`                         |
| 7   | Tabs             | `tabs/tabs.component.ts`                           |
| 8   | Pagination       | `pagination/pagination.component.ts`               |
| 9   | MenuItem         | `menu-item/menu-item.component.ts`                 |
| 10  | LanguageSelector | `language-selector/language-selector.component.ts` |
| 11  | InputCalendar    | `input-calendar/input-calendar.page.ts`            |

### Phase 4: Organisms (Depend on Molecules)

| #   | Component           | Source File                          |
| --- | ------------------- | ------------------------------------ |
| 12  | DataTable Cells (7) | `data-table/cells/*`                 |
| 13  | DataTable           | `data-table/data-table.component.ts` |

### Phase 5: Templates (Depend on Organisms)

| #   | Component | Source File               |
| --- | --------- | ------------------------- |
| 14  | Warning   | `warning/warning.page.ts` |
| 15  | Header    | `header/header.page.ts`   |
| 16  | Sidenav   | `sidenav/sidenav.page.ts` |

### Phase 6: Pages (Depend on Templates)

| #   | Component      | Source File                               |
| --- | -------------- | ----------------------------------------- |
| 17  | TableProcess   | `table-process/table-process.page.ts`     |
| 18  | TableSearch    | `table-search/table-search.page.ts`       |
| 19  | TableOngoing   | `table-ongoing/table-ongoing.page.ts`     |
| 20  | TableProtocols | `table-protocols/table-protocols.page.ts` |

---

## Angular → React Mapping

| Angular                        | React                                  |
| ------------------------------ | -------------------------------------- |
| `@Input()` / `input()`         | Props                                  |
| `@Output()`                    | Callback props (`onClick`, `onChange`) |
| `signal()`                     | `useState()`                           |
| `computed()`                   | `useMemo()`                            |
| `effect()`                     | `useEffect()`                          |
| `inject(Service)`              | `useContext()` / custom hooks          |
| `ControlValueAccessor`         | `forwardRef` + React Hook Form         |
| `ng-content`                   | `children` prop                        |
| `ng-content select="[footer]"` | Named props (`footer={<El />}`)        |
| `TranslationService`           | `useTranslations()` from `next-intl`   |

---

## Key Patterns

### Localization: next-intl

```tsx
// In components - use useTranslations hook
import { useTranslations } from "next-intl";

function Pagination() {
  const t = useTranslations("pagination");
  return (
    <span>
      {t("showing")} 1 {t("to")} 10
    </span>
  );
}

// Access nested keys: t('table.headers.processNumber')
```

### Atoms: forwardRef + Tailwind variants

```tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size])}
      {...props}
    />
  ),
);
```

### Form Integration: React Hook Form

```tsx
<Input {...register("email")} error={errors.email?.message} />
```

### Modal: Portal + Animation

```tsx
createPortal(<div className="fixed inset-0">...</div>, document.body);
```

### DataTable: Generic + Render Props

```tsx
<DataTable<Process>
  data={processes}
  columns={[
    {
      key: "number",
      header: "Process",
      render: (row) => <ProcessCell {...row} />,
    },
  ]}
/>
```

---

## Completed Components ✓

- **Phase 1**: Foundation (dependencies, cn utility, hooks, next-intl, SidenavContext)
- **Phase 2**: All Atoms (Button, Spinner, Input, InputSelect)
- **Phase 3**: All Molecules (Card, Modal, Tabs, Pagination, MenuItem, LanguageSelector, InputCalendar)
- **Phase 4**: All Organisms (DataTable + 7 cell components)
- **Phase 5 Partial**: Warning template

---

## Remaining Implementation

### 15. Header Template

**File**: `components/ui/templates/Header/Header.tsx`

Features to implement:

- Route-based page title using `usePathname()` and route title mapping
- Mobile hamburger menu (toggle sidenav via SidenavContext)
- Desktop sidenav collapse button (ChevronLeft/ChevronRight icons)
- User dropdown menu with logout action
- Help modal with support email
- Demo mode support (disabled buttons, "Demo" user display)
- Tenant name display

Dependencies:

- `useSidenav()` from SidenavContext
- `useTranslations()` for i18n
- `usePathname()` from next/navigation
- Modal component
- Button component

```tsx
interface HeaderProps {
  demoMode?: boolean;
  userName?: string;
  tenantName?: string;
  onLogout?: () => void;
}
```

### 16. Sidenav Template

**File**: `components/ui/templates/Sidenav/Sidenav.tsx`

Features:

- Collapsible desktop sidenav (80px collapsed / 265px expanded)
- Mobile slide-in drawer with backdrop overlay
- Route-based public/private options switching
- Logo display (full/icon based on collapsed state)
- Auto-close on mobile navigation

Sub-components:

- `PrivateOptions.tsx` - Full navigation with dropdowns
- `PublicOptions.tsx` - Limited navigation (Gen AI only active)

```tsx
// Uses SidenavContext for:
// - isCollapsed, isMobileOpen
// - toggle(), toggleMobile(), closeMobile()
```

### 17-20. Table Page Components

These are page-level data display components using DataTable with dual rendering (desktop table / mobile cards).

**Common patterns:**

- Mobile pagination with separate page state
- Empty state with icon and message
- Loading state with Spinner
- `useTranslations()` for all text
- Date formatting helper
- `trackById` for list rendering

#### 17. TableProcess

**File**: `components/ui/pages/TableProcess/TableProcess.tsx`

Props:

```tsx
interface TableProcessProps {
  startDate?: Date | null;
  endDate?: Date | null;
  favoritesOnly?: boolean;
  onProcessCountChange?: (count: number) => void;
}
```

Features:

- Sorting by lastUpdateDate (asc/desc toggle)
- Favorites management (toggle, track favorite IDs)
- Process summary modal with type-specific rendering:
  - FiscalizationBase: emails, companies, geography, activities, equipments
  - FiscalizationFuelQuality: violation details, process details
- PDF download action
- Mobile card view with process details grid

#### 18. TableSearch

**File**: `components/ui/pages/TableSearch/TableSearch.tsx`

Props:

```tsx
interface TableSearchProps {
  searchTerm?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  onTotalCountChange?: (count: number) => void;
}
```

Features:

- Client-side filtering by term (process number, classification, interested parties)
- Conditional rendering based on hasFilters computed
- Simpler column set than TableProcess

#### 19. TableOngoing

**File**: `components/ui/pages/TableOngoing/TableOngoing.tsx`

Props:

```tsx
interface TableOngoingProps {
  processId?: string;
  onTotalCountChange?: (count: number) => void;
}
```

Features:

- DateTime formatting (DD/MM/YYYY HH:mm)
- Three columns: dateTime, unit, description
- Loads on mount via processId

#### 20. TableProtocols

**File**: `components/ui/pages/TableProtocols/TableProtocols.tsx`

Props:

```tsx
interface TableProtocolsProps {
  processId?: string;
  onTotalCountChange?: (count: number) => void;
}
```

Features:

- Five columns: number, type, date, inclusionDate, unit
- Date formatting
- Loads on mount via processId

---

## Service Integration Note

The Angular components use injected services (ProcessService, OngoingService, ProtocolService, AuthService, TenantService). For the React migration:

1. **Data fetching**: Components will receive data via props or use React Query/SWR hooks (to be configured by consumer)
2. **Auth context**: Create placeholder hooks like `useAuth()`, `useTenant()` that can be implemented by the consuming app
3. **Keep components presentation-focused**: Pass callbacks for actions (logout, favorite toggle, etc.)

---

## Verification

1. **Visual parity**: Compare each React component against Angular original
2. **Functionality**: Test interactions (clicks, forms, dropdowns, modals)
3. **Responsive**: Verify mobile/desktop layouts match
4. **TypeScript**: Ensure proper typing, no `any` types
5. **Accessibility**: Keyboard navigation, focus states, ARIA attributes
