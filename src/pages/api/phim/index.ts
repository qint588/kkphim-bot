import Movie, { IMovie } from "@/models/movie.model";
import type { NextApiRequest, NextApiResponse } from "next";
import * as _ from "lodash";
import connectToDatabase from "@/lib/mongoose";
import Category from "@/models/category.model";
import Country from "@/models/country.model";
import { z } from "zod";

interface IDataResponse {
  items: IMovie[];
  pagination: IPagination;
}

interface IErrorResponse {
  error: {
    message: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

interface IPagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataResponse | IErrorResponse>
) {
  await connectToDatabase();

  const paginationSchema = z.object({
    page: z.number().min(1, "Page must be at least 1").optional(),
    per_page: z
      .number()
      .min(1, "Per page must be at least 1")
      .max(100, "Per page must not exceed 100")
      .optional(),
  });
  const response = paginationSchema.safeParse({
    ...req.query,
    page: req.query?.page ? parseInt(req.query?.page as string, 10) : undefined,
    per_page: req.query?.per_page
      ? parseInt(req.query?.per_page as string, 10)
      : undefined,
  });

  console.log(response);
  if (!response.success) {
    const { errors } = response.error;
    const formattedErrors = errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(422).json({
      error: { message: "Invalid request", errors: formattedErrors },
    });
  }

  const page = (response.data?.page || 1) as number;
  const limit = (response.data?.per_page || 10) as number;

  let movies: IMovie[] = await Movie.find()
    .select(
      "_id name originalName slug originalName porsterUrl thumbUrl year episodeCurrent lang quality modifiedTimeAt categories countries createdAt updatedAt"
    )
    .sort({
      modifiedTimeAt: -1,
    })
    .skip((page - 1) * limit)
    .limit(limit);

  const categoryIds = _.flattenDeep(_.map(movies, "categories"));
  const categories = await Category.find({
    _id: { $in: categoryIds },
  }).select("_id name slug");

  const countryIds = _.flattenDeep(_.map(movies, "countries"));
  const countries = await Country.find({
    _id: { $in: countryIds },
  }).select("_id name slug");

  movies = movies.map((movie) => {
    movie.categories = categories.filter(
      (el) => movie.categories.indexOf(el._id) != -1
    );
    movie.countries = countries.filter(
      (el) => movie.countries.indexOf(el._id) != -1
    );
    return movie;
  });

  const totalItems = await Movie.countDocuments();

  res.status(200).json({
    items: movies,
    pagination: {
      totalItems: totalItems,
      totalItemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    },
  });
}
