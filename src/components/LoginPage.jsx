import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("This email is already registered.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        position: position,
        email: user.email,
        lastLogin: new Date().toISOString(),
        status: "Active",
      });

      alert("User registered successfully");
      navigate("/admin");
    } catch (error) {
      alert("Error registering user: " + error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.status === "Blocked") {
          alert("Your account is blocked. Please contact the admin.");
          await signOut(auth);
          return;
        } else {
          alert("Logged in successfully");
          navigate("/admin");
        }
      } else {
        alert("User data not found.");
      }
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6">
          {isRegistering ? "Register" : "Login"}
        </h2>

        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          {isRegistering && (
            <>
              <div className="mb-4">
                <label htmlFor="Name">Name</label>
                <input
                  type="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <label htmlFor="position">Position</label>
                <input
                  type="position"
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </>
          )}

          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md"
          >
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}
          <button
            className="text-blue-500 ml-2"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
