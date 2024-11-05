import { InlineKeyboardButton, KeyboardButton } from "node-telegram-bot-api";

export const startKeyBoard = (): KeyboardButton[][] => {
  return [
    [
      {
        text: "🔍 Search",
      },
      {
        text: "🗂 Collections",
      },
    ],
    [
      {
        text: "💈 Filter",
      },
      {
        text: "⚙️ Setting",
      },
    ],
  ];
};

export const startInlineKeyboard = (): InlineKeyboardButton[][] => {
  return [
    [
      {
        text: "ℹ️ Video guide",
        callback_data: "1",
      },
      {
        text: "⚙️ Setting",
        callback_data: "setting",
      },
    ],
    [
      {
        text: "🔍 Start searching",
        switch_inline_query_current_chat: "",
      },
    ],
  ];
};

export const searchInlineKeyboard = (): InlineKeyboardButton[][] => {
  return [
    [
      {
        text: "🖲 Instructions",
        callback_data: "instructions",
      },
      {
        text: "⤴️ Share",
        callback_data: "share",
      },
    ],
    [
      {
        text: "🕐 History",
        switch_inline_query_current_chat: "#history",
      },
      {
        text: "⭐ Favourite",
        switch_inline_query_current_chat: "#favourite",
      },
    ],
    [
      {
        text: "🗂 Collections",
        callback_data: "3",
      },
      {
        text: "💈 Filter",
        callback_data: "4",
      },
    ],
    [
      {
        text: "⚙️ Setting",
        callback_data: "setting",
      },
    ],
    [
      {
        text: "🔍 Start searching",
        switch_inline_query_current_chat: "",
      },
    ],
  ];
};

export const instructionInlineKeyboard = (): InlineKeyboardButton[][] => {
  return [
    [
      {
        text: "🔙 Back",
        callback_data: "back_to_search",
      },
    ],
  ];
};
