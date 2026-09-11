# Graph Report - gourmetech-system  (2026-09-10)

## Corpus Check
- 82 files · ~38,868 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 361 nodes · 674 edges · 27 communities (20 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `442c5779`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dataTable.vue
- kitchenComponent.vue
- dependencies
- api.js
- resolveKitchenItemModalContent.vue
- package.json
- globalMethods
- devDependencies
- bankSelect.vue
- compilerOptions
- homeComponent.vue
- editProductModalContent.vue
- router.js
- cancelShippingModalContent.vue
- mapComponent.vue
- README.md
- forbiddenPage.vue
- vue.config.js

## God Nodes (most connected - your core abstractions)
1. `api` - 52 edges
2. `globalMethods` - 51 edges
3. `compilerOptions` - 7 edges
4. `_getCellDataForExport()` - 7 edges
5. `setSubmitLabel()` - 7 edges
6. `eslintConfig` - 6 edges
7. `loadOrderItems()` - 6 edges
8. `lib` - 5 edges
9. `parseQuantity()` - 5 edges
10. `scripts` - 4 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (27 total, 7 thin omitted)

### Community 0 - "dataTable.vue"
Cohesion: 0.08
Nodes (24): ColumnCell, exportarParaExcel(), filterData(), _findBoldStatus(), _findColor(), _getCellDataForExport(), getCellDisplayValue(), getCellRawValue() (+16 more)

### Community 1 - "kitchenComponent.vue"
Cohesion: 0.08
Nodes (13): afterModalClose(), backToGrid(), buildChecklistItems(), buildSubstitutionBadge(), loadOrderItems(), openOrder(), printBatch(), printOne() (+5 more)

### Community 2 - "dependencies"
Cohesion: 0.07
Nodes (29): animate.css, axios, chart.js, core-js, inputmask, jquery, leaflet, @lottiefiles/lottie-player (+21 more)

### Community 4 - "resolveKitchenItemModalContent.vue"
Cohesion: 0.11
Nodes (12): chooseCancelFlow(), choosePrincipal(), chooseSubstituteFlow(), getIngredients(), goToConfirmation(), handleSubmit(), loadSubstituteCandidates(), maxPortions() (+4 more)

### Community 5 - "package.json"
Cohesion: 0.09
Nodes (21): browserslist, node, eslintConfig, env, extends, parserOptions, root, rules (+13 more)

### Community 7 - "devDependencies"
Cohesion: 0.12
Nodes (17): @babel/core, @babel/eslint-parser, eslint, eslint-plugin-vue, devDependencies, @babel/core, @babel/eslint-parser, eslint (+9 more)

### Community 9 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, baseUrl, lib, module, moduleResolution, paths, target, dom (+3 more)

### Community 11 - "homeComponent.vue"
Cohesion: 0.20
Nodes (3): getCSSColor(), mounted(), renderChart()

### Community 14 - "cancelShippingModalContent.vue"
Cohesion: 0.33
Nodes (6): goToConfirmation(), handleSubmit(), parseQuantity(), scaledIngredientQuantity(), selectedItems(), submitCancellation()

### Community 17 - "mapComponent.vue"
Cohesion: 0.43
Nodes (3): initMap(), normalizeCenter(), setCenter()

### Community 20 - "README.md"
Cohesion: 0.40
Nodes (4): ✨ Funcionalidades Principais, 👨‍💻 Liderança e Desenvolvimento, 📌 Sobre o Projeto, 🛠️ Tecnologias Utilizadas

## Knowledge Gaps
- **54 isolated node(s):** `target`, `module`, `baseUrl`, `moduleResolution`, `paths` (+49 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api` connect `api.js` to `kitchenComponent.vue`, `resolveKitchenItemModalContent.vue`, `globalMethods`, `bankSelect.vue`, `editOrderModalContent.vue`, `homeComponent.vue`, `editProductModalContent.vue`, `router.js`, `cancelShippingModalContent.vue`, `header.vue`, `globalMethods.js`, `financialComponent.vue`, `stockComponent.vue`, `salesComponent.vue`, `usersConfig.vue`, `reservationsComponent.vue`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `globalMethods` connect `globalMethods` to `dataTable.vue`, `kitchenComponent.vue`, `api.js`, `resolveKitchenItemModalContent.vue`, `bankSelect.vue`, `editOrderModalContent.vue`, `homeComponent.vue`, `editProductModalContent.vue`, `router.js`, `cancelShippingModalContent.vue`, `header.vue`, `globalMethods.js`, `financialComponent.vue`, `stockComponent.vue`, `salesComponent.vue`, `usersConfig.vue`, `reservationsComponent.vue`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `target`, `module`, `baseUrl` to the rest of the system?**
  _54 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dataTable.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `kitchenComponent.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._