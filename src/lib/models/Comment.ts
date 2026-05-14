import mongoose, { InferSchemaType, Model, Schema } from "mongoose";
import { randomUUID } from "crypto";

const CommentSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    content: { type: String, required: true },
    taskId: { type: String, ref: "Task", required: true },
    userId: { type: String, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type ICommentDocument = InferSchemaType<typeof CommentSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

// Virtual id mapping from _id
CommentSchema.virtual("id").get(function () {
  return this._id;
});

const Comment: Model<ICommentDocument> =
  mongoose.models.Comment ||
  mongoose.model<ICommentDocument>("Comment", CommentSchema);

export default Comment;
