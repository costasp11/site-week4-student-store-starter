const express = require('express');
const cors = require('cors');
// import the product/order routes, then mount the route middleware to the express app
const productRoutes = require('./routes/productRoutes');
const orderRouters = require('./routes/orderRoutes')
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
// Product routes and order routes are express routers that routes to the middleware, that will handle the requests to the database
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use('/products', productRoutes);
app.use('/orders', orderRouters);



app.get('/', (req, res) => {
    res.send('Welcome to the Student Store API!');
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


