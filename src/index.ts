import dotenv from "dotenv";
dotenv.config();

import fs from "fs/promises";
import express, { Request, Response } from "express";
import path from "path";

const port = parseInt(process.env.PORT || "3000");

interface IApiResponse {
  readonly status: number;
  readonly body: any;
  readonly headers?: any;
}

interface IValidation {
  readonly type?: string;
  readonly required?: boolean;
  readonly response: IApiResponse;
}

interface IApiData {
  readonly url: string;
  readonly method: string;
  readonly query?: any;
  readonly body?: any;
  readonly headers?: any;
  readonly response: IApiResponse;
}

const app = express();

app.use(express.json());

async function main() {
  const jsonString = await fs.readFile(
    path.join(__dirname, "..", "mock_api.json"),
    "utf-8"
  );
  const apiList: IApiData[] = JSON.parse(jsonString);
  console.log(apiList);
  for (const apiData of apiList) {
    (app as any)[apiData.method](
      apiData.url,
      async (req: Request, res: Response) => {
        if (apiData.body) {
          for (const [k, vd] of Object.entries(apiData.body)) {
            const { type, required, response } = vd as IValidation;
            if ((required && !req.body[k]) || typeof vd !== type) {
              if (response.headers) {
                for (const [hk, hv] of Object.entries(response.headers)) {
                  res.setHeader(hk, hv as string);
                }
              }
              return res
                .status(apiData.response.status || 400)
                .json(apiData.response.body);
            }
          }
        }
        if (apiData.query) {
          for (const [k, vd] of Object.entries(apiData.query)) {
            const { required, response } = vd as IValidation;
            if (required && !req.body[k]) {
              if (response.headers) {
                for (const [hk, hv] of Object.entries(response.headers)) {
                  res.setHeader(hk, hv as string);
                }
              }
              return res
                .status(apiData.response.status || 400)
                .json(apiData.response.body);
            }
          }
        }
        if (apiData.headers) {
          for (const [k, vd] of Object.entries(apiData.headers)) {
            const { required, response } = vd as IValidation;
            if (required && !req.body[k]) {
              if (response.headers) {
                for (const [hk, hv] of Object.entries(response.headers)) {
                  res.setHeader(hk, hv as string);
                }
              }
              return res
                .status(apiData.response.status || 400)
                .json(apiData.response.body);
            }
          }
        }
        if (apiData.response.headers) {
          for (const [k, v] of Object.entries(apiData.response.headers)) {
            res.setHeader(k, v as string);
          }
        }
        res.status(apiData.response.status || 200).json(apiData.response.body);
      }
    );
  }

  app.listen(port, () => console.log(`Server listening on ${port}`));
}

main();
