import Category from "@/models/category.model";
import Country from "@/models/country.model";
import { IMovie } from "@/models/movie.model";
import _ from "lodash";

class MovieResource {
  format = async (movies: IMovie[]): Promise<IMovie[]> => {
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

    return movies;
  };
}

export default new MovieResource();
