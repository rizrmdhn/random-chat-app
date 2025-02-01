# Random Chat App

This is a [T3 Stack](https://create.t3.gg/) project with real-time chat functionality.

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [Redis](https://redis.io) - Real-time pub/sub
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [tRPC](https://trpc.io) - End-to-end typesafe API

## Features

- Real-time chat using Redis pub/sub
- User authentication with NextAuth.js
- PostgreSQL database with Drizzle ORM
- Type-safe API endpoints with tRPC
- Modern UI with Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Copy `.env.example` to `.env` and configure environment variables
4. Run migrations with `pnpm db:push`
5. Start the development server with `pnpm dev`

## Learn More

To learn more about the technologies used:

- [T3 Stack Documentation](https://create.t3.gg/)
- [Redis Pub/Sub Documentation](https://redis.io/docs/interact/pubsub/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)

## Deployment

Deploy using:

- [Vercel](https://create.t3.gg/en/deployment/vercel)
- [Docker](https://create.t3.gg/en/deployment/docker)
