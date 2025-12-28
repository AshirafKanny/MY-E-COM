import bcrypt from "bcryptjs";
import { Schema, model, Document } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 5,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

UserSchema.methods.comparePassword = async function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", UserSchema);
