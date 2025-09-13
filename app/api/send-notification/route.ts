// app/api/send-notification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendAcceptanceEmail, sendRejectionEmail } from '@/lib/email-real'; // Changed to real implementation

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received notification email request');
    
    const body = await request.json();
    const { email, name, status, reason } = body;
    
    // Validate input
    if (!email || !name || !status) {
      console.error('❌ Missing required fields in notification request');
      return NextResponse.json(
        { error: 'Email, name, and status are required' },
        { status: 400 }
      );
    }
    
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      console.error('❌ Invalid status in notification request:', status);
      return NextResponse.json(
        { error: 'Status must be either ACCEPTED or REJECTED' },
        { status: 400 }
      );
    }
    
    console.log(`📧 Processing REAL ${status} notification for: ${name} (${email})`);
    
    let result;
    
    if (status === 'ACCEPTED') {
      result = await sendAcceptanceEmail(email, name);
    } else if (status === 'REJECTED') {
      result = await sendRejectionEmail(email, name, reason);
    }
    
    console.log(`✅ REAL ${status} notification sent successfully:`, result?.messageId);
    
    return NextResponse.json({ 
      success: true, 
      messageId: result?.messageId,
      message: `${status} notification sent successfully`
    });
    
  } catch (error) {
    console.error('❌ Error in send-notification route:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send notification email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}