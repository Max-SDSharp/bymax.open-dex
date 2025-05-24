# Bymax OpenDEX

A decentralized exchange (DEX) interface powered by Next.js, TypeScript, and Tailwind CSS.

## About

Bymax OpenDEX is a modern, high-performance decentralized exchange interface inspired by Drift Protocol. It provides a seamless trading experience with low slippage, minimal price impact, and competitive fees.

### Key Features

- **Low Slippage Trading**: Execute trades with minimal price impact
- **Multiple Liquidity Sources**: Trades are supported by multiple liquidity mechanisms:
  - Just-in-Time (JIT) Auction Liquidity
  - Limit Orderbook Liquidity
  - AMM Liquidity as a backstop
- **Cross-Collateral**: Use any supported token as collateral for trading
- **Responsive Design**: Optimized for all devices with a modern UI

## Products

Drift Protocol offers four primary products:

1. **Spot Trading**: Trade tokens directly with immediate settlement
2. **Perpetuals Trading**: Trade perpetual futures contracts with leverage
3. **Borrow & Lend**: Supply assets to earn yield or borrow against your collateral
4. **Passive Liquidity Provision**: Provide liquidity to the protocol and earn fees

## Technical Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom components
- **Development**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 23.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/open-dex.git
cd open-dex
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

This project uses Next.js App Router for routing and Tailwind CSS for styling. The main structure is:

- `src/`: Contains the source code
  - `app/`: App Router components and routes
  - `components/`: Reusable UI components
  - `hooks/`: Custom React hooks
  - `lib/`: Utility functions and APIs
  - `styles/`: Global styles and Tailwind configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Inspired by [Drift Protocol](https://www.drift.trade/)
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
