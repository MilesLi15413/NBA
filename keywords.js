
const TEAM_SUPPLEMENTS = {

  // Atlanta Hawks
  "1": {
    nicknames: ["hawks", "atl hawks"],
    players: ["trae", "trae young", "dejounte", "murray"],
    arenas: ["state farm arena"],
    hashtags: ["#truetoatlanta", "#hawks", "#atl"]
  },

  // Boston Celtics
  "2": {
    nicknames: ["celtics", "cs", "boston"],
    players: ["jayson", "tatum", "jaylen", "brown", "jt", "jb", "payton pritchard", "al horford"],
    arenas: ["td garden"],
    hashtags: ["#celtics", "#bleedgreen", "#boston"]
  },

  // New Orleans Pelicans
  "3": {
    nicknames: ["pelicans", "pels", "new orleans"],
    players: ["zion", "williamson", "cj mccollum", "brandon ingram", "bi"],
    arenas: ["smoothie king center"],
    hashtags: ["#pelicans", "#doitbig", "#nola"]
  },

  // Chicago Bulls
  "4": {
    nicknames: ["bulls", "chicago"],
    players: ["zach lavine", "demar derozan", "nikola vucevic", "vooch"],
    arenas: ["united center"],
    hashtags: ["#bulls", "#bullsnation", "#chi"]
  },

  // Cleveland Cavaliers
  "5": {
    nicknames: ["cavs", "cavaliers", "cleveland"],
    players: ["donovan mitchell", "spida", "darius garland", "evan mobley", "jarrett allen"],
    arenas: ["rocket mortgage fieldhouse", "rocket mortgage"],
    hashtags: ["#cavs", "#believeland", "#allforoneohio"]
  },

  // Dallas Mavericks
  "6": {
    nicknames: ["mavs", "mavericks", "dallas"],
    players: ["luka", "doncic", "kyrie", "irving", "kai", "pj washington"],
    arenas: ["american airlines center", "aac"],
    hashtags: ["#mavs", "#mffl", "#dallas"]
  },

  // Denver Nuggets
  "7": {
    nicknames: ["nuggets", "nugs", "denver"],
    players: ["nikola", "jokic", "joker", "jamal murray", "michael porter", "mpp", "aaron gordon"],
    arenas: ["ball arena"],
    hashtags: ["#nuggets", "#miles", "#denver"]
  },

  // Detroit Pistons
  "8": {
    nicknames: ["pistons", "detroit"],
    players: ["cade", "cunningham", "jaden ivey", "bojan bogdanovic", "ausar thompson", "jalen duren"],
    arenas: ["little caesars arena"],
    hashtags: ["#pistons", "#detroitbasketball"]
  },

  // Golden State Warriors
  "9": {
    nicknames: ["warriors", "dubs", "golden state", "gsw"],
    players: ["steph", "curry", "stephen curry", "klay", "thompson", "draymond", "green", "andrew wiggins"],
    arenas: ["chase center"],
    hashtags: ["#warriors", "#dubnation", "#gsw", "#chasedown"]
  },

  // Houston Rockets
  "10": {
    nicknames: ["rockets", "houston"],
    players: ["alperen sengun", "sengun", "jalen green", "fred vanvleet", "amen thompson"],
    arenas: ["toyota center"],
    hashtags: ["#rockets", "#clutchcity", "#houston"]
  },

  // Indiana Pacers
  "11": {
    nicknames: ["pacers", "indiana"],
    players: ["tyrese haliburton", "haliburton", "pascal siakam", "myles turner", "bennedict mathurin", "obi toppin"],
    arenas: ["gainbridge fieldhouse"],
    hashtags: ["#pacers", "#boominup", "#indiana"]
  },

  // LA Clippers
  "12": {
    nicknames: ["clippers", "la clippers", "clips"],
    players: ["kawhi", "leonard", "paul george", "pg", "pg13", "james harden", "russell westbrook"],
    arenas: ["intuit dome"],
    hashtags: ["#clippers", "#clipnation", "#clippernation"]
  },

  // Los Angeles Lakers
  "13": {
    nicknames: ["lakers", "la lakers", "lal", "purple and gold"],
    players: ["lebron", "lbj", "king james", "ad", "anthony davis", "the brow", "austin reaves", "ar15", "d'angelo russell"],
    arenas: ["crypto.com arena", "crypto arena", "staples center"],
    hashtags: ["#lakers", "#lakersnation", "#lakeshow", "#purpleandgold"]
  },

  // Memphis Grizzlies
  "14": {
    nicknames: ["grizzlies", "grizz", "memphis"],
    players: ["ja morant", "ja", "jaren jackson", "jjj", "desmond bane", "steven adams"],
    arenas: ["fedexforum", "fedex forum"],
    hashtags: ["#grizzlies", "#grindcity", "#memphis", "#grizznation"]
  },

  // Miami Heat
  "15": {
    nicknames: ["heat", "miami", "south beach"],
    players: ["jimmy butler", "jimmy", "bam", "adebayo", "tyler herro", "herro", "kyle lowry"],
    arenas: ["kaseya center", "american airlines arena"],
    hashtags: ["#heatculture", "#heat", "#miami", "#heatnation"]
  },

  // Milwaukee Bucks
  "16": {
    nicknames: ["bucks", "milwaukee", "cream city"],
    players: ["giannis", "antetokounmpo", "greek freak", "damian lillard", "dame", "dame time", "khris middleton", "brook lopez"],
    arenas: ["fiserv forum"],
    hashtags: ["#bucks", "#fearthedeers", "#milwaukee", "#bukmil"]
  },

  // Minnesota Timberwolves
  "17": {
    nicknames: ["timberwolves", "wolves", "twolves", "minnesota"],
    players: ["karl-anthony towns", "kat", "anthony edwards", "ant", "ant-man", "rudy gobert", "jaden mcdaniels", "mike conley"],
    arenas: ["target center"],
    hashtags: ["#timberwolves", "#howlinformore", "#minnesota", "#wolves"]
  },

  // Brooklyn Nets
  "18": {
    nicknames: ["nets", "brooklyn", "bkn"],
    players: ["ben simmons", "cam thomas", "nic claxton", "mikal bridges"],
    arenas: ["barclays center"],
    hashtags: ["#nets", "#brooklyn", "#bkn"]
  },

  // New York Knicks
  "19": {
    nicknames: ["knicks", "new york", "nyc", "nyk"],
    players: ["jalen brunson", "brunson", "julius randle", "og anunoby", "og", "josh hart", "donte divincenzo", "mitchell robinson", "kat"],
    arenas: ["madison square garden", "msg", "the garden"],
    hashtags: ["#knicks", "#newyorkforever", "#msg", "#nyk"]
  },

  // Orlando Magic
  "20": {
    nicknames: ["magic", "orlando"],
    players: ["paolo banchero", "paolo", "franz wagner", "wendell carter", "jalen suggs"],
    arenas: ["kia center", "amway center"],
    hashtags: ["#magic", "#orlandomagic", "#orlando"]
  },

  // Philadelphia 76ers
  "21": {
    nicknames: ["sixers", "76ers", "philly", "philadelphia", "process"],
    players: ["joel embiid", "embiid", "the process", "tyrese maxey", "maxey", "pg13", "tobias harris"],
    arenas: ["wells fargo center"],
    hashtags: ["#sixers", "#trusttheprocess", "#philly", "#heretheycomeagain"]
  },

  // Phoenix Suns
  "22": {
    nicknames: ["suns", "phoenix", "valley", "valley suns"],
    players: ["devin booker", "book", "kevin durant", "kd", "bradley beal", "deandre ayton"],
    arenas: ["footprint center"],
    hashtags: ["#suns", "#valleyboys", "#phoenix", "#sunsnation"]
  },

  // Portland Trail Blazers
  "23": {
    nicknames: ["blazers", "trail blazers", "portland", "rip city"],
    players: ["damian lillard", "dame", "anfernee simons", "jerami grant", "scoot henderson"],
    arenas: ["moda center"],
    hashtags: ["#blazers", "#ripcity", "#portland"]
  },

  // San Antonio Spurs
  "24": {
    nicknames: ["spurs", "san antonio", "sa", "fiesta"],
    players: ["victor wembanyama", "wemby", "wembanyama", "devin vassell", "keldon johnson", "jeremy sochan"],
    arenas: ["frost bank center", "at&t center"],
    hashtags: ["#spurs", "#porvida", "#sanantonio", "#gospurs"]
  },

  // Oklahoma City Thunder
  "25": {
    nicknames: ["thunder", "okc", "oklahoma city"],
    players: ["shai gilgeous-alexander", "sga", "shai", "gilgeous-alexander", "chet holmgren", "chet", "jalen williams", "lu dort", "josh giddey"],
    arenas: ["paycom center", "chesapeake energy arena"],
    hashtags: ["#thunder", "#thunderup", "#okc", "#letitfly"]
  },

  // Sacramento Kings
  "26": {
    nicknames: ["kings", "sacramento", "sac"],
    players: ["de'aaron fox", "fox", "domantas sabonis", "sabonis", "keegan murray", "malik monk"],
    arenas: ["golden 1 center", "golden one center"],
    hashtags: ["#kings", "#sacramentoproud", "#sactown"]
  },

  // Toronto Raptors
  "28": {
    nicknames: ["raptors", "toronto", "the north", "raps"],
    players: ["scottie barnes", "rj barrett", "jakob poeltl", "immanuel quickley"],
    arenas: ["scotiabank arena"],
    hashtags: ["#raptors", "#wewantmore", "#thenorth", "#toronto"]
  },

  // Utah Jazz
  "29": {
    nicknames: ["jazz", "utah", "slc"],
    players: ["lauri markkanen", "lauri", "jordan clarkson", "walker kessler", "keyonte george"],
    arenas: ["delta center"],
    hashtags: ["#jazz", "#takenote", "#utahjazz"]
  },

  // Washington Wizards
  "30": {
    nicknames: ["wizards", "washington", "dc", "wiz"],
    players: ["kyle kuzma", "kuz", "bradley beal", "kristaps porzingis", "kp"],
    arenas: ["capital one arena", "verizon center"],
    hashtags: ["#wizards", "#dcfamily", "#washington"]
  },

  // Charlotte Hornets
  "31": {
    nicknames: ["hornets", "charlotte", "buzz city"],
    players: ["lamelo ball", "lamelo", "miles bridges", "terry rozier", "brandon miller"],
    arenas: ["spectrum center"],
    hashtags: ["#hornets", "#buzzcity", "#charlotte"]
  }

};

export { TEAM_SUPPLEMENTS };