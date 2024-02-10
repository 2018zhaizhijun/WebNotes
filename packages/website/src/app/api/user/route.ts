export async function GET() {
  const data = {
    name: "John Doe",
    age: 30,
  };

  return Response.json(data);
}
