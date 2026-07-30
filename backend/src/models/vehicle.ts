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
	// Optional descriptive fields added for seed/display purposes
	transmission?: string | null;
	fuelType?: string | null;
	mileage?: number | null;
	bodyType?: string | null;
	color?: string | null;
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
		// Optional descriptive fields
		transmission: { type: String, default: null },
		fuelType: { type: String, default: null },
		mileage: { type: Number, default: null },
		bodyType: { type: String, default: null },
		color: { type: String, default: null },
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

export async function listAvailableVehicles() {
	return VehicleModel.find({ quantity: { $gt: 0 } }).sort({ createdAt: -1 }).exec();
}

export async function incrementVehicleQuantity(id: string, amount: number) {
	return VehicleModel.findByIdAndUpdate(id, { $inc: { quantity: amount } }, { new: true }).exec();
}

export async function decrementVehicleQuantity(id: string, amount: number) {
	return VehicleModel.findByIdAndUpdate(id, { $inc: { quantity: -amount } }, { new: true }).exec();
}