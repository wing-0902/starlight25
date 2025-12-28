export const prerender = false;

import { v4 as uuid } from 'uuid';
import type { APIRoute } from 'astro';
import type { KVNamespace } from '@cloudflare/workers-types';

interface RuntimeEnv {
  SURVEY_ANSWERS: KVNamespace;
  TURNSTILE_SECRET_KEY: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
    
}