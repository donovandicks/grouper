import { HEADERS } from "./constants";

export const postData = async <Body, Res>(url: string, data: Body): Promise<Res> => {
  const body = JSON.stringify(data);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...HEADERS,
      "Content-Length": `${Buffer.byteLength(body)}`,
    },
    body,
  });

  return (await res.json()) as Res;
};
