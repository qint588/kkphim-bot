import connectToDatabase from "@/lib/mongoose";
import Category from "@/models/category.model";
import Country from "@/models/country.model";
import Episode, { IEpisode } from "@/models/episode.model";
import Movie from "@/models/movie.model";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

interface IKkPhimCategory {
  id: string;
  name: string;
  slug: string;
}

interface IKkPhimMovie {
  tmdb: {
    type: string | null;
    id: string | null;
    season: string | null;
    vote_average: number;
    vote_count: number;
  };
  imdb: {
    id: string | null;
  };
  modified: {
    time: string;
  };
  name: string;
  slug: string;
  origin_name: string;
  content: string;
  type: string;
  status: string;
  poster_url: string;
  thumb_url: string;
  is_copyright: boolean;
  sub_docquyen: boolean;
  chieurap: boolean;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  notify: string;
  showtimes: string;
  year: number;
  view: number;
  actor: string[];
  director: string[];
  category: IKkPhimCategory[];
  country: IKkPhimCategory[];
  episodes: IKkPhimEpisode[];
}

interface IKkPhimEpisode {
  server_name: string;
  server_data: Array<{
    name: string;
    slug: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
  }>;
}

const fetchMovie = async (page: number = 1): Promise<IKkPhimMovie[]> => {
  let listPromise = [];
  // for (let index = 1; index <= totalPage; index++) {
  listPromise.push(
    axios.get("https://phimapi.com/danh-sach/phim-moi-cap-nhat", {
      params: {
        page,
      },
    })
  );
  // }

  const listDetailPromise = (await Promise.allSettled(listPromise))
    .filter((el) => el.status == "fulfilled")
    .map((el) => el.value.data.items)
    .reduce((result, el) => {
      return [...result, ...el];
    }, [])
    .map((el: { slug: string }) => "https://phimapi.com/phim/" + el.slug)
    .map((el: string) => axios.get(el));

  const result = (await Promise.allSettled(listDetailPromise))
    .filter((el) => el.status == "fulfilled")
    .map((el) => {
      return {
        ...el.value.data.movie,
        episodes: el.value.data.episodes,
      };
    });

  return result;
};

const storeMovie = async (movie: IKkPhimMovie) => {
  let catIds = [];
  for (const category of movie.category) {
    const cat = await Category.findOneAndUpdate(
      { slug: category.slug },
      { name: category.name, slug: category.slug },
      {
        upsert: true,
        new: true,
      }
    );
    catIds.push(cat._id);
  }

  let countryIds = [];
  for (const country of movie.country) {
    const ctry = await Country.findOneAndUpdate(
      { slug: country.slug },
      { name: country.name, slug: country.slug },
      {
        upsert: true,
        new: true,
      }
    );
    countryIds.push(ctry._id);
  }

  const movieSaved = await Movie.findOneAndUpdate(
    {
      slug: movie.slug,
    },
    {
      imdb: movie.imdb.id,
      tmdb: movie.tmdb.id,
      name: movie.name,
      originalName: movie.origin_name,
      slug: movie.slug,
      content: movie.content,
      type: movie.type,
      status: movie.status,
      porsterUrl: movie.poster_url,
      thumbUrl: movie.thumb_url,
      exclusiveSub: movie.sub_docquyen,
      cinema: movie.chieurap,
      time: movie.time,
      episodeCurrent: movie.episode_current,
      episodeTotal: movie.episode_total,
      quality: movie.quality,
      lang: movie.lang,
      year: movie.year,
      modifiedTimeAt: new Date(movie.modified.time),
      categories: catIds,
      countries: countryIds,
    },
    {
      upsert: true,
      new: true,
      strict: false,
    }
  );

  let episodeIds = [];
  for (const episodeServer of movie.episodes) {
    for (const episodeData of episodeServer.server_data) {
      const episodeSaved: IEpisode = await Episode.findOneAndReplace(
        {
          serverName: episodeServer.server_name,
          movie: movieSaved._id,
          episodeSlug: episodeData.slug,
        },
        {
          name: episodeData.name,
          episodeSlug: episodeData.slug,
          episodeLinkEmbed: episodeData.link_embed,
          episodeLinkM3u8: episodeData.link_m3u8,
          serverName: episodeServer.server_name,
          movie: movieSaved._id,
        },
        {
          upsert: true,
          new: true,
          strict: false,
        }
      );
      episodeIds.push(episodeSaved._id);
    }
  }

  const movieUpdated = await Movie.findByIdAndUpdate(
    movieSaved._id,
    {
      $set: {
        episodes: episodeIds,
      },
    },
    { new: true, runValidators: true }
  );

  console.log(movieUpdated._id);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await connectToDatabase();

  const maxPage = (req?.query?.max_page || 15) as number;
  for (let index = 1; index <= maxPage; index++) {
    console.table({ currentpage: index });
    const movies = await fetchMovie(index);
    console.table(
      movies.map((el) => {
        return {
          name: el.name,
          slug: el.slug,
        };
      })
    );
    movies.forEach(async (movie) => {
      await storeMovie(movie);
    });
  }

  res.status(200).json({ message: "Schedule running..." });
}
