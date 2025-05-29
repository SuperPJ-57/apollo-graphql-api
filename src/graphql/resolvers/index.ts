import { GraphQLScalarType, Kind } from 'graphql';
import { memberResolvers } from './member.resolver.js';
import { projectResolvers } from './project.resolver.js';
import { userResolvers } from './user.resolver.js';

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Custom Date scalar type',
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value as string);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

export const resolvers = {
  Date: dateScalar,
  Mutation: {
    ...userResolvers.Mutation,
   
  },
  Query: {
    ...userResolvers.Query,
    ...projectResolvers.Query,
    ...memberResolvers.Query,
  },
  
};
