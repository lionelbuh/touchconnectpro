import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/config";

export function TestForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          email: email,
          ideaName: "Test",
          formData: { test: "test data" },
          businessPlan: {},
        }),
      });

      const text = await response.text();
      console.log("Raw response:", text);
      console.log("Status:", response.status);
      console.log("Headers:", Array.from(response.headers.entries()));

      if (!text) {
        setMessage(`✗ Empty response (status: ${response.status})`);
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setMessage(`✗ Invalid response: ${text.substring(0, 200)}`);
        return;
      }

      if (response.ok) {
        setMessage("✓ Saved to Supabase!");
        setEmail("");
        setName("");
        loadIdeas();
      } else {
        setMessage(`✗ Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`✗ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadIdeas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ideas`);
      const data = await response.json();
      setIdeas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load ideas:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Simple Form Test → Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  data-testid="input-test-name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  data-testid="input-test-email"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                data-testid="button-test-submit"
              >
                {loading ? "Submitting..." : "Submit to Supabase"}
              </Button>
            </form>

            {message && (
              <div
                className={`p-3 rounded ${
                  message.includes("✓")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
                data-testid="text-test-message"
              >
                {message}
              </div>
            )}

            <Button onClick={loadIdeas} variant="outline" className="w-full" data-testid="button-refresh">
              Refresh Data
            </Button>
          </CardContent>
        </Card>

        {ideas.length > 0 && (
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Saved Ideas ({ideas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ideas.map((idea) => (
                  <div key={idea.id} className="border rounded p-4 bg-slate-50 dark:bg-slate-700">
                    <p className="font-semibold">{idea.entrepreneur_name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{idea.entrepreneur_email}</p>
                    <p className="text-xs text-slate-500 mt-2">Status: {idea.status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
