import { Http } from "./server/wrapper.ts";
import { getIndex, getLogin, getPasswords, getAdmin } from "./server/routes/get.ts";
import {
  postLogin,
  postLogout,
  postSaveNewPassword,
  postSubmitReview,
  postCreateUser,
} from "./server/api/post.ts";

const server = new Http("./bestpass/public");

server
  .addRoute("GET", "/", getIndex)
  .addRoute("GET", "/login", getLogin)
  .addRoute("GET", "/passwords", getPasswords, true)
  .addRoute("GET", "/admin", getAdmin, true)
  .addRoute("POST", "/api/savenewpassword", postSaveNewPassword, true)
  .addRoute("POST", "/api/login", postLogin)
  .addRoute("POST", "/api/logout", postLogout, true)
  .addRoute("POST", "/api/submitreview", postSubmitReview, true)
  .addRoute("POST", "/api/admin/createuser", postCreateUser, true)
  .serve();
