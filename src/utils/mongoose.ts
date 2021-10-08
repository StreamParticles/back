import { PaginatedResult, PaginationSettings } from "@streamparticles/lib";
import { Id } from "@streamparticles/lib/out/types/mongoose";
import { isEqual } from "lodash";
import {
  Document,
  LeanDocument,
  Model,
  Query,
  Schema,
  SchemaOptions,
} from "mongoose";

import { DEFAULT_PAGINATION } from "#constants/pagination";

export const paginate = async <T>(
  model: Model<any>,
  query: any[],
  pagination: PaginationSettings = DEFAULT_PAGINATION
): Promise<PaginatedResult<T>> => {
  // Page numerotation starts from 0
  const {
    page = DEFAULT_PAGINATION.page,
    itemsPerPage = DEFAULT_PAGINATION.itemsPerPage,
  } = pagination;
  const skip = Math.abs(page - 1) * itemsPerPage;

  const aggregate = model.aggregate(query);
  const countQuery = model.aggregate(aggregate.pipeline());

  const result = await Promise.all([
    aggregate
      .skip(skip)
      .limit(itemsPerPage)
      .exec(),
    countQuery
      .group({
        _id: null,
        totalItems: { $sum: 1 },
      })
      .exec(),
  ]);

  const [items, [{ totalItems = 0 } = {}] = []] = result;

  return {
    page,
    itemsPerPage,
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / itemsPerPage),
  };
};

interface SchemaFactoryFn {
  (
    schemaDefinition: Record<string, unknown>,
    schemaOptions: SchemaOptions
  ): Schema;
}

export const SchemaFactory = (
  schemaBase: Record<string, unknown>,
  schemaBaseOptions?: SchemaOptions
): SchemaFactoryFn => {
  return (
    schemaDefinition: Record<string, unknown>,
    schemaOptions?: SchemaOptions
  ) =>
    new Schema(
      {
        ...schemaBase,
        // spread/merge passed in schema definition
        ...schemaDefinition,
      },
      {
        ...schemaBaseOptions,
        // spread/merge passed in schema options
        ...schemaOptions,
      }
    );
};

export const json = async <T extends Document>(
  query: Query<T | null, T, {}, T>
): Promise<LeanDocument<T> | null> => {
  const results = await query;

  if (!results) return null;

  return results.toJSON();
};

export const isEqualId = (id1: Id, id2: Id): boolean =>
  isEqual(String(id1), String(id2));
