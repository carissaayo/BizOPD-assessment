import mongoose, { Schema, type Document, type Types } from "mongoose";
import { INITIAL_STAGE, STAGES, type Stage } from "../core/constants/stages";

export interface IOrder {
  customerName: string;
  phone: string;
  product: string;
  stage: Stage;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
}

const orderSchema = new Schema<OrderDocument>(
  {
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    product: { type: String, required: true, trim: true },
    stage: {
      type: String,
      enum: STAGES,
      default: INITIAL_STAGE,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        const { _id, __v, ...rest } = ret;
        return { id: _id.toString(), ...rest };
      },
    },
  },
);

// Dashboard counts filter by stage 
orderSchema.index({ stage: 1 });

// Case-insensitive search targets customerName and phone.
orderSchema.index({ customerName: 1 });
orderSchema.index({ phone: 1 });

// Supports paginated listing sorted by newest first.
orderSchema.index({ createdAt: -1 });

export const OrderModel = mongoose.model<OrderDocument>("Order", orderSchema);
