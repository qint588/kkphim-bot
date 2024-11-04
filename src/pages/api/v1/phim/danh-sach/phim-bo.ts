import { IMovie } from "@/models/movie.model";
import type { NextApiRequest, NextApiResponse } from "next";
import * as _ from "lodash";
import connectToDatabase from "@/lib/mongoose";
import { z, ZodError } from "zod";
import movieService from "@/services/movie.service";
import { IDataResponse, IErrorResponse } from "@/lib/global";

/**
 * @swagger
 * /api/v1/phim/danh-sach/phim-bo:
 *   get:
 *     description: Trả ra danh sách phim bộ
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang cần lấy (mặc định là 1)
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng phim trên mỗi trang (mặc định là 10)
 *     responses:
 *       200:
 *         description: Danh sách phim bộ
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataResponse<IMovie> | IErrorResponse>
) {
  await connectToDatabase();

  const schema = z.object({
    page: z.number().min(1, "Page must be at least 1").optional(),
    per_page: z
      .number()
      .min(1, "Per page must be at least 1")
      .max(100, "Per page must not exceed 100")
      .optional(),
  });

  try {
    const validated = await schema.parseAsync({
      ...req.query,
      page: req.query?.page
        ? parseInt(req.query?.page as string, 10)
        : undefined,
      per_page: req.query?.per_page
        ? parseInt(req.query?.per_page as string, 10)
        : undefined,
    });

    const response = await movieService.search({
      ...validated,
      type: "series",
    });
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(422).json({
        message: "Invalid request",
        errors: formattedErrors,
      });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
}
