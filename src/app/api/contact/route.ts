import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPortfolio } from '@/lib/content';

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  message: z.string().trim().min(10).max(5000),
  // Honeypot: real users never see or fill this. Bots do.
  company: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation' }, { status: 400 });
  }

  const { name, email, message, company } = parsed.data;
  // Silently accept-and-drop spam so bots get no signal.
  if (company && company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? getPortfolio().profile.email;
  if (!key) {
    return NextResponse.json({ error: 'unconfigured' }, { status: 503 });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: [to],
        reply_to: email,
        subject: `New portfolio message from ${name}`,
        text: `${message}\n\n— ${name} <${email}>`,
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'send' }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: 'send' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
