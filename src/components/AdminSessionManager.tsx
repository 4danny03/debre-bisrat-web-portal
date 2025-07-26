import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface AdminSessionManagerProps {
  children: React.ReactNode;
  ariaLabel?: string;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export default function AdminSessionManager(props: AdminSessionManagerProps) {
  const { children, ariaLabel } = props;
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let activityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetTimers = () => {
      lastActivity = Date.now();
      clearTimeout(activityTimer);
      clearTimeout(warningTimer);
      clearTimeout(countdownTimer);
      setShowWarning(false);

      // Set warning timer
      warningTimer = setTimeout(() => {
        setShowWarning(true);
        setTimeLeft(WARNING_TIME);
        countdownTimer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1000) {
              handleSessionTimeout();
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);
      }, SESSION_TIMEOUT - WARNING_TIME);

      // Set session timeout
      activityTimer = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
    };

    const handleSessionTimeout = async () => {
      try {
        await supabase.auth.signOut();
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate("/admin/login");
      } catch (error) {
        console.error("Error during session timeout:", error);
      }
    };

    const handleActivity = () => {
      if (Date.now() - lastActivity > 60000) {
        // Only reset if more than 1 minute since last activity
        resetTimers();
      }
    };

    // Track user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timers
    resetTimers();

    return () => {
      clearTimeout(activityTimer);
      clearTimeout(warningTimer);
      clearTimeout(countdownTimer);
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [navigate, toast]);

  const handleExtendSession = () => {
    setShowWarning(false);
    // Reset timers by triggering activity
    document.dispatchEvent(new Event("mousedown"));
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {children}

      <Dialog open={showWarning} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="admin-session-title"
          aria-describedby="admin-session-desc"
          aria-label={ariaLabel || "Session expiring soon"}
          tabIndex={-1}
        >
          <DialogHeader>
            <DialogTitle id="admin-session-title" className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-orange-500" />
              Session Expiring Soon
            </DialogTitle>
            <DialogDescription id="admin-session-desc">
              <span aria-live="polite">
                Your admin session will expire in {formatTime(timeLeft)}. Would you like to extend your session?
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full sm:w-auto"
              aria-label="Logout now"
            >
              Logout Now
            </Button>
            <Button
              onClick={handleExtendSession}
              className="w-full sm:w-auto bg-church-burgundy hover:bg-church-burgundy/90"
              aria-label="Extend session"
            >
              Extend Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
