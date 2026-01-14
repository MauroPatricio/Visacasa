import express from "express";
import PriceComparison from "../models/PriceComparisonModel.js";
import Product from "../models/ProductModel.js";

const priceComparisonRouter = express.Router();

// Create a new price comparison
priceComparisonRouter.post("/create", async (req, res) => {
    try {
        const { userId, name, productIds } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId é obrigatório" });
        }

        if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
            return res.status(400).json({
                message: "É necessário pelo menos 2 produtos para comparar",
            });
        }

        // Verify all products exist
        const products = await Product.find({ _id: { $in: productIds } });
        if (products.length !== productIds.length) {
            return res.status(404).json({
                message: "Um ou mais produtos não foram encontrados",
            });
        }

        const comparison = new PriceComparison({
            user: userId,
            name: name || "Nova Comparação",
            products: productIds.map((id) => ({ product: id })),
        });

        await comparison.calculateMetadata();
        await comparison.save();

        await comparison.populate("products.product");

        res.status(201).json({
            success: true,
            comparison,
        });
    } catch (error) {
        console.error("Erro ao criar comparação:", error);
        res.status(500).json({ message: "Erro ao criar comparação", error: error.message });
    }
});

// Get all comparisons for a user
priceComparisonRouter.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive, page = 1, limit = 10 } = req.query;

        const query = { user: userId };
        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        const skip = (page - 1) * limit;

        const comparisons = await PriceComparison.find(query)
            .populate({
                path: "products.product",
                select: "name price image seller category",
            })
            .populate("metadata.cheapestProduct")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await PriceComparison.countDocuments(query);

        res.json({
            success: true,
            comparisons,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Erro ao buscar comparações:", error);
        res.status(500).json({ message: "Erro ao buscar comparações", error: error.message });
    }
});

// Get a specific comparison with full details
priceComparisonRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const comparison = await PriceComparison.findById(id).populate({
            path: "products.product",
            populate: [
                { path: "category" },
                { path: "seller", select: "name email phone province" },
                { path: "province" },
            ],
        });

        if (!comparison) {
            return res.status(404).json({ message: "Comparação não encontrada" });
        }

        // Recalculate metadata in case product prices changed
        await comparison.calculateMetadata();
        await comparison.save();

        res.json({
            success: true,
            comparison,
        });
    } catch (error) {
        console.error("Erro ao buscar comparação:", error);
        res.status(500).json({ message: "Erro ao buscar comparação", error: error.message });
    }
});

// Add a product to existing comparison
priceComparisonRouter.post("/:id/add-product", async (req, res) => {
    try {
        const { id } = req.params;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "productId é obrigatório" });
        }

        const comparison = await PriceComparison.findById(id);
        if (!comparison) {
            return res.status(404).json({ message: "Comparação não encontrada" });
        }

        // Check if product already exists in comparison
        const exists = comparison.products.some(
            (p) => p.product.toString() === productId
        );

        if (exists) {
            return res.status(400).json({
                message: "Este produto já está nesta comparação",
            });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        comparison.products.push({ product: productId });
        await comparison.calculateMetadata();
        await comparison.save();

        await comparison.populate("products.product");

        res.json({
            success: true,
            comparison,
        });
    } catch (error) {
        console.error("Erro ao adicionar produto:", error);
        res.status(500).json({ message: "Erro ao adicionar produto", error: error.message });
    }
});

// Remove a product from comparison
priceComparisonRouter.delete("/:id/remove-product/:productId", async (req, res) => {
    try {
        const { id, productId } = req.params;

        const comparison = await PriceComparison.findById(id);
        if (!comparison) {
            return res.status(404).json({ message: "Comparação não encontrada" });
        }

        comparison.products = comparison.products.filter(
            (p) => p.product.toString() !== productId
        );

        if (comparison.products.length < 2) {
            return res.status(400).json({
                message: "Uma comparação deve ter pelo menos 2 produtos",
            });
        }

        await comparison.calculateMetadata();
        await comparison.save();

        await comparison.populate("products.product");

        res.json({
            success: true,
            comparison,
        });
    } catch (error) {
        console.error("Erro ao remover produto:", error);
        res.status(500).json({ message: "Erro ao remover produto", error: error.message });
    }
});

// Delete a comparison
priceComparisonRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const comparison = await PriceComparison.findByIdAndDelete(id);

        if (!comparison) {
            return res.status(404).json({ message: "Comparação não encontrada" });
        }

        res.json({
            success: true,
            message: "Comparação removida com sucesso",
        });
    } catch (error) {
        console.error("Erro ao remover comparação:", error);
        res.status(500).json({ message: "Erro ao remover comparação", error: error.message });
    }
});

// Mark comparison as inactive (soft delete)
priceComparisonRouter.patch("/:id/deactivate", async (req, res) => {
    try {
        const { id } = req.params;

        const comparison = await PriceComparison.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!comparison) {
            return res.status(404).json({ message: "Comparação não encontrada" });
        }

        res.json({
            success: true,
            comparison,
        });
    } catch (error) {
        console.error("Erro ao desativar comparação:", error);
        res.status(500).json({ message: "Erro ao desativar comparação", error: error.message });
    }
});

// Get comparison statistics for a user
priceComparisonRouter.get("/user/:userId/stats", async (req, res) => {
    try {
        const { userId } = req.params;

        const totalComparisons = await PriceComparison.countDocuments({
            user: userId,
            isActive: true,
        });

        const allComparisons = await PriceComparison.find({
            user: userId,
            isActive: true,
        }).select("metadata");

        let totalSavings = 0;
        allComparisons.forEach((comp) => {
            if (comp.metadata?.maxDifference) {
                totalSavings += comp.metadata.maxDifference;
            }
        });

        res.json({
            success: true,
            stats: {
                totalComparisons,
                totalPotentialSavings: totalSavings.toFixed(2),
            },
        });
    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        res.status(500).json({ message: "Erro ao buscar estatísticas", error: error.message });
    }
});

export default priceComparisonRouter;
