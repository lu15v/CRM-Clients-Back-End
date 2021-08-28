const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'});

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex: true
        });

        console.log("Connection Successful");
    }
    catch(error){
        console.log('Error, trying to connect, ', error);
        process.exit(1);
    }
}

module.exports = connectDB;