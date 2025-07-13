import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/user");
      if (data.success) {
        setMyOrders(data.orders || data.order); // support both keys
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  return (
    <div className="mt-16 pb-16 px-4 sm:px-6">
      <div className="flex flex-col items-start w-max mb-8">
        <p className="text-2xl font-semibold uppercase text-gray-800">My Orders</p>
        <div className="w-16 h-0.5 bg-primary rounded-full mt-1"></div>
      </div>

      {myOrders.length === 0 && (
        <p className="text-gray-500">No orders found.</p>
      )}

      {myOrders.map((order, index) => (
        <div
          key={order._id || index}
          className="border border-gray-300 rounded-lg mb-10 p-6 max-w-4xl bg-white shadow-sm"
        >
          {/* Top Row: Order Meta */}
          <div className="flex justify-between flex-wrap text-sm text-gray-500 mb-4">
            <span>
              <span className="font-medium text-gray-800">OrderId:</span> {order._id}
            </span>
            <span>
              <span className="font-medium text-gray-800">Payment:</span>{" "}
              {order.paymentType}
            </span>
            <span>
              <span className="font-medium text-gray-800">Total Amount:</span>{" "}
              {currency}
              {order.amount}
            </span>
          </div>

          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row items-start md:items-center gap-4"
            >
              {/* Product Image */}
              <div className="bg-gray-100 p-3 rounded-md mb-2 md:mb-0">
                <img
                  src={
                    item?.product?.image?.[0] ||
                    "https://via.placeholder.com/100"
                  }
                  alt={item?.product?.name || "Product"}
                  className="w-16 h-16 object-cover rounded"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">
                  {item?.product?.name}
                </h2>
                <p className="text-gray-500 text-sm">
                  Category: {item?.product?.category}
                </p>
              </div>

              {/* Right Side: Details */}
              <div className="text-sm text-gray-600 md:text-right space-y-1 md:ml-auto">
                <p>Quantity: {item.quantity || 1}</p>
                <p>Status: {order.status || "Order Placed"}</p>
                <p>
                  Date:{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-green-600 font-medium">
                  Amount: {currency}
                  {item?.product?.offerPrice * item.quantity || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
