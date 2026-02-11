const mongoose = require("mongoose");


const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Ye standard ID format hai
        ref: "User", // Ye wo model name hai jo tumne User schema banate waqt diya tha
        required: true // Bina user ke booking nahi ho sakti
    },
    serviceName: { type: String, required: true, trim: true },
    appointmentDate: {
        type: Date,
        required: true
    },
    status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
    price: {
        type: Number,
        required: true
    },


}, { timestamps: true })

module.exports = mongoose.model("Booking", bookingSchema)


