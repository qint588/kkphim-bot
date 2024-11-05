import { IDataResponse } from "@/lib/global";
import connectToDatabase from "@/lib/mongoose";
import { ICategory } from "@/models/category.model";
import movieService from "@/services/movie.service";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/v1/phim/the-loai:
 *   get:
 *     description: Trả ra danh sách thể loại
 *     responses:
 *       200:
 *         description: Danh sách thể loại
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataResponse<ICategory>>
) {
  await connectToDatabase();

  const items = await movieService.getCatgeories();
  res.status(200).json({
    items,
  });
}
