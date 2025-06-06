import mongoose from "mongoose";
const StorelocationSchema = new mongoose.Schema({
  state: { type: String, required: true },
  cities: [
    {
      name: { type: String, required: true },
      addresses: [
        {
          name: { type: String, required: true },
          phone: { type: String, required: true },
          alternatePhone: { type: String },
          address: { type: String, required: true },
        },
      ],
    },
  ],
});

export const StoreLocation = mongoose.model(
  "StoreLocation",
  StorelocationSchema
);
