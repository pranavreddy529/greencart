import express from 'express'

import { updateCart } from '../controllers/cartController.js'
import authSeller from '../middleware/authSeller.js'


const cartRouter = express.Router()

cartRouter.post('/update' , authSeller, updateCart)



export default cartRouter;