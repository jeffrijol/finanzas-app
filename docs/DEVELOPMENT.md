# Development Guide

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start Database:
   ```bash
   npm run db:up
   ```

3. Run Development Server:
   ```bash
   npm run dev
   ```

## Structure

The project is a monorepo using Turbo/Workspaces.
- `packages/backend`: Express API.
- `packages/frontend`: Astro Frontend.
