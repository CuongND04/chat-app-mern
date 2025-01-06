import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body
  try {
    // check if lack info
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })

    }
    // validate pass
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }
    // check user exist
    const user = await User.findOne({ email: email })
    if (user) return res.status(400).json({ message: "Email already exists" })

    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // create new user
    const newUser = new User({
      fullName, email, password: hashedPassword
    })

    if (newUser) {
      // generate jwt token here
      // _id is how mongodb stores, not id
      generateToken(newUser._id, res)
      await newUser.save()

      // 201: which means something has been created
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic
      })

    } else {
      res.status(400).json({ message: "Invalid user data" })
    }
  } catch (error) {
    console.log("Error in signup controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body
  try {
    // check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      // email not found and wrong pass, put a generic message avoid a malicious user
      return res.status(400).json({ message: "Invalid credentials" })
    }
    // check password 
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" })
    }
    // create jwt 
    generateToken(user._id, res)
    // return response for login request
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic
    })
  } catch (error) {
    console.log("Error in login controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 })
    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.log("Error in login controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }

}
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body
    const userId = req.user._id
    if (!profilePic) return res.status(400).json({ message: "Profile pic is required" })
    const uploadResponse = await cloudinary.uploader.upload(profilePic)
    console.log(uploadResponse)
    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })
    res.status(200).json(updatedUser)
  } catch (error) {
    console.log("Error in update profile", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    console.log("Error in checkAuth controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}