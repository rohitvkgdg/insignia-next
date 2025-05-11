import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Video fetch failed: ${response.statusText}`);
    }

    // Get the video's content type and use it in our response
    const contentType = response.headers.get('content-type') || 'video/mp4';
    
    // Stream the video data
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Video streaming error:', error);
    return NextResponse.json(
      { error: 'Failed to stream video' }, 
      { status: 500 }
    );
  }
}