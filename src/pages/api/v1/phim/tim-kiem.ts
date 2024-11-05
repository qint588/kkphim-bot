import { IDataResponse, IErrorResponse } from "@/lib/global";
import connectToDatabase from "@/lib/mongoose";
import { IMovie } from "@/models/movie.model";
import movieService from "@/services/movie.service";
import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";

/**
 * @swagger
 * /api/v1/phim/tim-kiem:
 *   get:
 *     description: Trả ra danh sách phim theo điều kiện
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Từ khoá cần tìm
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Năm
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Trang thái (ongoing|completed)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Loại phim (hoathinh|series|single|tvshows)
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Danh sách thể loại (hai-huoc,tam-ly)
 *       - in: query
 *         name: countries
 *         schema:
 *           type: string
 *         description: Danh sách quốc gia (au-my,trung-quoc)
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
 *         description: Danh sách phim theo điều kiện
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IErrorResponse | IDataResponse<IMovie>>
) {
  await connectToDatabase();

  const schema = z.object({
    page: z.number().min(1, "Page must be at least 1").optional(),
    per_page: z
      .number()
      .min(1, "Per page must be at least 1")
      .max(100, "Per page must not exceed 100")
      .optional(),
    categories: z.string().optional(),
    countries: z.string().optional(),
    year: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    keyword: z.string().optional(),
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

    const response = await movieService.search(validated);
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
      console.log(error);

      res.status(500).json({ message: "Server error" });
    }
  }
}
