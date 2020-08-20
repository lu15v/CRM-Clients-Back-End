const {ApolloServer} = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolver');
const connectDB = require('./config/db');

//DB connection
connectDB();

//server
const server = new ApolloServer({
    typeDefs,
    resolvers
});


//Start server
server.listen().then( ({url}) =>{
    console.log(`Server ready on port ${url}`)
})
