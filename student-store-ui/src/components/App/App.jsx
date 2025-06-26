import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import SubNavbar from "../SubNavbar/SubNavbar";
import Sidebar from "../Sidebar/Sidebar";
import Home from "../Home/Home";
import ProductDetail from "../ProductDetail/ProductDetail";
import NotFound from "../NotFound/NotFound";
import { removeFromCart, addToCart, getQuantityOfItemInCart, getTotalItemsInCart } from "../../utils/cart";
import { productsAPI, ordersAPI } from "../../utils/api";
import "./App.css";

function App() {

  // State variables
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", email: ""});
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  // Toggles sidebar
  const toggleSidebar = () => setSidebarOpen((isOpen) => !isOpen);

  // Functions to change state (used for lifting state)
  const handleOnRemoveFromCart = (item) => setCart(removeFromCart(cart, item));
  const handleOnAddToCart = (item) => setCart(addToCart(cart, item));
  const handleGetItemQuantity = (item) => getQuantityOfItemInCart(cart, item);
  const handleGetTotalCartItems = () => getTotalItemsInCart(cart);

  const handleOnSearchInputChange = (event) => {
    setSearchInputValue(event.target.value);
  };

  // Fetch products from API
  const fetchProducts = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const productsData = await productsAPI.getAll();
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsFetching(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOnCheckout = async () => {
    console.log('🚀 Starting checkout process...');
    console.log('👤 User info:', userInfo);
    console.log('🛒 Cart contents:', cart);
    
    // Better validation with specific error messages
    if (!userInfo.name || userInfo.name.trim() === '') {
      setError('Please enter your name.');
      console.log('❌ Validation failed: Missing name');
      return;
    }

    if (!userInfo.email || userInfo.email.trim() === '') {
      setError('Please enter your email.');
      console.log('❌ Validation failed: Missing email');
      return;
    }

    if (Object.keys(cart).length === 0) {
      setError('Your cart is empty. Please add some items before checkout.');
      console.log('❌ Validation failed: Empty cart');
      return;
    }

    setIsCheckingOut(true);
    setError(null);
    console.log('⏳ Setting checkout state to true...');

    try {
      // Convert cart items to order items format
      const orderItems = Object.keys(cart).map((productId) => {
        const product = products.find((p) => p.id === Number(productId));
        return {
          productId: Number(productId),
          quantity: cart[productId],
          price: product ? Number(product.price) : 0,
        };
      });

      console.log('📋 Prepared order items:', orderItems);

      const orderData = {
        customer: userInfo.name.trim(),
        status: 'pending',
        orderItems: orderItems
      };

      console.log('📤 Sending order to backend:', orderData);
      console.log('🌐 API endpoint: POST /orders');

      // Create order in PostgreSQL via backend API
      const newOrder = await ordersAPI.create(orderData);

      console.log('✅ Order created successfully in PostgreSQL:', newOrder);
      console.log('🆔 Order ID:', newOrder.id);
      console.log('💰 Total:', newOrder.total);
      console.log('📦 Items count:', newOrder.orderItems?.length || 0);

      setOrder(newOrder);
      
      // Clear cart after successful order
      setCart({});
      console.log('🧹 Cart cleared');
      
      // Close sidebar
      setSidebarOpen(false);
      console.log('🎉 Checkout completed successfully!');
      
    } catch (err) {
      console.error('❌ Error during checkout:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      
      // More specific error messages
      if (err.response?.status === 400) {
        setError('Invalid data provided. Please check your information and try again.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Checkout failed. Please try again.');
      }
    } finally {
      setIsCheckingOut(false);
      console.log('⏹️ Checkout process finished');
    }
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar
          cart={cart}
          error={error}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          isOpen={sidebarOpen}
          products={products}
          toggleSidebar={toggleSidebar}
          isCheckingOut={isCheckingOut}
          addToCart={handleOnAddToCart}
          removeFromCart={handleOnRemoveFromCart}
          getQuantityOfItemInCart={handleGetItemQuantity}
          getTotalItemsInCart={handleGetTotalCartItems}
          handleOnCheckout={handleOnCheckout}
          order={order}
          setOrder={setOrder}
        />
        <main>
          <SubNavbar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchInputValue={searchInputValue}
            handleOnSearchInputChange={handleOnSearchInputChange}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  error={error}
                  products={products}
                  isFetching={isFetching}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  addToCart={handleOnAddToCart}
                  searchInputValue={searchInputValue}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />
            <Route
              path="/:productId"
              element={
                <ProductDetail
                  cart={cart}
                  error={error}
                  products={products}
                  addToCart={handleOnAddToCart}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />
            <Route
              path="*"
              element={
                <NotFound
                  error={error}
                  products={products}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                />
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
 