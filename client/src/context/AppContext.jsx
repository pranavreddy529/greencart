import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { dummyProducts } from '../assets/assets.js';
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const currency = import.meta.env.VITE_CURRENCY;

    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Seller Status
    const fetchSeller = async () => {
        try {
            // Fixed: Changed '/api/Seller/is-auth' to '/api/seller/is-auth' (lowercase)
            const { data } = await axios.get('/api/seller/is-auth');
            if (data.success) {
                setIsSeller(true);
            } else {
                setIsSeller(false);
            }
        } catch (error) {
            console.log("Fetch seller error:", error.message);
            setIsSeller(false);
        }
    };

    // Fetch User Auth Status, User Data and Cart Item
    const fetchUser = async () => {
        try {
            console.log("Fetching user auth status...");
            const { data } = await axios.get('/api/user/is-auth');
            
            console.log("User auth response:", data);
            
            if (data.success) {
                setUser(data.user);
                setCartItems(data.user.cartItems || {});
                console.log("User authenticated:", data.user);
            } else {
                console.log("User not authenticated:", data.message);
                setUser(null);
                setCartItems({});
            }
        } catch (error) {
            console.log("Fetch user error:", error.response?.data || error.message);
            setUser(null);
            setCartItems({});
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/product/list');
            if (data.success) {
                setProducts(data.products);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log("Fetch products error:", error.message);
            toast.error("Failed to fetch products");
        }
    };

    // Add Product to Cart
    const addToCart = async (itemId) => {
        const newCartItems = { ...cartItems };
        if (newCartItems[itemId]) {
            newCartItems[itemId] += 1;
        } else {
            newCartItems[itemId] = 1;
        }
        setCartItems(newCartItems);
        
        // Update database immediately if user is logged in
        if (user) {
            await updateCartInDatabase(newCartItems);
        }
        
        toast.success("Item added to cart", {
            position: "top-right",
        });
    };

    // Update Cart Item Quantity
    const updateCartItem = async (itemId, quantity) => {
        const cartData = { ...cartItems };
        cartData[itemId] = quantity;
        setCartItems(cartData);
        
        // Update database immediately if user is logged in
        if (user) {
            await updateCartInDatabase(cartData);
        }
        
        toast.success("Cart updated", {
            position: "top-right",
        });
    };

    // Remove Product from Cart
    const removeFromCart = async (itemId) => {
        const cartData = { ...cartItems };

        if (cartData[itemId]) {
            cartData[itemId] -= 1;
            if (cartData[itemId] === 0) {
                delete cartData[itemId];
            }
        }
        setCartItems(cartData);
        
        // Update database immediately if user is logged in
        if (user) {
            await updateCartInDatabase(cartData);
        }
        
        toast.success("Item removed from cart", {
            position: "top-right",
        });
    };

    // Get Cart Item Count
    const getCartCount = () => {
        let totalCount = 0;
        for (const item in cartItems) {
            totalCount += cartItems[item];
        }
        return totalCount;
    };

    // Get Cart Total Amount
    const getCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            let itemInfo = products.find((product) => product._id === item);
            if (cartItems[item] > 0 && itemInfo) {
                totalAmount += itemInfo.offerPrice * cartItems[item];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    };

    // Separate function to update cart in database
    const updateCartInDatabase = async (cartData) => {
        try {
            const { data } = await axios.post('/api/cart/update', {
                userId: user._id,
                cartItems: cartData
            });
            if (!data.success) {
                console.log("Cart update failed:", data.message);
            }
        } catch (error) {
            console.log("Cart update error:", error.message);
        }
    };

    // Initial data fetch
    useEffect(() => {
        const initializeApp = async () => {
            await fetchUser(); // Fetch user first
            await fetchSeller();
            await fetchProducts();
        };
        
        initializeApp();
    }, []);

    // Logout function
    const logout = async () => {
        try {
            const { data } = await axios.post('/api/user/logout');
            if (data.success) {
                setUser(null);
                setCartItems({});
                setIsSeller(false);
                toast.success("Logged out successfully");
                navigate('/');
            }
        } catch (error) {
            console.log("Logout error:", error.message);
            toast.error("Logout failed");
        }
    };

    const value = {
        navigate,
        user,
        setUser,
        isSeller,
        setIsSeller,
        showUserLogin,
        setShowUserLogin,
        products,
        setProducts,
        currency,
        addToCart,
        updateCartItem,
        removeFromCart,
        cartItems,
        setCartItems,
        searchQuery,
        setSearchQuery,
        getCartAmount,
        getCartCount,
        axios,
        fetchProducts,
        fetchUser,
        logout,
        loading
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};