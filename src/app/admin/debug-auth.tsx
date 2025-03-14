"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";

export default function DebugAuth() {
  const { user } = useUser();
  const identity = useQuery(api.users.debugIdentity);
  const [isClient, setIsClient] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fix hydration issues by only rendering on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to create a Clerk JWT template code sample
  const getJwtTemplateExample = () => {
    return `{
  "aud": "convex",
  "user_id": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "name": "{{user.first_name}} {{user.last_name}}",
  
  // This ensures all public metadata is included in JWT claims
  "role": "{{user.public_metadata.role}}",
  "public_metadata": "{{user.public_metadata}}"
}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getJwtTemplateExample());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Don't render during SSR
  if (!isClient) {
    return (
      <Card className="mb-8 bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-700">Auth Debugging Tool</CardTitle>
          <CardDescription>
            Loading authentication information...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-yellow-700">Auth Debugging Tool</CardTitle>
        <CardDescription>
          Diagnose and fix the Clerk JWT integration with Convex
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-md font-semibold flex items-center gap-2">
              {identity?.publicMetadata ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-green-700">JWT Configuration OK</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">
                    JWT Configuration Issue Detected
                  </span>
                </>
              )}
            </h3>

            {!identity?.publicMetadata && (
              <div className="bg-white p-4 rounded-md border border-red-200 text-sm">
                <p className="mb-2 font-medium">
                  Problem: Public metadata is not being passed to Convex
                </p>
                <p className="mb-4">
                  You need to create a JWT template in your Clerk Dashboard that
                  includes the public metadata in the claims.
                </p>

                <div className="bg-gray-100 p-3 rounded-md mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-gray-500">
                      JWT Template Example
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6"
                      onClick={copyToClipboard}
                    >
                      {copySuccess ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Copied
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-600">
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </span>
                      )}
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap text-xs overflow-auto">
                    {getJwtTemplateExample()}
                  </pre>
                </div>

                <h4 className="font-medium mb-2">Steps to fix:</h4>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li>
                    Go to the <strong>Clerk Dashboard</strong> →{" "}
                    <strong>JWT Templates</strong>
                  </li>
                  <li>
                    Create a <strong>New Template</strong> based on Convex
                  </li>
                  <li>
                    Use the JWT template example above (you can copy and paste
                    it)
                  </li>
                  <li>Save the template and restart your application</li>
                </ol>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-md font-semibold mb-2">Current Auth Data:</h3>
            <div className="bg-white p-4 rounded-md border border-gray-200 text-sm">
              <div className="space-y-2">
                <p>
                  <strong>User Email:</strong>{" "}
                  {user?.emailAddresses[0]?.emailAddress || "Not loaded"}
                </p>
                <p>
                  <strong>Clerk public metadata:</strong>{" "}
                  {user?.publicMetadata
                    ? JSON.stringify(user.publicMetadata)
                    : "None"}
                </p>
                <p>
                  <strong>Convex identity:</strong>{" "}
                  {identity ? "Authenticated" : "Not authenticated"}
                </p>
                <p>
                  <strong>Convex public metadata:</strong>{" "}
                  {identity?.publicMetadata
                    ? JSON.stringify(identity.publicMetadata)
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
