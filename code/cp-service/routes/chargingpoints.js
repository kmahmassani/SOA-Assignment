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

module.exports = router