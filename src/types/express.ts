import { Request } from "express";

export interface AuthenticatedRequest<
  ReqParams = {},
  ReqQuery = {},
  ReqBody = {}
> extends Request<ReqParams, {}, ReqBody, ReqQuery> {
  herotag?: string;
  userId?: string;
}

export const isAuthenticatedRequest = (
  req: Request | AuthenticatedRequest
): req is AuthenticatedRequest => {
  return (
    !!(req as AuthenticatedRequest).herotag &&
    !!(req as AuthenticatedRequest).userId
  );
};

export interface WithHerotagRequestParams {
  herotag: string;
}

export interface WithAddressRequestParams {
  erdAddress: string;
}
