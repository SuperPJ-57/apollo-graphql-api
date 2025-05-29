export const projectTypeDefs = `#graphql
  type Project {
    id: ID!
    name: String!
    createdAt: Date
  }
  type Query {
    projects: [Project!]!
  }    
`;   