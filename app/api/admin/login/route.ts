// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Verify credentials
    if (username !== adminUsername) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // For production, you should hash the password in your env
    // For now, we'll do a simple comparison
    // In production: const isValidPassword = await bcrypt.compare(password, hashedAdminPassword);
    const isValidPassword = password === adminPassword;
    
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    // Set secure cookie
    const response = NextResponse.json({ 
      success: true, 
      token,
      message: 'Login successful' 
    });
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}