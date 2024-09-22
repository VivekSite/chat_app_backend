import { Router } from "express";
import { createConversationHandler, getConversationHandler } from "../controllers";
import { ValidateCreateConversation } from "../middlewares/conversation.middleware";
import messageRoutes from './message.route'

const app = Router({
  mergeParams: true
});

app.post("/", ValidateCreateConversation, createConversationHandler)
app.post("/:userId", getConversationHandler)
app.use("/:conversationId", messageRoutes)

export default app;