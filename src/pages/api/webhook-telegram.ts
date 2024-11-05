import type { NextApiRequest, NextApiResponse } from "next";
import * as _ from "lodash";
import { telegramBot } from "@/lib/telegram";
import telegramService from "@/services/telegram.service";

telegramService.process();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "POST") {
    if (req.body) {
      telegramBot.processUpdate(req.body);
    }

    res.status(200).send("OK");
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
