const express = require('express')
const router = express.Router()
const { ChargingPoints } = require('../models/chargingPoint')


//Get All
router.get('/', async (req, res) => {
    try {
        const cp = await ChargingPoints.find()
        res.json(cp)
      } catch (err) {
        res.status(500).json({ message: err.message })
      }
})

// Get by ID
router.get('/:id', async (req, res) => {
    const id = req.params.id

    if (!id || id == '')
    {
        res.status(400).statusMessage('Invalid ID supplied')
        return;
    }

    try {
        const cp = await ChargingPoints.findOne({ cpID: id})

        if (!cp)
        {
            res.status(404).statusMessage('Point not found')
            return;
        }
        res.json(cp)
      } catch (err) {
        res.status(500).json({ message: err.message })
      }
})


// router.post('/seed', (req, res) => {
//     const cps = [
//         { cpID:'TS20', name:'Ashmolean Oxford Charger', ownerID: 1, cost:10, chargeType:'Tesla Supercharger', latitude: 51.7555223, longitude: -1.260042},
//         { cpID:'CM1', name:'Chilton Campsite', ownerID: 1, cost:15, chargeType:'Caravan Mains Socket', latitude: 51.569849, longitude: -1.296043},
//         { cpID:'E300', name:'Chilton Campsite', ownerID: 1, cost:0, chargeType:'Europlug', latitude: 51.569849, longitude: -1.296043},
//         { cpID:'E22', name:'Gunwharf Quays', ownerID: 1, cost:0, chargeType:'Europlug',  latitude: 50.795394, longitude: -1.105063},
//         { cpID:'TS298', name:'Oxford Department of Computer Science Charger', ownerID: 1, cost:30, chargeType:'Tesla Supercharger', latitude: 51.759952, longitude: -1.258212},
//         { cpID:'TS592', name:'Chilton Campsite', ownerID: 1, cost:2, chargeType:'Tesla Supercharger', latitude: 51.569849, longitude: -1.296043},
//         { cpID:'TS291', name:'Gunwharf Quays', ownerID: 1, cost:0, chargeType:'Tesla Supercharger',  latitude: 50.795394, longitude: -1.105063},
//         { cpID:'TS728', name:'Gunwharf Quays', ownerID: 1, cost:1, chargeType:'Tesla Supercharger', latitude: 50.795394, longitude: -1.105063},
//     ]
//     for (cp of cps) {
//         var newCP = new ChargingPoints(cp);
//         newCP.save();
//       }
      
//     res.send('Database seeded!');
// })

module.exports = router