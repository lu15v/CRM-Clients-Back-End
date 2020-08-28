const User = require('../models/User');
const Client = require('../models/Client');
const Product = require('../models/Product');
const Order = require('../models/Order');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config({path: 'variables.env'});

const createToken = (user, secret, exp) => {
    const {id, email, name, lastName} = user;

    return jwt.sign({id, email, name, lastName}, secret, { expiresIn: exp})
}

//Resolver
const resolvers  = {
    Query: {
        //Users
        getUser: async (_,{token}) => {
            const userId = await jwt.verify(token, process.env.SECRET);

            return userId;
        },

        //Products
        getProducts: async () => {
            try{
                const products = await Product.find({});
                return products
            }
            catch(error){
                console.log(error);
            }
        },
        getProduct: async (_,{id}) => {
            const productExists = await Product.findById(id);

            if(!productExists){
                throw new Error(`Product with id ${id} not found`)
            }
            return productExists
        },
        getClients: async () => {
            try{
                const clients = Client.find({});
                return clients;
            }catch(error){
                console.log(error);
            }
        },
        getClientsVendor: async (_, {}, ctx) =>{
            try{
                const clients = Client.find({vendor: ctx.user.id.toString()});
                return clients;
            }catch(error){
                console.log(error);
            }
        },
        getClient: async (_,{id}, ctx) => {
            const clientExists = await Client.findById(id);

            if(!clientExists) throw new Error(`Client with ID: ${id} does not exists`);

            if(clientExists.vendor.toString() !== ctx.user.id){
                throw new Error(`You are not authorized to see this client`);
            }

            return clientExists;
        },
        getOrders: async () =>{
            try{
                const orders = await Order.find({});
                return orders;
            }catch(error){
                console.log(error);
            }
        },
        getOrdersVendor: async (_,{}, ctx) => {
            try{
                const orders = await Order.find({vendor: ctx.user.id});
                return orders;
            }catch(error){
                console.log(error);
            }
        },
        getOrder: async(_, {id}, ctx) =>{
            const orderExists = await Order.findById(id);
            if(!orderExists) throw new Error(`The order with the id: ${id} does not exists`);
            if(orderExists.vendor.toString() !== ctx.user.id) throw new Error(`You don't have permissions to see this order`);

            return orderExists;

        },
        getOrderByState: async(_, {state}, ctx) =>{
            try{
                const orders = await Order.find({vendor: ctx.user.id, state})
                return orders;
            }catch(error){
                console.log(error);
            }
        },
        bestClients: async () =>{
            const clients = await Order.aggregate([
                {$match: {state: "COMPLETED"}},
                {$group :{
                    _id : '$client',
                    total: {$sum: '$total'}
                }},
                {
                    $lookup: {
                        from: 'clients',
                        localField: '_id',
                        foreignField: "_id",
                        as: "client"
                    }
                },
                {
                    $sort: {total: -1}
                },
                {
                    $limit: 10
                }
            ]);
            return clients;
        },
        bestVendors: async () =>{
            const vendors = await Order.aggregate([
                {$match: {state: "COMPLETED"}},
                {$group:{
                    _id: "$vendor",
                    total: {$sum: '$total'}
                }},
                {
                    $lookup:{
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vendor'
                    }
                },
                {
                    $sort: {total: -1}
                },
                {
                    $limit: 3
                }
            ]);
            return vendors;
        },
        searchProduct: async(_,{text}) =>{
            const products = await Product.find({$text: {$search: text} });

            return products;
        }
    },
    Mutation :{
        newUser: async (_, {input}) => {
            
            const {email, password} = input;
            //Check if the user exists.
            const userExists = await User.findOne({email});
            if(userExists){
                throw new Error('User already registered');
            }
            //Passwords Hashing
            //const salt = await bcryptjs.getSalt(10);
            input.password = await bcryptjs.hash(password, bcryptjs.genSaltSync(10));
            //save it to the db.
            try{
                const user = new User(input);
                user.save();
                return user;
            }
            catch(error){
                console.log(error)
            }
        },
        
        authUser:  async (_, {input}) => {
            const {email, password} = input;
            //User exists?
            const userExists = await User.findOne({email});
            if(!userExists){
                throw new Error('User does not exists');
            }

            //Check if the password is ok
            const correctPass = await bcryptjs.compare(password, userExists.password);

            if(!correctPass){
                throw new Error('Wrong password');
            }
            //Create Token
            return {
                token: createToken(userExists, process.env.SECRET, '24h')
            }
        },
        newProduct: async  (_, {input}) => {
            try{
                const product = new Product(input);
                product.save();
                return product;
            }
            catch(error){
                console.log(error);
            }
        },
        updateProduct: async  (_, {id, input}) => {
            let productExists = await Product.findById(id);

            if(!productExists){
                throw new Error(`Product with id ${id} not found`)
            }

            productExists = await Product.findOneAndUpdate({_id : id}, input, {new: true, useFindAndModify: false});
            
            return productExists;
        },
        deleteProduct: async  (_, {id}) => {
            const productExists = await Product.findById(id);

            if(!productExists){
                throw new Error(`Product with id ${id} not found`)
            }
            await Product.findOneAndDelete({_id : id});

            return `Product ${id} eliminated`;
        },
        newClient: async (_, {input}, ctx) => {
            const {email} = input;
            const clientExists = await Client.findOne({email});
            if(clientExists) throw new Error(`email ${email} already registered`);
            const newClient = new Client(input);

            try{
                newClient.vendor = ctx.user.id;
                const result = await newClient.save();
    
                return result;
            } catch(error){
                console.log(error);
            }
        },
        updateClient: async (_, {id, input}, ctx) => {
            let clientExists = await Client.findById(id);
            if(!clientExists) throw new Error(`Client with id ${id} does not exists`);

            if(clientExists.vendor.toString() !== ctx.user.id) throw new Error(`You are not authorized for updating this client`);

            try{
                clientExists =  await Client.findOneAndUpdate({_id: id}, input, {new: true,useFindAndModify: false});
                clientExists.save();
                return clientExists;
            }catch(error){
                console.log(error)
            }
        },
        deleteClient: async (_, {id}, ctx) => {
            let clientExists = await Client.findById(id);
            if(!clientExists) throw new Error(`Client with id ${id} does not exists`);

            if(clientExists.vendor.toString() !== ctx.user.id) throw new Error(`You are not authorized for deleting this client`);

            try{
                await Client.findOneAndDelete({_id: id});
                return "Client deleted successfully";
            } catch(error){
                console.log(error);
            }
        },
        newOrder: async (_, {input}, ctx) =>{
            const {order, client} = input;

            //Check if client exists
            let clientExists = await Client.findById(client);
            if(!clientExists) throw new Error(`Client with id ${client} does not exists`);

            //Check if client belongs to logged vendor
            if(clientExists.vendor.toString() !== ctx.user.id) throw new Error(`You are not authorized to asign an order to this client`);

            //let total  = 0;
            //Check stock
           for await (const article of order){
                const {id} = article;
                const product = await Product.findById(id);
                if(article.quantity > product.stock){
                    throw new Error(`The product '${product.name}' does not have the required stock (required: ${article.quantity}, stock:${product.stock})`)
                }else{
                    product.stock -= article.quantity;
                    await product.save();
                    //total += product.price;
                }
            }
            //validation of the total, just for double security
            //if(total !== input.total) show an error
            //Create order
            const newOrder = new Order(input);

            //asign vendor
            newOrder.vendor = ctx.user.id;

            //Save order
            const result = await newOrder.save();

            return result;
        },
        updateOrder:async (_, {id, input}, ctx) =>{
            console.log(id)
            console.log(input)
            const {order, client} = input;
            const orderExists = await Order.findById(id);
            const clientExists = await Client.findById(client);
            console.log(orderExists.vendor)
            if(!orderExists) throw new Error(`The order with the id: ${id} does not exists`);
            if(orderExists.vendor.toString() !== ctx.user.id) throw new Error(`You don't have permissions to update this order`);
            if(!clientExists) throw new Error(`The client with the id: ${id} does not exists`);
            if(clientExists.vendor.toString() !== ctx.user.id) throw new Error(`You don't have permissions to update an order on this client ${client}`);

            for await (const article of order){
                const {id} = article;
                const product = await Product.findById(id);
                if(article.quantity > product.stock){
                    throw new Error(`The product '${product.name}' does not have the required stock (required: ${article.quantity}, stock:${product.stock})`)
                }else{
                    product.stock -= article.quantity;
                    await product.save();
                    //total += product.price;
                }
            }
            return await Order.findOneAndUpdate({_id: id}, input, {new: true});
        },
        deleteOrder: async (_, {id}, ctx) =>{
            const orderExists = Order.findById(id);
            if(!orderExists) throw new Error(`The order with the id: ${id} does not exists`);
            if(orderExists.vendor.toString() !== ctx.user.id) throw new Error(`You don't have permissions to delete this order`);
            try{
                await Order.findOneAndDelete({_id: id});
                return "Order deleted successfully";
            } catch(error){
                console.log(error);
            }
        }
    }
}

module.exports = resolvers;