const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const Friend = require("./models/Friend");
const TicketListing = require("./models/TicketListing"); // ADD THIS LINE
const FixturesService = require("./services/fixturesService");

const ALWAYS_KEEP_USERS = [
  "6836ef4acb8462b030c04e5f", // אסף
  "6836fe977e631fcdf744a128", // ליאת
  "683703567e631fcdf744a3bf", // אסתר
].map((id) => new mongoose.Types.ObjectId(id));

// Enhanced profile pictures arrays
const maleProfilePictures = [
  // Real football player style photos
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face",
  // Random user API backup
  "https://randomuser.me/api/portraits/men/1.jpg",
  "https://randomuser.me/api/portraits/men/2.jpg",
  "https://randomuser.me/api/portraits/men/3.jpg",
  "https://randomuser.me/api/portraits/men/4.jpg",
  "https://randomuser.me/api/portraits/men/5.jpg",
  "https://randomuser.me/api/portraits/men/6.jpg",
  "https://randomuser.me/api/portraits/men/7.jpg",
  "https://randomuser.me/api/portraits/men/8.jpg",
  "https://randomuser.me/api/portraits/men/9.jpg",
  "https://randomuser.me/api/portraits/men/10.jpg",
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/men/12.jpg",
  "https://randomuser.me/api/portraits/men/13.jpg",
  "https://randomuser.me/api/portraits/men/14.jpg",
  "https://randomuser.me/api/portraits/men/15.jpg",
  "https://randomuser.me/api/portraits/men/16.jpg",
  "https://randomuser.me/api/portraits/men/17.jpg",
  "https://randomuser.me/api/portraits/men/18.jpg",
  "https://randomuser.me/api/portraits/men/19.jpg",
  "https://randomuser.me/api/portraits/men/20.jpg",
  "https://randomuser.me/api/portraits/men/21.jpg",
  "https://randomuser.me/api/portraits/men/22.jpg",
  "https://randomuser.me/api/portraits/men/23.jpg",
  "https://randomuser.me/api/portraits/men/24.jpg",
  "https://randomuser.me/api/portraits/men/25.jpg",
];

const femaleProfilePictures = [
  // Real female photos
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  // Random user API backup
  "https://randomuser.me/api/portraits/women/1.jpg",
  "https://randomuser.me/api/portraits/women/2.jpg",
  "https://randomuser.me/api/portraits/women/3.jpg",
  "https://randomuser.me/api/portraits/women/4.jpg",
  "https://randomuser.me/api/portraits/women/5.jpg",
  "https://randomuser.me/api/portraits/women/6.jpg",
  "https://randomuser.me/api/portraits/women/7.jpg",
  "https://randomuser.me/api/portraits/women/8.jpg",
  "https://randomuser.me/api/portraits/women/9.jpg",
  "https://randomuser.me/api/portraits/women/10.jpg",
  "https://randomuser.me/api/portraits/women/11.jpg",
  "https://randomuser.me/api/portraits/women/12.jpg",
  "https://randomuser.me/api/portraits/women/13.jpg",
  "https://randomuser.me/api/portraits/women/14.jpg",
  "https://randomuser.me/api/portraits/women/15.jpg",
  "https://randomuser.me/api/portraits/women/16.jpg",
  "https://randomuser.me/api/portraits/women/17.jpg",
  "https://randomuser.me/api/portraits/women/18.jpg",
  "https://randomuser.me/api/portraits/women/19.jpg",
  "https://randomuser.me/api/portraits/women/20.jpg",
  "https://randomuser.me/api/portraits/women/21.jpg",
  "https://randomuser.me/api/portraits/women/22.jpg",
  "https://randomuser.me/api/portraits/women/23.jpg",
  "https://randomuser.me/api/portraits/women/24.jpg",
  "https://randomuser.me/api/portraits/women/25.jpg",
];

// Football-related images for posts
const footballImages = [
  // Stadiums and matches
  "https://www.israelhayom.co.il/wp-content/uploads/2024/12/31/31/New_ALEN9316-4.jpg",
  "https://sport1images.maariv.co.il/image/upload/f_auto,fl_lossy,c_thumb,g_north,w_728,h_441/1179327?t=1",
  "https://www.israelhayom.co.il/wp-content/uploads/2023/12/16/16/New__LAN1745.jpg",
  "https://img.ice.co.il/giflib/news/rsPhoto/sz_329/rsz_615_346_%D7%92%D7%93%D7%A9%D7%93%D7%92%D7%A9%D7%93%D7%92%D7%A9%D7%93%D7%92%D7%A9%D7%93%D7%92%D7%A9%D7%93%D7%92%D7%A9%D7%93%D7%92%D7%A9.JPG",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnQYkN3W7F4vJ5k7VEFjnBiSAjnwV97betFQ&s",

  // Football balls and equipment
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
  "https://sportball.co.il/wp-content/uploads/2024/05/2.jpg",
  "https://www.news08.net/wp-content/uploads/2025/04/GopYld9WoAA2e20-819x1024.jpg",
  "https://ashdodonline.co.il/wp-content/uploads/2023/11/F-0-NKhWQAAHiq5.jpeg",

  // Football action and players
  "https://www.israelhayom.co.il/wp-content/uploads/2025/01/27/27/New_AMI_7061-960x640.jpg",
  "https://www.israelhayom.co.il/wp-content/uploads/2025/05/07/07/New_ALAN1837.jpg",
  "https://pic1.calcalist.co.il/PicServer3/2017/06/21/736221/17_l.jpg",
  "https://2.a7.org/files/pictures/781x439/1172088.jpg",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=600&fit=crop",
  "https://www.israelhayom.co.il/wp-content/uploads/2025/03/07/07/dannymaron30-15.jpg",

  // Goals and celebrations
  "https://sport1images.maariv.co.il/image/upload/f_auto,fl_lossy,c_thumb,g_north,w_260,h_160/1231727?t=1",
  "https://ynet-pic1.yit.co.il/cdn-cgi/image/f=auto,w=740,q=75/picserver5/crop_images/2022/09/18/rJGcZJBWs/rJGcZJBWs_0_42_1280_720_0_x-large.jpg",
  "https://ynet-pic1.yit.co.il/cdn-cgi/image/f=auto,w=740,q=75/picserver5/crop_images/2023/09/04/BkfmE57A3/BkfmE57A3_0_74_1442_812_0_x-large.jpg",
  "https://www.ynet.co.il/PicServer5/2018/04/16/8474203/84741590990100980680no.jpg",
  "https://www.ynet.co.il/PicServer5/2019/03/10/9110387/911038201000100980759no.jpg",

  // Fans and atmosphere
  "https://ynet-pic1.yit.co.il/picserver5/crop_images/2022/09/11/By6wHsjgj/By6wHsjgj_0_313_3000_1688_0_x-large.jpg",
  "https://sport1images.maariv.co.il/image/upload/f_auto,fl_lossy,c_thumb,g_north,w_1200,h_630/600479",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT31thNytc6uFdRowpAW-FGLMuQvZ3yoYho5Q&s",
];

// Cover images for profiles
const coverImages = [
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=400&fit=crop",
  "https://images.wcdn.co.il/f_auto,q_auto,w_1200,t_54/3/4/4/5/3445333-46.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpPxewq9OZisA-xKKaN9nxt_0Uz5tPiTLhxQ&s",
  "https://www.sport5.co.il/Sip_Storage/FILES/5/size475x318/1549755.jpg",
  "https://ultras-israel.co.il/wp-content/uploads/2023/02/IMG_20230225_183217_929.jpg",
  "https://green-apes.com/wp-content/uploads/2025/01/469146787_980852470736663_7711482733408696428_n-1024x620.jpg",
  "https://hazavit.co.il/wp-content/uploads/2017/05/6212DCF9-1F99-4BE4-BD2A-12805D605DEA-951-000000EC7F7D867F.jpeg",
  "https://ynet-pic1.yit.co.il/picserver5/crop_images/2022/08/27/one1618141/one1618141_0_0_800_444_0_large.jpg",
];

// Teams mapping with community IDs
const teamsData = {
  "מכבי תל אביב": { communityId: "1" },
  "הפועל באר שבע": { communityId: "2" },
  "מכבי חיפה": { communityId: "3" },
  'בית"ר ירושלים': { communityId: "4" },
  "הפועל חיפה": { communityId: "5" },
  "מכבי נתניה": { communityId: "6" },
  "עירוני קרית שמונה": { communityId: "7" },
  "מכבי בני ריינה": { communityId: "8" },
  "הפועל ירושלים": { communityId: "9" },
  "עירוני טבריה": { communityId: "10" },
  "מכבי פתח תקווה": { communityId: "11" },
  "בני סכנין": { communityId: "12" },
  "מ.ס. אשדוד": { communityId: "13" },
  "הפועל חדרה": { communityId: "14" },
  "מכבי הרצליה": { communityId: "15" },
  "הפועל ניר רמת השרון": { communityId: "16" },
  "הפועל פתח תקווה": { communityId: "17" },
  "הפועל אום אל פחם": { communityId: "18" },
  "הפועל רמת גן": { communityId: "19" },
  "הפועל כפר סבא": { communityId: "20" },
  "הפועל עפולה": { communityId: "21" },
  "הפועל נוף הגליל": { communityId: "22" },
  "בני יהודה": { communityId: "23" },
  "הפועל עכו": { communityId: "24" },
  "הפועל תל אביב": { communityId: "25" },
  "מכבי יפו": { communityId: "26" },
  "הפועל ראשון לציון": { communityId: "27" },
  "הפועל כפר שלם": { communityId: "28" },
  "מ.ס. כפר קאסם": { communityId: "29" },
  "הפועל רעננה": { communityId: "30" },
};

// Sample matches data for each team
const sampleMatches = {
  "הפועל תל אביב": [
    {
      homeTeam: "הפועל תל אביב",
      awayTeam: "מכבי תל אביב",
      stadium: "בלומפילד",
      date: "2025-02-15",
      time: "20:00",
    },
    {
      homeTeam: "הפועל באר שבע",
      awayTeam: "הפועל תל אביב",
      stadium: "טרנר",
      date: "2025-02-22",
      time: "17:00",
    },
    {
      homeTeam: "הפועל תל אביב",
      awayTeam: "מכבי חיפה",
      stadium: "בלומפילד",
      date: "2025-03-01",
      time: "20:00",
    },
    {
      homeTeam: 'בית"ר ירושלים',
      awayTeam: "הפועל תל אביב",
      stadium: "טדי",
      date: "2025-03-08",
      time: "17:00",
    },
  ],
  "מכבי תל אביב": [
    {
      homeTeam: "מכבי תל אביב",
      awayTeam: "הפועל תל אביב",
      stadium: "בלומפילד",
      date: "2025-02-15",
      time: "20:00",
    },
    {
      homeTeam: "מכבי חיפה",
      awayTeam: "מכבי תל אביב",
      stadium: "סמי עופר",
      date: "2025-02-22",
      time: "17:00",
    },
    {
      homeTeam: "מכבי תל אביב",
      awayTeam: "הפועל באר שבע",
      stadium: "בלומפילד",
      date: "2025-03-01",
      time: "20:00",
    },
    {
      homeTeam: "מכבי נתניה",
      awayTeam: "מכבי תל אביב",
      stadium: "נתניה",
      date: "2025-03-08",
      time: "17:00",
    },
  ],
  "הפועל באר שבע": [
    {
      homeTeam: "הפועל באר שבע",
      awayTeam: "הפועל תל אביב",
      stadium: "טרנר",
      date: "2025-02-22",
      time: "17:00",
    },
    {
      homeTeam: "מכבי תל אביב",
      awayTeam: "הפועל באר שבע",
      stadium: "בלומפילד",
      date: "2025-03-01",
      time: "20:00",
    },
    {
      homeTeam: "הפועל באר שבע",
      awayTeam: "מכבי חיפה",
      stadium: "טרנר",
      date: "2025-03-08",
      time: "17:00",
    },
    {
      homeTeam: "הפועל חיפה",
      awayTeam: "הפועל באר שבע",
      stadium: "סמי עופר",
      date: "2025-03-15",
      time: "20:00",
    },
  ],
  "מכבי חיפה": [
    {
      homeTeam: "מכבי חיפה",
      awayTeam: "מכבי תל אביב",
      stadium: "סמי עופר",
      date: "2025-02-22",
      time: "17:00",
    },
    {
      homeTeam: "הפועל תל אביב",
      awayTeam: "מכבי חיפה",
      stadium: "בלומפילד",
      date: "2025-03-01",
      time: "20:00",
    },
    {
      homeTeam: "הפועל באר שבע",
      awayTeam: "מכבי חיפה",
      stadium: "טרנר",
      date: "2025-03-08",
      time: "17:00",
    },
    {
      homeTeam: "מכבי חיפה",
      awayTeam: 'בית"ר ירושלים',
      stadium: "סמי עופר",
      date: "2025-03-15",
      time: "20:00",
    },
  ],
  'בית"ר ירושלים': [
    {
      homeTeam: 'בית"ר ירושלים',
      awayTeam: "הפועל תל אביב",
      stadium: "טדי",
      date: "2025-03-08",
      time: "17:00",
    },
    {
      homeTeam: "מכבי חיפה",
      awayTeam: 'בית"ר ירושלים',
      stadium: "סמי עופר",
      date: "2025-03-15",
      time: "20:00",
    },
    {
      homeTeam: 'בית"ר ירושלים',
      awayTeam: "הפועל ירושלים",
      stadium: "טדי",
      date: "2025-03-22",
      time: "17:00",
    },
    {
      homeTeam: "מכבי נתניה",
      awayTeam: 'בית"ר ירושלים',
      stadium: "נתניה",
      date: "2025-03-29",
      time: "20:00",
    },
  ],
  "הפועל חיפה": [
    {
      homeTeam: "הפועל חיפה",
      awayTeam: "הפועל באר שבע",
      stadium: "סמי עופר",
      date: "2025-03-15",
      time: "20:00",
    },
    {
      homeTeam: "מכבי נתניה",
      awayTeam: "הפועל חיפה",
      stadium: "נתניה",
      date: "2025-03-22",
      time: "17:00",
    },
    {
      homeTeam: "הפועל חיפה",
      awayTeam: "עירוני קרית שמונה",
      stadium: "סמי עופר",
      date: "2025-03-29",
      time: "20:00",
    },
    {
      homeTeam: "הפועל ירושלים",
      awayTeam: "הפועל חיפה",
      stadium: "טדי",
      date: "2025-04-05",
      time: "17:00",
    },
  ],
  "מכבי נתניה": [
    {
      homeTeam: "מכבי נתניה",
      awayTeam: "מכבי תל אביב",
      stadium: "נתניה",
      date: "2025-03-08",
      time: "17:00",
    },
    {
      homeTeam: "מכבי נתניה",
      awayTeam: 'בית"ר ירושלים',
      stadium: "נתניה",
      date: "2025-03-29",
      time: "20:00",
    },
    {
      homeTeam: "מכבי נתניה",
      awayTeam: "הפועל חיפה",
      stadium: "נתניה",
      date: "2025-03-22",
      time: "17:00",
    },
    {
      homeTeam: "עירוני קרית שמונה",
      awayTeam: "מכבי נתניה",
      stadium: "קרית שמונה",
      date: "2025-04-05",
      time: "20:00",
    },
  ],
  "עירוני קרית שמונה": [
    {
      homeTeam: "הפועל חיפה",
      awayTeam: "עירוני קרית שמונה",
      stadium: "סמי עופר",
      date: "2025-03-29",
      time: "20:00",
    },
    {
      homeTeam: "עירוני קרית שמונה",
      awayTeam: "מכבי נתניה",
      stadium: "קרית שמונה",
      date: "2025-04-05",
      time: "20:00",
    },
    {
      homeTeam: "עירוני קרית שמונה",
      awayTeam: "הפועל פתח תקווה",
      stadium: "קרית שמונה",
      date: "2025-04-12",
      time: "17:00",
    },
    {
      homeTeam: "בני יהודה",
      awayTeam: "עירוני קרית שמונה",
      stadium: "יהודה",
      date: "2025-04-19",
      time: "20:00",
    },
  ],
  "הפועל פתח תקווה": [
    {
      homeTeam: "עירוני קרית שמונה",
      awayTeam: "הפועל פתח תקווה",
      stadium: "קרית שמונה",
      date: "2025-04-12",
      time: "17:00",
    },
    {
      homeTeam: "הפועל פתח תקווה",
      awayTeam: "מכבי פתח תקווה",
      stadium: "HaMoshava",
      date: "2025-04-19",
      time: "20:00",
    },
    {
      homeTeam: "בני סכנין",
      awayTeam: "הפועל פתח תקווה",
      stadium: "Doha",
      date: "2025-04-26",
      time: "17:00",
    },
    {
      homeTeam: "הפועל פתח תקווה",
      awayTeam: "מ.ס. אשדוד",
      stadium: "HaMoshava",
      date: "2025-05-03",
      time: "20:00",
    },
  ],
  "הפועל ירושלים": [
    {
      homeTeam: 'בית"ר ירושלים',
      awayTeam: "הפועל ירושלים",
      stadium: "טדי",
      date: "2025-03-22",
      time: "17:00",
    },
    {
      homeTeam: "הפועל ירושלים",
      awayTeam: "הפועל חיפה",
      stadium: "טדי",
      date: "2025-04-05",
      time: "17:00",
    },
    {
      homeTeam: "הפועל ירושלים",
      awayTeam: "בני יהודה",
      stadium: "טדי",
      date: "2025-04-12",
      time: "20:00",
    },
    {
      homeTeam: "מכבי פתח תקווה",
      awayTeam: "הפועל ירושלים",
      stadium: "HaMoshava",
      date: "2025-04-19",
      time: "17:00",
    },
  ],
  "בני יהודה": [
    {
      homeTeam: "בני יהודה",
      awayTeam: "עירוני קרית שמונה",
      stadium: "יהודה",
      date: "2025-04-19",
      time: "20:00",
    },
    {
      homeTeam: "הפועל ירושלים",
      awayTeam: "בני יהודה",
      stadium: "טדי",
      date: "2025-04-12",
      time: "20:00",
    },
    {
      homeTeam: "בני יהודה",
      awayTeam: "בני סכנין",
      stadium: "יהודה",
      date: "2025-04-26",
      time: "17:00",
    },
    {
      homeTeam: "הפועל רמת גן",
      awayTeam: "בני יהודה",
      stadium: "רמת גן",
      date: "2025-05-03",
      time: "20:00",
    },
  ],
  "מכבי פתח תקווה": [
    {
      homeTeam: "הפועל פתח תקווה",
      awayTeam: "מכבי פתח תקווה",
      stadium: "HaMoshava",
      date: "2025-04-19",
      time: "20:00",
    },
    {
      homeTeam: "מכבי פתח תקווה",
      awayTeam: "הפועל ירושלים",
      stadium: "HaMoshava",
      date: "2025-04-19",
      time: "17:00",
    },
    {
      homeTeam: "מכבי פתח תקווה",
      awayTeam: "מ.ס. אשדוד",
      stadium: "HaMoshava",
      date: "2025-04-26",
      time: "20:00",
    },
    {
      homeTeam: "בני סכנין",
      awayTeam: "מכבי פתח תקווה",
      stadium: "Doha",
      date: "2025-05-03",
      time: "17:00",
    },
  ],
  "בני סכנין": [
    {
      homeTeam: "בני סכנין",
      awayTeam: "הפועל פתח תקווה",
      stadium: "Doha",
      date: "2025-04-26",
      time: "17:00",
    },
    {
      homeTeam: "בני יהודה",
      awayTeam: "בני סכנין",
      stadium: "יהודה",
      date: "2025-04-26",
      time: "17:00",
    },
    {
      homeTeam: "בני סכנין",
      awayTeam: "מכבי פתח תקווה",
      stadium: "Doha",
      date: "2025-05-03",
      time: "17:00",
    },
    {
      homeTeam: "הפועל כפר שלם",
      awayTeam: "בני סכנין",
      stadium: "כפר שלם",
      date: "2025-05-10",
      time: "20:00",
    },
  ],
  "מ.ס. אשדוד": [
    {
      homeTeam: "הפועל פתח תקווה",
      awayTeam: "מ.ס. אשדוד",
      stadium: "HaMoshava",
      date: "2025-05-03",
      time: "20:00",
    },
    {
      homeTeam: "מכבי פתח תקווה",
      awayTeam: "מ.ס. אשדוד",
      stadium: "HaMoshava",
      date: "2025-04-26",
      time: "20:00",
    },
    {
      homeTeam: "מ.ס. אשדוד",
      awayTeam: "הפועל רמת גן",
      stadium: "יד אליהו",
      date: "2025-05-10",
      time: "17:00",
    },
    {
      homeTeam: "מ.ס. אשדוד",
      awayTeam: "הפועל כפר שלם",
      stadium: "יד אליהו",
      date: "2025-05-17",
      time: "20:00",
    },
  ],
  "הפועל רמת גן": [
    {
      homeTeam: "הפועל רמת גן",
      awayTeam: "בני יהודה",
      stadium: "רמת גן",
      date: "2025-05-03",
      time: "20:00",
    },
    {
      homeTeam: "מ.ס. אשדוד",
      awayTeam: "הפועל רמת גן",
      stadium: "יד אליהו",
      date: "2025-05-10",
      time: "17:00",
    },
    {
      homeTeam: "הפועל רמת גן",
      awayTeam: "הפועל כפר שלם",
      stadium: "רמת גן",
      date: "2025-05-17",
      time: "17:00",
    },
    {
      homeTeam: "הפועל רמת גן",
      awayTeam: "הפועל תל אביב",
      stadium: "רמת גן",
      date: "2025-05-24",
      time: "20:00",
    },
  ],
  "הפועל כפר שלם": [
    {
      homeTeam: "הפועל כפר שלם",
      awayTeam: "בני סכנין",
      stadium: "כפר שלם",
      date: "2025-05-10",
      time: "20:00",
    },
    {
      homeTeam: "מ.ס. אשדוד",
      awayTeam: "הפועל כפר שלם",
      stadium: "יד אליהו",
      date: "2025-05-17",
      time: "20:00",
    },
    {
      homeTeam: "הפועל רמת גן",
      awayTeam: "הפועל כפר שלם",
      stadium: "רמת גן",
      date: "2025-05-17",
      time: "17:00",
    },
    {
      homeTeam: "הפועל כפר שלם",
      awayTeam: "מכבי תל אביב",
      stadium: "כפר שלם",
      date: "2025-05-24",
      time: "17:00",
    },
  ],
};

// Enhanced name arrays
const maleFirstNames = [
  "יוסי",
  "רועי",
  "איתי",
  "מתן",
  "אדם",
  "ליאור",
  "עומר",
  "שחר",
  "נדב",
  "אלעד",
  "עמיר",
  "רון",
  "איל",
  "גל",
  "תום",
  "אור",
  "נועם",
  "עידו",
  "זיו",
  "אריאל",
  "דוד",
  "משה",
  "אברהם",
  "יעקב",
  "יצחק",
  "שמואל",
  "דניאל",
  "מיכאל",
  "רפאל",
  "עזרא",
  "אבי",
  "בועז",
  "עודד",
  "יונתן",
  "נתן",
  "שי",
  "טל",
  "קורן",
  "רם",
  "לי",
];

const femaleFirstNames = [
  "נועה",
  "שירה",
  "תמר",
  "מיכל",
  "מאיה",
  "דנה",
  "אור",
  "רוני",
  "טל",
  "איילת",
  "ליאת",
  "גל",
  "שני",
  "מור",
  "קרן",
  "חן",
  "עדן",
  "מעיין",
  "ליה",
  "שירן",
  "רותם",
  "יעל",
  "הדר",
  "נגה",
  "סתיו",
  "אביגיל",
  "רחל",
  "לאה",
  "דינה",
  "מרים",
  "שרה",
  "רבקה",
  "אסתר",
  "יהודית",
  "בת שבע",
  "ליבי",
  "צביה",
  "פנינה",
  "חווה",
  "נעמי",
];

const lastNames = [
  "כהן",
  "לוי",
  "פרץ",
  "ישראלי",
  "מלכה",
  "רוזן",
  "אביטל",
  "נחום",
  "זיו",
  "ברק",
  "דוד",
  "משה",
  "אברהם",
  "יעקב",
  "גולדמן",
  "שמיר",
  "בן דוד",
  "גבע",
  "טל",
  "מור",
  "אמור",
  "זהבי",
  "נחמן",
  "שלום",
  "ברוך",
  "דרור",
  "אלון",
  "צבר",
  "ארז",
  "כרמל",
  "גלבוע",
  "הררי",
  "שדה",
  "ענבר",
  "דגן",
  "רימון",
  "אתרוג",
  "זית",
  "תמר",
  "ליבנה",
];

const israeliCities = ["מרכז", "צפון", "דרום", "ירושלים", "אחר"];

// Extensive post content arrays
const postContents = [
  // Match reactions
  "איזה משחק מטורף היה אתמול! לא יכול להירגע מהרגש! ⚽🔥",
  "הגול השני הזה! עדיין מקבל צמרמורת כשאני חושב עליו 😍",
  "ההגנה שלנו הייתה מושלמת היום! כל הכבוד לבנים 💪",
  "איזה סייב מדהים של השוער! הציל לנו את הניצחון 🥅",
  "המסירה הזאת לגול הייתה פשוט גאונית! איזה כדורגל! ⚽",

  // Pre-match excitement
  "מחכה למשחק בשבת! מי בא איתי לאצטדיון? 🏟️",
  "קניתי כרטיסים למשחק! מישהו רוצה להצטרף? 🎫",
  "דרבי השבוע הזה! מוכנים לתת הכל ביציע! 🔥",
  "אני כבר לא יכול לחכות למשחק מחר! הלב דופק! ❤️",
  "מישהו יודע איך להגיע לאצטדיון בתחבורה ציבורית? 🚌",

  // Team performance analysis
  "הקבוצה שלנו משחקת נדהר השנה! איזו הרכבה! ⭐",
  "המאמן החדש באמת הביא רוח חדשה לקבוצה 👨‍💼",
  "צריך לשפר את המשחק באמצע המגרש, אבל אנחנו על הדרך הנכונה 🎯",
  "השחקן החדש שהצטרף השבוע נראה מבטיח מאוד! 🌟",
  "בסוף העונה אנחנו הולכים להיות באירופה! אני מרגיש את זה! 🏆",

  // Fan culture and atmosphere
  "האווירה באצטדיון הבית שלנו זה פשוט משהו אחר! 🎵",
  "השירים החדשים ביציע פשוט מדהימים! כל הכבוד למארגנים! 🎤",
  "30 שנה שאני אוהד ועדיין מתרגש כמו בפעם הראשונה! 💚",
  "הדרך הביתה מהאצטדיון עם כל האוהדים זה החלק הכי טוב! 🚶‍♂️",
  "איך התחלתם להיות אוהדים של הקבוצה? אני מסקרן לשמוע! 🤔",

  // Transfers and rumors
  "שמעתם על העסקה החדשה? מה אתם חושבים? 💰",
  "אם נצליח להביא את השחקן הזה, זה יהיה משחק מוחות! 🧠",
  "השמועות על העזיבה מדאיגות אותי... מקווה שזה לא נכון 😟",
  "החלון הזה אנחנו חייבים להתחזק בהגנה! 🛡️",
  "איזה שחקן אתם הכי רוצים לראות בקבוצה? 🌟",

  // Historical moments
  "זוכרים את המשחק הזה מלפני 5 שנים? איזה רגש! 📅",
  "היום זה בדיוק 10 שנים לאותו ניצחון היסטורי! 🏆",
  "הווידאו הזה מהארכיון גורם לי לבכות מרגש כל פעם 😭",
  "הדור הצעיר לא מכיר את הקסם הזה שהיה פעם... 👴",
  "אבא שלי לקח אותי לראות את המשחק הזה כשהייתי בן 8... 👨‍👦",

  // Current events and league
  "המצב בטבלה נראה טוב השנה! בואו נמשיך ככה! 📊",
  "השופטים השנה פשוט לא עקביים... זה מתסכל! 🤦‍♂️",
  "הרמה בליגה השנה גבוהה במיוחד! כל משחק הוא מלחמה! ⚔️",
  "פלייאוף או לא, אני גאה בקבוצה שלנו כל שנה! ❤️",
  "מי עוד חושב שהחורף הזה יהיה הכי מעניין? ❄️",

  // Social and community
  "מישהו בא לראות את המשחק יחד? לבד זה לא כיף... 👥",
  "איפה כל האוהדים הצעירים? בואו נעודד יותר! 📣",
  "הקהילה שלנו היא הכי טובה! אוהב אתכם כולם! 🤗",
  "מי בא לחגוג אם ננצח השבת? 🎉",
  "האוהדות הזאת עוברת מדור לדור במשפחה שלי! 👪",

  // Emotional and personal
  "הכדורגל זה לא רק משחק, זה אורח חיים! ⚽❤️",
  "יום קשה בעבודה, אבל המשחק בערב יעשה לי טוב! 💪",
  "התחתנתי בחליפה בצבעי הקבוצה! אשתי הבינה למה היא נכנסת 😂",
  "הבן שלי בן 5 וכבר יודע את כל השירים! גאה בו! 👶⚽",
  "אפילו בחופשות בחו״ל אני מחפש איך לראות את המשחקים! 🌍",
];

// Enhanced comment templates
const commentTemplates = [
  // Agreement and support
  "מסכים איתך מאה אחוז! 💯",
  "בדיוק מה שחשבתי! 👍",
  "אין מילים! צודק לחלוטין! ✅",
  "לא יכולתי להגיד את זה יותר טוב! 🎯",
  "כל מילה במקום! 👏",

  // Strong emotions
  "אני בשוק! לא מאמין שזה קרה! 😱",
  "הלב שלי עדיין דופק! ❤️",
  "קיבלתי צמרמורת! 🥶",
  "בוכה מרגש! 😭",
  "לא יכול להפסיק לחייך! 😄",
  "עדיין לא מעכל את זה! 🤯",

  // Praise and admiration
  "איזה מקצוען! כל הכבוד! 👨‍💼",
  "גאון! פשוט גאון! 🧠",
  "זה בדיוק מה שהקבוצה צריכה! ⭐",
  "שחקן ברמה עולמית! 🌍",
  "המאמן הזה יודע מה הוא עושה! 🎯",

  // Team spirit and unity
  "יאללה בנים! בואו נתמוך! 💪",
  "ביחד ננצח! 🤝",
  "הקבוצה הכי טובה בעולם! 🏆",
  "אנחנו איתכם עד הסוף! ❤️",
  "זה מה שקוראים רוח קבוצתית! 👥",

  // Analysis and discussion
  "המהלך הזה היה גאוני! 🎲",
  "לא הבנתי את ההחלפה הזאת... 🤔",
  "אולי היה צריך לשחק יותר הגנתי? 🛡️",
  "הטקטיקה הזאת עבדה מושלם! 📋",
  "צריך להתחזק בחורף! 💪",

  // Excitement for future
  "מחכה כבר למשחק הבא! ⏰",
  "העונה הזאת תהיה שלנו! 🏆",
  "אני מרגיש שמשהו גדול מתקרב! 🌟",
  "בואו נמלא את האצטדיון! 🏟️",
  "הכל עוד לפנינו! 🚀",

  // Disagreement and debate
  "לא בטוח שזה הצעד הנכון... 🤨",
  "יש לי דעה אחרת לגמרי! 💭",
  "מעניין לשמוע, אבל... 🧐",
  "אולי יש זווית אחרת לראות את זה? 👀",
  "לא משכנע אותי... 😕",

  // Questions and engagement
  "מה אתם חושבים על זה? 🤔",
  "מישהו יכול להסביר למה? ❓",
  "איך אתם רואים את המצב? 👁️",
  "מי עוד שם לב לזה? 🕵️",
  "יש למישהו מידע נוסף על זה? 📰",

  // Memories and nostalgia
  "זוכר כמה התרגשתי אז! 😊",
  "הזמנים הטובים! 📸",
  "אותו רגש כמו פעם! ❤️",
  "איך הזמן עף! ⏳",
  "זה מזכיר לי משהו מהעבר... 💭",

  // Motivation and encouragement
  "בואו נמשיך לתמוך! 📣",
  "לא מוותרים! 💪",
  "יש לנו את הכוח! ⚡",
  "ביחד נעבור את זה! 🤝",
  "האמונה היא הכל! 🙏",
];

// Reply templates for deeper conversation
const replyTemplates = [
  // Short agreements
  "בדיוק! 💯",
  "ממש כך! ✅",
  "אין ספק! 👍",
  "לגמרי! 🎯",
  "מה שאמרת! 👏",
  "בול! 🔥",
  "נכון מאוד! ✔️",

  // Elaborations
  "ועוד איך! זה בדיוק מה שחסר לנו! 💪",
  "נכון, ובנוסף לזה גם... 📝",
  "רואה שאתה מבין בכדורגל! 🧠",
  "מסכים, אבל חשוב גם... 🤔",

  // Emotional responses
  "גם אני התרגשתי! 😍",
  "נתת לי צמרמורת! 🥶",
  "אני נפל מהכיסא! 😂",
  "הלב שלי כמעט עצר! 💓",
  "קיבלתי התכווצות! 😱",

  // Questions back
  "ואתה מה חושב על...? 🤔",
  "איך אתה רואה את זה? 👀",
  "מסכים, אבל מה עם...? 💭",
  "נכון, ומה אם...? 🎲",

  // Disagreements
  "רגע, אני לא מסכים... 🤨",
  "יש לי דעה קצת אחרת 💬",
  "מבין אותך, אבל... 🧐",
  "לא בטוח בזה... 😕",

  // Adding information
  "ועוד משהו שחשוב... 📌",
  "דרך אגב, גם... 💡",
  "נכון, ושמעתי גם ש... 👂",
  "ובאותו הקשר... 🔗",

  // Future oriented
  "בואו נראה מה יהיה! 🔮",
  "מקווה שתהיה צודק! 🙏",
  "נחכה ונראה... ⏳",
  "הזמן יגיד! ⌛",
];

const teamNameMapping = {
  "מכבי תל אביב": "Maccabi Tel Aviv",
  "הפועל באר שבע": "Hapoel Beer Sheva",
  "מכבי חיפה": "Maccabi Haifa",
  'בית"ר ירושלים': "Beitar Jerusalem",
  "הפועל חיפה": "Hapoel Haifa",
  "מכבי נתניה": "Maccabi Netanya",
  "עירוני קריית שמונה": "Hapoel Kiryat Shmona",
  "מכבי בני ריינה": "Maccabi Bnei Raina",
  "הפועל ירושלים": "Hapoel Jerusalem",
  "עירוני טבריה": "Ironi Tiberias",
  "מכבי פתח תקווה": "Maccabi Petach Tikva",
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
};

let allFixtures = [];

// Utility functions
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack = 30) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

function randomFutureDate(daysAhead = 30) {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return date;
}

function generateUserName(gender) {
  const firstName =
    gender === "זכר"
      ? randomChoice(maleFirstNames)
      : randomChoice(femaleFirstNames);
  const lastName = randomChoice(lastNames);
  return `${firstName} ${lastName}`;
}

// Database connection
async function connectDB() {
  try {
    const mongoUrl = process.env.MONGO_URL.includes("<MONGO_PASSWORD>")
      ? process.env.MONGO_URL.replace(
          "<MONGO_PASSWORD>",
          process.env.MONGO_PASSWORD
        )
      : process.env.MONGO_URL;

    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB!");
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    process.exit(1);
  }
}

// Clear database except specified users
async function clearDatabaseExceptUsers(userIdsToKeep) {
  console.log(
    "🗑️ Clearing DB except users",
    userIdsToKeep.map((id) => id.toString())
  );

  await User.deleteMany({ _id: { $nin: userIdsToKeep } });
  await Post.deleteMany({ authorId: { $nin: userIdsToKeep } });

  const userPostIds = await Post.find({
    authorId: { $in: userIdsToKeep },
  }).distinct("_id");
  await Comment.deleteMany({
    $and: [
      { authorId: { $nin: userIdsToKeep } },
      { postId: { $nin: userPostIds } },
    ],
  });

  await Friend.deleteMany({
    $and: [
      { userId: { $nin: userIdsToKeep } },
      { friendId: { $nin: userIdsToKeep } },
    ],
  });

  await TicketListing.deleteMany({ sellerId: { $nin: userIdsToKeep } });

  console.log("✅ Database cleared except specified users and their data");
}

// Create users (20+ per team)
async function createUsers() {
  console.log("👥 Creating users...");

  const users = [];
  const teams = Object.keys(teamsData);

  for (const team of teams) {
    const usersPerTeam = randomNumber(15, 20); // 15-20 users per team

    for (let i = 0; i < usersPerTeam; i++) {
      const gender = Math.random() < 0.5 ? "זכר" : "נקבה";
      const name = generateUserName(gender);
      const hashedPassword = await bcrypt.hash("123456", 10);

      const profilePicture =
        gender === "זכר"
          ? randomChoice(maleProfilePictures)
          : randomChoice(femaleProfilePictures);

      const user = new User({
        name: name,
        email: `${users.length + 1}@example.com`,
        password: hashedPassword,
        favoriteTeam: team,
        location: randomChoice(israeliCities),
        bio: `אוהד נלהב של ${team} מהגיל הצעיר! אוהב לבוא למשחקים ולעודד את הקבוצה שלי. הכדורגל זה החיים שלי! ⚽❤️`,
        gender: gender,
        phone: `0${randomNumber(50, 59)}${randomNumber(1000000, 9999999)}`,
        birthDate: new Date(
          randomNumber(1970, 2000),
          randomNumber(0, 11),
          randomNumber(1, 28)
        ),
        isEmailVerified: true,
        profilePicture: profilePicture,
        coverImage: randomChoice(coverImages),
      });

      users.push(user);
    }
  }

  await User.insertMany(users);
  console.log(`✅ Created ${users.length} users across ${teams.length} teams`);
  return users;
}

// Fetch real fixtures
async function fetchRealFixtures() {
  console.log("📡 Fetching real fixtures data...");

  try {
    const fixturesService = new FixturesService();

    let allApiFixtures = [];

    try {
      // Fetch Ligat HaAl fixtures (seasonId: 4644)
      const ligat_haal = await fixturesService.fetchAllFixtures(
        4644,
        "2024-2025",
        false
      );

      // Fetch Leumit League fixtures (seasonId: 4966)
      const leumit = await fixturesService.fetchAllFixtures(
        4966,
        "2024-2025",
        false
      );

      allApiFixtures = [...ligat_haal.allFixtures, ...leumit.allFixtures];

      console.log(`   Found ${allApiFixtures.length} total fixtures from API`);
    } catch (error) {
      console.log("   API failed, using fallback...");
      throw error;
    }

    // Convert English team names to Hebrew
    const hebrewFixtures = allApiFixtures.map((fixture) => {
      return {
        ...fixture,
        homeTeamHebrew: getHebrewTeamName(fixture.homeTeam),
        awayTeamHebrew: getHebrewTeamName(fixture.awayTeam),
      };
    });

    return hebrewFixtures;
  } catch (error) {
    console.error("❌ Error fetching real fixtures:", error.message);
    console.log("   Falling back to sample fixtures...");
    return generateSampleFixtures();
  }
}

// Helper function to convert English team names to Hebrew
function getHebrewTeamName(englishName) {
  const reverseMapping = {};
  Object.entries(teamNameMapping).forEach(([hebrew, english]) => {
    reverseMapping[english] = hebrew;
  });

  return reverseMapping[englishName] || englishName;
}

// Generate sample fixtures as fallback
function generateSampleFixtures() {
  const sampleFixtures = [];
  const teams = Object.keys(teamNameMapping);

  console.log("   Generating sample fixtures with Hebrew team names...");

  teams.forEach((hebrewTeam) => {
    for (let i = 0; i < 4; i++) {
      const opponent = teams[Math.floor(Math.random() * teams.length)];
      if (opponent !== hebrewTeam) {
        const isHome = Math.random() < 0.5;
        const futureDate = randomFutureDate(60);

        sampleFixtures.push({
          id: `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          homeTeam: teamNameMapping[isHome ? hebrewTeam : opponent],
          awayTeam: teamNameMapping[isHome ? opponent : hebrewTeam],
          homeTeamHebrew: isHome ? hebrewTeam : opponent,
          awayTeamHebrew: isHome ? opponent : hebrewTeam,
          date: futureDate.toISOString().split("T")[0],
          time: ["17:00", "19:00", "20:00", "20:30"][
            Math.floor(Math.random() * 4)
          ],
          venue: `אצטדיון ${isHome ? hebrewTeam : opponent}`,
        });
      }
    }
  });

  console.log(`   Generated ${sampleFixtures.length} sample fixtures`);
  return sampleFixtures;
}

// Create friendships within same teams
async function createFriendships(users) {
  console.log("🤝 Creating friendships...");

  const friendships = [];

  // Group users by team
  const teamGroups = {};
  users.forEach((user) => {
    if (!teamGroups[user.favoriteTeam]) {
      teamGroups[user.favoriteTeam] = [];
    }
    teamGroups[user.favoriteTeam].push(user);
  });

  // Create friendships within each team
  for (const team in teamGroups) {
    const teamUsers = teamGroups[team];

    // Generate all possible pairs
    const allPairs = [];
    for (let i = 0; i < teamUsers.length; i++) {
      for (let j = i + 1; j < teamUsers.length; j++) {
        allPairs.push([teamUsers[i], teamUsers[j]]);
      }
    }

    // Select random pairs to be friends (60% of possible pairs)
    const shuffledPairs = allPairs.sort(() => 0.5 - Math.random());
    const friendshipsToCreate = Math.floor(shuffledPairs.length * 0.6);

    for (let i = 0; i < friendshipsToCreate; i++) {
      const [user1, user2] = shuffledPairs[i];
      const status = Math.random() < 0.8 ? "accepted" : "pending";

      friendships.push(
        new Friend({
          senderId: user1._id,
          receiverId: user2._id,
          status: status,
        })
      );
    }
  }

  if (friendships.length > 0) {
    await Friend.insertMany(friendships);
  }

  console.log(`✅ Created ${friendships.length} friendships`);
  return friendships;
}

// Create posts (1-4 per user)
async function createPosts(users) {
  console.log("📝 Creating posts...");

  const posts = [];

  for (const user of users) {
    const postsCount = randomNumber(1, 4);

    for (let i = 0; i < postsCount; i++) {
      const teamData = teamsData[user.favoriteTeam];

      const post = new Post({
        authorId: user._id,
        communityId: teamData.communityId,
        content: randomChoice(postContents),
        createdAt: randomDate(60),
      });

      // 35% chance of having an image
      if (Math.random() < 0.35) {
        post.media = [randomChoice(footballImages)];
      }

      posts.push(post);
    }
  }

  if (posts.length > 0) {
    await Post.insertMany(posts);
  }

  console.log(`✅ Created ${posts.length} posts`);
  return posts;
}

// Create comments with replies (same team only)
async function createComments(users, posts) {
  console.log("💬 Creating comments and replies...");

  const comments = [];

  for (const post of posts) {
    const commentsCount = randomNumber(0, 4);
    const postCreatedAt = new Date(post.createdAt);

    // Find post author and same team users ONLY
    const postAuthor = users.find(
      (u) => u._id.toString() === post.authorId.toString()
    );
    if (!postAuthor) continue;

    const sameTeamUsers = users.filter(
      (u) => u.favoriteTeam === postAuthor.favoriteTeam
    );

    // Create main comments - ONLY from same team users
    const postComments = [];
    for (let i = 0; i < commentsCount; i++) {
      const commenter = randomChoice(sameTeamUsers);

      const comment = new Comment({
        postId: post._id,
        authorId: commenter._id,
        content: randomChoice(commentTemplates),
        createdAt: new Date(
          postCreatedAt.getTime() + randomNumber(1, 48) * 60 * 60 * 1000
        ),
      });

      comments.push(comment);
      postComments.push(comment);
    }

    // Create replies to some comments (40% chance per comment)
    for (const comment of postComments) {
      if (Math.random() < 0.4) {
        const repliesCount = randomNumber(0, 2);

        for (let j = 0; j < repliesCount; j++) {
          const replier = randomChoice(sameTeamUsers);

          if (replier._id.toString() !== comment.authorId.toString()) {
            const reply = new Comment({
              postId: post._id,
              authorId: replier._id,
              parentCommentId: comment._id,
              content: randomChoice(replyTemplates),
              createdAt: new Date(
                comment.createdAt.getTime() +
                  randomNumber(1, 12) * 60 * 60 * 1000
              ),
            });

            comments.push(reply);
          }
        }
      }
    }
  }

  if (comments.length > 0) {
    await Comment.insertMany(comments);
  }

  console.log(
    `✅ Created ${comments.length} comments - ALL from same team users`
  );
  return comments;
}

// Add likes to posts (same team only)
async function addLikesToPosts(users, posts) {
  console.log("❤️ Adding likes to posts (same team only)...");

  const batchSize = 50;

  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    const bulkOps = [];

    for (const post of batch) {
      const likesCount = randomNumber(0, 15);
      const likedUsers = new Set();

      const author = users.find(
        (u) => u._id.toString() === post.authorId.toString()
      );
      if (!author) continue;

      const sameTeamUsers = users.filter(
        (u) => u.favoriteTeam === author.favoriteTeam
      );

      for (let j = 0; j < likesCount; j++) {
        if (sameTeamUsers.length > 0) {
          const randomUser = randomChoice(sameTeamUsers);
          likedUsers.add(randomUser._id);
        }
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: post._id },
          update: { $set: { likes: Array.from(likedUsers) } },
        },
      });
    }

    if (bulkOps.length > 0) {
      await Post.bulkWrite(bulkOps);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("✅ Added likes to posts (same team only)");
}

// Create ticket listings with team-based segregation
async function createTicketListings(users) {
  console.log("🎫 Creating ticket listings with team-based segregation...");

  const tickets = [];

  // Group fixtures by Hebrew team name
  const fixturesByTeam = {};

  Object.keys(teamNameMapping).forEach((hebrewTeam) => {
    fixturesByTeam[hebrewTeam] = [];
  });

  allFixtures.forEach((fixture) => {
    const homeTeamHebrew =
      fixture.homeTeamHebrew || getHebrewTeamName(fixture.homeTeam);
    const awayTeamHebrew =
      fixture.awayTeamHebrew || getHebrewTeamName(fixture.awayTeam);

    if (fixturesByTeam[homeTeamHebrew]) {
      fixturesByTeam[homeTeamHebrew].push({
        ...fixture,
        homeTeamHebrew,
        awayTeamHebrew,
        isHomeGame: true,
      });
    }
    if (fixturesByTeam[awayTeamHebrew]) {
      fixturesByTeam[awayTeamHebrew].push({
        ...fixture,
        homeTeamHebrew,
        awayTeamHebrew,
        isHomeGame: false,
      });
    }
  });

  for (const user of users) {
    if (!user.favoriteTeam) continue;

    const ticketsCount = randomNumber(0, 2); // 0-2 tickets per user
    if (ticketsCount === 0) continue;

    const userTeam = user.favoriteTeam;
    const teamFixtures = fixturesByTeam[userTeam] || [];

    if (teamFixtures.length === 0) {
      // Create sample fixture if no real fixtures found
      const futureDate = randomFutureDate(60);
      const opponents = Object.keys(teamNameMapping).filter(
        (t) => t !== userTeam
      );
      const opponent = randomChoice(opponents);
      const isHome = Math.random() > 0.5;

      const sampleFixture = {
        id: `sample_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        homeTeam:
          teamNameMapping[isHome ? userTeam : opponent] ||
          (isHome ? userTeam : opponent),
        awayTeam:
          teamNameMapping[isHome ? opponent : userTeam] ||
          (isHome ? opponent : userTeam),
        homeTeamHebrew: isHome ? userTeam : opponent,
        awayTeamHebrew: isHome ? opponent : userTeam,
        date: futureDate.toISOString().split("T")[0],
        time: randomChoice(["17:00", "19:00", "20:00", "20:30"]),
        strVenue: `אצטדיון ${isHome ? userTeam : opponent}`,
        venue: `אצטדיון ${isHome ? userTeam : opponent}`, // גם לתמיכה לאחור
        isHomeGame: isHome,
      };
      teamFixtures.push(sampleFixture);
    }

    for (let i = 0; i < ticketsCount; i++) {
      const fixture = randomChoice(teamFixtures);

      // Ensure match is relevant to user's team
      const isValidMatch =
        fixture.homeTeamHebrew === userTeam ||
        fixture.awayTeamHebrew === userTeam;

      if (!isValidMatch) {
        continue;
      }

      const ticket = new TicketListing({
        sellerId: user._id,
        matchId:
          fixture.id ||
          `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        homeTeam:
          teamNameMapping[fixture.homeTeamHebrew] || fixture.homeTeamHebrew,
        awayTeam:
          teamNameMapping[fixture.awayTeamHebrew] || fixture.awayTeamHebrew,
        date: new Date(fixture.date),
        time: fixture.time,
        stadium: fixture.strVenue || fixture.venue || `אצטדיון ${userTeam}`,
        quantity: randomNumber(1, 4),
        price: randomNumber(50, 400),
        notes: generateTicketNotes(userTeam, fixture),
        isSoldOut: Math.random() < 0.05,
      });

      tickets.push(ticket);
    }
  }

  if (tickets.length > 0) {
    await TicketListing.insertMany(tickets);
  }

  console.log(
    `✅ Created ${tickets.length} ticket listings with team-based segregation`
  );
  return tickets;
}

// Generate ticket notes
function generateTicketNotes(userTeam, fixture) {
  const isHomeGame = fixture.homeTeamHebrew === userTeam;
  const opponent = isHomeGame ? fixture.awayTeamHebrew : fixture.homeTeamHebrew;

  const homeNotes = [
    `כרטיסים למשחק הבית נגד ${opponent}!`,
    "מקומות באיכות מעולה ליציע הבית",
    "כרטיסים למכירה בדחיפות - משחק בית חשוב!",
    "מושבים נוחים עם נוף מעולה על המגרש",
    "מקומות מקורים ליציע הבית",
    "ליציע הדרומי - האווירה הכי טובה!",
  ];

  const awayNotes = [
    `כרטיסים למשחק החוץ נגד ${opponent}`,
    "מקומות ליציע האורחים",
    "כרטיסים למכירה - משחק חוץ חשוב!",
    "בואו לתמוך בקבוצה במשחק החוץ!",
  ];

  const neutralNotes = [
    "כרטיסים באיכות מעולה!",
    "מושבים נוחים עם נוף מעולה",
    "כרטיסים למכירה בדחיפות",
    "מקומות לכל המשפחה",
    "",
  ];

  if (isHomeGame) {
    return randomChoice(homeNotes);
  } else {
    return randomChoice([...awayNotes, ...neutralNotes]);
  }
}

// Main seeding function
async function seedDatabase() {
  console.log("🌱 Starting enhanced database seeding process...\n");

  await connectDB();

  const clearFirst = process.argv.includes("--clear") || true;
  const userIdsToKeep = [...ALWAYS_KEEP_USERS];

  if (clearFirst) {
    if (userIdsToKeep.length > 0) {
      await clearDatabaseExceptUsers(userIdsToKeep);
    }
  }

  try {
    console.log("📊 Seeding Summary:");
    console.log("   - Users per team: 15-20");
    console.log("   - Posts per user: 1-4");
    console.log("   - Comments per post: 0-4");
    console.log("   - Friends per user: ~60% of possible pairs");
    console.log("   - Tickets per user: 0-2 (using REAL fixtures)");
    console.log("   - Only same-team interactions\n");

    // Step 1: Create users
    const users = await createUsers();

    // Step 2: Fetch real fixtures data
    allFixtures = await fetchRealFixtures();

    // Step 3: Create friendships within same teams
    const friendships = await createFriendships(users);

    // Step 4: Create posts
    const posts = await createPosts(users);

    // Step 5: Add likes to posts
    await addLikesToPosts(users, posts);

    // Step 6: Create comments with replies
    const comments = await createComments(users, posts);

    // Step 7: Create ticket listings
    const tickets = await createTicketListings(users);

    // Statistics
    const mainComments = comments.filter((c) => !c.parentCommentId);
    const replies = comments.filter((c) => c.parentCommentId);
    const acceptedFriendships = friendships.filter(
      (f) => f.status === "accepted"
    );
    const availableTickets = tickets.filter((t) => !t.isSoldOut);

    console.log("\n🎉 Enhanced database seeded successfully!");
    console.log("📈 Final Statistics:");
    console.log(
      `   👥 Users: ${users.length} (across ${
        Object.keys(teamsData).length
      } teams)`
    );
    console.log(`   📝 Posts: ${posts.length}`);
    console.log(
      `   💬 Comments: ${comments.length} (${mainComments.length} main + ${replies.length} replies)`
    );
    console.log(`   🤝 Friendships: ${acceptedFriendships.length} accepted`);
    console.log(`   🎫 Ticket Listings: ${availableTickets.length} available`);
    console.log(`   ⚽ Real fixtures: ${allFixtures.length} matches`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run the script
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
