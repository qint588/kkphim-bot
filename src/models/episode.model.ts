import mongoose, { Schema, Document } from "mongoose";

export interface IEpisode extends Document {
  name: string;
  slug: string;
  season: number;
  episodeNumber: number;
  episodeLinkEmbed: string;
  episodeLinkM3u8: string;
  serverName: string;
  movie: mongoose.Types.ObjectId;
}

const episodeSchema = new Schema<IEpisode>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    season: { type: Number },
    episodeNumber: { type: Number, required: true },
    episodeLinkEmbed: { type: String },
    episodeLinkM3u8: { type: String },
    serverName: { type: String, required: true },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Episode =
  mongoose.models.Episode || mongoose.model<IEpisode>("Episode", episodeSchema);

export default Episode;
