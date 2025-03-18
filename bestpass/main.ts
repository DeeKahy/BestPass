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
  .addRoute("GET", "/", getIndex, false)
  .addRoute("GET", "/login", getLogin, false)
  .addRoute("GET", "/passwords", getPasswords)
  .addRoute("GET", "/admin", getAdmin)
  .addRoute("POST", "/api/savenewpassword", postSaveNewPassword)
  .addRoute("POST", "/api/login", postLogin)
  .addRoute("POST", "/api/logout", postLogout)
  .addRoute("POST", "/api/submitreview", postSubmitReview)
  .addRoute("POST", "/api/admin/createuser", postCreateUser)
  .serve();
