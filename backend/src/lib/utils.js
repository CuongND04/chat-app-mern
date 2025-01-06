import jwt from "jsonwebtoken"
export const generateToken = (userId, res) => {
  // generate a token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  })
  // send token to cookie
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // milisecond
    httpOnly: true, // prevent xss attacks
    samesite: "strict", // prevent csrf attacks
    secure: process.env.NODE_ENV !== "development" // https and http
  })
  return token
} 
