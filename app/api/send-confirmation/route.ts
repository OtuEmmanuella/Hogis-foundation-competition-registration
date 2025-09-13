// app/api/send-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/lib/email-real'; // Changed to real implementation

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received confirmation email request');
    
    const body = await request.json();
    const { email, name } = body;
    
    // Validate input
    if (!email || !name) {
      console.error('❌ Missing email or name in request');
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }
    
    console.log(`📧 Processing REAL confirmation email for: ${name} (${email})`);
    
    // Send confirmation email using REAL implementation
    const result = await sendConfirmationEmail(email, name);
    
    console.log('✅ Confirmation email sent successfully:', result.messageId);
    
    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      message: 'Confirmation email sent successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in send-confirmation route:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send confirmation email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}