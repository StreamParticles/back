import { Request, Response } from "express";

import * as authenticationProcesses from "#processes/authentication";
import {
  AuthenticatedRequest,
  WithAddressRequestParams,
  WithHerotagRequestParams,
} from "#types_/express";

export const authenticateUser = async (
  req: Request<{}, {}, authenticationProcesses.UserAuthenticationData>,
  res: Response
): Promise<void> => {
  const authData = await authenticationProcesses.authenticateUser(req.body);

  res.send(authData);
};

export const createUserAccount = async (
  req: Request<{}, {}, authenticationProcesses.UserAccountCreationData>,
  res: Response
): Promise<void> => {
  const creationData = await authenticationProcesses.createUserAccount(
    req.body
  );

  res.send(creationData);
};

export const editPassword = async (
  req: Request<{}, {}, authenticationProcesses.UserAccountCreationData>,
  res: Response
): Promise<void> => {
  await authenticationProcesses.editPassword(req.body);

  res.sendStatus(204);
};

export interface DeleteAccountRequest {
  password: string;
  confirmation: string;
}

export const deleteAccount = async (
  req: AuthenticatedRequest<{}, {}, DeleteAccountRequest>,
  res: Response
): Promise<void> => {
  await authenticationProcesses.deleteAccount(
    req.userId as string,
    req.body.password
  );

  res.sendStatus(204);
};

export const isProfileVerified = async (
  req: Request<WithAddressRequestParams>,
  res: Response
): Promise<void> => {
  const isVerified = await authenticationProcesses.isProfileVerified(
    req.params.erdAddress
  );

  res.send(isVerified);
};

export const getVerificationReference = async (
  req: Request<WithAddressRequestParams>,
  res: Response
): Promise<void> => {
  const reference = await authenticationProcesses.getVerificationReference(
    req.params.erdAddress
  );

  res.send(reference);
};

export const isHerotagValid = async (
  req: Request<WithHerotagRequestParams>,
  res: Response
): Promise<void> => {
  const result = await authenticationProcesses.isHerotagValid(
    req.params.herotag
  );

  res.send(result);
};
