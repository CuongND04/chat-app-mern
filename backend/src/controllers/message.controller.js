import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js"
import Message from "../models/message.model.js"
import User from "../models/user.model.js"

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id
    // get all users except logged in user
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")
    // console.log("filteredUsers: ", filteredUsers)

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
export const getMessages = async (req, res) => {
  try {
    // get values of dynamic params and rename parameter "id" to "userToCharId"
    const { id: userToChatId } = req.params
    const myId = req.user._id
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ]
    })
    res.status(200).json(messages)
  } catch (error) {
    console.log("Error in getMessages: ", error.message)
    res.status(500).json({ message: "Internal Server Error" })

  }
}
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body
    const { id: receiverId } = req.params
    const senderId = req.user._id

    let imageUrl
    if (image) {
      // upload base64 image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }
    const newMessage = new Message({
      senderId, receiverId, text, image: imageUrl
    })
    await newMessage.save()
    console.log("newMessage: ", newMessage)
    // gửi message đến bên nhật theo thời gian thực
    const receiverSocketId = getReceiverSocketId(receiverId)
    if (receiverSocketId) {
      // chỉ có receiverSocketId mới nhận được thông điệp
      io.to(receiverSocketId).emit("newMessage", newMessage)
    }



    res.status(201).json(newMessage)
  } catch (error) {
    console.log("Error in sendMessage: ", error.message)
    res.status(500).json({ message: "Internal Server Error" })

  }
}