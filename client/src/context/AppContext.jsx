import { createContext, useContext, useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import the hook
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
    const [searchQuery,setSearchQuery] = useState([])

    // Fetch Seller Status
    const fetchSeller = async ()=>{
        try {
            const {data} = await axios.get('/api/Seller/is-auth');
            if(data.success){
                setIsSeller(true)
            }else{
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }

    // Fetch User Auth Status, User Data and Cart Item

    const fetchUser = async()=>{
        try {
            const {data} = await axios.get('api/user/is-auth');
            if(data.success){
                setUser(data.user)
                setCartItems(data.user.cartItems)
            }
        } catch (error) {
            setUser(null)
        }
    }




    const fetchProducts = async () => {
        try {
            const {data} = await axios.get('/api/product/list')
            if(data.success){
                setProducts(data.products)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Add Product to Cart

    const addToCart = (itemId) => {
        setCartItems(prev => {
            const cartData = { ...prev };
            if (cartData[itemId]) {
                cartData[itemId] += 1;
            } else {
                cartData[itemId] = 1;
            }
            return cartData;
        });
        toast.success("Item added to cart", {
            position: "top-right",
        });
    }

    // Update Cart Item Quantity
    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems)

       
            cartData[itemId] = quantity;
        
        setCartItems(cartData);
        toast.success("Cart updated", {
            position: "top-right",
        })
    }

    // Remove Product from Cart

    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems)

        if(cartData[itemId]){
            cartData[itemId] -= 1;
            if(cartData[itemId] === 0){
                delete cartData[itemId];
            }
        }
        setCartItems(cartData);
        toast.success("Item removed from cart", {
            position: "top-right",
        })
    }

    // Get Cart Item Count
    const getCartCount = ()=>{
        let totalCount = 0;
        for(const item in cartItems){
            totalCount += cartItems[item];
        }
        return totalCount;
    }

    // Get Cart Total Amount

    const getCartAmount = ()=>{
        let totalAmount = 0;
         for(const item in cartItems){
            let itemInfo = products.find((product)=>product._id === item);
            if(cartItems[item] > 0 && itemInfo){
                totalAmount += itemInfo.offerPrice * cartItems[item]
            }
         }
         return Math.floor(totalAmount * 100) /100;
    }



    useEffect(() => {
        fetchSeller();
        fetchProducts();
        fetchUser();
    }, []);

    // Update Database Cart Items

    useEffect(()=>{
        const updateCart = async()=>{
            try {
               const {data} = await axios.post('/api/cart/update' , {userId:user._id,cartItems}) 
               if(!data.success){
                toast.error(data.message)
               }
            } catch (error) {
                toast.error(error.message)
            }
        
        }

        if(user ){
            updateCart()
        }


    },[cartItems])

    const value = { navigate, user, setUser, isSeller, setIsSeller, showUserLogin, setShowUserLogin, products, setProducts , currency ,addToCart, updateCartItem, removeFromCart, cartItems, setCartItems ,searchQuery,setSearchQuery,getCartAmount,getCartCount,axios,fetchProducts,setCartItems};

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    return useContext(AppContext);
};
