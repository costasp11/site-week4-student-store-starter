// controlls the functions of the order model
// will sort by query parameter if it exists
// import prisma client
const prisma = require('../db/db.js');

exports.getAll = async (req, res) => {
    const orders = await prisma.order.findMany();
    return res.json(orders);
}

// get by ID

exports.getById = async (req, res) => {
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({
        where: { id: id }
    });
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    return res.json(order);
}
// create an order in the database

exports.create = async (req, res) => {
    console.log('🛒 Backend: Order creation request received');
    console.log('📦 Request body:', req.body);
    
    const { customer, status, orderItems } = req.body;

    // Validation: orderItems must be a non-empty array
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
        return res.status(400).json({ error: 'orderItems must be a non-empty array.' });
    }

    // when an order is created, calculated total is automatically applied
    try {
        // checks if array exists, uses .reduce operator iterates over every item and adds its price together to find the total
        const calculatedTotal = orderItems && Array.isArray(orderItems)
            ? orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
            : 0;

        console.log('💰 Calculated total:', calculatedTotal);
        console.log('📋 Order items to create:', orderItems);

        console.log('🗄️ Creating order in PostgreSQL...');
        const order = await prisma.order.create({
            data: {
                customer: customer,
                status: status,
                total: Number(calculatedTotal), // Ensure total is a number
                orderItems: {
                    create: orderItems.map(item => ({
                        product: { connect: { id: Number(item.productId) } },
                        quantity: Number(item.quantity),
                        price: Number(item.price)
                    }))
                }
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });
        
        console.log('✅ Order successfully created in PostgreSQL!');
        console.log('🆔 Order ID:', order.id);
        console.log('👤 Customer:', order.customer);
        console.log('💰 Total:', order.total);
        console.log('📦 Items created:', order.orderItems.length);
        
        return res.status(201).json(order);
    } catch (error) {
        console.error("❌ Error creating order in PostgreSQL:", error);
        console.error("❌ Error code:", error.code);
        console.error("❌ Error message:", error.message);
        
        if (error.code === 'P2025' || error.code === 'P2003') {
             return res.status(400).json({
                error: 'Invalid product or data provided for order items.',
                details: error.message
            });
        }
        return res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
};

// Return the resulting total from an order ( calculated already within create and stored in variable )
exports.getOrderTotal = async (req, res) => {
    const id = Number(req.params.id)

    try {
        // retrieve the order by id
        const order = await prisma.order.findUnique({ where: {id: id}});
        return res.status(200).json({
            orderID: order.id,
            total: order.total // directly return 'total' field from fetched order
        })
    } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve order total', details: error.message });
    }
}

// TODO - Add an item to an order
exports.addItem = async (req, res) => {
    const orderId = Number(req.params.id);
    const { orderItems } = req.body; // expects an array of items

    // case where orderItems is not an array or is empty
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
        return res.status(400).json({ error: 'orderItems must be a non-empty array.' });
    }

    try {
        // Add new items to the order
        await Promise.all(orderItems.map(async (item) => { // map over each item in the array, item: an orderItem object in array
            await prisma.orderItem.create({
                data: {
                    // update the data accordingly
                    orderId: orderId,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }
            });
        }));

        // Recalculate the total
        const allItems = await prisma.orderItem.findMany({
            where: { orderId: orderId }
        });
        // update the new total
        const newTotal = allItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        // Update the order's total
        await prisma.order.update({
            where: { id: orderId },
            data: { total: newTotal }
        });

        // Return the updated order with items and products, store in variable
        const updatedOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: { product: true }
                }
            }
        });
        return res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Error adding items to order:', error);
        return res.status(500).json({ error: 'Failed to add items to order', details: error.message });
    }
}


// update an ORDER in the DB
exports.update = async (req, res) => {
    // destruct the body, get ID
    const id = Number(req.params.id)
    const { customer, total, status } = req.body

    try {
        // update the data in the DB using prisma
        const order = await prisma.order.update({
            where: { id: id },
            data: {
                customer,
                total,
                status
            }
        })

        return res.json(order)

    } catch (error) {
        console.log("Error updating order:", error)
        return res.status(500).json({ error: 'Failed to update order', details: error.message });
    }
    
}

exports.delete = async (req, res) => {
    // get ID from params
    const id = Number(req.params.id)

    try {
        const order = await prisma.order.delete({
            where: { id: id }
        })
        return res.status(200).json({message: 'Order deleted successfully'})

    } catch (error) {
        console.log("Error deleting order", error)
        return res.status(500).json({ error: 'Failed to delete order', details: error.message });
    }
}