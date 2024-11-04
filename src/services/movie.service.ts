import { IDataResponse } from "@/lib/global";
import Category, { ICategory } from "@/models/category.model";
import Country, { ICountry } from "@/models/country.model";
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

    const movies: IMovie[] = await Movie.find(query)
      .select(
        "_id name originalName slug originalName porsterUrl thumbUrl year episodeCurrent lang quality modifiedTimeAt categories countries createdAt updatedAt"
      )
      .sort({
        modifiedTimeAt: -1,
      })
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

  async detail(id: string): Promise<IMovie | null> {
    return null;
  }
}

export default new MovieService();
