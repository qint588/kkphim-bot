import connectToDatabase from "@/lib/mongoose";
import { telegramBot as bot } from "@/lib/telegram";
import User from "@/models/user.model";
import {
  instructionInlineKeyboard,
  searchInlineKeyboard,
  startInlineKeyboard,
  startKeyBoard,
} from "@/utils/telegram";
import TelegramBot, {
  ChatId,
  InlineQueryResult,
  MessageId,
} from "node-telegram-bot-api";
import movieService from "./movie.service";

class TelegramService {
  async process() {
    await connectToDatabase();

    bot.onText(/\/start/, async function (msg: TelegramBot.Message) {
      await User.findOneAndUpdate(
        {
          userId: msg.from?.id,
        },
        {
          userId: msg.from?.id,
          userName: msg.from?.username,
          firstName: msg.from?.first_name,
          languageCode: msg.from?.language_code,
        },
        {
          upsert: true,
          new: true,
        }
      );
      await bot.sendMessage(msg.chat.id, "/start", {
        reply_markup: {
          keyboard: startKeyBoard(),
        },
      });
      await bot.sendMessage(
        msg.chat.id,
        `🍿 Hello, movie buff!
  
🔍 To search, use the buttons below or send a movie title in a message`,
        {
          reply_markup: {
            inline_keyboard: startInlineKeyboard(),
          },
        }
      );
    });

    bot.onText(/\/search/, async function (msg: TelegramBot.Message) {
      await bot.sendMessage(
        msg.chat.id,
        `To find the movie you need, click the "Start Search" button and enter your request or simply send your request in a message`,
        {
          reply_markup: {
            inline_keyboard: searchInlineKeyboard(),
          },
        }
      );
    });

    bot.onText(/🔍 Search/, async function (msg: TelegramBot.Message) {
      await bot.sendMessage(
        msg.chat.id,
        `To find the movie you need, click the "Start Search" button and enter your request or simply send your request in a message`,
        {
          reply_markup: {
            inline_keyboard: searchInlineKeyboard(),
          },
        }
      );
    });

    bot.onText(/⚙️ Setting/, async function (msg: TelegramBot.Message) {
      await bot.sendMessage(
        msg.chat.id,
        "⚠️ Feature is under development, please come back later"
      );
    });

    bot.on("callback_query", async (query) => {
      if (query.data == "instructions") {
        await bot.deleteMessage(
          query.message?.chat.id as ChatId,
          query.message?.message_id as number
        );
        await bot.sendMessage(
          query.message?.chat.id as ChatId,
          `WHAT DOES THE BOT ALLOW YOU TO DO?
With the help of the bot, you can search for a movie or TV series, watch it, add it to favorites, download and watch it offline!
HOW TO USE THE BOT?
🔍 Send the bot the name of the movie and the bot will give you the search result, examples:
✅ shameless
✅ argument
🔍 Send me a link to kinopoisk or kinopoiskId, examples:
✅ https://www.kinopoisk.ru/series/571335
✅ kp571335
🔍 Send me imdbId, examples:
✅ tt0944947
🔍 Send me tmdbId, examples:
✅ tm1399
👤 /support`,
          {
            reply_markup: {
              inline_keyboard: instructionInlineKeyboard(),
            },
          }
        );
      }
      if (query.data == "back_to_search") {
        await bot.deleteMessage(
          query.message?.chat.id as ChatId,
          query.message?.message_id as number
        );
        await bot.sendMessage(
          query.message?.chat.id as ChatId,
          `To find the movie you need, click the "Start Search" button and enter your request or simply send your request in a message`,
          {
            reply_markup: {
              inline_keyboard: searchInlineKeyboard(),
            },
          }
        );
      }
      if (query.data == "setting") {
        await bot.deleteMessage(
          query.message?.chat.id as ChatId,
          query.message?.message_id as number
        );
        await bot.sendMessage(
          query.message?.chat.id as ChatId,
          "⚠️ Feature is under development, please come back later",
          {
            reply_markup: {
              inline_keyboard: instructionInlineKeyboard(),
            },
          }
        );
      }
      if (query.data == "share") {
        await bot.deleteMessage(
          query.message?.chat.id as ChatId,
          query.message?.message_id as number
        );
        await bot.sendMessage(
          query.message?.chat.id as ChatId,
          `⤴️ Share the link

👍 Invite your friends and get +3 days of VIP access for each!

🔗 ​​Your personal link, click to copy:
https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=997_9812098

Mandatory conditions!
1) The friend must follow your personal link, click the Start button and Pass the Captcha after launching the bot.
2) The friend has never switched to a similar bot before.`,
          {
            reply_markup: {
              inline_keyboard: instructionInlineKeyboard(),
            },
          }
        );
      }
    });

    bot.on("inline_query", async (query) => {
      const limit = 20;
      const offset: number = query.offset ? parseInt(query.offset, 10) : 0;
      const page = offset / limit + 1;
      const { items, pagination } = await movieService.search({
        page,
        per_page: limit,
        keyword: query.query,
      });

      const inlineQueryResult =
        page == 1 && items.length == 0
          ? [
              {
                id: "nocontent",
                type: "article",
                title: "No results found 😓",
                input_message_content: {
                  message_text: "/search",
                },
                description: "⚠️ If it doesn't work, read the instructions.",
              },
            ]
          : items.map((el) => {
              return {
                id: el._id,
                type: "article",
                title: el.name,
                input_message_content: {
                  message_text: `kk${el._id}`,
                },
                thumb_url: el.thumbUrl,
                thumb_height: 100,
                thumb_width: 100,
                description: `${el.lang} | ${el.quality} | ${el.categories
                  .map((el: any) => el.name)
                  .join(", ")}`,
              };
            });

      await bot.answerInlineQuery(
        query.id,
        inlineQueryResult as InlineQueryResult[],
        {
          cache_time: 1,
          next_offset: `${page * limit}`,
        }
      );
    });
  }
}

export default new TelegramService();
