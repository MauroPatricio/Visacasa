import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        // Track when the product was favorited for sorting
        favoritedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        // Sync metadata for cross-device support
        syncStatus: {
            type: String,
            enum: ["synced", "pending", "failed"],
            default: "synced",
        },
        lastSyncedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure a user can't favorite the same product twice
favoriteSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for fast user-specific queries sorted by most recent
favoriteSchema.index({ user: 1, favoritedAt: -1 });

// Static method to toggle favorite
favoriteSchema.statics.toggleFavorite = async function (userId, productId) {
    const existing = await this.findOne({ user: userId, product: productId });

    if (existing) {
        await this.deleteOne({ _id: existing._id });
        return { isFavorited: false, message: "Removido dos favoritos" };
    } else {
        await this.create({
            user: userId,
            product: productId,
            favoritedAt: new Date(),
            syncStatus: "synced",
            lastSyncedAt: new Date(),
        });
        return { isFavorited: true, message: "Adicionado aos favoritos" };
    }
};

// Static method to check if a product is favorited by user
favoriteSchema.statics.isFavorited = async function (userId, productId) {
    const favorite = await this.findOne({ user: userId, product: productId });
    return !!favorite;
};

// Static method to get all user favorites with product details
favoriteSchema.statics.getUserFavorites = async function (userId, options = {}) {
    const { page = 1, limit = 20, sort = "-favoritedAt" } = options;
    const skip = (page - 1) * limit;

    const favorites = await this.find({ user: userId })
        .populate({
            path: "product",
            populate: [
                { path: "category" },
                { path: "seller", select: "name email phone" },
                { path: "province" },
            ],
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await this.countDocuments({ user: userId });

    return {
        favorites: favorites.filter((f) => f.product !== null), // Filter out deleted products
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
