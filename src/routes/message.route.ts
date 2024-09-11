import { Router } from "express";
import { createMessageHandler } from './../controllers/message.controller'

const app = Router({
  mergeParams: true
});

app.post('/', createMessageHandler)

export default app;