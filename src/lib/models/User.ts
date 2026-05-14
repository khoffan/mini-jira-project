import mongoose, { InferSchemaType, Model, Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    _id: { type: String, required: true }, // Maps to uid from Firebase
    email: { type: String, required: true, unique: true },
    name: { type: String, default: null },
    image: { type: String, default: null }
  },
  {
    _id: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export type IUserDocument = InferSchemaType<typeof UserSchema> & {
  uid: string; // Virtual mapping from _id
  createdAt: Date;
  updatedAt: Date;
};

// Virtual uid mapping from _id (Firebase uid)
UserSchema.virtual('uid').get(function () {
  return this._id;
});

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
