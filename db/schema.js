const {gql} = require('apollo-server');

//Schema
const typeDefs = gql`
    type User {
        id: ID
        name: String
        lastName: String
        email: String
        created: String        
    }
    
    type Token {
        token: String
    }

    type Product {
        id: ID
        name: String
        stock: Int
        price: Float
        created: String
    }

    type Client {
        id: ID
        name: String
        lastName: String
        company: String
        email: String
        phone: String
        vendor: ID
    }

    input UserInput {
        name: String!
        lastName: String!
        email: String!
        password: String!
    }

    input ProductInput {
        name: String!
        stock: Int!
        price: Float!
    }

    input ClientInput {
        name: String!
        lastName: String!
        company: String!
        email: String!
        phone: String
    }

    input AuthInput {
        email: String!
        password: String!
    }

    type Query {
        #Users
        getUser(token: String!) : User

        #Products
        getProducts: [Product]
        getProduct(id: ID!) : Product

        #Clients
        getClients: [Client]
        getClientsVendor: [Client]
        getClient(id: ID!): Client
    }
    
    type Mutation {
        #Users
        newUser(input: UserInput) : User
        authUser(input: AuthInput) : Token
        
        #Products
        newProduct(input: ProductInput): Product
        updateProduct(id: ID!, input: ProductInput): Product
        deleteProduct(id: ID!): String

        #Clients
        newClient(input: ClientInput) : Client
    }
`;

module.exports = typeDefs;