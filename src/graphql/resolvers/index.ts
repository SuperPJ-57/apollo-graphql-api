import { userResolvers } from './user.resolver.js';

export const resolvers = {
  Mutation: {
    ...userResolvers.Mutation,
  },
  
};
