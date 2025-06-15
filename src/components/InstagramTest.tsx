import { useState } from "react";
import { Button } from "@/components/ui/button";

const InstagramTest = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testProxyEndpoint = async () => {
    setLoading(true);
    setTestResult("Testing proxy endpoint...");

    try {
      const response = await fetch(
        "/api/instagram/user-feeds2?id=69993321572&count=1",
      );
      const status = response.status;
      const headers = Object.fromEntries(response.headers.entries());

      if (response.ok) {
        const data = await response.text();
        setTestResult(
          `✅ SUCCESS!\nStatus: ${status}\nHeaders: ${JSON.stringify(headers, null, 2)}\nData: ${data.substring(0, 300)}...`,
        );
      } else {
        const errorText = await response.text();
        setTestResult(
          `❌ ERROR!\nStatus: ${status}\nHeaders: ${JSON.stringify(headers, null, 2)}\nError: ${errorText}`,
        );
      }
    } catch (error) {
      setTestResult(
        `❌ FETCH ERROR!\nError: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    setLoading(false);
  };

  const testDirectEndpoint = async () => {
    setLoading(true);
    setTestResult("Testing direct endpoint (should fail)...");

    try {
      const response = await fetch(
        "https://instagram-looter2.p.rapidapi.com/user-feeds2?id=69993321572&count=1",
        {
          headers: {
            "x-rapidapi-key":
              "4dd843cf7emsh2f863ef92f39024p13fe73jsn2bd67e697dcc",
            "x-rapidapi-host": "instagram-looter2.p.rapidapi.com",
          },
        },
      );

      const data = await response.text();
      setTestResult(`Unexpected success: ${data}`);
    } catch (error) {
      setTestResult(
        `Expected CORS error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    setLoading(false);
  };

  return (
    <div className="fixed top-4 right-4 bg-white border rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold mb-2">Instagram API Test</h3>
      <div className="space-y-2 mb-4">
        <Button onClick={testProxyEndpoint} disabled={loading} size="sm">
          Test Proxy Endpoint
        </Button>
        <Button
          onClick={testDirectEndpoint}
          disabled={loading}
          size="sm"
          variant="outline"
        >
          Test Direct (Should Fail)
        </Button>
      </div>
      {testResult && (
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
          {testResult}
        </pre>
      )}
    </div>
  );
};

export default InstagramTest;
