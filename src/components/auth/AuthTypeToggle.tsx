
interface AuthTypeToggleProps {
  authType: "signin" | "signup";
  onToggle: (type: "signin" | "signup") => void;
}

const AuthTypeToggle = ({ authType, onToggle }: AuthTypeToggleProps) => {
  return (
    <div className="text-center text-sm mt-2">
      {authType === "signin" ? (
        <p>
          Don't have an account?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline font-medium"
            onClick={() => onToggle("signup")}
          >
            Sign up
          </button>
        </p>
      ) : (
        <p>
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline font-medium"
            onClick={() => onToggle("signin")}
          >
            Sign in
          </button>
        </p>
      )}
    </div>
  );
};

export default AuthTypeToggle;
