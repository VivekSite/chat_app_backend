import { Router } from "express";
import { createConversationHandler, getConversationHandler } from "../controllers";
import { ValidateCreateConversation } from "../middlewares/conversation.middleware";

const app = Router({
	mergeParams: true
});

app.post("/", ValidateCreateConversation, createConversationHandler);
app.get("/:userId", getConversationHandler);

export default app;
