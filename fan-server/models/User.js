// ### Mongoose Schema: User
// Defines the user model for the platform, including authentication fields,
// personal preferences (favorite team, location, gender), and profile metadata.
// Used for user management, search, and personalization features.

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "user",
    },

    favoriteTeam: {
      type: String,
      enum: [
        "הפועל עכו",
        'בית"ר ירושלים',
        "בני יהודה",
        "בני סכנין",
        "הפועל אום אל פחם",
        "הפועל עפולה",
        "הפועל באר שבע",
        "הפועל חדרה",
        "הפועל חיפה",
        "הפועל ירושלים",
        "הפועל נוף הגליל",
        "הפועל ניר רמת השרון",
        "הפועל פתח תקווה",
        "הפועל כפר סבא",
        "הפועל כפר שלם",
        "הפועל ראשון לציון",
        "הפועל רעננה",
        "הפועל רמת גן",
        "הפועל תל אביב",
        "מ.ס. אשדוד",
        "מ.ס. כפר קאסם",
        "מכבי בני ריינה",
        "מכבי תל אביב",
        "מכבי חיפה",
        "מכבי יפו",
        "מכבי נתניה",
        "מכבי פתח תקווה",
        "מכבי הרצליה",
        "עירוני קרית שמונה",
        "עירוני טבריה",
      ],

      default: "הפועל תל אביב",
    },

    location: {
      type: String,
      enum: ["צפון", "מרכז", "דרום", "ירושלים", "אחר"],
      default: "צפון",
    },

    refreshToken: {
      type: String,
    },

    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/ddygnvbr7/image/upload/v1752662044/defaultProfilePic_pngf2x.png",
    },

    coverImage: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
    },

    gender: {
      type: String,
      enum: ["זכר", "נקבה", "אחר"],
    },

    birthDate: {
      type: Date,
    },

    bio: {
      type: String,
      maxlength: 300,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
  },
  { timestamps: true }
);

UserSchema.index({ name: "text" });
UserSchema.index({ favoriteTeam: 1, name: 1 });
UserSchema.index({ favoriteTeam: 1, gender: 1, location: 1 });

module.exports = mongoose.model("User", UserSchema);
