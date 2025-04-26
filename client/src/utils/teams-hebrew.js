const teamNameMap = {
  "Maccabi Tel Aviv": {
    name: "מכבי תל אביב",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/lh08ob1625167121.png",
  },
  "Hapoel Beer Sheva": {
    name: "הפועל באר שבע",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/978vgx1579019997.png",
  },
  "Maccabi Haifa": {
    name: "מכבי חיפה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/t73b501639433206.png",
  },
  "Beitar Jerusalem": {
    name: 'בית"ר ירושלים',
    badge: "https://r2.thesportsdb.com/images/media/team/badge/bq7vys1639433460.png",
  },
  "Hapoel Haifa": {
    name: "הפועל חיפה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/ytmoe71639433126.png",
  },
  "Maccabi Netanya": {
    name: "מכבי נתניה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/xqrw8z1639430750.png",
  },
  "Hapoel Kiryat Shmona": {
    name: "הפועל קריית שמונה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/401ntu1579020023.png",
  },
  "Maccabi Bnei Raina": {
    name: "מכבי בני ריינה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/b97dj21664188696.png",
  },
  "Hapoel Jerusalem": {
    name: "הפועל ירושלים",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/cvh4ec1639431062.png",
  },
  "Ironi Tiberias": {
    name: "עירוני טבריה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/78q5ez1656067666.png",
  },
  "Maccabi Petach Tikva": {
    name: "מכבי פתח תקווה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/3bvby91720417514.png",
  },
  "Bnei Sakhnin": {
    name: "בני סכנין",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/kbgr2l1639433190.png",
  },
  "FC Ashdod": {
    name: "מ.ס. אשדוד",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/ccwrfk1715765767.png",
  },
  "Hapoel Hadera Eran": {
    name: "הפועל חדרה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/4xg82f1579020005.png",
  }, 
   "Maccabi Herzliya": {
    name: "מכבי הרצליה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/1yaiqr1688622486.png",
  },
  "Hapoel Ramat HaSharon": {
    name: "הפועל ניר רמת השרון",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/7xm0dq1617289243.png",
  },
  "Hapoel Petah Tikva": {
    name: "הפועל פתח תקווה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/agaems1617289236.png",
  },
  "Hapoel Umm al-Fahm": {
    name: "הפועל אום אל פחם",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/6kpl9l1656016362.png",
  },
  "Hapoel Ramat Gan": {
    name: "הפועל רמת גן",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/7g4kpr1513886152.png",
  },
  "Hapoel Kfar Saba": {
    name: "הפועל כפר סבא",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/emvu201513885986.png",
  },

  "Hapoel Afula": {
    name: "הפועל עפולה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/e8v3011664188566.png",
  },
  "Hapoel Nof HaGalil": {
    name: "הפועל נוף הגליל",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/cfqh2u1639433151.png",
  },
  "Bnei Yehuda": {
    name: "בני יהודה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/axtvuc1579019984.png",
  },
  "Hapoel Ironi Akko": {
    name: "הפועל עכו",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/b96mpv1513885885.png",
  },
  "Hapoel Tel-Aviv": {
    name: "הפועל תל אביב",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/viqboc1579020034.png",
  },
  "Maccabi Kabilio Jaffa": {
    name: "מכבי יפו",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/w9x8b41664188942.png",
  },
  "Hapoel Rishon LeZion": {
    name: "הפועל ראשון לציון",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/h6vwsm1617289250.png",
  },
  "Hapoel Kfar Shalem": {
    name: "הפועל כפר שלם",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/adlzuy1617289221.png",
  },
  "Kafr Qasim": {
    name: "מ.ס. כפר קאסם",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/4g7dis1617289263.png",
  },
  "Hapoel Raanana": {
    name: "הפועל רעננה",
    badge: "https://r2.thesportsdb.com/images/media/team/badge/h7annf1513886063.png",
  },
};

export default teamNameMap;
