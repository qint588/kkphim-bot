import Country, { ICountry } from "@/models/country.model";
import type { NextApiRequest, NextApiResponse } from "next";

interface IDataResponse {
  items: ICountry[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataResponse>
) {
  const countries = await Country.find().select("_id name slug");
  res.status(200).json({
    items: countries,
  });
}
