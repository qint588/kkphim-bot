import { IDataResponse } from "@/lib/global";
import Category, { ICategory } from "@/models/category.model";
import Country, { ICountry } from "@/models/country.model";
import Episode, { IEpisode } from "@/models/episode.model";
import Movie, { IMovie } from "@/models/movie.model";
import movieResource from "@/resources/movie.resource";
import _ from "lodash";

class MovieService {
  async search(
    params: Record<string, any> | null = null
  ): Promise<IDataResponse<IMovie>> {
    const page = (params?.page || 1) as number;
    const limit = (params?.per_page || 10) as number;

    let query: Record<string, any> = {};

    if (!!params?.categories) {
      const categorySlugs = params?.categories
        ?.split(",")
        ?.map((el: string) => el.trim());

      const categorySearch = await Category.find({
        slug: { $in: categorySlugs },
      });

      query["categories"] = {
        $in: categorySearch,
      };
    }

    if (!!params?.countries) {
      const countrySlugs = params?.countries
        ?.split(",")
        ?.map((el: string) => el.trim());

      const countrySearch = await Country.find({
        slug: { $in: countrySlugs },
      });
      query["countries"] = {
        $in: countrySearch,
      };
    }

    if (params?.year) {
      query.year = params?.year;
    }

    if (params?.type) {
      query.type = params?.type;
    }

    if (params?.status) {
      query.status = params?.status;
    }

    if (params?.keyword) {
      query = {
        ...query,
        $text: { $search: params?.keyword },
      };
    }

    const movies: IMovie[] = await Movie.find(query, {
      score: { $meta: "textScore" },
    })
      .select(
        "_id name originalName slug originalName porsterUrl thumbUrl year episodeCurrent type status lang quality modifiedTimeAt categories countries createdAt updatedAt"
      )
      .sort(
        params?.keyword
          ? { score: { $meta: "textScore" } }
          : {
              modifiedTimeAt: -1,
            }
      )
      .skip((page - 1) * limit)
      .limit(limit);

    const totalItems = await Movie.countDocuments(query);

    return {
      items: await movieResource.format(movies),
      pagination: {
        totalItems: totalItems,
        totalItemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async getCatgeories(): Promise<ICategory[]> {
    return await Category.find().select("_id name slug");
  }

  async getCountries(): Promise<ICountry[]> {
    return await Country.find().select("_id name slug");
  }

  async detail(slug: string): Promise<{
    movie: IMovie;
    episodes: IEpisode[];
  }> {
    const movie = await Movie.findOne({ slug });

    const categories = await Category.find({
      _id: {
        $in: movie.categories,
      },
    }).select("_id name");
    const countries = await Country.find({
      _id: {
        $in: movie.countries,
      },
    }).select("_id name");
    const episodes = await Episode.aggregate([
      {
        $match: {
          _id: {
            $in: movie.episodes,
          },
        },
      },
      {
        $group: {
          _id: "$serverName",
          count: { $sum: 1 },
          documents: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { count: 1 },
      },
    ]);

    movie.categories = categories;
    movie.countries = countries;

    const { episodes: tempEpisodes, ...newMovieResource } = movie._doc;

    return {
      movie: newMovieResource,
      episodes,
    };
  }

  async getYears(): Promise<Array<{ _id: number; count: number }>> {
    const years = await Movie.aggregate([
      {
        $group: {
          _id: "$year",
          count: { $sum: 1 },
        },
      },
      {
        $match: { _id: { $gt: 0 } },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    return years;
  }
}

export default new MovieService();
