import mongoose, { InferSchemaType, Schema } from "mongoose";
import { randomUUID } from "crypto";

const BoardSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    title: { type: String, required: true },
    projectId: { type: String, ref: "Project", required: true },
    slug: { type: String, required: true, index: true, unique: true },
    isActive: { type: Boolean, default: true },
    color: { type: String, default: null },
    description: { type: String, default: null },
    positionX: { type: Number, default: 0 },
    positionY: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type IBoardDocument = InferSchemaType<typeof BoardSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

// Virtual id mapping from _id
BoardSchema.virtual("id").get(function () {
  return this._id;
});

// Virtual populate tasks (ITask[])
BoardSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "boardId",
});

// Virtual populate board edges - boards that this board is source of
BoardSchema.virtual("sourceOf", {
  ref: "BoardEdge",
  localField: "_id",
  foreignField: "sourceBoardId",
});

// Virtual populate board edges - boards that this board is target of
BoardSchema.virtual("targetOf", {
  ref: "BoardEdge",
  localField: "_id",
  foreignField: "targetBoardId",
});

const Board =
  (mongoose.models.Board as mongoose.Model<IBoardDocument>) ||
  mongoose.model<IBoardDocument>("Board", BoardSchema);

export default Board;
