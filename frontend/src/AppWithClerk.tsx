import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { LogIn } from "lucide-react";
import App from "./App";

export function AppWithClerk() {
  const { user, isSignedIn } = useUser();

  const authSlot = (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors">
            <LogIn size={15} />
            Sign in
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
      </SignedIn>
    </>
  );

  const signInSlot = (
    <SignInButton mode="modal">
      <button className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 border border-blue-900 hover:border-blue-700 px-3 py-1.5 rounded-lg transition-colors">
        <LogIn size={13} />
        Sign in to sync history across devices
      </button>
    </SignInButton>
  );

  return (
    <App
      authSlot={authSlot}
      signInSlot={signInSlot}
      userId={user?.id ?? null}
      isSignedIn={!!isSignedIn}
    />
  );
}
