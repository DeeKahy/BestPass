import { Http } from "./server/wrapper.ts";
import { getIndex, getLogin, getPasswords } from "./server/routes/get.ts";
import {
  postLogin,
  postLogout,
  postSaveNewPassword,
} from "./server/api/post.ts";

const server = new Http("./bestpass/public");

server
  .addRoute("GET", "/", getIndex)
  .addRoute("GET", "/login", getLogin)
  .addRoute("GET", "/passwords", getPasswords, true)
  .addRoute("POST", "/api/savenewpassword", postSaveNewPassword, true)
  .addRoute("POST", "/api/login", postLogin)
  .addRoute("POST", "/api/logout", postLogout, true)
  .serve();
