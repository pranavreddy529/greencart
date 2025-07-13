import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";

// Place Order COD : /api/order/cod


export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    // Calculate total amount
    let amount = await items.reduce(async (accPromise, item) => {
      const acc = await accPromise;
      const product = await Product.findById(item.product);
      return acc + product.offerPrice * item.quantity;
    }, Promise.resolve(0));

    // Add 2% Tax
    amount += parseFloat((amount * 0.02).toFixed(2));

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Place Order STRIPE : /api/order/stripe

export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const {origin} = req.headers;


    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let productData = [];

    // Calculate total amount
    let amount = await items.reduce(async (accPromise, item) => {
      const acc = await accPromise;
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return acc + product.offerPrice * item.quantity;
    }, Promise.resolve(0));

    // Add 2% Tax
    amount += parseFloat((amount * 0.02).toFixed(2));

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe
    const line_items = productData.map((item)=>{
        return {
            price_data:{
                currency: "usd",
                product_data:{
                    name:item.name
                },
                unit_amount: Math.floor(item.price + item.price * 0.02) * 100
            },
            quantity: item.quantity,
        }

    })

    // Create session
    const session = await stripeInstance.checkout.sessions.create({
        line_items,
        mode:"payment",
        success_url: `${origin}/loader?next=my-orders`,
        cancel_url: `${origin}/cart`,
        metadata: {
            orderId: order._id.toString(),
            userId,
        }
    })

    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


// Get Orders by User ID : /api/order/user

export const getUserOrders = async(req , res)=>{
    try {
        const {userId} = req;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"} , {isPaid: true}]

        }).populate("items.product address").sort({createdAt: -1});
        res.json({success: true , orders});
    } catch (error) {
        res.json({success: false ,  message: error.message});
    }

}

// Get All Orders (for seller/admin) : /api/order/seller


export const getAllOrders = async(req , res)=>{
    try {
        
        const orders = await Order.find({
            
            $or: [{paymentType: "COD"} , {isPaid: true}]

        }).populate("items.product address").sort({createdAt: -1});
        res.json({success: true , orders});
    } catch (error) {
        res.json({success: false ,  message: error.message});
    }

}






