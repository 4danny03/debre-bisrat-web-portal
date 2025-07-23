import { useState, useEffect } from "react";
import { ErrorHandler } from "@/utils/errorHandling";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Database,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import { adminTestSuite, runAdminTests } from "@/utils/adminTestSuite";
import { useToast } from "@/components/ui/use-toast";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  error?: any;
}

interface DiagnosticsProps {
  autoRun?: boolean;
  showDetails?: boolean;
}

export default function AdminDiagnostics({
  autoRun = false,
  showDetails = true,
}: DiagnosticsProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const { toast } = useToast();

  useEffect(() => {
    if (autoRun) {
      runDiagnostics();
    }
  }, [autoRun]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const testResults = await runAdminTests();

      clearInterval(progressInterval);
      setProgress(100);
      setResults(testResults);

      const summary = adminTestSuite.getTestSummary();

      if (summary.failed > 0) {
        toast({
          title: "Diagnostics Complete",
          description: `${summary.failed} tests failed, ${summary.warnings} warnings`,
          variant: "destructive",
        });
      } else if (summary.warnings > 0) {
        toast({
          title: "Diagnostics Complete",
          description: `All tests passed with ${summary.warnings} warnings`,
        });
      } else {
        toast({
          title: "Diagnostics Complete",
          description: "All tests passed successfully!",
        });
      }
    } catch (error) {
      console.error("Diagnostics failed:", error);
      toast({
        title: "Diagnostics Failed",
        description: "Failed to run diagnostics",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: {
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      },
      fail: { variant: "destructive" as const, className: "" },
      warning: {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800",
      },
    };

    const config =
      variants[status as keyof typeof variants] || variants.warning;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const groupResultsByCategory = (results: TestResult[]) => {
    if (!Array.isArray(results) || results.length === 0) {
      console.warn("groupResultsByCategory: results is not a valid array");
      return {};
    }

    const safeResults = results.filter(
      (result) => result && typeof result === "object",
    );
    if (safeResults.length === 0) {
      console.warn("groupResultsByCategory: no valid results to categorize");
      return {};
    }

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

    safeResults.forEach((result) => {
      if (!result || typeof result.name !== "string") {
        console.warn("Invalid result object:", result);
        return;
      }

      if (
        result.name.includes("Database") ||
        result.name.includes("Table Access")
      ) {
        categories["Database"].push(result);
      } else if (result.name.includes("API:")) {
        categories["API"].push(result);
      } else if (result.name.includes("Authentication")) {
        categories["Authentication"].push(result);
      } else if (result.name.includes("Edge Function")) {
        categories["Edge Functions"].push(result);
      } else if (result.name.includes("Admin Helper")) {
        categories["Admin Helpers"].push(result);
      } else if (result.name.includes("Data Sync")) {
        categories["Data Sync"].push(result);
      } else if (
        result.name.includes("Email") ||
        result.name.includes("Newsletter") ||
        result.name.includes("Campaign")
      ) {
        categories["Email Marketing"].push(result);
      } else {
        categories["Other"].push(result);
      }
    });

    // Remove empty categories
    Object.keys(categories).forEach((key) => {
      if (!Array.isArray(categories[key]) || categories[key].length === 0) {
        delete categories[key];
      }
    });

    return categories;
  };

  const getCategoryIcon = (category: string) => {
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

  const summary =
    (results?.length || 0) > 0 ? adminTestSuite.getTestSummary() : null;
  const categorizedResults = groupResultsByCategory(results);

  return (
    <div className="space-y-4 bg-white min-h-screen p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Admin Panel Diagnostics
            </span>
            <Button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="bg-church-burgundy hover:bg-church-burgundy/90"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "Running..." : "Run Diagnostics"}
            </Button>
          </CardTitle>
          <CardDescription>
            Comprehensive health check for all admin panel components
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running diagnostics...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {summary && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {summary.total}
                </div>
                <div className="text-sm text-gray-500">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {summary.passed}
                </div>
                <div className="text-sm text-gray-500">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {summary.failed}
                </div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {summary.warnings}
                </div>
                <div className="text-sm text-gray-500">Warnings</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showDetails && Object.keys(categorizedResults).length > 0 && (
        <div className="space-y-4">
          {Object.entries(categorizedResults).map(
            ([category, categoryResults]) => {
              if (!Array.isArray(categoryResults)) {
                console.warn(
                  `Category ${category} results is not an array:`,
                  categoryResults,
                );
                return null;
              }

              const safeResults = Array.isArray(categoryResults)
                ? categoryResults
                : [];
              const categoryStatus = safeResults.some(
                (r) => r && r.status === "fail",
              )
                ? "fail"
                : safeResults.some((r) => r && r.status === "warning")
                  ? "warning"
                  : "pass";

              return (
                <Card key={category}>
                  <Collapsible
                    open={expandedSections.has(category)}
                    onOpenChange={() => toggleSection(category)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50">
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center">
                            {getCategoryIcon(category)}
                            <span className="ml-2">{category}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              (
                              {Array.isArray(categoryResults)
                                ? categoryResults.length
                                : 0}{" "}
                              tests)
                            </span>
                          </span>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(categoryStatus)}
                            {expandedSections.has(category) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-2">
                          {(categoryResults || []).map((result, index) => {
                            if (!result) {
                              console.warn(`Invalid result at index ${index}`);
                              return null;
                            }

                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  {getStatusIcon(result.status)}
                                  <div>
                                    <div className="font-medium">
                                      {result.name || "Unknown Test"}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {result.message || "No message"}
                                    </div>
                                    {result.error && (
                                      <div className="text-xs text-red-600 mt-1">
                                        Error:{" "}
                                        {result.error.message ||
                                          String(result.error)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {getStatusBadge(result.status)}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            },
          )}
        </div>
      )}

      {(results?.length || 0) === 0 && !isRunning && (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No diagnostics run yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Run Diagnostics" to check admin panel health
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
