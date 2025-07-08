# Checkout.com Flow Integration

A modern payment integration demo using Checkout.com Flow with Next.js and Tailwind CSS.

## Features

- ✅ Next.js 14 with App Router (JavaScript, no TypeScript)
- ✅ Tailwind CSS for styling
- ✅ Checkout.com Flow integration with CDN
- ✅ Payment session API endpoint
- ✅ Success/failure page handling
- ✅ Responsive design with modern UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- Checkout.com sandbox account
- API keys from Checkout.com Dashboard

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dchewjd/checkout-flow-app.git
cd checkout-flow-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Checkout.com API keys to `.env.local`:
```
CHECKOUT_SECRET_KEY=sk_sbox_your_secret_key_here
NEXT_PUBLIC_CHECKOUT_PUBLIC_KEY=pk_sbox_your_public_key_here
PROCESSING_CHANNEL_ID=pc_your_processing_channel_id_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Keys Setup

1. Go to [Checkout.com Dashboard](https://dashboard.checkout.com)
2. Create API keys with the following scopes:
   - **Public Key**: `payment-sessions:pay` and `vault-tokenization`
   - **Secret Key**: `payment-sessions`
3. Get your Processing Channel ID from the Dashboard

## Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Add the environment variables in Vercel dashboard
3. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dchewjd/checkout-flow-app)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── payment-session/
│   │       └── route.js          # Payment session creation endpoint
│   ├── checkout/
│   │   └── page.js               # Checkout page with Flow component
│   ├── success/
│   │   └── page.js               # Payment success page
│   ├── failure/
│   │   └── page.js               # Payment failure page
│   └── page.js                   # Homepage
└── ...
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CHECKOUT_SECRET_KEY` | Your Checkout.com secret key |
| `NEXT_PUBLIC_CHECKOUT_PUBLIC_KEY` | Your Checkout.com public key |
| `PROCESSING_CHANNEL_ID` | Your processing channel ID |
| `NEXT_PUBLIC_BASE_URL` | Your application URL |

## Development Notes

- This project uses the CDN version of Checkout.com Web Components
- All payments are processed in sandbox mode
- The application includes proper error handling and loading states
- Console logs are included for debugging purposes

## License

This project is for demonstration purposes only.
