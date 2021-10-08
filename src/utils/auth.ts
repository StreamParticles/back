import bcrypt from "bcrypt";

export const getHashedPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

export const verifyPassword = (password: string, hash: string): void => {
  try {
    const result = bcrypt.compareSync(password, hash);

    if (!result) throw new Error("INVALID_PASSWORD");
  } catch (error) {
    throw new Error("INVALID_PASSWORD");
  }
};
