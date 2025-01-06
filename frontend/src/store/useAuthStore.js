import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client"

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// just create it in one place and use it in any other components
export const useAuthStore = create((set, get) => ({
  // init value
  authUser: null, // if user is not authenticated

  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    try {
      // build api to check if user is authenticated
      // don't write base url because it is indicated in axios.js
      const res = await axiosInstance.get("/auth/check")
      set({ authUser: res.data })
      // nếu đã được xác thực rồi thì kết nối với socket
      if (get().socket?.connected) return
      get().connectSocket()
      // console.log("run on check Auth")
    } catch (error) {
      console.log("Error in checkAuth: ", error)
      set({ authUser: null })
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");

      // sau khi đăng ký nó sẽ kết nối tới socket luôn
      get().connectSocket()
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");

      get().disconnectSocket()
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      // sau khi đăng nhập nó sẽ kết nối tới socket luôn
      get().connectSocket()
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: async () => {
    // console.log("run on connect socket 1")
    const { authUser } = get()
    // nếu chưa xác thực hoặc đã kết nối rồi thì không kết nối lại nữa
    if (!authUser || get().socket?.connected) return
    // console.log("run on connect socket 2: ", get().socket?.connected)
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id  // đây là cái dùng để handshake.query
      }
    })
    socket.connect()

    set({ socket: socket })
    // emit bằng tên gì thì mình phải lắng nghe bằng tên đấy
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds })
    })
  },
  // cho dù mình chưa xây dựng phương thức này nhưng nếu tắt trình duyệt thì nó 
  // cx sẽ hiểu là không có kết nối nữa nên sẽ tự ngắt
  disconnectSocket: async () => {
    // .connected và .disconnect là thuộc tính và phương thức có sẵn của thằng get().socket
    if (get().socket?.connected) get().socket.disconnect()
  },
})) 