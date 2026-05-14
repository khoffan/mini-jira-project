import mongoose, { InferSchemaType, Model, Schema } from 'mongoose';
import { randomUUID } from 'crypto';
import { IWorkspaceWithNestedData } from '../types';

const WorkspaceSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    ownerId: { type: String, ref: 'User', default: null },
    inviteCode: { type: String, unique: true, default: () => randomUUID() },
    isActive: { type: Boolean, default: true },
    description: { type: String, default: null },
    logoUrl: { type: String, default: null },
    allowLinkJoin: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export type IWorkspaceDocument = InferSchemaType<typeof WorkspaceSchema> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// Virtual id mapping from _id
WorkspaceSchema.virtual('id').get(function () {
  return this._id;
});

// Virtual populate projects
WorkspaceSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'workspaceId'
});

const Workspace = (mongoose.models.Workspace as mongoose.Model<IWorkspaceWithNestedData>) ||
  mongoose.model<IWorkspaceWithNestedData>('Workspace', WorkspaceSchema);
export default Workspace;