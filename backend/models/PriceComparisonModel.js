import mongoose from "mongoose";

const priceComparisonSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: "Nova Comparação",
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    metadata: {
      cheapestProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      highestPrice: Number,
      lowestPrice: Number,
      averagePrice: Number,
      maxDifference: Number,
      maxDifferencePercentage: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast user-specific queries
priceComparisonSchema.index({ user: 1, createdAt: -1 });
priceComparisonSchema.index({ user: 1, isActive: 1 });

// Automatically cleanup old inactive comparisons (older than 30 days)
priceComparisonSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { isActive: false } }
);

// Method to calculate comparison metadata
priceComparisonSchema.methods.calculateMetadata = async function () {
  await this.populate("products.product");
  
  if (!this.products || this.products.length === 0) {
    this.metadata = {};
    return;
  }

  const prices = this.products
    .map((p) => p.product?.price)
    .filter((price) => price !== undefined && price !== null);

  if (prices.length === 0) {
    this.metadata = {};
    return;
  }

  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const maxDifference = highestPrice - lowestPrice;
  const maxDifferencePercentage =
    lowestPrice > 0 ? ((maxDifference / lowestPrice) * 100).toFixed(2) : 0;

  const cheapestProduct = this.products.find(
    (p) => p.product?.price === lowestPrice
  )?.product?._id;

  this.metadata = {
    cheapestProduct,
    lowestPrice,
    highestPrice,
    averagePrice: parseFloat(averagePrice.toFixed(2)),
    maxDifference: parseFloat(maxDifference.toFixed(2)),
    maxDifferencePercentage: parseFloat(maxDifferencePercentage),
  };
};

const PriceComparison = mongoose.model("PriceComparison", priceComparisonSchema);

export default PriceComparison;
