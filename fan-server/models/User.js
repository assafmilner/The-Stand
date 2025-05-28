const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
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
  "עירוני טבריה"
],

    default: "הפועל תל אביב"
  },

  location: {
    type: String,
    enum: ['צפון', 'מרכז', 'דרום', 'ירושלים', 'אחר'],
    default: 'אחר'
  },

  refreshToken: {
    type: String,
  },

  profilePicture: {
    type: String,
    default:"http://localhost:3001/assets/defaultProfilePic.png", 
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
    enum: ["זכר", "נקבה", "אחר"]
  },

  birthDate: { 
    type: Date
  },

  bio: { 
    type: String, 
    maxlength: 150 
  },

  joinedAt: { 
    type: Date,
    default: Date.now
 },

 isEmailVerified: {
  type: Boolean,
  default: false
},

emailVerificationToken: String,
emailVerificationTokenExpires: Date,


}, { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);