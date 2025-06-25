// controlls the functions of the product model
// import prisma client

const prisma = require('../db/db.js');

// get all products from the database
// will sort by query parameter if it exists
exports.getAll = async (req, res) => {
    const products = await prisma.product.findMany();
    
    // make a local variable to hold the products
    let filteredProducts = [...products];

    // check if the query parameter 'sort' exists
    const sort = req.query.sort;
    if (sort) {
        // sort the products by the query parameter
        filteredProducts.sort((a, b) => {
            if (sort === 'price') {
                return a.price - b.price; // ascending order by price
            } else if (sort === 'name') {
                return a.name.localeCompare(b.name); // ascending order by name
            } else if (sort === 'category') {
                return a.category.localeCompare(b.category); // ascending order by category
            }
            return 0; // no sorting
        });
        res.json(filteredProducts);
        // return early if sort parameter is applied
        return;
    }

    // check if query parameter category exists
    const category = req.query.category;
    if (category) {
        // filter products by category
        filteredProducts = filteredProducts.filter(product => product.category === category);
        res.json(filteredProducts);
        // return early if category filter is applied
        return;
    }


    res.json(products);
}

// get a product by id from the database
exports.getById = async (req, res) => {
    // take the id from the request parameters
    const id = Number(req.params.id);
    // find the product in the database by id
    const product = await prisma.product.findUnique({
        where: { id: id }
    });
    // output in json format
    res.json(product);
}

exports.create = async(req, res) => {
    const { name, description, price, image_url, category } = req.body;
    // create a new product in the database
    const product = await prisma.product.create({
        data: {
            name: name,
            description: description,
            price: price,
            image_url: image_url,
            category: category
        }
    })
    res.json(product);
}

exports.update = async(req, res) => {
    const id = Number(req.params.id);
    const { name, description, price, image_url, category } = req.body;

    // update the product in the database
    const product = await prisma.product.update({
        where: { id: id },
        data: {
            name: name,
            description: description,
            price: price,
            image_url: image_url,
            category: category
        }
    });

    res.json(product);
}

exports.delete = async(req, res) => {
    const id = Number(req.params.id);
    // delete the product from the database
    await prisma.product.delete({
        where: { id: id }
    });
    res.status(204).send(); // No content response
}
