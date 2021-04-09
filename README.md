# Discord-Grammarly
A small discord bot that uses the unofficial internal grammarly API to warn users about how they type in discord.

# Context
I built a somewhat small bot that takes in user messages and outputs Grammarly formatted alerts applied on their messages, however, since this took around 3 days to make, and I have no further interest in it as it achieved it's main purpose (show me TypeScript what it has to offer, work with databases in typescript, interact with the API via discord.js in typescript, try out new libraries such as lodash and more). I don't have the time required to fully finnish the project but I left some commands in the files where I would have liked to complete but main things left to add, off the top of my head, are - adding a formatting algorithm that takes in every alert produced by a message and return a discord markdown formatted thatcould be added to an embed and then delivered to the user in DMs; creation of commands to edit the small amount guild settings present in the guilds schema; creation of commands to edit the user preferences; and addition of eneral commands such as invite, help, etc. and to add a little space make all of those commands slash commands with no message-based commands whatsoever

# Features
A list of things the bot features.

- Base event & command loader with abstract classes for both of them that can be implemented accordingly to add new commands with different configuration in their respective directories.
- Message parsing that includes a mention prefix.
- Data structures for the database.
- Encrypting and encoding the message contents with AES-256-CBC encryption algorithm to store message contents as identifiers in the databases to be able to retain a cache.
- The bot guesses the language of a message and retains it in the database cache (via detectlanguage api).
- Uses MongoDb as the database for storing all of the data - this required because we store End User Data (message contents) which must be fully protected at all costs in order to comply with the Developers Terms of Service.
- The bot querries grammarly's unofficial api, encrypts the responses and stores them in the database.
- Sends a random motivational message after roughly 33-ish messages that do not contain any grammarly alerts.
- Uses .env to store all the custom data.

# Environment File
```.env
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_bot_id
DB_URL=your database_url
PREFIX=youre_prefix_defaults_to_g!
DETECT_LANGUAGE=detectlanguage_api_key
CRYPTO_KEY=optional_but_recomended_a_32_characters_long_crypto_secret_used_for_encryption
OWNER_ID=the_id_of_the_bot_owner
CRYPTO_IV=optional_but_recomended_a_16_character_long_iv_used_for_signing_the_encryption
ADMINS=optional_a_stirng_of_discord_ids
TICK=optional_a_tick_emote_native_or_custom
CROS=optional_a_cross_emote_native_or_custom
RED_WARNING=optional_redwarning_tick_emote_native_or_custom
BLUE_WARNING=optional_a_bluewarning_emote_native_or_custom
GREEN_WARNING=optional_a_greenwarning_emote_native_or_custom
PURPLE_WARNING=optional_a_purplewarning_emote_native_or_custom
LOADER=optional_a_loader_emote_native_or_custom
```

# Contributions
This repository is archieved but feel free to create a fork, contribute to that, <a href="https://discord.gg/Wwekc2QAzq">join my server</a> and send me a direct message on discord to get your changes merged into the main repository.
