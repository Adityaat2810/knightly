const GithubStrategy = require('passport-github2').Strategy;
import passport from 'passport';
import dotenv from 'dotenv';
import { db } from './db';

interface GithubEmailRes {
  email: string;
  primary: boolean;
  verified: boolean;
  visiblity: 'private' | 'public'
}

dotenv.config()

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

export function initPassport(){
  console.log("clientId",GITHUB_CLIENT_ID, "client secret", GITHUB_CLIENT_SECRET)
  if(!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET){
    throw new Error(
      'Missing env variable for authentication provider'
    )
  }

  passport.use(
    new GithubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: '/auth/github/callback',
      },
      async function (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void,
      ) {
        const res = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        });
        const data: GithubEmailRes[] = await res.json();
        const primaryEmail = data.find((item) => item.primary === true);
        
        const user = await db.user.upsert({
          create: {
            email: primaryEmail!.email,
            name: profile.displayName,
            provider: 'GITHUB',
          },
          update: {
            name: profile.displayName,
          },
          where: {
            email: primaryEmail?.email,
          },
        });

        console.log('user is ', user, 'saved')

        done(null, user);
      },
    ),
  );

  passport.serializeUser(function (user: any, cb) {
    process.nextTick(function () {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture,
      });
    });
  });

  passport.deserializeUser(function (user: any, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });


}
