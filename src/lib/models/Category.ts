import mongoose, { InferSchemaType, Model, Schema } from "mongoose";
import { randomUUID } from "crypto";

const CategorySchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true },
    color: { type: String, required: true },
    projectId: { type: String, ref: "Project", required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type ICategoryDocument = InferSchemaType<typeof CategorySchema> & {
  createdAt: Date;
  updatedAt: Date;
};

// Virtual id mapping from _id
CategorySchema.virtual("id").get(function () {
  return this._id;
});

const Category: Model<ICategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<ICategoryDocument>("Category", CategorySchema);

export default Category;
