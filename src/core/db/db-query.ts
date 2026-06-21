import mongoose, { type Query } from "mongoose";

const excludedFields = ["page", "sort", "limit", "fields", "search"];

export interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  search?: string;
  [key: string]: string | undefined;
}

type RegexQuery = Record<string, unknown>;

export const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function buildRegexQuery(queryObj: QueryString): RegexQuery {
  const filteredQueryObj = { ...queryObj };

  excludedFields.forEach((field) => {
    delete filteredQueryObj[field];
  });

  const regex: RegexQuery = {};

  for (const key of Object.keys(filteredQueryObj)) {
    const actualKey = key.replace(/_/g, ".");
    const value = filteredQueryObj[key];

    if (value === undefined) {
      continue;
    }

    if (
      mongoose.Types.ObjectId.isValid(value) &&
      actualKey.toLowerCase().includes("id")
    ) {
      regex[actualKey] = new mongoose.Types.ObjectId(value);
      continue;
    }

    if (typeof value === "string" && value.includes("$")) {
      try {
        regex[actualKey] = JSON.parse(value);
        continue;
      } catch {
        regex[actualKey] = value;
        continue;
      }
    }

    if (typeof value === "string" && value === "true") {
      regex[actualKey] = true;
      continue;
    }

    if (typeof value === "string" && value === "false") {
      regex[actualKey] = false;
      continue;
    }

    if (typeof value === "string" && !value.startsWith("[object ")) {
      regex[actualKey] = new RegExp(escapeRegExp(value), "i");
      continue;
    }

    regex[actualKey] = value;
  }

  return regex;
}

export function buildOrderFilter(queryString: QueryString): RegexQuery {
  const { search, ...rest } = queryString;
  const fieldFilter = buildRegexQuery(rest);

  if (!search?.trim()) {
    return fieldFilter;
  }

  const searchRegex = new RegExp(escapeRegExp(search.trim()), "i");
  const searchFilter = {
    $or: [{ customerName: searchRegex }, { phone: searchRegex }],
  };

  if (Object.keys(fieldFilter).length === 0) {
    return searchFilter;
  }

  return { $and: [fieldFilter, searchFilter] };
}

class BaseDBQuery<T> {
  public query: Query<T[], T>;
  public queryString: QueryString;
  public page = 1;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): this {
    this.query = this.query.find(buildOrderFilter(this.queryString));
    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate(): this {
    const page = Number.parseInt(this.queryString.page || "1", 10);
    let limit = Number.parseInt(this.queryString.limit || "20", 10);

    if (limit > 100) {
      limit = 100;
    }

    const skip = (page - 1) * limit;

    this.page = page;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

export class DBQuery<T> extends BaseDBQuery<T> {
  constructor(query: Query<T[], T>, queryString: QueryString) {
    super(query, queryString);
  }
}

export class DBQueryCount<T> extends BaseDBQuery<T> {
  constructor(query: Query<T[], T>, queryString: QueryString) {
    super(query, queryString);
  }

  countDocuments(): Promise<number> {
    return this.query.find(buildOrderFilter(this.queryString)).countDocuments();
  }
}
