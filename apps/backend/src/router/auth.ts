import { Request, Response, Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { COOKIE_MAX_AGE } from '../consts';

const router = Router();

const CLIENT_URL = process.env.AUTH_REDIRECT_URL ?? 'http://localhost:5173/game/random';
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

interface userJwtClaims {
  userId: string;
  name: string;
}

interface UserDetails {
  id: string;
  token?: string;
  name: string;
  isGuest?: boolean;

}

// Guest Login
router.post('/guest', async(req: Request, res:Response) => {
  const bodyData = req.body
  let guestUUID = 'guest-' + uuidv4()

  const user = await db.user.create({
    data: {
      username: guestUUID,
      email: guestUUID + '@chess100x.com',
      name: bodyData.name || guestUUID,
      provider: 'GUEST'
    }
  })

  const token = jwt.sign(
    {userId: user.id, name: user.name, isGuest: true},
    JWT_SECRET
  );

  const UserDetails: UserDetails = {
    id: user.id,
    name: user.name!,
    token: token,
    isGuest: true
  };

  res.cookie('guest', token, { maxAge: COOKIE_MAX_AGE });
  res.json(UserDetails);

})

// Refresh route — renews JWT from session/cookie
router.get('/refresh', async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as UserDetails;

    const userDb = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    const token = jwt.sign({ userId: user.id, name: userDb?.name }, JWT_SECRET);
    res.json({
      token,
      id: user.id,
      name: userDb?.name,
    });
  } else if(req.cookies && req.cookies.guest){

    const decoded = jwt.verify(req.cookies.guest, JWT_SECRET) as userJwtClaims;
    const token = jwt.sign(
      {userId: decoded.userId, name: decoded.name, isGuest: true },
      JWT_SECRET,
    )

    let User: UserDetails = {
      id: decoded.userId,
      name: decoded.name,
      token: token,
      isGuest: true,
    };
    res.cookie('guest', token, { maxAge: COOKIE_MAX_AGE });
    res.json(User);

  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

// Login failed fallback
router.get('/login/failed', (_req: Request, res: Response) => {
  res.status(401).json({ success: false, message: 'failure' });
});

// Logout route
router.get('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      res.status(500).json({ error: 'Failed to log out' });
    } else {
      res.clearCookie('jwt');
      res.redirect('http://localhost:5173/');
    }
  });
});

// GitHub auth route
router.get(
  '/github',
  passport.authenticate('github', { scope: ['read:user', 'user:email'] }),
  (req,res)=>{
    console.log("Inside ", req)
  }
);

// GitHub callback
router.get(
  '/github/callback',
  passport.authenticate('github', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/login/failed',
  }),
  (req, res)=>{
    console.log('✅ GitHub callback route hit. User:', req.user);

  }
);

export default router;
