"use client";

import { AuthCard } from "@daveyplate/better-auth-ui";
import { useEffect, useState } from "react";

interface CustomAuthCardProps {
  pathname?: string;
  view?: "signIn" | "signUp" | "magicLink" | "forgotPassword" | "resetPassword" | "settings" | "signOut";
  redirectTo?: string;
  className?: string;
}

export function CustomAuthCard({
  pathname,
  view,
  redirectTo,
  className,
}: CustomAuthCardProps) {
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  
  // Only run on client side
  useEffect(() => {
    setMounted(true);
    
    // Add event listener to capture password input changes
    const handlePasswordInput = () => {
      const passwordInput = document.querySelector('input[type="password"][name="password"]')!;
      if (passwordInput) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              setPassword((passwordInput as HTMLInputElement).value);
            }
          });
        });
        
        observer.observe(passwordInput, { attributes: true });
        
        // Also add direct event listener
        passwordInput.addEventListener('input', (e) => {
          setPassword((e.target as HTMLInputElement).value);
        });
        
        return () => {
          observer.disconnect();
          passwordInput.removeEventListener('input', (e) => {
            setPassword((e.target as HTMLInputElement).value);
          });
        };
      }
    };
    
    // Check for password field after a short delay to ensure the form is rendered
    const timer = setTimeout(handlePasswordInput, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Function to inject the password strength indicator
  useEffect(() => {
    if (!mounted) return;
    
    const injectPasswordStrengthIndicator = () => {
      // Only inject on signup form
      if (pathname !== 'sign-up' && view !== 'signUp') return;
      
      const passwordInput = document.querySelector('input[type="password"][name="password"]');
      if (!passwordInput) return;
      
      // Check if indicator container already exists
      const existingContainer = document.getElementById('password-strength-container');
      if (existingContainer) return;
      
      // Create container for the password strength indicator
      const container = document.createElement('div');
      container.id = 'password-strength-container';
      
      // Insert after the password input's parent form item
      const formItem = passwordInput.closest('.form-item') ?? passwordInput.parentElement;
      if (formItem?.parentElement) {
        formItem.parentElement.insertBefore(container, formItem.nextSibling);
      }
    };
    
    // Run injection after a short delay to ensure the form is fully rendered
    const timer = setTimeout(injectPasswordStrengthIndicator, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [mounted, pathname, view]);
  
  // Render the password strength indicator in a portal
  useEffect(() => {
    if (!mounted) return;
    
    const renderPasswordStrengthIndicator = () => {
      const container = document.getElementById('password-strength-container');
      if (!container) return;
      
      // Only show on signup form and when password has value
      if ((pathname !== 'sign-up' && view !== 'signUp') || !password) {
        container.innerHTML = '';
        return;
      }
      
      // Create a div for the indicator
      const indicatorDiv = document.createElement('div');
      indicatorDiv.className = 'mt-2';
      container.innerHTML = '';
      container.appendChild(indicatorDiv);
      
      // Render the password strength indicator
      const root = document.createElement('div');
      root.className = 'password-strength-indicator';
      indicatorDiv.appendChild(root);
      
      // We can't use React.createPortal here, so we'll manually create the HTML
      root.innerHTML = `
        <div class="space-y-3">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span>Password Strength:</span>
              <span class="font-medium ${getStrengthTextClass(password)}">
                ${getStrengthText(password)}
              </span>
            </div>
            <div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full transition-all duration-300 ${getStrengthColor(password)}"
                style="width: ${getStrengthPercentage(password)}%"
              ></div>
            </div>
          </div>
          
          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-700">Requirements:</p>
            <div class="grid grid-cols-1 gap-1 text-xs">
              ${getRequirementsHTML(password)}
            </div>
          </div>
        </div>
      `;
    };
    
    // Run rendering whenever password changes
    renderPasswordStrengthIndicator();
    
    // Also set up an interval to check periodically
    const interval = setInterval(renderPasswordStrengthIndicator, 500);
    
    return () => {
      clearInterval(interval);
    };
  }, [mounted, pathname, view, password]);
  
  return (
    <AuthCard
      pathname={pathname}
      view={view}
      redirectTo={redirectTo}
      className={className}
    />
  );
}

// Helper functions to calculate password strength
function getRequirements(password: string) {
  const checks = [
    {
      label: "At least 8 characters",
      met: password.length >= 8,
    },
    {
      label: "Contains uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Contains lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "Contains number",
      met: /\d/.test(password),
    },
    {
      label: "Contains special character",
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
    {
      label: "No sequential characters (123, abc)",
      met: !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password),
    },
    {
      label: "No repeated characters (aaa, 111)",
      met: !/(.)\1{2,}/.test(password),
    },
  ];
  
  const commonPasswords = [
    "password", "123456", "123456789", "12345678", "12345", "1234567", "password123",
    "admin", "qwerty", "abc123", "Password1", "welcome", "login", "passw0rd",
    "master", "hello", "guest", "root", "test", "user", "default", "changeme"
  ];
  
  checks.push({
    label: "Not a common password",
    met: !commonPasswords.includes(password.toLowerCase()),
  });
  
  return checks;
}

function getStrengthPercentage(password: string) {
  if (!password) return 0;
  const requirements = getRequirements(password);
  const metCount = requirements.filter(req => req.met).length;
  return (metCount / requirements.length) * 100;
}

function getStrengthColor(password: string) {
  if (!password) return "bg-red-500";
  const strength = getStrengthPercentage(password) / 100;
  if (strength < 0.3) return "bg-red-500";
  if (strength < 0.6) return "bg-yellow-500";
  if (strength < 0.8) return "bg-blue-500";
  return "bg-green-500";
}

function getStrengthText(password: string) {
  if (!password) return "Weak";
  const strength = getStrengthPercentage(password) / 100;
  if (strength < 0.3) return "Weak";
  if (strength < 0.6) return "Fair";
  if (strength < 0.8) return "Good";
  return "Strong";
}

function getStrengthTextClass(password: string) {
  if (!password) return "text-red-600";
  const strength = getStrengthPercentage(password) / 100;
  if (strength < 0.3) return "text-red-600";
  if (strength < 0.6) return "text-yellow-600";
  if (strength < 0.8) return "text-blue-600";
  return "text-green-600";
}

function getRequirementsHTML(password: string) {
  const requirements = getRequirements(password);
  return requirements.map((req) => `
    <div class="flex items-center gap-2">
      ${req.met 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>' 
        : '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-red-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      }
      <span class="${req.met ? "text-green-700" : "text-gray-600"}">
        ${req.label}
      </span>
    </div>
  `).join('');
}