import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Database,
  Server,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export interface TestResult {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  error?: any;
}

export const groupResultsByCategory = (
  results: TestResult[],
): Record<string, TestResult[]> => {
  if (!Array.isArray(results) || results.length === 0) return {};
  const categories: Record<string, TestResult[]> = {
    Database: [],
    API: [],
    Authentication: [],
    "Edge Functions": [],
    "Admin Helpers": [],
    "Data Sync": [],
    "Email Marketing": [],
    Other: [],
  };
  results.forEach((result) => {
    const { name } = result;
    if (name.includes("Database") || name.includes("Table Access"))
      categories.Database.push(result);
    else if (name.includes("API:")) categories.API.push(result);
    else if (name.includes("Authentication"))
      categories.Authentication.push(result);
    else if (name.includes("Edge Function"))
      categories["Edge Functions"].push(result);
    else if (name.includes("Admin Helper"))
      categories["Admin Helpers"].push(result);
    else if (name.includes("Data Sync")) categories["Data Sync"].push(result);
    else if (
      name.includes("Email") ||
      name.includes("Newsletter") ||
      name.includes("Campaign")
    )
      categories["Email Marketing"].push(result);
    else categories.Other.push(result);
  });
  Object.keys(categories).forEach((key) => {
    if (!categories[key].length) delete categories[key];
  });
  return categories;
};

export const getCategoryIconComponent = (category: string): React.ReactNode => {
  switch (category) {
    case "Database":
      return <Database className="h-4 w-4" />;
    case "API":
      return <Server className="h-4 w-4" />;
    case "Authentication":
      return <Shield className="h-4 w-4" />;
    case "Edge Functions":
      return <Zap className="h-4 w-4" />;
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
};

export const isValidTestResult = (result: any): result is TestResult => {
  return (
    result &&
    typeof result === "object" &&
    typeof result.name === "string" &&
    typeof result.status === "string" &&
    ["pass", "fail", "warning"].includes(result.status) &&
    typeof result.message === "string"
  );
};

export const sanitizeTestResults = (results: any[]): TestResult[] => {
  if (!Array.isArray(results)) return [];
  return results.filter(isValidTestResult);
};

// --- Modern AdminDiagnostics Component ---
interface AdminDiagnosticsProps {
  results: TestResult[];
}

const statusColor = {
  pass: "text-green-600 border-green-200 bg-green-50",
  fail: "text-red-600 border-red-200 bg-red-50",
  warning: "text-yellow-700 border-yellow-200 bg-yellow-50",
};

const statusIcon = {
  pass: <CheckCircle className="h-4 w-4 text-green-600" />,
  fail: <XCircle className="h-4 w-4 text-red-600" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-700" />,
};

export const AdminDiagnostics: React.FC<AdminDiagnosticsProps> = ({
  results,
}) => {
  const validResults = sanitizeTestResults(results);
  const grouped = groupResultsByCategory(validResults);
  const summary = validResults.reduce(
    (acc, r) => {
      acc[r.status]++;
      return acc;
    },
    { pass: 0, fail: 0, warning: 0 },
  );
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Diagnostics Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Badge className="bg-green-50 text-green-700 border border-green-200">
            Pass: {summary.pass}
          </Badge>
          <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200">
            Warning: {summary.warning}
          </Badge>
          <Badge className="bg-red-50 text-red-700 border border-red-200">
            Fail: {summary.fail}
          </Badge>
        </CardContent>
      </Card>
      {Object.entries(grouped).map(([category, tests]) => (
        <Collapsible
          key={category}
          open={!!open[category]}
          onOpenChange={(v) => setOpen((o) => ({ ...o, [category]: v }))}
        >
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center gap-2">
                {getCategoryIconComponent(category)}
                <CardTitle className="flex-1">{category}</CardTitle>
                <Badge variant="outline">{tests.length} tests</Badge>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2">
              {tests.map((test, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 border rounded px-2 py-1 ${statusColor[test.status]}`}
                >
                  {statusIcon[test.status]}
                  <span className="font-medium">{test.name}</span>
                  <span className="text-xs">{test.message}</span>
                  {test.error && (
                    <span className="text-xs text-red-500">
                      {String(test.error)}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default AdminDiagnostics;
