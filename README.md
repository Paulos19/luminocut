# Luminocut - Frontend (Next.js 16)

Interface web editorial de alta precisão para remoção de fundos com IA, suporte a matting neural, edição em estúdio claro, retoque manual e Three.js.

## 🚀 Tecnologias
- **Next.js 16 (App Router)**
- **Tailwind CSS v4**
- **Three.js** (gotas de vidro refrativas e orbe neural 3D)
- **GSAP** (animações de entrada e transições de slider)
- **Lucide Icons** & **Canvas Confetti**

## 📦 Deploy no Easypanel
1. Crie um novo serviço no Easypanel a partir deste repositório GitHub.
2. Selecione o tipo de build: **Dockerfile**.
3. Adicione a variável de ambiente (ou Build Arg):
   - `NEXT_PUBLIC_API_URL`: URL pública HTTPS do seu backend (ex: `https://api.seudominio.com`).
4. Porta da aplicação: `3000`.
