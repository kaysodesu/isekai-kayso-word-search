/* Seek & Find - "The Scattered Storybook"
   Lore: Jumble, a chaotic wind spirit with notifications permanently on, scattered the pages of
   Wordwood's Great Storybook. Inky, the Storybook's chronically tired archivist (runs on oat-milk
   lattes), recruits you (the Seeker) to get them back. Each theme is one page; its five puzzles
   are the five lines of that page. Restore all five to complete the story.

   Panel format: "X:text" where X = N (narrator), I (Inky), J (Jumble), Y (you).
   {name} is replaced with the player's avatar name. */

window.STORY = {
  prologue: [
    "N:In the cozy town of Wordwood, every word ever spoken lives in the Great Storybook. It has better organization than your downloads folder.",
    "J:Ugh, so boring. Shelved. Alphabetized. Color-coded. So I did a dramatic entrance: wind effects, flying hair, a little sparkle. Iconic.",
    "N:One gust later, every page was scattered across the land, tangled into grids of letters. The group chat exploded.",
    "I:Hi. I'm Inky, the archivist. I'm on my third latte, and 35 pages are missing. I need a partner with sharp eyes and zero plans this weekend.",
    "Y:I'm {name}. My weekend plans were 'touch grass, maybe.' This sounds way better."
  ],
  finale: [
    "N:The last word slides into place. The Great Storybook closes with the most satisfying thump since a cassette tape clicking shut.",
    "I:Every page accounted for, {name}. You're officially the main character. I'm framing this. And taking a nap.",
    "J:Okay, I'm sorry. Genuinely. ...But was it not the best side quest you've had all year? Same time next season? Kidding! Mostly."
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
    "ocean-life":   ["N:Page one went to the Glimmer Sea, where the tide reads everything twice and still misses the point.", "I:A whole page of sea life, soaked and scrambled. Let's move before the crabs claim it as a housing deposit.", "I:Ocean page recovered. Slightly damp. Kind of like my spirit. Strong start, though."],
    "safari":       ["N:Sunset on the Sunstripe Savanna. The giraffes are posing like it's golden hour on a dating profile.", "I:Jumble scattered this page across the whole plain. Binoculars recommended. Sunscreen mandatory.", "I:Savanna page secured. The lions look unimpressed, which, honestly, is their whole brand."],
    "birds":        ["N:High on the Whistletop Cliffs, every bird has an opinion and absolutely posts it.", "J:I shuffled their song sheets. Now they're all singing the same viral sound on loop. You're welcome.", "I:Bird page restored. The comment section has finally calmed down."],
    "fresh-fruit":  ["N:Saturday at the Juicy Jubilee farmers market: $9 for one heirloom tomato and you'll pay it, smiling.", "J:I rolled a few words under the produce stands. Is that a crime? Ask my lawyer, the pineapple.", "I:Fruit page restored. The vendor threw in a free peach. We are thriving."],
    "bakery":       ["N:The Toasty Crumb Bakery opens at 5 a.m. The line already wraps around the block. Everyone looks like they need this.", "I:Jumble went through the flour bin. The recipe page is somewhere in that cloud. So is my will to live.", "I:Recipe page recovered. The baker insists we take a croissant. I'm not crying, you're crying."],
    "italian":      ["N:Pastavera, a hill town where dinner takes three hours and nobody checks their phone. Wild concept.", "J:I twirled the words like spaghetti. Untangle at your own pace. No rush. Mangia, babe.", "I:Kitchen page restored. Chef's kiss. Literally, the chef kissed my forehead. I'm processing."],
    "outer-space":  ["N:A night at the Starlit Observatory. Mercury is in retrograde, so everyone's blaming it for everything.", "J:Up here the words float right off the page! I gave them a little push. For science.", "I:Space page recovered. One small search for {name}, one giant leap for my anxiety levels."],
    "weather":      ["N:The Cloudmill spins the weather by hand. The forecast is 'vibes,' with a 40% chance of drama.", "J:Wind is literally my whole personality. This page is my home turf. Bring a cute raincoat.", "I:Weather page restored and the storm has passed. Jumble looks almost impressed. Mark the calendar."],
    "flowers":      ["N:The Petalpath Gardens are in full bloom, and every single plant has lost its little name tag. Chaos.", "I:This is a plant parent's worst nightmare. Let's get these names back before someone overwaters the wrong one.", "I:Garden page restored. It smells incredible in here. Like a candle called 'Unbothered.'"],
    "forest-trees": ["N:The Elderleaf Forest is older than the Storybook and has seen things. It's tired too. Relatable.", "I:The old oak says Jumble tangled this page in its branches and then left without saying goodbye. Rude.", "I:Forest page restored. The trees are rustling, which I'm told is applause. Or gossip. Either way."],
    "capitals":     ["N:Inky unfolds a well-worn map. Time for a whirlwind world tour with zero jet lag and no middle seat.", "J:I shuffled all the capitals. Is Lisbon in Lima? Is Rome even real? Keeping everyone humble.", "I:Every capital back where it belongs. Your passport would be so proud of you."],
    "beach-day":    ["N:Seashell Cove, 2 p.m. Warm sand, cold drinks, and out-of-office replies fully activated.", "J:I buried a few words in the sand. Think of it as a vacation activity. Very mindful. Very zen.", "I:Beach page restored. Five more minutes in the sun, then reapply sunscreen. I'm not your mom, but reapply."],
    "camping":      ["N:Night falls over Pinecone Camp. The fire crackles. Somewhere, a raccoon is plotting your snacks.", "I:Jumble blew out the lantern and half this page wandered into the woods. No signal out here. Cool. Cool cool cool.", "I:Camping page found. We've earned a s'more. Or four. I'm not counting, and neither are you."],
    "countries":    ["N:Passports ready. This page went on a gap year around the world without asking anyone.", "J:Customs flagged me for carrying forty countries in my backpack. Long story. Very funny in hindsight.", "I:World page restored. Consider your passport stamped and your travel-content era officially started."],
    "ball-games":   ["N:Game night at Bounceborough Stadium. The crowd is loud, the nachos are overpriced, and the vibes are immaculate.", "J:I'm running a little keep-away with the sports words. Can't catch me! ...Okay, please don't actually tackle me.", "I:Sports page recovered. Ball is life. Or so I'm told. I'm more of a nap-is-life person."],
    "olympics":     ["N:The torch is lit for the Grand Games of Wordwood. Everyone's stretching like they didn't skip leg day.", "I:The event names blew right off the scoreboard. Let's go for gold. Or at least a solid participation trophy.", "I:Gold-medal effort, {name}. This page takes the top step of the podium. Cue the dramatic anthem."],
    "crafts":       ["N:The Craft Cottage: yarn, glue guns, and four half-finished projects someone swears they'll get back to.", "J:I unraveled the words like a sweater. A little casual chaos. It's called art, look it up.", "I:Crafts page restored, every stitch in place. Handmade with love and a small amount of hot glue burn."],
    "board-games":  ["N:Game night at the Parlor. Someone's already flipping the board, and it's only the first round.", "J:I shuffled the words like a deck of cards. Pick one. Any one. No, not that one.", "I:Checkmate, Jumble. Game page back in the box. Friendships intact. Mostly."],
    "instruments":  ["N:Melody Hall, an hour before curtain. Something in the orchestra sounds suspiciously like a ringtone.", "J:I nudged every note half a step sharp. It's not wrong, it's jazz. Look it up.", "I:Music page recovered. The orchestra is tuning up, and it slaps. Is that the right word? I'm keeping it."],
    "movies":       ["N:The Moonlight Cinema. Popcorn is popping, the trailers are rolling, and someone is already on their phone.", "J:I snipped the movie words into tiny pieces. Plot twist! Nobody saw it coming. Except everyone.", "I:Film page restored. Roll the credits and stay for the post-credits scene. There's always a post-credits scene."],
    "art-studio":   ["N:The Splatterbrush Studio, where every surface is a canvas and every artist has an oat-milk latte.", "I:Jumble knocked over the paint. The words are hiding in the splatter. Very abstract. Very tragic.", "I:Art page recovered. Honestly, this belongs in a gallery. Or at least on a tote bag."],
    "books":        ["N:The Great Library, where the Storybook was first written by candlelight. And yes, there's a book club.", "J:A whole library of words in one place? Shh. I couldn't help myself. Shh. Okay.", "I:Library page restored. The resident cat has blinked slowly at you. That's the highest honor here."],
    "anime-genres": ["N:Title card! Dramatic music! The next page crash-landed in Animetown, where every street is a different genre.", "J:Behold! This isn't even my final form! ...Okay, it is. But the words are scattered across EVERY genre. Mwahaha.", "I:Genre page restored. Cue the ending theme, the freeze-frame and a suspiciously long preview for next episode."],
    "anime-lingo":  ["N:A cozy anime cafe where the menu is entirely in fan slang and the barista calls everyone 'senpai.'", "J:Notice me, Seeker! I hid the lingo where only true fans would look. Behind the plushies. Obviously.", "I:Lingo page recovered. Sugoi, {name}. I said it out loud. Don't make it weird. ...Okay, it's a little weird."],
    "anime-con":    ["N:Con weekend. Badge on, lanyard on, comfiest shoes on, and a budget you are absolutely going to ignore.", "I:The page blew into Artist Alley. Every single table has a few of our words. And so many cute prints.", "I:Con page restored. We only spent a little on merch. Define 'a little.' Don't define it, actually."],
    "manga-studio": ["N:A late-night manga studio. The deadline is tomorrow, the coffee is today, and the editor is typing...", "J:I scattered the panels! Dramatic tension! Speed lines! A cliffhanger that will haunt readers for a year!", "I:Studio page recovered: inked, lettered and submitted with an hour to spare. Per my last email, we did it."],
    "tokyo-nights": ["N:Neon signs flicker on as the train pulls in. Ramen first, adventure second, convenience-store snacks always.", "I:This page is spread across arcades, shrines and three different vending machines. We're being thorough.", "I:Travel page restored. Somewhere, a vending machine is cheering for you. In a very polite voice."],
    "nineties":     ["N:Rewind. The next page landed in a 90s basement: beanbag chair, lava lamp, and a mixtape titled 'FEELINGS.'", "J:Be kind, rewind? I did NOT rewind. Also, I recorded over your favorite show. Whoops.", "I:Throwback page restored. Late fees waived. Totally radical, {name}. Is that still a thing? It is now."],
    "y2k-internet": ["N:The modem screeches like a robot falling down stairs. Someone picks up the landline. Welcome to the Y2K internet.", "J:brb, scattering words. My away message is song lyrics that are definitely about you. Or not. Who's to say.", "I:Internet page recovered. Congrats, you've been promoted to my Top 8. Don't tell the others."],
    "adulting":     ["N:A tiny apartment with big houseplants, an even bigger to-do list, and a 'quick errand' that took four hours.", "I:This page fell somewhere between the laundry pile and the unopened mail. Classic Tuesday.", "I:Adulting page restored. You filed it, paid it AND watered it. Reward yourself with a nap. You've earned it."],
    "halloween":    ["N:A harvest moon rises over Hollowmist Hill. The fog is on schedule. The spooky playlist is on shuffle.", "J:I hid these words in the darkest corners. It felt thematic. Also, booooo. Did that work? Be honest.", "I:Halloween page recovered. Even the ghosts are relieved. Boo-tiful work, {name}. I'm sorry. I had to."],
    "winter":       ["N:Snow settles over Frostfeather Village. Every chimney is smoking, and every mug says 'cozy era.'", "I:Jumble whipped up a blizzard of letters. Scarf on, hot cocoa in hand, let's go find them.", "I:Winter page restored. Hot cocoa is on me. Marshmallows are non-negotiable."],
    "spring":       ["N:The thaw arrives in Blossomvale. Everything turns green overnight, and so does everyone's allergy forecast.", "J:Achoo. Pollen. I may have sneezed this whole page loose. ...Sorry about that. Is that growth? Is this healing?", "I:Did Jumble just apologize? Spring page restored, and apparently so is his emotional range."],
    "summer":       ["N:Long golden days at Lemonade Lake. Summer is in no hurry to leave, and neither are we.", "I:Jumble's been oddly helpful lately. He made a playlist called 'sorry I scattered the pages.' It's actually good.", "J:Fine. I admit it. Scattering the pages was a mistake. Finding them with you has been the best side quest ever."],
    "autumn":       ["N:Leaves turn amber over Harvest Hollow. One of the last pages waits here, smelling like pumpkin spice.", "J:Let's find this one together, Seeker. Truce? I'll even hold the flashlight. Sweater weather and teamwork.", "I:Truce accepted. Autumn page restored. The Storybook is almost whole. I might cry. It's the latte. It's fine."]
  }
};
