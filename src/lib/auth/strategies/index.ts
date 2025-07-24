import { authService } from "../AuthService";
import { EmailPasswordStrategy } from "./EmailPasswordStrategy";

// Register all authentication strategies
export function registerAuthStrategies() {
  // Register email/password strategy
  authService.registerStrategy("emailPassword", new EmailPasswordStrategy());

  // Additional strategies can be registered here
  // authService.registerStrategy("google", new GoogleAuthStrategy());
  // authService.registerStrategy("facebook", new FacebookAuthStrategy());
}

// Initialize strategies
registerAuthStrategies();

// Export strategies for direct use
export { EmailPasswordStrategy } from "./EmailPasswordStrategy";
