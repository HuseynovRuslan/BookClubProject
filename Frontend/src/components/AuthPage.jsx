import React, { useState } from "react";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";

export default function AuthPage() {
  const [showSignUp, setShowSignUp] = useState(false);

  return showSignUp ? (
    <SignUpPage onSwitchToSignIn={() => setShowSignUp(false)} />
  ) : (
    <LoginPage onSwitchToSignUp={() => setShowSignUp(true)} />
  );
}
