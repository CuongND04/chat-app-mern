import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [], // chứa tin nhắn cập nhật thời gian thực
  users: [],
  selectedUser: null, // show conversation between myUser with that user
  isUsersLoading: false, // show skeleton
  isMessagesLoading: false, // show skeleton
  // call api to get all users
  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const res = await axiosInstance.get("/messages/users") // call api
      console.log("res:", res.data)
      set({ users: res.data }) // response contains list of users
    } catch (error) {
      toast.error(error.response.data.message) // display the notification
    } finally {
      set({ isUsersLoading: false }) // process is done
    }
  },
  // call api to get conversation of userID
  getMessages: async (userId) => {
    set({ isMessagesLoading: true })
    try {
      const res = await axiosInstance.get(`/messages/${userId}`)
      set({ messages: res.data })
    } catch (error) {
      toast.error(error.response.data.message) // display the notification

    } finally {
      set({ isMessagesLoading: false })
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get()
    try {
      // Đối tượng messageData sẽ được gửi trong phần body của request.
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
      // console.log("run on sendMessage: ", messages)
      set({ messages: [...messages, res.data] })
    } catch (error) {
      toast.error(error.response.data.message) // display the notification
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get()
    if (!selectedUser) return
    // getState():Là một phương thức của store trong Zustand, 
    // được dùng để truy cập trực tiếp toàn bộ trạng thái hiện tại của store.
    const socket = useAuthStore.getState().socket
    socket.on("newMessage", (newMessage) => {
      // tránh hiển thị tin nhắn nhận bên những user khác
      // tin nhắn có được gửi từ selected user hay không
      if (newMessage.senderId !== selectedUser._id) return

      // đây là spread, dùng để thêm phần tử mới nối tiếp vào mảng cũ
      set({ messages: [...get().messages, newMessage] })
      // console.log("run on subscribeToMessages")
    }
    )
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },


  setSelectedUser: (selectedUser) => set({ selectedUser }),
}))