import { PaginatedResult, PaginationSettings } from "@streamparticles/lib";
import { Schema } from "mongoose";

import { DEFAULT_PAGINATION } from "#constants/pagination";

export interface GlobalQueryHelpers<T> {
  paginate(pagination?: PaginationSettings): Promise<PaginatedResult<T>>;
}

const paginatePlugin = (schema: Schema): void => {
  schema.query.paginate = async function(
    pagination: PaginationSettings = DEFAULT_PAGINATION
  ) {
    // Page numerotation starts from 1
    const {
      page = DEFAULT_PAGINATION.page,
      itemsPerPage = DEFAULT_PAGINATION.itemsPerPage,
    } = pagination;
    const skip = Math.abs(page - 1) * itemsPerPage;

    const totalItems = await this.countDocuments();
    const items = await this.find()
      .skip(skip)
      .limit(itemsPerPage)
      .lean();

    return {
      page,
      itemsPerPage,
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage),
    };
  };
};

export default paginatePlugin;
