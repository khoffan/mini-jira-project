import mongoose, { InferSchemaType, Model, Schema } from "mongoose";
import { randomUUID } from "crypto";

const ProjectMemberSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, ref: "User", default: null },
    workspaceId: { type: String, ref: "Workspace", default: null },
    role: {
      type: String,
      enum: ["EDITOR", "VIEWER", "ADMIN"],
      default: "VIEWER",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type IProjectMemberDocument = InferSchemaType<
  typeof ProjectMemberSchema
> & {
  createdAt: Date;
  updatedAt: Date;
};

// Composite unique constraint for workspace + user
ProjectMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

// Virtual id mapping from _id
ProjectMemberSchema.virtual("id").get(function () {
  return this._id;
});

const ProjectMember: Model<IProjectMemberDocument> =
  mongoose.models.ProjectMember ||
  mongoose.model<IProjectMemberDocument>("ProjectMember", ProjectMemberSchema);

export default ProjectMember;
