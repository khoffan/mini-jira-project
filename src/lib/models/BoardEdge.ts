import mongoose, { InferSchemaType, Model, Schema } from "mongoose";
import { randomUUID } from "crypto";

const BoardEdgeSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    sourceBoardId: { type: String, ref: "Board", required: true },
    targetBoardId: { type: String, ref: "Board", required: true },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type IBoardEdgeDocument = InferSchemaType<typeof BoardEdgeSchema>;

// Virtual id mapping from _id
BoardEdgeSchema.virtual("id").get(function () {
  return this._id;
});

const BoardEdge: Model<IBoardEdgeDocument> =
  mongoose.models.BoardEdge ||
  mongoose.model<IBoardEdgeDocument>("BoardEdge", BoardEdgeSchema);

export default BoardEdge;
