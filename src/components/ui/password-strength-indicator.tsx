"use client";

import { Check, X } from "lucide-react";
import { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const requirements = useMemo(() => {
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
  }, [password]);

  const metCount = requirements.filter(req => req.met).length;
  const strength = metCount / requirements.length;
  
  const getStrengthColor = () => {
    if (strength < 0.3) return "bg-red-500";
    if (strength < 0.6) return "bg-yellow-500";
    if (strength < 0.8) return "bg-blue-500";
    return "bg-green-500";
  };
  
  const getStrengthText = () => {
    if (strength < 0.3) return "Weak";
    if (strength < 0.6) return "Fair";
    if (strength < 0.8) return "Good";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Password Strength:</span>
          <span className={`font-medium ${
            strength < 0.3 ? "text-red-600" :
            strength < 0.6 ? "text-yellow-600" :
            strength < 0.8 ? "text-blue-600" :
            "text-green-600"
          }`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">Requirements:</p>
        <div className="grid grid-cols-1 gap-1 text-xs">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              {req.met ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <X className="h-3 w-3 text-red-500" />
              )}
              <span className={req.met ? "text-green-700" : "text-gray-600"}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}