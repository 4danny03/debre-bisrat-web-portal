      "Admin Helpers": [],
      "Data Sync": [],
      "Email Marketing": [],
      Other: [],
    };

    results.forEach((result) => {
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
      if (categories[key].length === 0) {
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

  return {
    groupResultsByCategory,
    getCategoryIcon,
  };