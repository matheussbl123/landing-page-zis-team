import { google } from 'googleapis';

type ContactPayload = { name?: unknown; subject?: unknown; message?: unknown };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}

function asField(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] ?? character);
}

async function sendNotification(input: { name: string; subject: string; message: string; apiKey: string; recipient: string; from: string }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${input.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: input.from,
      to: [input.recipient],
      subject: `Novo contato ZisTeam: ${input.subject}`,
      html: `<h1>Novo contato pelo site ZisTeam</h1><p><strong>Nome:</strong> ${escapeHtml(input.name)}</p><p><strong>Assunto:</strong> ${escapeHtml(input.subject)}</p><p><strong>Mensagem:</strong></p><p>${escapeHtml(input.message).replace(/\n/g, '<br>')}</p>`,
    }),
  });
  if (!response.ok) throw new Error(`Resend retornou ${response.status}.`);
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ message: 'Método não permitido.' }, 405);

  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const range = process.env.GOOGLE_SHEETS_CONTACT_RANGE;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const notificationRecipient = process.env.CONTACT_NOTIFICATION_EMAIL;
  const notificationFrom = process.env.CONTACT_FROM_EMAIL;
  if (!sheetId || !range || !clientEmail || !privateKey || !resendApiKey || !notificationRecipient || !notificationFrom) {
    return json({ message: 'O formulário ainda não está configurado para receber mensagens.' }, 503);
  }

  let payload: ContactPayload;
  try { payload = (await request.json()) as ContactPayload; }
  catch { return json({ message: 'Dados de envio inválidos.' }, 400); }

  const name = asField(payload.name, 120);
  const subject = asField(payload.subject, 160);
  const message = asField(payload.message, 3000);
  if (!name || !subject || !message) return json({ message: 'Preencha nome, assunto e mensagem.' }, 400);

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[new Date().toISOString(), name, subject, message]] },
    });
    try {
      await sendNotification({ name, subject, message, apiKey: resendApiKey, recipient: notificationRecipient, from: notificationFrom });
      return json({ ok: true, message: 'Mensagem enviada com sucesso. Obrigado pelo contato!' });
    } catch (error) {
      console.error('Contact notification email failed', error);
      return json({ ok: true, notification: false, message: 'Mensagem registrada. A notificação por e-mail não pôde ser enviada agora.' }, 202);
    }
  } catch (error) {
    console.error('Google Sheets contact submission failed', error);
    return json({ message: 'Não foi possível registrar sua mensagem. Tente novamente em instantes.' }, 502);
  }
}
