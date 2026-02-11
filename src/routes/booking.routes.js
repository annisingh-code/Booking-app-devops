const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const bookingRouter = express.Router();
const Booking = require("../models/booking.model");

bookingRouter.post("/", authMiddleware, roleMiddleware("user"), async (req, res) => {
    try {

        const { serviceName, appointmentDate, price } = req.body;
        const { userId } = req.user
        if (!serviceName || !appointmentDate || !price) {
            return res.status(400).json({ msg: "All fields are required" });
        }
        const newBooking = await Booking.create({
            userId,
            serviceName,
            appointmentDate,
            price,
            status: "pending" // business rule enforced
        });
        return res.status(201).json({ msg: "Your Booking is successful", booking: newBooking })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Booking failed", error: error.message })
    }
})


bookingRouter.get("/:id", authMiddleware, async (req, res) => {
    try {
        const { userId, role } = req.user;

        let bookings;

        if (role === "admin") {
            // Admin can see all bookings
            bookings = await Booking.find();
        } else {
            // User can see only their bookings
            bookings = await Booking.find({ userId });
        }

        return res.status(200).json({
            msg: "Booking details fetched successfully",
            bookings
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Failed to fetch bookings"
        });
    }
});


bookingRouter.put("/:id", authMiddleware, roleMiddleware("user"), async (req, res) => {
    try {
        const { serviceName, appointmentDate, price, status } = req.body;
        const bookingId = req.params.id;

        // 1. Validation
        if (!serviceName || !appointmentDate || !price) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        // 2. Query Object Banao
        // Hume wahi booking chahiye jo User ki ho + Pending ho
        const query = {
            _id: bookingId,
            status: "pending",// ✨ MAGIC LOGIC: Sirf pending wali hi select hogi
            userId: req.user.userId

        };

        // 3. Update Object
        const updateData = {
            serviceName,
            appointmentDate,
            price
        };

        // 4. Find One And Update
        const updatedBooking = await Booking.findOneAndUpdate(
            query,
            updateData,
            { new: true, runValidators: true }
        );
        // 5. Check Result
        if (!updatedBooking) {
            // Agar yahan null aaya, iska matlab ya toh ID galat hai,
            // YA FIR status 'pending' nahi tha (shayad approve ho chuka hai).
            return res.status(400).json({
                msg: "Cannot update: Booking not found or it is already processed (not pending)."
            });
        }
        return res.status(200).json({
            msg: "Booking updated successfully",
            booking: updatedBooking
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Something went wrong", error: error.message })
    }
})

// Note: Method PUT ya PATCH use karo, DELETE nahi
// DELETE ki jagah PUT use kar rahe hain, kyunki hum sirf status badal rahe hain
bookingRouter.patch(
    "/:id/cancel",
    authMiddleware,
    roleMiddleware("user"),
    async (req, res) => {
        try {
            const bookingId = req.params.id;

            const query = {
                _id: bookingId,
                status: "pending",
                userId: req.user.userId   // ✅ Correct field name
            };

            const cancelledBooking = await Booking.findOneAndUpdate(
                query,
                { status: "cancelled" },
                { new: true, runValidators: true }
            );

            if (!cancelledBooking) {
                return res.status(400).json({
                    msg: "Cannot Cancel: Booking not found, not yours, or not pending."
                });
            }

            return res.status(200).json({
                msg: "Booking Cancelled successfully",
                booking: cancelledBooking
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                msg: "Something went wrong",
                error: error.message
            });
        }
    }
);


bookingRouter.patch("/:id/approve", authMiddleware, roleMiddleware("admin"), async (req, res) => {

    try {
        const bookingId = req.params.id;
        const query = {
            _id: bookingId,
            status: "pending",
        }
        const approvedBooking = await Booking.findOneAndUpdate(
            query,
            { status: "approved" },
            { new: true }
        );
        if (!approvedBooking) {
            return res.status(400).json({
                msg: "Cannot approve: Booking not found or already processed."
            });
        }
        return res.status(200).json({
            msg: "Booking approved successfully",
            booking: approvedBooking
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Something went wrong",
            error: error.message
        });
    }
});


bookingRouter.patch("/:id/reject", authMiddleware, roleMiddleware("admin"), async (req, res) => {

    try {
        const bookingId = req.params.id;
        const query = {
            _id: bookingId,
            status: "pending"
        };
        const rejectedBooking = await Booking.findOneAndUpdate(
            query,
            { status: "reject" },
            { new: true, runValidators: true }
        );
        if (!rejectedBooking) {
            return res.status(400).json({
                message: "Booking not found or cannot be rejected (status is not pending)."
            });
        }
        return res.status(200).json({
            msg: "Booking rejected successfully",
            booking: rejectedBooking
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Something went wrong",
            error: error.message
        });
    }
});

bookingRouter.delete("/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {

    try {
        const bookingId = req.params.id;

        const deletedBooking = await Booking.findByIdAndDelete(bookingId)
        if (!deletedBooking) {
            return res.status(400).json({
                message: `This BookingId ${bookingId} does not exist`
            });
        }
        return res.status(200).json({
            msg: "Booking Deleted successfully",
            booking: deletedBooking
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Something went wrong",
            error: error.message
        });
    }
});


module.exports = bookingRouter