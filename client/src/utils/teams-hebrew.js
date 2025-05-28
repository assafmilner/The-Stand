const teamNameMap = {
  "Maccabi Tel Aviv": {
    name: "מכבי תל אביב",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/lh08ob1625167121.png",
    communityId: "1",
  },
  "Hapoel Beer Sheva": {
    name: "הפועל באר שבע",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/978vgx1579019997.png",
    communityId: "2",
  },
  "Maccabi Haifa": {
    name: "מכבי חיפה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/t73b501639433206.png",
    communityId: "3",
  },
  "Beitar Jerusalem": {
    name: 'בית"ר ירושלים',
    badge: "https://r2.thesportsdb.com/images/media/team/badge/bq7vys1639433460.png",
    communityId: "4",
  },
  "Hapoel Haifa": {
    name: "הפועל חיפה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/ytmoe71639433126.png",
    communityId: "5",
  },
  "Maccabi Netanya": {
    name: "מכבי נתניה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/xqrw8z1639430750.png",
    communityId: "6",
  },
  "Hapoel Kiryat Shmona": {
    name: "עירוני קריית שמונה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/401ntu1579020023.png",
    communityId: "7",
  },
  "Maccabi Bnei Raina": {
    name: "מכבי בני ריינה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/b97dj21664188696.png",
    communityId: "8",
  },
  "Hapoel Jerusalem": {
    name: "הפועל ירושלים",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/cvh4ec1639431062.png",
    communityId: "9",
  },
  "Ironi Tiberias": {
    name: "עירוני טבריה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/78q5ez1656067666.png",
    communityId: "10",
  },
  "Maccabi Petach Tikva": {
    name: "מכבי פתח תקווה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/3bvby91720417514.png",
    communityId: "11",
  },
  "Bnei Sakhnin": {
    name: "בני סכנין",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/kbgr2l1639433190.png",
    communityId: "12",
  },
  "FC Ashdod": {
    name: "מ.ס. אשדוד",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/ccwrfk1715765767.png",
    communityId: "13",
  },
  "Hapoel Hadera Eran": {
    name: "הפועל חדרה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/4xg82f1579020005.png",
    communityId: "14",
  }, 
   "Maccabi Herzliya": {
    name: "מכבי הרצליה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/1yaiqr1688622486.png",
    communityId: "15",
  },
  "Hapoel Ramat HaSharon": {
    name: "הפועל ניר רמת השרון",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/7xm0dq1617289243.png",
    communityId: "16",
  },
  "Hapoel Petah Tikva": {
    name: "הפועל פתח תקווה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/agaems1617289236.png",
    communityId: "17",
  },
  "Hapoel Umm al-Fahm": {
    name: "הפועל אום אל פחם",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/6kpl9l1656016362.png",
    communityId: "18",
  },
  "Hapoel Ramat Gan": {
    name: "הפועל רמת גן",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/7g4kpr1513886152.png",
    communityId: "19",
  },
  "Hapoel Kfar Saba": {
    name: "הפועל כפר סבא",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/emvu201513885986.png",
    communityId: "20",
  },

  "Hapoel Afula": {
    name: "הפועל עפולה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/e8v3011664188566.png",
    communityId: "21",
  },
  "Hapoel Nof HaGalil": {
    name: "הפועל נוף הגליל",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/cfqh2u1639433151.png",
    communityId: "22",
  },
  "Bnei Yehuda": {
    name: "בני יהודה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/axtvuc1579019984.png",
    communityId: "23",
  },
  "Hapoel Ironi Akko": {
    name: "הפועל עכו",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/b96mpv1513885885.png",
    communityId: "24",
  },
  "Hapoel Tel-Aviv": {
    name: "הפועל תל אביב",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/viqboc1579020034.png",
    communityId: "25",
  },
  "Maccabi Kabilio Jaffa": {
    name: "מכבי יפו",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/w9x8b41664188942.png",
    communityId: "26",
  },
  "Hapoel Rishon LeZion": {
    name: "הפועל ראשון לציון",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/h6vwsm1617289250.png",
    communityId: "27",
  },
  "Hapoel Kfar Shalem": {
    name: "הפועל כפר שלם",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/adlzuy1617289221.png",
    communityId: "28",
  },
  "Kafr Qasim": {
    name: "מ.ס. כפר קאסם",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/4g7dis1617289263.png",
    communityId: "29",
  },
  "Hapoel Raanana": {
    name: "הפועל רעננה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/h7annf1513886063.png",
    communityId: "30",
  },
};

export default teamNameMap;
