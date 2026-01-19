import express from "express";
import Favorite from "../models/FavoriteModel.js";
import Product from "../models/ProductModel.js";

const favoriteRouter = express.Router();

// Toggle favorite status (add or remove)
favoriteRouter.post("/toggle", async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                message: "userId e productId são obrigatórios",
            });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        const result = await Favorite.toggleFavorite(userId, productId);

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Erro ao alternar favorito:", error);
        res.status(500).json({
            message: "Erro ao alternar favorito",
            error: error.message,
        });
    }
});

// Add product to favorites
favoriteRouter.post("/add", async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                message: "userId e productId são obrigatórios",
            });
        }

        // Check if already favorited
        const existing = await Favorite.findOne({ user: userId, product: productId });
        if (existing) {
            return res.status(400).json({
                message: "Este produto já está nos favoritos",
            });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        const favorite = await Favorite.create({
            user: userId,
            product: productId,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
        });

        res.status(201).json({
            success: true,
            message: "Produto adicionado aos favoritos",
            favorite,
        });
    } catch (error) {
        console.error("Erro ao adicionar favorito:", error);
        res.status(500).json({
            message: "Erro ao adicionar favorito",
            error: error.message,
        });
    }
});

// Remove product from favorites
favoriteRouter.delete("/remove", async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                message: "userId e productId são obrigatórios",
            });
        }

        const result = await Favorite.deleteOne({ user: userId, product: productId });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Favorito não encontrado",
            });
        }

        res.json({
            success: true,
            message: "Produto removido dos favoritos",
        });
    } catch (error) {
        console.error("Erro ao remover favorito:", error);
        res.status(500).json({
            message: "Erro ao remover favorito",
            error: error.message,
        });
    }
});

// Get all favorites for a user
favoriteRouter.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20, sort = "-favoritedAt" } = req.query;

        const result = await Favorite.getUserFavorites(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
        });

        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Erro ao buscar favoritos:", error);
        res.status(500).json({
            message: "Erro ao buscar favoritos",
            error: error.message,
        });
    }
});

// Check if a product is favorited by user
favoriteRouter.get("/check", async (req, res) => {
    try {
        const { userId, productId } = req.query;

        if (!userId || !productId) {
            return res.status(400).json({
                message: "userId e productId são obrigatórios",
            });
        }

        const isFavorited = await Favorite.isFavorited(userId, productId);

        res.json({
            success: true,
            isFavorited,
        });
    } catch (error) {
        console.error("Erro ao verificar favorito:", error);
        res.status(500).json({
            message: "Erro ao verificar favorito",
            error: error.message,
        });
    }
});

// Get favorite count for a user
favoriteRouter.get("/user/:userId/count", async (req, res) => {
    try {
        const { userId } = req.params;

        const count = await Favorite.countDocuments({ user: userId });

        res.json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Erro ao contar favoritos:", error);
        res.status(500).json({
            message: "Erro ao contar favoritos",
            error: error.message,
        });
    }
});

// Bulk add favorites
favoriteRouter.post("/bulk-add", async (req, res) => {
    try {
        const { userId, productIds } = req.body;

        if (!userId || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                message: "userId e array de productIds são obrigatórios",
            });
        }

        const favorites = productIds.map((productId) => ({
            user: userId,
            product: productId,
            syncStatus: "synced",
            lastSyncedAt: new Date(),
        }));

        // Use insertMany with ordered: false to insert as many as possible
        // even if some fail due to duplicates
        const result = await Favorite.insertMany(favorites, { ordered: false })
            .catch((error) => {
                // Handle duplicate key errors gracefully
                if (error.code === 11000) {
                    return { insertedCount: error.result?.nInserted || 0 };
                }
                throw error;
            });

        res.json({
            success: true,
            message: `${result.length || result.insertedCount || 0} produtos adicionados aos favoritos`,
        });
    } catch (error) {
        console.error("Erro ao adicionar favoritos em lote:", error);
        res.status(500).json({
            message: "Erro ao adicionar favoritos",
            error: error.message,
        });
    }
});

// Clear all favorites for a user
favoriteRouter.delete("/user/:userId/clear", async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await Favorite.deleteMany({ user: userId });

        res.json({
            success: true,
            message: `${result.deletedCount} favoritos removidos`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Erro ao limpar favoritos:", error);
        res.status(500).json({
            message: "Erro ao limpar favoritos",
            error: error.message,
        });
    }
});

export default favoriteRouter;
