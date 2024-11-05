import { IErrorResponse } from "@/lib/global";
import connectToDatabase from "@/lib/mongoose";
import { IEpisode } from "@/models/episode.model";
import Movie, { IMovie } from "@/models/movie.model";
import movieService from "@/services/movie.service";
import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";

/**
 * @swagger
 * /api/v1/phim/{slug}:
 *   get:
 *     description: Trả ra chi tiết phim
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug của phim
 *         example: khi-anh-chay-ve-phia-em
 *     responses:
 *       200:
 *         description: Chi tiêt phim
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | {
        movie: IMovie;
        episodes: IEpisode[];
      }
    | IErrorResponse
  >
) {
  await connectToDatabase();

  const schema = z.object({
    slug: z
      .string()
      .min(1)
      .refine(
        async (slug) => {
          const movie = await Movie.findOne({ slug }).select("_id name");
          return !!movie;
        },
        {
          message: "Slug does not exist in movies collection",
        }
      ),
  });

  try {
    const validated = await schema.parseAsync(req.query);
    const response = await movieService.detail(validated.slug as string);
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
