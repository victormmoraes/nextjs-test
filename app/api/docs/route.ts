import { NextRequest, NextResponse } from "next/server";
import { openApiSpec } from "@/lib/swagger/openapi";

const DOCS_USERNAME = process.env.DOCS_USERNAME || "admin";
const DOCS_PASSWORD = process.env.DOCS_PASSWORD || "docs123";

function checkBasicAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  const base64Credentials = authHeader.substring(6);
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [username, password] = credentials.split(":");

  return username === DOCS_USERNAME && password === DOCS_PASSWORD;
}

function unauthorizedResponse(): NextResponse {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="API Documentation"',
    },
  });
}

export async function GET(request: NextRequest) {
  if (!checkBasicAuth(request)) {
    return unauthorizedResponse();
  }

  return NextResponse.json(openApiSpec);
}
