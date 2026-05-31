import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "loan_approved",
        "loan_rejected",
        "loan_disbursed",
        "payment_marked",
        "new_user",
        "new_loan",
        "other",
      ],
      default: "other",
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      // optional link to redirect the user when clicked
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
