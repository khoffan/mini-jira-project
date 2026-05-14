import mongoose, { InferSchemaType, Schema } from "mongoose";
import { randomUUID } from "crypto";

const ProjectSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true, unique: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"],
      default: "ACTIVE",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    workspaceId: { type: String, ref: "Workspace", default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export type IProjectDocument = InferSchemaType<typeof ProjectSchema> & {
  createdAt: Date;
  updatedAt: Date;
};

// Virtual id mapping from _id
ProjectSchema.virtual("id").get(function () {
  return this._id;
});

// Virtual populate boards (INestedBoard[])
ProjectSchema.virtual("boards", {
  ref: "Board",
  localField: "_id",
  foreignField: "projectId",
});

// Virtual populate edges (IBoardEdge[]) for board connections
ProjectSchema.virtual("edges", {
  ref: "BoardEdge",
  localField: "_id",
  foreignField: "projectId",
});

const Project =
  (mongoose.models.Project as mongoose.Model<IProjectDocument>) ||
  mongoose.model<IProjectDocument>("Project", ProjectSchema);
export default Project;
