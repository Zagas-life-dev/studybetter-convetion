# Migrating to pnpm

## Quick Migration Steps

### 1. Install pnpm globally (if not already installed)
```bash
npm install -g pnpm
```

Or using PowerShell (Windows):
```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

### 2. Remove npm artifacts
Delete these files/folders:
- `node_modules/` folder
- `package-lock.json` file

On Windows, you may need to:
- Close your IDE/editor
- Delete `node_modules` manually from File Explorer
- Or use PowerShell: `Remove-Item -Recurse -Force node_modules`

### 3. Install dependencies with pnpm
```bash
pnpm install
```

This will:
- Create a `pnpm-lock.yaml` file (instead of package-lock.json)
- Install all dependencies using pnpm's efficient linking system
- Handle peer dependencies better than npm

### 4. Update your scripts (optional)
If you have any npm-specific scripts, you can update them to use pnpm:

```json
{
  "scripts": {
    "dev": "pnpm next dev",
    "build": "pnpm next build",
    "start": "pnpm next start"
  }
}
```

### 5. Benefits of pnpm
- **Faster**: Uses hard links and symlinks to save disk space and speed up installs
- **Better peer dependency handling**: Resolves conflicts more intelligently
- **Strict**: Prevents phantom dependencies (packages not declared in package.json)
- **Disk efficient**: Shared store across projects

## Troubleshooting

If pnpm command is not found after installation:
1. Restart your terminal/IDE
2. Check PATH: `echo $PATH` (Linux/Mac) or `$env:PATH` (PowerShell)
3. Use `npx pnpm` instead of `pnpm` temporarily

## After Migration

- Use `pnpm` instead of `npm` for all commands:
  - `pnpm install` (instead of `npm install`)
  - `pnpm add <package>` (instead of `npm install <package>`)
  - `pnpm remove <package>` (instead of `npm uninstall <package>`)
  - `pnpm run <script>` (instead of `npm run <script>`)









