import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        images: { type: [String], required: true },
        video: { type: String },
        category: { type: String, required: true },
        sizes: { type: [String], default: ["XS", "S", "M", "L", "XL"] },
        inStock: { type: Boolean, default: true },
        countInStock: { type: Number, default: 0 },
        addOnItems: {
            type: [{
                name: { type: String, required: true },
                price: { type: Number, required: true },
                description: { type: String, default: "" },
                images: { type: [String], default: [] },
                inStock: { type: Boolean, default: true },
                countInStock: { type: Number, default: 0 }
            }],
            default: [],
            validate: {
                validator: function (items) {
                    return items.length <= 6;
                },
                message: "Maximum 6 add-on items allowed per product"
            }
        },
    },
    { timestamps: true }
);

export default mongoose.model("Product", productSchema);
