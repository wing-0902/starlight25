export const prerender = false;

import { v4 as uuidv4 } from 'uuid';
import type { APIRoute } from 'astro';
import type { KVNamespace } from '@cloudflare/workers-types';

interface RuntimeEnv {
  SURVEY_ANSWERS: KVNamespace;
  TURNSTILE_SECRET_KEY: string;
}
interface SurveyData {
  about: string;
  rate: number;
  comment?: string;
  timestamp: number;
  length?: string;
  alreadyRead?: string[];
}

export const POST: APIRoute = async ({ request, locals }) => {
  const id = uuidv4();

  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim();

  const typedEnv = locals.runtime.env as RuntimeEnv;

  try {
    const formData = await request.formData();

    // IDを作成
    const key = uuidv4();

    // Turnstileトークンを取得
    const turnstileToken = formData.get('cf-turnstile-response');
    
    // トークンがない場合
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: 'Turnstile認証が完了していません．' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 先に他のバリデーションをしましょう

    const about = formData.get('about') as string;
    const rate = parseInt(formData.get('rate') as string, 10);
    const comment = formData.get('comment') as string || undefined;
    
    // aboutの値に応じて追加のデータを取得
    let length = undefined;
    let alreadyRead = undefined;

    if (about === 'book') {
      alreadyRead = formData.getAll('alreadyRead') as string[];
      if (alreadyRead.length === 0) {
        return new Response(JSON.stringify({ error: 'お読みになった部誌を一つ以上選択してください。' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else if (about === 'planetarium') {
      length = formData.get('length') as string;
      if (!length) {
        return new Response(JSON.stringify({ error: 'プラネタリウムの時間は必須項目です。選択してください。' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: 'オプションが無効です．' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: SurveyData = {
      about,
      rate,
      comment,
      timestamp: Date.now(),
      length,
      alreadyRead,
    };
      
    // 必須項目である about と rate のバリデーション
    if (!data.about || data.rate < 1 || data.rate > 5) {
      return new Response(JSON.stringify({ error: 'フォーム内容の形式に誤りがあります．' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }


    // Turnstile検証

    // Cloudflareの検証エンドポイントにリクエスト
    const verificationResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: `secret=${encodeURIComponent(typedEnv.TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(turnstileToken as string)}&remoteip=${ip}&idempotency_key=${key}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const verificationResult = await verificationResponse.json();

    // 検証失敗
    if (!verificationResult.success) {
      console.error('Turnstile検証失敗：', verificationResult['error-codes']);
      return new Response(JSON.stringify({ error: 'Turnstileトークンが無効です．' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Workers KVに保存
    await typedEnv.SURVEY_ANSWERS.put(key, JSON.stringify(data));

    // 成功した時のレスポンス
    return new Response(JSON.stringify({ message: 'アンケート回答が保存されました．', key: key}), {
      status: 200,
      headers: { 'Content-Type': 'application/json'},
    });
  } catch (error) {
    console.error('API処理エラー：', error);
    return new Response(JSON.stringify({ error: '予期せぬエラーが発生しました．' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json'},
    })
  }
}