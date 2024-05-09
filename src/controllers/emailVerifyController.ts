import { Request, Response } from "express";
import axios from "axios";
import download from "download";
import csvtojson from "csvtojson";
import fs from "fs";

type ApolloJSON = {
  Name: string;
  LinkedinURL: string;
  Title: string;
  CompanyName: string;
  Email: string;
  Phone: string;
  Location: string;
};

type ReoonJSON = {
  name: string;
  emails: string[];
  key: string;
};

export const bulkEmailVerify = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, url } = req.body;
  const reoonEndpoint =
    "https://emailverifier.reoon.com/api/v1/create-bulk-verification-task/";
  let reoonJson: ReoonJSON = {
    name: name,
    key: process.env.REOON_API_KEY as string,
    emails: [],
  };

  try {
    fs.writeFileSync(`./downloads/${name}.csv`, await download(url));

    const apolloJson: ApolloJSON[] = await csvtojson().fromFile(
      `./downloads/${name}.csv`,
    );

    apolloJson.map((json) => {
      reoonJson.emails.push(json["Email"]);
    });

    const submitTaskRes = await axios.post(reoonEndpoint, reoonJson);

    if (submitTaskRes && submitTaskRes.status === 201) {
      res.status(200).json({
        ...submitTaskRes.data,
        apiKey: process.env.REOON_API_KEY,
        leads: JSON.stringify(apolloJson),
      });
    } else {
      res.status(400).json({ msg: "Bad Request" });
    }
  } catch (error: any) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const checkTaskStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { task_id } = req.query;

  const getStatusTaskReoon = async () => {
    const resp = await axios.get(
      `https://emailverifier.reoon.com/api/v1/get-result-bulk-verification-task/?key=${process.env.REOON_API_KEY}&task_id=${task_id}`,
    );

    if (resp.data.status === "completed") {
      let reformatResult = [];

      for (const [_, val] of Object.entries(resp.data.results)) {
        const data: any = val;
        reformatResult.push({
          email: data.email,
          overall_score: data.overall_score,
          status: data.status,
        });
      }
      stopInterval();
      res.status(200).json(JSON.stringify(reformatResult));
    }
  };

  const timerId = setInterval(getStatusTaskReoon, 5000);

  function stopInterval() {
    clearInterval(timerId);
  }
};
