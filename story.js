/* Seek & Find - "The Scattered Storybook"
   Lore: Jumble, a restless wind spirit with a flair for drama, scattered the pages of
   Wordwood's Great Storybook. Inky, the Storybook's dry-witted little archivist, recruits
   you (the Seeker) to recover them. Each theme is one page; its five puzzles are the five
   lines of that page. Restore all five to complete the story (and earn a sweepstakes entry).

   Panel format: "X:text" where X = N (narrator), I (Inky), J (Jumble), Y (you).
   {name} is replaced with the player's avatar name. */

window.STORY = {
  prologue: [
    "N:In the quiet town of Wordwood, every word ever spoken is kept in one place: the Great Storybook.",
    "J:Kept. Filed. Shelved. So boring! So I made a dramatic entrance. Wind effects, flying hair, the works.",
    "N:One gust later, the pages were scattered across the land, their sentences tangled into grids of letters.",
    "I:I'm Inky, the Storybook's archivist. Thirty-five pages are missing, five lines each. I could use a sharp-eyed partner.",
    "Y:I'm {name}. Point me to the first page. I'll bring the coffee."
  ],
  finale: [
    "N:With the final word back in place, the Great Storybook closes with a satisfied thump.",
    "I:Every page accounted for, {name}. In all my years of archiving, I've never had a better partner.",
    "J:For the record, I'm keeping the window shut from now on. Mostly. Same time next year?"
  ],
  realms: {
    animals: "The Wild Pages",
    food: "The Kitchen Pages",
    nature: "The Wonder Pages",
    places: "The Travel Pages",
    sports: "The Leisure Pages",
    arts: "The Culture Pages",
    anime: "The Anime Pages",
    throwback: "The Throwback Pages",
    seasons: "The Calendar Pages"
  },
  themes: {
    "ocean-life":   ["N:The first page drifted all the way to the Glimmer Sea, where the tide reads everything twice.", "I:A whole page of sea life, soaked and scrambled. Let's start before the crabs file it under 'lunch.'", "I:Ocean page recovered. Slightly damp, completely legible. A strong start."],
    "safari":       ["N:Dusk settles over the Sunstripe Savanna, golden and wide open.", "I:Jumble scattered this page across the whole plain. Binoculars recommended.", "I:Savanna page back in the binder. The lions remain unimpressed, which is how you know it's correct."],
    "birds":        ["N:Up on the Whistletop Cliffs, every bird has an opinion and shares it loudly.", "J:I rearranged their song sheets. The critics say it's my best work.", "I:Bird page restored. Peace and quiet... relatively speaking."],
    "fresh-fruit":  ["N:Saturday morning at the Juicy Jubilee market. Everything smells like summer.", "J:I may have rolled a few words under the produce stands. Allegedly.", "I:Fruit page restored, and the vendor threw in a peach for the trouble."],
    "bakery":       ["N:The Toasty Crumb Bakery opens at five, and the line already wraps the block.", "I:Jumble blew through the flour bin. The recipe page is somewhere in this cloud.", "I:Recipe page recovered. The baker insists we take a croissant. Who are we to argue?"],
    "italian":      ["N:Pastavera, a hill town where dinner is a three-hour event and nobody minds.", "J:I twirled the words like spaghetti. Untangle at your own pace. Mangia.", "I:Kitchen page restored. Bellissimo, as they keep telling us."],
    "outer-space":  ["N:A night at the Starlit Observatory, telescope pointed at the sky.", "J:Up here, words just float off. I helped a few of them along.", "I:Astronomy page recovered. One small search for {name}, one giant leap for the archive."],
    "weather":      ["N:The Cloudmill, where the forecast is spun by hand and rarely accurate.", "J:Wind is literally my whole personality. This page is my home turf.", "I:Weather page restored, and the storm has passed. Jumble looks almost impressed."],
    "flowers":      ["N:The Petalpath Gardens are in full bloom, and every plant has lost its label.", "I:A gardener's nightmare. Let's get these names back where they belong.", "I:Garden page restored. Smells wonderful in here, if I do say so."],
    "forest-trees": ["N:The Elderleaf Forest is older than the Storybook, and it remembers everything.", "I:The old oak says Jumble tangled this page in its branches. It's not happy about it.", "I:Forest page restored. The trees are rustling, which I'm told is applause."],
    "capitals":     ["N:Inky unfolds a well-worn map. Time for a whirlwind tour of the world's great cities.", "J:I shuffled the capitals. Is Lisbon in Lima? Exciting, isn't it?", "I:Every capital back where it belongs. A world tour without the jet lag."],
    "beach-day":    ["N:Seashell Cove, mid-afternoon. Warm sand, cold drinks, no emails.", "J:I buried a few words in the sand. Consider it a vacation activity.", "I:Beach page restored. Five more minutes in the sun, then back to work."],
    "camping":      ["N:Night falls over Pinecone Camp. The fire crackles, and somewhere an owl clears its throat.", "I:Jumble blew out the lantern, and half this page wandered into the woods.", "I:Camping page found. I believe we've earned a s'more."],
    "countries":    ["N:Passports ready. This page went on a trip around the globe without us.", "J:Customs found it suspicious that I was carrying forty countries. Long story.", "I:World page restored. Consider your passport stamped."],
    "ball-games":   ["N:Game night at Bounceborough Stadium. The crowd is already on its feet.", "J:I'm running a little keep-away with the sports words. Good luck catching up.", "I:Sports page recovered. That's the game. Fans can go home happy."],
    "olympics":     ["N:The torch is lit for the Grand Games of Wordwood.", "I:The event names blew right off the scoreboard. Let's go for gold.", "I:Gold-medal effort, {name}. This page takes the top step of the podium."],
    "crafts":       ["N:The Craft Cottage: yarn, glue guns and at least one half-finished quilt.", "J:I unraveled the words like a sweater. A little casual chaos.", "I:Crafts page restored, every stitch in place. Handmade, like the best things are."],
    "board-games":  ["N:The Game Parlor never closes. There's always a rematch waiting.", "J:I shuffled the words like a deck of cards. Pick one. Any one.", "I:Checkmate, Jumble. The game page is back in the box."],
    "instruments":  ["N:Melody Hall, an hour before curtain. Something in the orchestra sounds off.", "J:I nudged every note half a step sharp. It's called jazz.", "I:Music page recovered. The orchestra is tuning up, and it sounds lovely."],
    "movies":       ["N:The Moonlight Cinema. Popcorn's popping and the trailers are rolling.", "J:I cut the movie words into tiny pieces. Plot twist.", "I:Film page restored. Roll the credits and stay for the post-credits scene."],
    "art-studio":   ["N:The Splatterbrush Studio, where every surface counts as a canvas.", "I:Jumble tipped the paint. The words are hiding somewhere in the splatter.", "I:Art page recovered. Honestly, it might belong in a gallery."],
    "books":        ["N:The Great Library, where the Storybook was first written by candlelight.", "J:A whole library of words in one place? I couldn't help myself.", "I:Library page restored. The resident cat has given her approval, which is rare."],
    "anime-genres": ["N:Title card! The next page crash-landed in Animetown, where every street is a different genre.", "J:Behold! This isn't even my final form! ...Okay, it is. But the words are scattered across EVERY genre.", "I:Genre page restored. Cue the ending theme and a dramatic freeze-frame."],
    "anime-lingo":  ["N:A cozy anime cafe where the menu is written entirely in fan slang.", "J:Notice me, Seeker! I hid the lingo where only true fans would look.", "I:Lingo page recovered. Sugoi, {name}. I said it. Don't make it weird."],
    "anime-con":    ["N:Convention weekend. Badge on, lanyard on, comfiest shoes on.", "I:The page blew into Artist Alley. Every table has a few of our words.", "I:Con page restored, and we only spent a little on merch. Mostly."],
    "manga-studio": ["N:A late-night manga studio. The deadline is tomorrow; the coffee is today.", "J:I scattered the panels! Dramatic tension! Speed lines! Cliffhanger!", "I:Studio page recovered: inked, lettered and turned in with an hour to spare."],
    "tokyo-nights": ["N:Neon signs flicker on as the train pulls into the city. Ramen first, adventure second.", "I:This page is spread across arcades, shrines and convenience stores. Let's be thorough.", "I:Travel page restored. Somewhere, a vending machine is cheering for you."],
    "nineties":     ["N:Rewind. The next page landed in a 90s basement, complete with a beanbag and a tangled mixtape.", "J:Be kind, rewind? I did NOT rewind. The words are everywhere.", "I:Throwback page restored. Late fees waived. Totally radical, {name}."],
    "y2k-internet": ["N:The modem screeches. Someone picks up the phone. Welcome to the Y2K internet.", "J:brb, scattering words. My away message just says 'mysterious.'", "I:Internet page recovered. Congratulations, you've made my Top 8."],
    "adulting":     ["N:A tiny apartment with big houseplants and an even bigger to-do list.", "I:This page fell somewhere between the laundry pile and the unopened mail. Classic.", "I:Adulting page restored. Reward yourself with a nap. You've earned it."],
    "halloween":    ["N:A harvest moon rises over Hollowmist Hill, and the fog is right on schedule.", "J:I hid these words in the darkest corners. It seemed thematic.", "I:Halloween page recovered. Even the ghosts are relieved. Spooky work, {name}."],
    "winter":       ["N:Snow settles over Frostfeather Village. Every chimney has smoke curling out.", "I:Jumble whipped up a blizzard of letters. Scarf on; let's go.", "I:Winter page restored. Hot cocoa is on me."],
    "spring":       ["N:The thaw arrives in Blossomvale, and everything turns green overnight.", "J:Achoo. Pollen. I may have sneezed this whole page loose. ...Sorry about that.", "I:Did Jumble just apologize? Spring page restored, and apparently so is his conscience."],
    "summer":       ["N:Long golden days at Lemonade Lake. Summer is in no hurry to leave.", "I:Jumble's been oddly helpful lately. He's out there looking for words, too.", "J:Fine. I admit it. Scattering the pages was a mistake. Finding them has been more fun."],
    "autumn":       ["N:Leaves turn amber over Harvest Hollow. One of the last pages waits here.", "J:Let's find this one together, Seeker. Truce?", "I:Truce accepted. Autumn page restored. The Storybook is almost whole."]
  }
};
