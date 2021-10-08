import dotenv from "dotenv-defaults";
import path from "path";

// Load environment config
dotenv.config({
  encoding: "utf8",
  path:
    process.env.NODE_ENV === "test"
      ? path.resolve(process.cwd(), ".env.test")
      : path.resolve(process.cwd(), ".env"),
  defaults: path.resolve(process.cwd(), ".env.defaults"),
});

const ENV: { [key: string]: string | boolean | number } = Object.entries(
  process.env
).reduce((acc, [_key, _value]) => {
  //  null values
  if (_value === "null" || _value === undefined) return acc;

  // Convert booleans
  if (_value === "true") return { ...acc, [_key]: true };
  else if (_value === "false") return { ...acc, [_key]: false };

  if (isFinite(Number(_value)) && _value !== "")
    return { ...acc, [_key]: Number(_value) };

  return { ...acc, [_key]: _value };
}, {});

// Expose environment vars
export { ENV };
