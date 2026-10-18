# ZisTeam landing page

Landing page em React/Vite reproduzindo as sete artes do projeto ZisTeam em quadros 16:9, com navegação, contatos e formulário funcional.

## Rodar localmente

```bash
pnpm install
pnpm run build
pnpm run dev
```

## Importar na Vercel

1. Importe este repositório na Vercel com o framework `Vite`.
2. Mantenha `pnpm run build` como comando de build e `dist` como diretório de saída.
3. Cadastre as variáveis de ambiente abaixo no projeto Vercel.
4. Crie na planilha Google a aba `Contatos` com as colunas: `Data/Hora`, `Nome`, `Assunto` e `Mensagem`.
5. Compartilhe a planilha com o e-mail da conta de serviço Google configurada em `GOOGLE_CLIENT_EMAIL`.

```text
GOOGLE_SHEETS_ID=<id da planilha>
GOOGLE_SHEETS_CONTACT_RANGE=Contatos!A:D
GOOGLE_CLIENT_EMAIL=<e-mail da conta de serviço>
GOOGLE_PRIVATE_KEY=<chave privada da conta de serviço>
RESEND_API_KEY=<chave da API do Resend>
CONTACT_NOTIFICATION_EMAIL=matheusbl123@gmail.com
CONTACT_FROM_EMAIL=ZisTeam <contato@seu-dominio-verificado.com>
```

O endpoint `POST /api/contact` valida `name`, `subject` e `message`, inclui uma linha na planilha e envia a mesma resposta para `CONTACT_NOTIFICATION_EMAIL`. Sem essas variáveis, o formulário informa que o recebimento de mensagens ainda não está configurado. Para produção, verifique um domínio de envio no Resend e use-o em `CONTACT_FROM_EMAIL`.

## Links externos

Edite o objeto `externalLinks` em `src/App.tsx` com os endereços oficiais de Instagram, YouTube, TikTok, Threads e das páginas de modalidades. Até lá, cada área mostra um aviso de canal em breve em vez de levar o visitante a uma página inexistente.
