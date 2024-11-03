import Category, { ICategory } from "@/models/category.model";
import type { NextApiRequest, NextApiResponse } from "next";

interface IDataResponse {
  items: ICategory[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IDataResponse>
) {
  const categories = await Category.find().select("_id name slug");
  res.status(200).json({
    items: categories,
  });
}
