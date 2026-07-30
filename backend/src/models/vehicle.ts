import { HydratedDocument, Model, Schema, model, Types } from 'mongoose';

export interface VehicleAttributes {
	make: string;
	model: string;
	category: string;
	year: number;
	price: number;
	quantity: number;
	imageUrl?: string | null;
	description?: string | null;
}

export interface VehicleDocument extends VehicleAttributes {
	_id: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const vehicleSchema = new Schema<VehicleDocument, Model<VehicleDocument>>(
	{
		make: { type: String, required: true, trim: true },
		model: { type: String, required: true, trim: true },
		category: { type: String, required: true, trim: true },
		year: { type: Number, required: true },
		price: { type: Number, required: true },
		quantity: { type: Number, required: true, min: 0 },
		imageUrl: { type: String, default: null },
		description: { type: String, default: null },
	},
	{ timestamps: true }
);

export const VehicleModel = model<VehicleDocument>('Vehicle', vehicleSchema);

export async function createVehicle(attributes: VehicleAttributes): Promise<HydratedDocument<VehicleDocument>> {
	return VehicleModel.create(attributes);
}

export async function findVehicleById(id: string) {
	return VehicleModel.findById(id).exec();
}

export async function updateVehicleById(id: string, updates: Partial<VehicleAttributes>) {
	return VehicleModel.findByIdAndUpdate(id, updates, { new: true }).exec();
}

export async function deleteVehicleById(id: string) {
	return VehicleModel.findByIdAndDelete(id).exec();
}

export async function listVehicles() {
	return VehicleModel.find({}).sort({ createdAt: -1 }).exec();
}