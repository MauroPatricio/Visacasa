import express from 'express';
import Product from '../models/ProductModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isSellerOrAdmin } from '../utils.js';
import User from '../models/UserModel.js';
import http from 'http';
import { Server } from 'socket.io';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import mongoose from 'mongoose';

// Inicialização
const productRoutes = express.Router();
const app = express();
const httpServer = http.Server(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// Configuração Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ----------------------------- Helpers -----------------------------
const getFilteredProducts = async (query, additionalFilters = {}, showAllIsActive = false) => {
  const pageSize = parseInt(query.pageSize) || 10;
  const page = parseInt(query.page) || 1;
  const category = query.category || '';
  const price = query.price || '';
  const rating = query.rating || '';
  const order = query.order || '';
  const province = query.province || '';
  const searchQuery = query.query || '';

  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? { nome: { $regex: searchQuery, $options: 'i' } }
      : {};

  const categoryFilter = category && category !== 'all' ? { category } : {};
  const provinceFilter = province && province !== 'all' ? { province } : {};
  const ratingFilter = rating && rating !== 'all' ? { rating: { $gte: Number(rating) } } : {};
  const priceFilter =
    price && price !== 'all'
      ? {
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
      : {};

  const sortOrder =
    order === 'featured'
      ? { featured: -1 }
      : order === 'lowest'
      ? { price: 1 }
      : order === 'highest'
      ? { price: -1 }
      : order === 'toprated'
      ? { rating: -1 }
      : order === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 };

  const filters = {
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
    ...provinceFilter,
    ...additionalFilters,
    ...(showAllIsActive ? {} : { isActive: true }),
  };

  const [products, countProducts] = await Promise.all([
    Product.find(filters)
      .populate('seller category province conditionStatus qualityType size color')
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .lean(),
    Product.countDocuments(filters),
  ]);

  return { products, countProducts, page, pages: Math.ceil(countProducts / pageSize) };
};

// ----------------------------- ROTAS -----------------------------

// GET /products (lista com filtros + paginação)
productRoutes.get('/', async (req, res) => {
  try {
    const seller = req.query.seller || '';
    const sellerFilter = seller ? { seller } : {};
    const showAllIsActive = !!seller;

    const { products, pages } = await getFilteredProducts(req.query, sellerFilter, showAllIsActive);
    res.send({ products, pages });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao carregar produtos', error });
  }
});

// GET /products/bycategory
productRoutes.get('/bycategory', async (req, res) => {
  try {
    const categoriesWithProducts = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$categoryDetails._id',
          category: { $first: '$categoryDetails' },
          products: {
            $push: {
              _id: '$_id',
              name: '$name',
              slug: '$slug',
              description: '$description',
              image: '$image',
              price: '$price',
              isActive: '$isActive',
            },
          },
        },
      },
      { $sort: { 'category.name': 1 } },
    ]);

    res.status(200).json({ categoriesWithProducts });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias com produtos.' });
  }
});

// GET /products/bycategory/:id
productRoutes.get('/bycategory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'ID de categoria inválido' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const filter = { category: id, isActive: true };

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate('seller category province')
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      totalPages: Math.ceil(totalProducts / pageSize),
      currentPage: page,
      totalProducts,
      products,
    });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao buscar produtos pela categoria', error });
  }
});

// PUT /products/:id
productRoutes.put(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const comissionPercentage = parseFloat(process.env.COMISSION_PRICE);
      const priceFromSeller = parseFloat(req.body.price);
      const priceComission = parseFloat(priceFromSeller * comissionPercentage);
      const price = parseFloat(priceComission + priceFromSeller);

      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).send({ message: 'Produto não encontrado' });

      Object.assign(product, {
        ...req.body,
        priceFromSeller,
        priceComission,
        price,
        comissionPercentage,
      });

      await product.save();
      io.emit('newProduct', product);
      res.send({ message: 'Produto atualizado com sucesso', product });
    } catch (error) {
      res.status(500).send({ message: 'Erro ao atualizar o produto', error });
    }
  })
);

// DELETE /products/:id
productRoutes.delete(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).send({ message: 'Produto não encontrado' });

      await product.deleteOne();
      io.emit('productDeleted', { _id: req.params.id });
      res.send({ message: 'Produto removido com sucesso' });
    } catch (error) {
      res.status(500).send({ message: 'Erro ao remover o produto', error });
    }
  })
);

// POST /products (criação)
productRoutes.post(
  '/',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      if (!req.body.image) {
        return res.status(400).send({ message: 'A imagem do produto é obrigatória' });
      }

      const comission_price = parseFloat(process.env.COMISSION_PRICE);
      const priceFromSeller = parseFloat(req.body.price);
      const priceComission = parseFloat(priceFromSeller * comission_price);
      const priceWithComission = parseFloat(priceComission + priceFromSeller);

      const user = await User.findById(req.user._id);
      const newProduct = new Product({
        ...req.body,
        seller: req.user._id,
        priceFromSeller,
        priceComission,
        price: priceWithComission,
        comissionPercentage: comission_price,
        isActive: user.isApproved,
        slug: crypto.randomBytes(3).toString('hex'),
      });

      const product = await newProduct.save();
      io.emit('newProduct', product);
      res.send({ message: 'Produto criado com sucesso', product });
    } catch (error) {
      res.status(500).send({ message: 'Erro ao criar produto', error });
    }
  })
);

// GET /products/slug/:slug
productRoutes.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('seller category conditionStatus qualityType size color')
      .lean();

    if (!product) return res.status(404).send({ message: 'Produto não encontrado' });
    res.send(product);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao buscar produto', error });
  }
});



// NEW: GET /products/categoriesWithCount  (rápido e leve — só categorias com contagem)
productRoutes.get('/categoriesWithCount', async (req, res) => {

  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $project: {
          _id: '$categoryDetails._id',
          name: '$categoryDetails.nome', // ajuste se seu campo na Category for diferente
          image: '$categoryDetails.image', // opcional se existir
          count: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.status(200).json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Search products
productRoutes.get('/search', expressAsyncHandler(async (req, res) => {
  try {
    const { products, countProducts, page, pages } = await getFilteredProducts(req.query);
    res.send({ products, countProducts, page, pages });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao buscar produtos', error });
  }
}));

// GET /products/:id
productRoutes.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller color size category province qualityType conditionStatus')
      .lean();

    if (!product) return res.status(404).send({ message: 'Produto não encontrado' });
    res.send(product);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao buscar o produto', error });
  }
});

export default productRoutes;

