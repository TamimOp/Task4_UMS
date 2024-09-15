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
  deleteDoc,
} from "firebase/firestore";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // For Firebase Auth user
  const [userName, setUserName] = useState(""); // New state for user's name
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the logged-in user from Firebase Auth
    const fetchCurrentUser = () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
        // Fetch user's name from Firestore
        fetchUserName(user.uid);
      }
    };

    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    };

    const fetchUserName = async (uid) => {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().name || "User"); // Set name from Firestore
      }
    };

    fetchCurrentUser();
    fetchUsers();
  }, []);

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

  const handleDeleteUsers = async () => {
    await Promise.all(
      selectedUsers.map(async (userId) => {
        await deleteDoc(doc(db, "users", userId));
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
