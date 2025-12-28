import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/config";

interface ContractAcceptance {
  id: string;
  email: string;
  role: string;
  contract_version: string;
  contract_text: string;
  ip_address: string;
  user_agent: string | null;
  accepted_at: string;
}

interface MyAgreementsProps {
  userEmail: string;
}

export default function MyAgreements({ userEmail }: MyAgreementsProps) {
  const [contracts, setContracts] = useState<ContractAcceptance[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedContract, setExpandedContract] = useState<string | null>(null);

  useEffect(() => {
    if (userEmail) {
      fetchContracts();
    }
  }, [userEmail]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/contract-acceptances/user/${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
    setLoading(false);
  };

  const roleColors: Record<string, string> = {
    coach: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    mentor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    investor: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            My Agreements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No signed agreements found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-600" />
          My Agreements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contracts.map((contract) => (
          <div 
            key={contract.id} 
            className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50"
            data-testid={`my-agreement-${contract.id}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={roleColors[contract.role] || "bg-gray-100 text-gray-800"}>
                      {contract.role.charAt(0).toUpperCase() + contract.role.slice(1)} Agreement
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Signed on {new Date(contract.accepted_at).toLocaleDateString()} at {new Date(contract.accepted_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedContract(expandedContract === contract.id ? null : contract.id)}
              >
                {expandedContract === contract.id ? "Hide" : "View"}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Version: {contract.contract_version}</p>
            </div>
            {expandedContract === contract.id && (
              <ScrollArea className="mt-4 h-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                  {contract.contract_text}
                </pre>
              </ScrollArea>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
