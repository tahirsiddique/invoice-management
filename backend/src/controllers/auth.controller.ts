import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';

export class AuthController {
  static signup = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    const { user, token } = await AuthService.signup({
      email,
      password,
      firstName,
      lastName,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully. Please verify your email.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        token,
      },
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { user, token } = await AuthService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        token,
      },
    });
  });

  static googleCallback = asyncHandler(async (req: Request, res: Response) => {
    // This would be implemented with passport-google-oauth20
    // For now, returning a placeholder
    const { googleId, email, firstName, lastName, avatar } = req.body;

    const { user, token } = await AuthService.googleAuth(
      googleId,
      email,
      firstName,
      lastName,
      avatar
    );

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
    });
  });

  static requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    await AuthService.requestPasswordReset(email);

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    await AuthService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  });

  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    await AuthService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  });

  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    await AuthService.changePassword(userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    // JWT is stateless, so logout is handled on client side
    // Optionally, implement token blacklisting here

    res.json({
      success: true,
      message: 'Logout successful',
    });
  });

  static getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      },
    });
  });
}
