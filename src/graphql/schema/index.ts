import { userTypeDefs } from './user.schema.js';
import { projectTypeDefs } from './project.schema.js';
import { memberTypeDefs } from './member.schema.js';


export const typeDefs = `#graphql
  scalar Date
  ${userTypeDefs}
  ${projectTypeDefs}
  ${memberTypeDefs}
`;
