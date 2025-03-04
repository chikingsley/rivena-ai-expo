export async function POST(request: Request) {
  try {
    const data = await request.json();
    return Response.json({
      success: true,
      message: "Test API endpoint working",
      receivedData: data
    });
  } catch (error) {
    return Response.json({
      success: false,
      message: "Error processing request",
      error: String(error)
    }, { status: 500 });
  }
}

export function GET() {
  return Response.json({
    success: true,
    message: "Test API GET endpoint working"
  });
} 