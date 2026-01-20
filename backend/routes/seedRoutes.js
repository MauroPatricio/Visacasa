import express from 'express';
import Product from '../models/ProductModel.js';
import Category from '../models/CategoryModel.js';

import data from '../data.js';
import User from '../models/UserModel.js';

const seedRoutes = express.Router();

seedRoutes.get('/', async (req, res) => {
    await User.deleteMany({});
    const createUsers = await User.insertMany(data.users);

    // Encontrar o vendedor
    const sellerUser = createUsers.find(u => u.isSeller);

    await Product.deleteMany({});
    // Associar produtos ao vendedor e calcular comissões
    const productsWithSeller = data.products.map(p => {
        const comissionPercentage = p.comissionPercentage || 0.3;
        const price = p.price || 0;
        const priceComission = p.priceComission || (price * comissionPercentage);
        const priceFromSeller = p.priceFromSeller || (price - priceComission);

        const product = {
            ...p,
            seller: sellerUser ? sellerUser._id : null,
            comissionPercentage,
            priceComission,
            priceFromSeller,
            price
        };
        console.log('Product to insert:', product.slug, {
            price: product.price,
            priceFromSeller: product.priceFromSeller,
            comissionPercentage: product.comissionPercentage,
            priceComission: product.priceComission
        });
        return product;
    });
    const createProducts = await Product.insertMany(productsWithSeller);

    await Category.deleteMany({});
    const createCategories = await Category.insertMany(data.categories);

    res.send({ createProducts, createCategories, createUsers });
});

export default seedRoutes;
