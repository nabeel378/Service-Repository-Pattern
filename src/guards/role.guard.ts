import { NextFunction, RequestHandler } from "express";

export const checkRole = (role: string | string[]): RequestHandler | RequestHandler => (
  req: any,
  res: any,
  next: NextFunction
) => {
  if (Array.isArray(role)) {
    let isAllowed = false
    for (let index = 0; index < role.length; index++) {
      if (req[role[index].toLowerCase()]) {
        isAllowed = true
      }
    }
    if(isAllowed){
      next()
      return
    }

  } else {
    if (req[role.toLowerCase()]) {
      next()
      return

    }
  }
  return res.status(401).send({ isSuccess: false, isError: true, isServerError: false, statusCode: 401, message: "you don't have permission to access" });

};