<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1FognpKRRgogbRIprGDeVW2X62Z-5PrI_

## Run Locally

**Prerequisites:**  Node.js

1.  Install dependencies:
    `npm install`
2.  Copy `.env.example` to `.env.local` and set the following keys:
    *   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (Supabase)
    *   `VITE_GEMINI_API_KEY` (Gemini API Key do Google)
3.  Run the app:
    `npm run dev`

### 🚀 Novas Funcionalidades de IA (Gemini)
O sistema agora utiliza o **Gemini 2.0 Flash** para:
- **Geração de Termos de Consentimento**: Analisa os dados de saúde e residência do recruta para gerar um termo personalizado de alta intensidade em conformidade com a LGPD.
- **Insights Estratégicos**: O painel administrativo agora recebe insights automáticos sobre as metas da missão e conversão de participantes.
