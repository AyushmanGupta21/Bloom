# Graph Report - .  (2026-08-16)

## Corpus Check
- Corpus is ~31,908 words - fits in a single context window. You may not need a graph.

## Summary
- 491 nodes · 685 edges · 22 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 1,500 input · 600 output
- Edge kinds: contains: 393 · imports: 138 · imports_from: 123 · calls: 27 · references: 4

## God Nodes (most connected - your core abstractions)
1. `cn()` - 51 edges
2. `Button()` - 13 edges
3. `db` - 6 edges
4. `UserDetailContext` - 6 edges
5. `buttonVariants` - 5 edges
6. `useCarousel()` - 5 edges
7. `useFormField()` - 5 edges
8. `Input()` - 5 edges
9. `Separator()` - 5 edges
10. `useSidebar()` - 5 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (21): imagekit, Props, transformOptions, useIsMobile(), Sheet(), SheetContent(), SheetDescription(), SheetHeader() (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (15): Button(), buttonVariants, CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (12): Field(), fieldVariants, FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItemContext, FormItemContextValue (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (9): jetbrainsMono, metadata, outfit, Prop, Props, OnSaveContext, Frame, Messages (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (8): AppHeaderProps, AppSidebar(), AppSidebarProps, suggestion, suggestions, UserDetailContext, Progress(), Skeleton()

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (6): Dialog(), DialogContent(), DialogDescription(), DialogHeader(), DialogTitle(), DialogTrigger()

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (11): Props, Select(), SelectContent(), SelectItem(), SelectTrigger(), SelectValue(), ToggleGroup(), ToggleGroupContext (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (7): ButtonGroup(), buttonGroupVariants, Item(), ItemMedia(), itemMediaVariants, itemVariants, Separator()

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (6): db, sql, chatTable, frameTable, projectTable, usersTable

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (5): jetbrainsMono, presets, features, jetbrainsMono, jetbrainsMono

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (1): cn()

### Community 14 - "Community 14"
Cohesion: 0.21
Nodes (6): InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, Input(), Textarea()

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (7): ChartConfig, ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), THEMES, useChart()

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (2): NavigationMenuTrigger(), navigationMenuTriggerStyle

### Community 19 - "Community 19"
Cohesion: 0.22
Nodes (2): FloatingLinesProps, WavePosition

### Community 21 - "Community 21"
Cohesion: 0.39
Nodes (7): chats, frames, projects, public.frames, public.projects, public.users, users

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (2): EmptyMedia(), emptyMediaVariants

### Community 26 - "Community 26"
Cohesion: 0.50
Nodes (2): Alert(), alertVariants

### Community 34 - "Community 34"
Cohesion: 0.67
Nodes (2): config, isPublicRoute

### Community 35 - "Community 35"
Cohesion: 1.00
Nodes (2): Badge(), badgeVariants

### Community 39 - "Community 39"
Cohesion: 1.00
Nodes (1): nextConfig

### Community 40 - "Community 40"
Cohesion: 1.00
Nodes (1): config

## Knowledge Gaps
- **46 isolated node(s):** `suggestion`, `presets`, `jetbrainsMono`, `features`, `metadata` (+41 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (1 nodes): `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `NavigationMenuTrigger()`, `navigationMenuTriggerStyle`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `FloatingLinesProps`, `WavePosition`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `EmptyMedia()`, `emptyMediaVariants`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `Alert()`, `alertVariants`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `config`, `isPublicRoute`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `Badge()`, `badgeVariants`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 13` to `Community 25`, `Community 26`, `Community 15`, `Community 30`, `Community 35`, `Community 22`, `Community 1`, `Community 7`, `Community 23`, `Community 16`, `Community 5`, `Community 11`, `Community 17`, `Community 12`, `Community 24`, `Community 2`, `Community 32`, `Community 14`, `Community 27`, `Community 10`, `Community 18`, `Community 28`, `Community 4`, `Community 36`, `Community 33`, `Community 37`, `Community 6`, `Community 0`, `Community 20`, `Community 29`?**
  _High betweenness centrality (0.303) - this node is a cross-community bridge._
- **Why does `UserDetailContext` connect `Community 4` to `Community 3`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 1` to `Community 6`, `Community 4`, `Community 0`, `Community 5`, `Community 14`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `suggestion`, `presets`, `jetbrainsMono` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05411764705882353 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._