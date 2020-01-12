
const mongoose = require('mongoose')
const { buildSchema } = require('graphql');

const chargingPointSchema = new mongoose.Schema({
    cpID: {
      type: String,
      required: true,
      unique: true
    },
   name : {
       type: String,
       required: true
   },
   ownerID: {
    type: String,
    required: true
   },
   cost: {
    type: Number,
    default: 0   
   },
   latitude: Number,
   longitude: Number,
   chargeType: {
       type: String,
       enum: ['Tesla Supercharger','Caravan Mains Socket', 'Europlug'],
       required: true
   }
  })

const ChargingPoints = mongoose.model('ChargingPoint', chargingPointSchema);



const ChargingPointQL = buildSchema(`
    type Query {
        points: [ChargingPoint]
        point(cpId: String): ChargingPoint
    }
    type ChargingPoint {
        cpID: String,
        name: String,
        ownerID: String,
        cost: Float,
        latitude: Float,
        longitude: Float,
        chargeType: String
    }
`)

module.exports = { ChargingPoints, ChargingPointQL };
  