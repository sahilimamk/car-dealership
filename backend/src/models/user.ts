import { HydratedDocument, Model, Schema, model, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface UserAttributes {
  username: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface UserDocument extends UserAttributes {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument, Model<UserDocument>>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<UserDocument>('User', userSchema);

export async function createUser(attributes: UserAttributes): Promise<HydratedDocument<UserDocument>> {
  return UserModel.create({
    ...attributes,
    role: attributes.role || 'user',
  });
}

export async function findUserById(id: string) {
  return UserModel.findById(id).exec();
}

export async function findUserByUsername(username: string) {
  return UserModel.findOne({ username }).exec();
}

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email }).exec();
}

export async function updateUserById(id: string, updates: Partial<UserAttributes>) {
  return UserModel.findByIdAndUpdate(id, updates, { new: true }).exec();
}

export async function deleteUserById(id: string) {
  return UserModel.findByIdAndDelete(id).exec();
}
