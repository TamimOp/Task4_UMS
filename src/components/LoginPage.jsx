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
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore"; // Fixed import

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
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      let userDoc = null;

      // Check if user was marked as "Deleted"
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email === email && userData.status === "Deleted") {
          userDoc = doc;
        }
      });

      if (userDoc) {
        // Reactivate the deleted user
        await updateDoc(doc(db, "users", userDoc.id), { status: "Active" });
        alert("Your account has been reactivated!");
      } else {
        // Proceed with normal registration
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
      }

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

      // Check if the user is blocked or deleted
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.status === "Blocked") {
          alert("Your account is blocked.");
          await signOut(auth);
          return;
        } else if (userData.status === "Deleted") {
          alert("Your account has been deleted.");
          await signOut(auth);
          return;
        }
      }

      // Update last login timestamp
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: new Date().toISOString(),
      });

      alert("User logged in successfully");
      navigate("/admin");
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <form
        onSubmit={isRegistering ? handleRegister : handleLogin}
        className="p-6 bg-white rounded shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4">
          {isRegistering ? "Register" : "Login"}
        </h2>

        {isRegistering && (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="border mb-4 p-2 w-full"
              required
            />
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Position"
              className="border mb-4 p-2 w-full"
            />
          </>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border mb-4 p-2 w-full"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border mb-4 p-2 w-full"
          required
        />

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded w-full"
        >
          {isRegistering ? "Register" : "Login"}
        </button>

        <p className="mt-4 text-center">
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            className="text-blue-500 underline"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
