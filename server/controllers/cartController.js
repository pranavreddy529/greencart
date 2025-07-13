import User from "../models/User.js";

// Update User CartData : /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const { userId, cartItems } = req.body;

    if (!userId || !cartItems) {
      return res.json({ success: false, message: "Missing userId or cartItems" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    await User.findByIdAndUpdate(userId, { cartItems });

    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log("Cart Update Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
