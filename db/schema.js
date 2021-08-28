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

    type Order{
        id: ID
        order: [OrderGroup]
        total: Float
        client: ID
        date: String
        state: StatusOrder
    }

    type OrderGroup{
        id: ID
        quantity: Int
    }

    type TopClient{
        total: Int
        client: [Client]
    }

    type TopVendor{
        total: Int
        vendor: [User]
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
    input OrderProductInput{
        id: ID
        quantity: Int
    }
    input OrderInput{
        order: [OrderProductInput]
        total: Float
        client: ID
        state: StatusOrder
    }

    enum StatusOrder{
        PENDING
        SHIPPED
        COMPLETED
        CANCELED
    }

    type Query {
        #Users
        getUser: User

        #Products
        getProducts: [Product]
        getProduct(id: ID!) : Product

        #Clients
        getClients: [Client]
        getClientsVendor: [Client]
        getClient(id: ID!): Client

        #Orders
        getOrders: [Order]
        getOrdersVendor: [Order]
        getOrder(id: ID!): Order
        getOrderByState(state: StatusOrder): [Order]


        #Advanced searchs
        bestClients: [TopClient]
        bestVendors: [TopVendor]
        searchProduct(text: String!): [Product]
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
        updateClient(id: ID!, input: ClientInput): Client
        deleteClient(id: ID!): String

        #Orders
        newOrder(input: OrderInput): Order
        updateOrder(id: ID!, input: OrderInput): Order
        deleteOrder(id: ID!): String
    }
`;

module.exports = typeDefs;