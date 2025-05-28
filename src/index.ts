import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import { typeDefs } from './graphql/schema/index.js';
import { resolvers } from './graphql/resolvers/index.js';
import './config/env.js';

const app = express();

// Create Apollo Server instance
const server = new ApolloServer({ typeDefs, resolvers });

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true // if you need to allow credentials
};

// Start the server and apply middleware
async function startServer() {
  await server.start();
  
  // Apply middleware with CORS configuration
  app.use(
    '/graphql',
    cors(corsOptions),  // Apply CORS with specific origin
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );
  
  // Start Express server
  app.listen(4000, () => {
    console.log(`Server ready at http://localhost:4000/graphql`);
    console.log(`CORS configured for http://localhost:3000`);
  });
}

startServer();