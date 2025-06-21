import { RoleEnum } from "../constants/roleEnum";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: typeof RoleEnum._type;
      };
    }
  }
}
