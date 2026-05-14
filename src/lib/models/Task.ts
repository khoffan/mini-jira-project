import mongoose, { InferSchemaType, Model, Schema } from "mongoose";
import { randomUUID } from "crypto";

const TaskSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    dueDate: { type: Date, default: null },
    categoryId: { type: String, ref: "Category", default: null },
    userId: { type: String, ref: "User", default: null },
    boardId: { type: String, ref: "Board", default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type ITaskDocument = InferSchemaType<typeof TaskSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

// Virtual id mapping from _id
TaskSchema.virtual("id").get(function () {
  return this._id;
});

const Task: Model<ITaskDocument> =
  mongoose.models.Task || mongoose.model<ITaskDocument>("Task", TaskSchema);

export default Task;
