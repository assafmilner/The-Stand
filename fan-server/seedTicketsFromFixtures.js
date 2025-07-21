const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const TicketListing = require("./models/TicketListing");
const Fixture = require("./models/Fixture");

const teamNameMapping = {
  "מכבי תל אביב": "Maccabi Tel Aviv",
  "הפועל באר שבע": "Hapoel Beer Sheva",
  "מכבי חיפה": "Maccabi Haifa",
  'בית"ר ירושלים': "Beitar Jerusalem",
  "הפועל חיפה": "Hapoel Haifa",
  "מכבי נתניה": "Maccabi Netanya",
  "עירוני קריית שמונה": "Hapoel Ironi Kiryat Shmona",
  "מכבי בני ריינה": "Maccabi Bnei Raina",
  "הפועל ירושלים": "Hapoel Jerusalem",
  "עירוני טבריה": "Ironi Tiberias",
  "מכבי פתח תקווה": "Maccabi Petah Tikva",
  "בני סכנין": "Bnei Sakhnin",
  "מ.ס. אשדוד": "FC Ashdod",
  "הפועל חדרה": "Hapoel Hadera",
  "מכבי הרצליה": "Maccabi Herzliya",
  "הפועל ניר רמת השרון": "Hapoel Ramat HaSharon",
  "הפועל פתח תקווה": "Hapoel Petach Tikva",
  "הפועל אום אל פחם": "Hapoel Umm al-Fahm",
  "הפועל רמת גן": "Hapoel Ramat Gan",
  "הפועל כפר סבא": "Hapoel Kfar Saba",
  "הפועל עפולה": "Hapoel Afula",
  "הפועל נוף הגליל": "Hapoel Nof HaGalil",
  "בני יהודה": "Bnei Yehuda",
  "הפועל עכו": "Hapoel Ironi Akko",
  "הפועל תל אביב": "Hapoel Tel-Aviv",
  "מכבי יפו": "Maccabi Kabilio Jaffa",
  "הפועל ראשון לציון": "Hapoel Rishon LeZion",
  "הפועל כפר שלם": "Hapoel Kfar Shalem",
  "מ.ס. כפר קאסם": "Kafr Qasim",
  "הפועל רעננה": "Hapoel Raanana",
  "הפועל קרית ים": "Hapoel Kiryat Yam",
  "עירוני מודיעין": "Ironi Modi'in",
};

function getHebrewTeamName(englishName) {
  const reverseMapping = Object.fromEntries(
    Object.entries(teamNameMapping).map(([he, en]) => [en, he])
  );
  return reverseMapping[englishName] || englishName;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTicketNotes(team, fixture) {
  const opponent =
    fixture.homeTeamHebrew === team
      ? fixture.awayTeamHebrew
      : fixture.homeTeamHebrew;

  const templates = [
    `כרטיסים למשחק נגד ${opponent}!`,
    "מקומות בגוש המעודד!",
    "מושבים מעולים לאוהדים שרופים!",
    `משחק חשוב נגד ${opponent}, אל תפספסו!`,
  ];

  return randomChoice(templates);
}

async function seedTicketsFromFixtures() {
  console.log("📦 Connecting to MongoDB...");

  try {
    const mongoUrl = process.env.MONGO_URL.includes("<MONGO_PASSWORD>")
      ? process.env.MONGO_URL.replace(
          "<MONGO_PASSWORD>",
          process.env.MONGO_PASSWORD
        )
      : process.env.MONGO_URL;

    await mongoose.connect(mongoUrl);
    console.log("✅ Connected!");

    if (process.argv.includes("--clear")) {
      await TicketListing.deleteMany({});
      console.log("🧹 Cleared existing tickets from DB.");
    }

    const fixtures = await Fixture.find({ date: { $gte: new Date() } });

    if (fixtures.length === 0) {
      console.log("⚠️ No future fixtures found.");
      return;
    }

    const fixturesByHebrewTeam = {};

    for (const fixture of fixtures) {
      const homeTeamHebrew = getHebrewTeamName(fixture.homeTeam);
      const awayTeamHebrew = getHebrewTeamName(fixture.awayTeam);

      if (!fixturesByHebrewTeam[homeTeamHebrew])
        fixturesByHebrewTeam[homeTeamHebrew] = [];
      if (!fixturesByHebrewTeam[awayTeamHebrew])
        fixturesByHebrewTeam[awayTeamHebrew] = [];

      fixturesByHebrewTeam[homeTeamHebrew].push({
        ...fixture.toObject(),
        homeTeamHebrew,
        awayTeamHebrew,
      });
      fixturesByHebrewTeam[awayTeamHebrew].push({
        ...fixture.toObject(),
        homeTeamHebrew,
        awayTeamHebrew,
      });
    }

    const allTeams = Object.keys(fixturesByHebrewTeam);
    let totalTickets = 0;

    for (const team of allTeams) {
      const users = await User.find({ favoriteTeam: team });
      const teamFixtures = fixturesByHebrewTeam[team];

      if (users.length === 0 || teamFixtures.length === 0) {
        console.log(
          `⚠️ Skipping ${team} (users: ${users.length}, fixtures: ${teamFixtures.length})`
        );
        continue;
      }

      for (let i = 0; i < 10; i++) {
        const seller = randomChoice(users);
        const fixture = randomChoice(teamFixtures);

        const ticket = new TicketListing({
          sellerId: seller._id,
          matchId: fixture._id.toString(),
          homeTeam: fixture.homeTeam,
          awayTeam: fixture.awayTeam,
          date: fixture.date,
          time: fixture.time,
          stadium: fixture.venue || fixture.strVenue || `אצטדיון ${team}`,
          quantity: randomNumber(1, 4),
          price: randomNumber(60, 250),
          notes: generateTicketNotes(team, fixture),
          isSoldOut: false,
        });

        await ticket.save();
        totalTickets++;
      }

      console.log(`✅ Created 10 tickets for ${team}`);
    }

    console.log(`\n🎫 Done. Total tickets created: ${totalTickets}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

seedTicketsFromFixtures();
