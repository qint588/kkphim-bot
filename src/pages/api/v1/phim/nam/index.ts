import { IDataResponse } from "@/lib/global";
import connectToDatabase from "@/lib/mongoose";
import movieService from "@/services/movie.service";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/v1/phim/nam:
 *   get:
 *     description: Trả ra danh sách năm
 *     responses:
 *       200:
 *         description: Danh sách năm
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataResponse<{ _id: number; count: number }>>
) {
  await connectToDatabase();

  const items = await movieService.getYears();
  res.status(200).json({
    items,
  });
}
