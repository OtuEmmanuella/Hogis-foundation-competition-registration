// app/api/admin/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get the admin token from cookies
    const adminToken = request.cookies.get('admin-token')?.value;
    
    if (!adminToken) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }
    
    // Verify the JWT token
    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
    
    try {
      const decoded = jwt.verify(adminToken, secret) as any;
      
      // Check if the token contains admin role
      if (decoded.role !== 'admin') {
        return NextResponse.json(
          { message: 'Invalid token role' },
          { status: 401 }
        );
      }
      
      // Token is valid
      return NextResponse.json({
        success: true,
        user: {
          username: decoded.username,
          role: decoded.role
        }
      });
      
    } catch (jwtError) {
      // Token is invalid or expired
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}