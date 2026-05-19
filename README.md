# Vobels Limited

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![Deployed on Cloudflare](https://img.shields.io/badge/Deployed%20on-Cloudflare-F38020?logo=cloudflare)](https://pages.cloudflare.com)

Official website for Vobels Limited - a full-service development and growth firm building businesses from idea to maturity.

## 🚀 Overview

Vobels provides end-to-end business enablement services including:

- **Business Formation & Structure** - CAC registration, NGO registration, Trademark, NAFDAC, SCUML
- **Business Design & Identity** - Brand identity, logo design, brand guidelines
- **Operations & Management** - BizOS setup, workflow automation, financial systems
- **Digital Presence & Technology** - Websites, web applications, API integration
- **Growth & Expansion** - Content strategy, paid ads, market entry
- **Global Business Access** - DUNS numbers, US/UK business registration

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Astro](https://astro.build) v6 |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) |
| Payments | [Paystack](https://paystack.com) |
| Icons | [Boxicons](https://boxicons.com) |
| Package Manager | [pnpm](https://pnpm.io) |

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/vobels-website.git
cd vobels-website

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm run dev
Environment Variables
Create a .env file with the following variables:

env
PAYSTACK_SECRET_KEY=your_paystack_secret_key
GOOGLE_SHEET_URL=your_google_sheet_webhook_url
WHATSAPP_GROUP_LINK=your_whatsapp_group_link
VOBELS_ADMIN_EMAIL=admin_email
VOBELS_ADMIN_PASSWORD=admin_password
🏗️ Project Structure
text
/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and media
│   ├── components/      # Reusable UI components
│   │   ├── admin/       # Admin dashboard components
│   │   ├── navbar/      # Navigation components
│   │   └── ui/          # Base UI elements
│   ├── content/         # Blog and team content
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route pages
│   │   ├── academy/     # Agent certification
│   │   ├── admin/       # Admin dashboard
│   │   ├── api/         # API endpoints
│   │   └── pillars/     # Service pillar pages
│   ├── styles/          # Global styles
│   └── utils/           # Utility functions
├── astro.config.mjs     # Astro configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies
🚢 Deployment
Automatic Deployment (Recommended)
This project is configured for automatic deployment to Cloudflare Pages:

Push your code to GitHub

Connect your repository to Cloudflare Pages

Set build command: pnpm run build

Set output directory: dist

Cloudflare deploys automatically on every push

Manual Deployment
bash
# Build for production
pnpm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=vobels-website
📝 Available Scripts
CommandDescription
pnpm run devStart development server
pnpm run buildBuild for production
pnpm run previewPreview production build
pnpm run deployBuild and deploy to Cloudflare
🔒 Environment Variables (Production)
Set these in Cloudflare Pages dashboard:

VariableDescription
PAYSTACK_SECRET_KEYPaystack payment gateway secret
GOOGLE_SHEET_URLGoogle Apps Script webhook URL
WHATSAPP_GROUP_LINKWhatsApp community invite link
VOBELS_ADMIN_EMAILAdmin dashboard email
VOBELS_ADMIN_PASSWORDAdmin dashboard password
📄 License
© Vobels Limited. All rights reserved.

📞 Contact
Website: https://vobels.com.ng

Email: vobels.co@gmail.com

WhatsApp: Speak with a Partner

Built with ❤️ by Vobels Limited
