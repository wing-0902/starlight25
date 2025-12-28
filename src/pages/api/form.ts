export const prerender = false;

import { v4 as uuidv4 } from 'uuid';
import type { APIRoute } from 'astro';
import type { KVNamespace } from '@cloudflare/workers-types';

interface RuntimeEnv {
  SURVEY_ANSWERS: KVNamespace;
  TURNSTILE_SECRET_KEY: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const id = uuidv4();
}