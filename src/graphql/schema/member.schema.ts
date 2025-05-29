export const memberTypeDefs = `#graphql
  type Member {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    members: [Member!]!
  }
`;   