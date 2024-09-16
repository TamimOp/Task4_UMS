import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { BsUnlockFill } from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // For Firebase Auth user
  const [userName, setUserName] = useState(""); // New state for user's name
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUserAndData = async () => {
      const user = auth.currentUser;

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          if (userData.status === "Blocked") {
            alert("Your account is blocked. You will be logged out.");
            await signOut(auth); // Sign out the blocked user
            navigate("/login"); // Redirect to the login page
          } else if (userData.status === "Deleted") {
            alert("Your account has been deleted. You will be logged out.");
            await signOut(auth);
            navigate("/login");
          } else {
            setCurrentUser(user); // Set the current user object from auth
            setUserName(userData.name || "User"); // Set name from Firestore
          }
        }
      }

      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersList);
    };

    fetchCurrentUserAndData();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleBlockUsers = async () => {
    await Promise.all(
      selectedUsers.map(async (userId) => {
        await updateDoc(doc(db, "users", userId), { status: "Blocked" });
      })
    );
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        selectedUsers.includes(user.id) ? { ...user, status: "Blocked" } : user
      )
    );
    setSelectedUsers([]);
  };

  const handleUnblockUsers = async () => {
    await Promise.all(
      selectedUsers.map(async (userId) => {
        await updateDoc(doc(db, "users", userId), { status: "Active" });
      })
    );
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        selectedUsers.includes(user.id) ? { ...user, status: "Active" } : user
      )
    );
    setSelectedUsers([]);
  };

  // Soft delete users by marking them as "Deleted"
  const handleDeleteUsers = async () => {
    await Promise.all(
      selectedUsers.map(async (userId) => {
        await updateDoc(doc(db, "users", userId), { status: "Deleted" });
      })
    );
    setUsers((prevUsers) =>
      prevUsers.filter((user) => !selectedUsers.includes(user.id))
    );
    setSelectedUsers([]);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">User Registry</h2>
        <div>
          <span className="mr-4">
            Hello, {userName || currentUser?.email || "User"}!
          </span>
          <button className="text-blue-500 underline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="flex justify-start mb-4">
        <button
          className="bg-red-500 text-white px-4 py-2 mr-2 rounded"
          onClick={handleBlockUsers}
        >
          Block
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 mr-2 rounded"
          onClick={handleUnblockUsers}
        >
          <BsUnlockFill />
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={handleDeleteUsers}
        >
          <MdDeleteForever />
        </button>
      </div>

      <div className="overflow-auto shadow rounded-lg">
        <table className="min-w-full table-auto bg-white">
          <thead>
            <tr>
              <th className="border-b px-4 py-2">
                <input type="checkbox" onChange={handleSelectAll} />
              </th>
              <th className="border-b px-4 py-2">Name</th>
              <th className="border-b px-4 py-2">Position</th>
              <th className="border-b px-4 py-2">e-Mail</th>
              <th className="border-b px-4 py-2">Last Login</th>
              <th className="border-b px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.position || "-"}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.lastLogin}</td>
                <td className="px-4 py-2">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanel;
