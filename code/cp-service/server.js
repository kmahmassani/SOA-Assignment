require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { MongoClient } = require('mongodb');
const graphqlHTTP = require('express-graphql');
const { ChargingPointQL } = require('./models/chargingPoint');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const dbContext = mongoose.connection
dbContext.on('error', (error) => console.error(error))
dbContext.once('open', () => console.log('connected to database'))

app.use(express.json())

// GRAPHQL END POINT
const chargingpointsRouter = require('./routes/chargingpoints')

app.use('/chargingpoints', chargingpointsRouter) 

const context = () => MongoClient.connect(process.env.DATABASE_URL, { useNewUrlParser: true }).then(client => client.db('chargingpointsdb'));

const resolvers = {
    points: (args, context) => context().then(db => db.collection('chargingpoints').find().toArray()),   
    point: (args, context) =>  context().then(db => db.collection('chargingpoints').findOne({ cpId: args.cpId}).toArray())
  };

app.use('/graphql', graphqlHTTP({
    schema:ChargingPointQL,
    rootValue: resolvers,    
    context,
    graphiql: true
  }))

app.listen(process.env.PORT || 3000, () => console.log('server started'))