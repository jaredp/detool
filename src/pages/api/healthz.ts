import type { NextApiRequest, NextApiResponse } from "next/types";

export default function healthzHandler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const healthReport = {
    message: "OK",
    timestamp: Date.now(),
    uptime: process.uptime(),
  };
  try {
    res.status(200).json(healthReport);
  } catch (error) {
    healthReport.message = (error as string).toString();
    res.status(503).json(healthReport);
  }
}
