import type { NextApiRequest, NextApiResponse } from "next";
import * as _ from "lodash";
import connectToDatabase from "@/lib/mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  await connectToDatabase();

  res.status(200).send("Ok");
}
