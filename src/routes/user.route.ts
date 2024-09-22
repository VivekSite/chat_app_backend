import { Router } from "express";
import { getAllUserHandler } from "../controllers/user.controller";

const app = Router({
  mergeParams: true,
})

app.get('/', getAllUserHandler)

export default app;