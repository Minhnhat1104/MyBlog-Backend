import { NextFunction, Request, Response } from "express";
import i18n from '../i18n';

export function i18nMiddleware(req: Request, res: Response, next: NextFunction) {
const lang =
  req.headers['accept-language']?.split(',')[0] || 'en';

  req.t = i18n.getFixedT(lang);
  next();
}
