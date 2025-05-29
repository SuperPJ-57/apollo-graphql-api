import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { typeDefs } from './graphql/schema/index.js';
import { resolvers } from './graphql/resolvers/index.js';
import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import { MyContext } from './types/context.js';
import { getUserFromRequest } from './middleware/authMiddleware.js';


// 👇 Pass context type to ApolloServer
const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});

await server.start();

const app = express();

app.use(
  '/graphql',
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }: ExpressContextFunctionArgument): Promise<MyContext> => {
      const user = getUserFromRequest(req);
      console.log('User from request:', user);
      return { req, res, user };
    },
  })
);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}/graphql`);
});
