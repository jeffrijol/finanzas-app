# Plan de Implementación: CI/CD y Control de Versiones

Implementar control de versiones robusto y automatización de CI/CD para el monorepo `finanzas-app`, optimizado para un desarrollador único trabajando en la rama `develop` con merges infrecuentes a `master`.

## Contexto del Proyecto

**Situación Actual:**

- Rama por defecto: `master` (producción)
- Rama de desarrollo: `develop` (trabajo diario)
- Desarrollador único (sin revisiones de código externas)
- Sin protección de ramas configurada
- Sin workflows de CI/CD automatizados
- Sin templates de PR ni guías de commits

**Objetivo:**
Establecer un flujo de trabajo profesional que garantice calidad de código antes de merges a `master`, sin añadir fricción innecesaria al ser un proyecto de un solo desarrollador.

---

## User Review Required

> [!IMPORTANT]
> **Decisiones que requieren tu confirmación:**
>
> 1. **Branch Protection**: La configuración propuesta permite que como administrador puedas hacer override de las reglas si es necesario (útil en emergencias). ¿Deseas mantener esta flexibilidad?
> 2. **Lint Temporal**: El workflow de CI tiene `continue-on-error: true` para el linting porque actualmente existen algunos warnings. ¿Prefieres que los warnings bloqueen el merge o solo que sean informativos por ahora?
> 3. **Auto-versioning**: El plan incluye un workflow opcional para auto-incrementar versiones. ¿Quieres implementarlo o prefieres gestionar versiones manualmente?

> [!WARNING]
> **Cambio en flujo de trabajo:**
> Una vez implementado, ya NO podrás hacer push directo a `master`. Todos los cambios deberán pasar por Pull Request desde `develop`. Esto es intencional para garantizar que los checks pasen antes de mergear.

---

## Proposed Changes

### Phase 1: Estructura Base de GitHub

#### [NEW] [pull_request_template.md](file:///d:/desarrollo/finanzas-app/.github/pull_request_template.md)

Template estándar para PRs que facilita documentar cambios y asegurar que se ha verificado el código:

```markdown
## 📋 Descripción de cambios

<!-- Describe brevemente qué cambios introduce este PR -->

### Tipo de cambio

- [ ] ✨ Nueva funcionalidad (feat)
- [ ] 🐛 Corrección de bug (fix)
- [ ] ♻️ Refactorización (refactor)
- [ ] 📝 Documentación (docs)
- [ ] 🎨 Estilo/formato (style)
- [ ] ✅ Tests (test)
- [ ] 🔧 Configuración/tooling (chore)

### Cambios principales

<!-- Lista los archivos o módulos más importantes modificados -->

### Checklist

- [ ] El código sigue las guías de estilo del proyecto
- [ ] Se ha ejecutado `npm run lint` localmente
- [ ] Se ha ejecutado `npm run build` sin errores
- [ ] Documentación actualizada si es necesario
- [ ] Branch actualizada con `develop` antes del merge

---

**Commits incluidos:**

<!-- Se llenará automáticamente al crear el PR -->
```

---

### Phase 2: GitHub Actions Workflows

#### [NEW] [ci.yml](file:///d:/desarrollo/finanzas-app/.github/workflows/ci.yml)

Workflow principal de integración continua que se ejecuta en cada PR hacia `master`:

**Triggers:**

- `pull_request` hacia `master`
- `push` a `master` (validación post-merge)

**Jobs:**

1. **Lint Check** (con `continue-on-error` temporal)
2. **Type Check** (TypeScript)
3. **Build All Packages** (usando TurboRepo)
4. **Run Tests** (si existen - actualmente opcional)

**Tecnologías:**

- Node.js 20 LTS
- pnpm 8 (con cache automático)
- TurboRepo para builds optimizados

```yaml
name: CI Build and Test

on:
  pull_request:
    branches: [master]
  push:
    branches: [master]

jobs:
  build-and-test:
    name: 🔍 Lint, Build & Test
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout repository
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: 📦 Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: 📚 Install dependencies
        run: pnpm install --frozen-lockfile

      - name: 🎨 Run linting
        run: pnpm run lint
        continue-on-error: true # TODO: Quitar cuando se corrijan todos los warnings

      - name: 🏗️ Build all packages
        run: pnpm run build

      - name: ✅ Run tests
        run: |
          if grep -q '"test"' package.json; then
            pnpm run test
          else
            echo "⚠️ No tests configured yet"
          fi

      - name: 🔎 Type check
        run: |
          cd packages/backend
          pnpm exec tsc --noEmit
```

---

#### [NEW] [release.yml](file:///d:/desarrollo/finanzas-app/.github/workflows/release.yml) (Opcional)

Workflow para auto-versionado cuando se mergea a `master`:

**Trigger:** `pull_request` cerrado y mergeado a `master`

**Acciones:**

1. Incrementar versión `patch` automáticamente
2. Crear tag git
3. Generar release notes

```yaml
name: Auto Release

on:
  pull_request:
    types: [closed]
    branches: [master]

jobs:
  release:
    name: 🚀 Create Release
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: 📦 Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: 🔢 Bump version
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          npm version patch -m "chore: release v%s"
          git push --follow-tags

      - name: 📝 Create GitHub Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          VERSION=$(node -p "require('./package.json').version")
          gh release create "v${VERSION}" \
            --title "Release v${VERSION}" \
            --generate-notes
```

---

### Phase 3: Branch Protection Rules (Configuración Manual en GitHub)

> [!NOTE]
> Esta fase requiere configuración manual en GitHub debido a que las Branch Protection Rules no se pueden gestionar vía archivos en el repositorio. Se proporciona la configuración exacta a aplicar.

**URL de configuración:**
`https://github.com/jeffrijol/finanzas-app/settings/branch_protection_rules/new`

**Configuración para `master`:**

| Regla                                     | Estado        | Configuración                                                                                                  |
| ----------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------- |
| **Require a pull request before merging** | ✅ Activar    | • Required approvals: `0` (eres solo tú)<br>• Dismiss stale reviews: ❌                                        |
| **Require status checks to pass**         | ✅ Activar    | • Require branches up to date: ✅<br>• Status checks requeridos:<br> - `build-and-test` (nombre del job en CI) |
| **Require conversation resolution**       | ✅ Activar    | Útil para auto-documentar decisiones                                                                           |
| **Require signed commits**                | ❌ Desactivar | Opcional, añade fricción                                                                                       |
| **Include administrators**                | ✅ Activar    | Tú también debes seguir las reglas<br>(pero puedes hacer override si es crítico)                               |
| **Restrict who can push**                 | ❌ Desactivar | No necesario (eres solo tú)                                                                                    |
| **Allow force pushes**                    | ❌ Desactivar | Protege historial de `master`                                                                                  |
| **Allow deletions**                       | ❌ Desactivar | Evita borrar `master` por error                                                                                |

---

### Phase 4: Documentación y Guías

#### [NEW] [CONTRIBUTING.md](file:///d:/desarrollo/finanzas-app/CONTRIBUTING.md)

Guía de contribución (útil para tu "yo del futuro" y por si colaboras con alguien):

**Contenido:**

- Flujo de trabajo Git (develop → PR → master)
- Convención de commits (Conventional Commits)
- Comandos de desarrollo más comunes
- Cómo ejecutar tests y linting

#### [MODIFY] [README.md](file:///d:/desarrollo/finanzas-app/README.md)

Agregar sección de **"Desarrollo"** con:

- Badges de CI/CD (status del workflow)
- Instrucciones de setup inicial
- Link a CONTRIBUTING.md

---

## Verification Plan

### Automated Tests

> [!CAUTION]
> No existen tests automatizados actualmente en el proyecto. La verificación será principalmente manual y mediante los workflows de CI.

**Post-implementación, los workflows verificarán automáticamente:**

1. ✅ Lint pasa (warnings no bloquean por ahora)
2. ✅ Type check exitoso en backend
3. ✅ Build completo sin errores

### Manual Verification

#### 1. Verificar estructura de archivos creados

```powershell
# Verificar que se crearon los archivos
ls .github/workflows/*.yml
ls .github/pull_request_template.md
ls CONTRIBUTING.md
```

**Resultado esperado:**

- `ci.yml` y `release.yml` (o solo `ci.yml` si el opcional no se implementa)
- `pull_request_template.md`
- `CONTRIBUTING.md`

---

#### 2. Probar workflow de CI localmente (opcional)

Instalar `act` para ejecutar GitHub Actions localmente:

```powershell
# Instalar act (requiere Docker)
choco install act-cli

# Simular el workflow
act pull_request
```

**Resultado esperado:** El workflow debe completar todos los pasos sin errores críticos.

---

#### 3. Configurar Branch Protection en GitHub

**Pasos manuales:**

1. Ir a: `https://github.com/jeffrijol/finanzas-app/settings/branches`
2. Click en "Add branch protection rule"
3. Aplicar configuración de la tabla en **Phase 3**
4. Guardar cambios

**Verificación:**

- Intentar hacer push directo a `master` → debe ser rechazado
- La UI de GitHub debe mostrar "Protected" junto a la rama `master`

---

#### 4. Crear primer PR de prueba

**Script de verificación:**

```powershell
# Crear rama de prueba
git checkout develop
git checkout -b test/ci-verification

# Hacer un cambio trivial
echo "# CI/CD Test" >> .github/CI_TEST.md
git add .github/CI_TEST.md
git commit -m "test: verificar workflow de CI"

# Push y crear PR
git push -u origin test/ci-verification
```

**Verificación en GitHub:**

1. Crear PR desde `test/ci-verification` → `master`
2. Verificar que el template de PR se carga automáticamente
3. Esperar a que el workflow `CI Build and Test` se ejecute
4. Verificar que aparece el check ✅ o ❌ en el PR
5. Si el check pasa, hacer merge
6. Verificar que el workflow de release (si se implementó) crea un tag

---

#### 5. Verificar flujo completo (develop → master)

**Flujo normal de trabajo:**

```powershell
# 1. Trabajar en develop
git checkout develop
# ... hacer cambios ...
git add .
git commit -m "feat(frontend): nueva funcionalidad"
git push origin develop

# 2. Crear PR
gh pr create --base master --head develop --title "feat: nueva funcionalidad" --fill

# 3. Esperar checks automáticos

# 4. Mergear desde GitHub UI

# 5. Actualizar develop con master
git checkout develop
git pull origin master
```

**Resultado esperado:**

- PR se crea correctamente
- Workflow de CI se ejecuta automáticamente
- Solo se puede mergear si los checks pasan
- (Opcional) Se crea release automático tras merge

---

## Rollback Plan

Si algo falla durante la implementación:

### Deshacer Branch Protection

1. Ir a `https://github.com/jeffrijol/finanzas-app/settings/branches`
2. Encontrar la regla de `master`
3. Click en "Delete"

### Desactivar Workflows

Dos opciones:

**Opción 1 (temporal):** Deshabilitar desde GitHub UI

- Settings → Actions → Disable workflows

**Opción 2 (permanente):** Eliminar archivos

```powershell
git rm .github/workflows/*.yml
git commit -m "chore: revertir workflows de CI"
git push
```

---

## Notas Adicionales

### Convención de Commits Recomendada

```
<type>(<scope>): <subject>

Examples:
feat(frontend): añadir gráficos de análisis trimestral
fix(backend): corregir filtro de fecha en analytics
chore(deps): actualizar dependencias de seguridad
docs: actualizar guía de instalación
```

**Types válidos:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `chore`: Tareas de mantenimiento
- `docs`: Documentación
- `style`: Formato de código
- `refactor`: Refactorización
- `test`: Tests
- `perf`: Mejoras de performance

### Comandos Útiles Post-Implementación

```powershell
# Crear PR desde CLI
gh pr create --base master --head develop --fill

# Ver status de checks de un PR
gh pr checks

# Mergear PR desde CLI (solo si checks pasan)
gh pr merge --squash --delete-branch

# Ver workflows ejecutándose
gh run list

# Ver logs de un workflow
gh run view <run-id> --log
```
