
export const userTypeDefs = `#graphql
  type User {
    id: ID!
    firstname: String!
    lastname: String!
    email: String!
  }
  


  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  input SignupInput {
    firstname: String!
    lastname: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    _empty: String
  }

  type Mutation {
    signup(input: SignupInput!): User!
    login(input: LoginInput!): AuthPayload!
    refreshToken(refreshToken: String!): AuthPayload!
  }
`;
