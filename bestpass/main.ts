import { Http } from "./server/wrapper.ts";
import { getIndex, getLogin, getPasswords } from "./server/routes/get.ts";
import {
  postLogin,
  postLogout,
  postSaveNewPassword,
  postSubmitReview,
} from "./server/api/post.ts";

const server = new Http("./bestpass/public");

server
  .addRoute("GET", "/", getIndex, false)
  .addRoute("GET", "/login", getLogin, false)
  .addRoute("GET", "/passwords", getPasswords)
  .addRoute("POST", "/api/savenewpassword", postSaveNewPassword)
  .addRoute("POST", "/api/login", postLogin, false)
  .addRoute("POST", "/api/logout", postLogout)
  .serve();
