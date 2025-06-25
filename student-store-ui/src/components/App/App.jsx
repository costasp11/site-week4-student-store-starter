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
  const [userInfo, setUserInfo] = useState({ name: "", dorm_number: ""});
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
    if (!userInfo.name || !userInfo.dorm_number) {
      setError('Please fill in your name and dorm number before checkout.');
      return;
    }

    if (Object.keys(cart).length === 0) {
      setError('Your cart is empty. Please add some items before checkout.');
      return;
    }

    setIsCheckingOut(true);
    setError(null);

    try {
      // Convert cart items to order items format
      const orderItems = Object.values(cart).map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      // Create order
      const newOrder = await ordersAPI.create({
        customer: userInfo.name,
        status: 'pending',
        orderItems: orderItems
      });

      setOrder(newOrder);
      
      // Clear cart after successful order
      setCart({});
      
      // Close sidebar
      setSidebarOpen(false);
      
    } catch (err) {
      console.error('Error during checkout:', err);
      setError('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
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
 