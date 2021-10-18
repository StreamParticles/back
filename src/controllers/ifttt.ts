import { IftttConfig } from "@streamparticles/lib";
import { Response } from "express";

import * as userProcesses from "#processes/user";
import { AuthenticatedRequest } from "#types_/express";

export interface UpdateIftttRequestBody {
  ifttt: IftttConfig;
}

export const updateIftttParticleData = async (
  req: AuthenticatedRequest<{}, {}, UpdateIftttRequestBody>,
  res: Response
): Promise<void> => {
  await userProcesses.updateIftttParticleData(
    req.userId as string,
    req.body.ifttt
  );

  res.sendStatus(204);
};

export interface ToggleIftttRequestBody {
  isActive: boolean;
}

export const toggleIftttParticle = async (
  req: AuthenticatedRequest<{}, {}, ToggleIftttRequestBody>,
  res: Response
): Promise<void> => {
  await userProcesses.toggleIftttParticle(
    req.userId as string,
    req.body.isActive
  );

  res.sendStatus(204);
};
