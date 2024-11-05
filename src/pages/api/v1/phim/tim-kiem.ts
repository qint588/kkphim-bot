import { IDataResponse, IErrorResponse } from "@/lib/global";
import connectToDatabase from "@/lib/mongoose";
import { IMovie } from "@/models/movie.model";
import movieService from "@/services/movie.service";
import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";

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
      res.status(500).json({ message: "Server error" });
    }
  }
}