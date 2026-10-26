import { beforeAll, describe, expect, it } from 'vitest';
import SwaggerParser from '@apidevtools/swagger-parser';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openApiDocument } from '../src/docs/openapi';
import { api, app, resetDb } from './helpers';

beforeAll(resetDb);

type Layer = { route?: { path: string; methods: Record<string, boolean> }; name?: string; handle?: { stack?: Layer[] } };

/** אוסף את כל הנתיבים שרשומים בפועל ב-Express תחת /api */
function collectRoutes(): string[] {
  const routes: string[] = [];
  const apiLayer = (app as unknown as { router: { stack: Layer[] } }).router.stack.find(
    (l) => l.name === 'router' && l.handle?.stack?.some((s) => s.name === 'router'),
  );
  if (!apiLayer?.handle?.stack) throw new Error('api router not found');
  // אותו סדר כמו ב-src/routes.ts
  const prefixes = ['', '/auth', '/me', '/tracks', '/menus', '/foods', '/weights', '/meals', '/consultations', '/admin'];
  apiLayer.handle.stack.forEach((layer, i) => {
    for (const r of layer.handle?.stack ?? []) {
      if (!r.route) continue;
      for (const m of Object.keys(r.route.methods)) {
        const path = `/api${prefixes[i]}${r.route.path === '/' ? '' : r.route.path}`.replace(/:(\w+)/g, '{$1}');
        routes.push(`${m.toUpperCase()} ${path}`);
      }
    }
  });
  return routes.sort();
}

describe('Swagger / OpenAPI', () => {
  it('המסמך תקין לפי תקן OpenAPI 3', async () => {
    await SwaggerParser.validate(structuredClone(openApiDocument) as never);
  });

  it('כל נתיב שקיים בשרת מתועד, ולהפך - 36 Endpoints', () => {
    const documented = Object.entries(openApiDocument.paths)
      .flatMap(([path, ops]) => Object.keys(ops).map((m) => `${m.toUpperCase()} ${path}`))
      .sort();
    expect(collectRoutes()).toEqual(documented);
    expect(documented).toHaveLength(36);
  });

  it('כל נתיב מוגן מוגדר עם bearerAuth וקודי 401', () => {
    for (const [path, ops] of Object.entries(openApiDocument.paths)) {
      for (const [method, op] of Object.entries(ops as Record<string, { security?: unknown; responses: Record<string, unknown> }>)) {
        const isPublic = ['/api/health', '/api/options', '/api/auth/login', '/api/auth/register'].includes(path);
        if (isPublic) continue;
        expect(op.security, `${method} ${path}`).toEqual([{ bearerAuth: [] }]);
        expect(op.responses['401'], `${method} ${path}`).toBeDefined();
      }
    }
  });

  it('docs/openapi.json מעודכן', () => {
    const file = JSON.parse(readFileSync(join(__dirname, '..', 'docs', 'openapi.json'), 'utf8'));
    expect(file).toEqual(JSON.parse(JSON.stringify(openApiDocument)));
  });

  it('Swagger UI נפתח ב-/api-docs', async () => {
    const res = await api().get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });

  it('המסמך זמין גם כ-JSON', async () => {
    const res = await api().get('/api-docs.json');
    expect(res.status).toBe(200);
    expect(res.body.components.securitySchemes.bearerAuth).toMatchObject({ type: 'http', scheme: 'bearer' });
  });
});

describe('בדיקות כלליות', () => {
  it('GET /api/health', async () => {
    const res = await api().get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('GET /api/options מחזיר תוויות בעברית', async () => {
    const res = await api().get('/api/options');
    expect(res.status).toBe(200);
    expect(res.body.foodCategories).toContainEqual({ value: 'FRUITS', label: 'פירות' });
    expect(res.body.mealTypes).toHaveLength(4);
  });
});
