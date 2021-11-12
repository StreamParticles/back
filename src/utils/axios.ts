import axios from "axios";

export const axiosGet = async <ResponseType = {}>(
  url: string
): Promise<ResponseType> => {
  const { data }: { data: ResponseType } = await axios.get(url);

  return data;
};
