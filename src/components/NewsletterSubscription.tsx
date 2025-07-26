import * as React from "react";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";

export default function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setFeedback(null);
    try {
      // Here you would typically save to a newsletter table
      // For now, just show success message
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setFeedback("Thank you for subscribing to our newsletter.");
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
      setFeedback("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  React.useEffect(() => {
    if (feedback && feedbackRef.current) {
      feedbackRef.current.focus();
    }
  }, [feedback]);

  return (
    <div className="bg-white p-6 rounded-lg shadow" role="region" aria-label="Newsletter subscription">
      <h3 className="text-lg font-semibold mb-4" id="newsletter-title">
        Subscribe to Our Newsletter
      </h3>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2"
        aria-labelledby="newsletter-title"
        role="form"
      >
        <input
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          aria-label={isLoading ? "Subscribing" : "Subscribe"}
        >
          {isLoading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {feedback && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          className="mt-3 text-sm text-green-700"
          aria-live="polite"
          role="status"
        >
          {feedback}
        </div>
      )}
    </div>
  );
}
