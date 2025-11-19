import * as fs from "fs";
import * as path from "path";

export interface Env {
  env: "production" | "development";
  // MySQL Configuration
  mysqlHost: string;
  mysqlPort: string;
  mysqlUser: string;
  mysqlPassword: string;
  mysqlDatabase: string;
  jwt_secret_key: string;
  jwt_refresh_secret_key: string;
  firebase_project_Id: string;
  firebase_client_email: string;
  firebase_private_key: string;
  encryption_key: string;
  google_maps_api_key?: string;
}

let env: Env;

export const getEnv = () => {
  if (env) {
    return env;
  }

  let contents = null;


    const envFilePath =
      process.env.ENV_PATH || path.resolve(__dirname, "../../env/env.json");
    contents = fs.readFileSync(envFilePath);

  // contents = `
  // {
  //   "env": "${process.env.NODE_ENV}", 
  //   "mongoUri": "${process.env.DATABASE_URI}",
  //   "mongoUsername": "${process.env.DATABASE_USERNAME}", 
  //   "mongoPassword": "${process.env.DATABASE_PASSWORD}", 
  //   "mongoHost": "${process.env.DATABASE_HOST}",
  //   "mongoPort": "${process.env.DATABASE_PORT}",
  //   "database": "${process.env.DATABASE}", 
  //   "jwt_secret_key": "${process.env.JWT_SECRET_KEY}", 
  //   "jwt_refresh_secret_key": "${process.env.JWT_REFRESH_SECRET_KEY}",
  //   "firebase_project_Id": "${process.env.FIREBASE_PROJECT_ID}",
  //   "firebase_client_email": "${process.env.FIREBASE_CLIENT_EMAIL}",
  //   "firebase_private_key": "${process.env.FIREBASE_PRIVATE_KEY}",
  //   "encryption_key": "${process.env.ENCRYPTION_KEY}"
  // }
  // `;
  env = JSON.parse(contents.toString());

  return env;
};
