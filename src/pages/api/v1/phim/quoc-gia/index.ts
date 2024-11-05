import { IDataResponse } from "@/lib/global";
import connectToDatabase from "@/lib/mongoose";
import { ICountry } from "@/models/country.model";
import movieService from "@/services/movie.service";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/v1/phim/quoc-gia:
 *   get:
 *     description: Trả ra danh sách quốc gia
 *     responses:
 *       200:
 *         description: Danh sách quốc gia
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataResponse<ICountry>>
) {
  await connectToDatabase();

  const items = await movieService.getCountries();
  res.status(200).json({
    items,
  });
}
