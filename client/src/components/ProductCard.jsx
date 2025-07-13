import React from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";


const ProductCard = ({ product }) => {
  const {
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
  } = useAppContext();

  const navigate = useNavigate();


  // Guard clause: if product doesn't exist yet
  if (!product) return null;

  const quantity = cartItems[product._id] || 0;

  const handleDecrement = () => {
    if (quantity === 1) {
      removeFromCart(product._id);
    } else {
      updateCartItem(product._id, quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity === 0) {
      addToCart(product._id);
    } else {
      updateCartItem(product._id, quantity + 1);
    }
  };

  return (
    <div onClick={()=> {navigate(`/products/${product.category.toLowerCase()}/${product._id}`) ; scrollTo(0,0)}} className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full">
      <div className="group cursor-pointer flex items-center justify-center px-2">
        <img
          className="group-hover:scale-105 transition max-w-26 md:max-w-36"
          src={product.image[0]}
          alt={product.name}
        />
      </div>
      <div className="text-gray-500/60 text-sm">
        <p>{product.category}</p>
        <p className="text-gray-700 font-medium text-lg truncate w-full">
          {product.name}
        </p>
        <div className="flex items-center gap-0.5">
          {Array(5)
            .fill("")
            .map((_, i) => (
              <img
                key={i}
                className="md:w-3.5 w3"
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt=""
              />
            ))}
          <p>(4)</p>
        </div>
        <div className="flex items-end justify-between mt-3">
          <p className="md:text-xl text-base font-medium text-primary">
            {currency}{product.offerPrice}{" "}
            <span className="text-gray-500/60 md:text-sm text-xs line-through">
              {currency}{product.price}
            </span>
          </p>
          <div className="text-primary">
          {quantity === 0 ? (
              <button
                className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded text-black font-medium"
                onClick={e => { e.stopPropagation(); addToCart(product._id); }}
              >
                <img src={assets.cart_icon} alt="cart" />
                Add
              </button>
            ) : (
              <div
                className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary rounded select-none"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={handleDecrement}
                  className="cursor-pointer text-md px-2 h-full text-black"
                >
                  -
                </button>
                <span className="w-5 text-center text-black">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="cursor-pointer text-md px-2 h-full text-black"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
