import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../config/database.js';
import { mapUser } from '../utils/helpers.js';

/**
 * Create JWT tokens for user
 */
const createTokens = (user) => {
  const payload = { id: user.id, email: user.email };
  
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
  
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  
  return { accessToken, refreshToken };
};

/**
 * Send authentication response with tokens
 */
const sendAuthResponse = (res, user) => {
  const tokens = createTokens(user);
  
  // Set refresh token as HTTP-only cookie
  res.cookie(config.cookie.name, tokens.refreshToken, config.cookie.options);
  
  res.json({
    user: mapUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
};

/**
 * Register new user
 */
export const register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      age, 
      gender, 
      height, 
      weight, 
      goal, 
      activityLevel 
    } = req.body;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        age: age ? Number(age) : null,
        gender: gender || null,
        heightCm: height ? Number(height) : null,
        weightKg: weight ? Number(weight) : null,
        goal: goal || null,
        activityLevel: activityLevel || null,
      },
    });

    sendAuthResponse(res, user);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    sendAuthResponse(res, user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

/**
 * Refresh access token
 */
export const refresh = async (req, res) => {
  try {
    const token = req.body?.refreshToken || req.cookies?.[config.cookie.name] || null;
    
    if (!token) {
      return res.status(401).json({ error: 'Missing refresh token' });
    }

    // Verify refresh token
    const payload = jwt.verify(token, config.jwt.refreshSecret);
    
    // Get user
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    sendAuthResponse(res, user);
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

/**
 * Logout user
 */
export const logout = (req, res) => {
  res.clearCookie(config.cookie.name, {
    ...config.cookie.options,
    maxAge: 0,
  });
  res.status(204).send();
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id } 
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(mapUser(user));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, 
      age, 
      gender, 
      heightCm, 
      weightKg, 
      goal, 
      activityLevel, 
      exercisePreferences,
      neckCm,
      waistCm,
      hipCm,
      bicepsCm,
      thighCm
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        age: age !== undefined ? Number(age) : undefined,
        gender,
        heightCm: heightCm !== undefined ? Number(heightCm) : undefined,
        weightKg: weightKg !== undefined ? Number(weightKg) : undefined,
        goal,
        activityLevel,
        exercisePreferences: exercisePreferences !== undefined ? exercisePreferences : undefined,
        neckCm: neckCm !== undefined ? Number(neckCm) : undefined,
        waistCm: waistCm !== undefined ? Number(waistCm) : undefined,
        hipCm: hipCm !== undefined ? Number(hipCm) : undefined,
        bicepsCm: bicepsCm !== undefined ? Number(bicepsCm) : undefined,
        thighCm: thighCm !== undefined ? Number(thighCm) : undefined,
      },
    });

    res.json(mapUser(updated));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

/**
 * Update user measurements
 */
export const updateMeasurements = async (req, res) => {
  try {
    const userId = req.user.id;
    const { neckCm, waistCm, hipCm, bicepsCm, thighCm } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { neckCm, waistCm, hipCm, bicepsCm, thighCm },
    });

    res.json(mapUser(updated));
  } catch (error) {
    console.error('Update measurements error:', error);
    res.status(500).json({ error: 'Failed to update measurements' });
  }
};
