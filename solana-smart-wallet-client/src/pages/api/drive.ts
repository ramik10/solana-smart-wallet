import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"
import { NextApiRequest, NextApiResponse } from "next"
import {authOptions} from "./auth/[...nextauth]"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    try {
      console.log("came here")
      //@ts-ignore
      const session = await getServerSession(req, res, authOptions)
      const token = await getToken({ req })
  
      if (!session) {
        return res.status(401).json({ error: 'No Session Active' })
      }
      //@ts-ignore
      const accessToken = token?.accessToken as string
      //@ts-ignore
      const refreshToken = token?.refreshToken as string
      console.log(accessToken,refreshToken)
      if (!accessToken) {
        return res.status(401).json({ error: 'No Access Token' })
      }
  
      const oauth2Client = new google.auth.OAuth2({})
  
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      //@ts-ignore
      // const { credentials } = await oauth2Client.refreshAccessToken()
      // const token1 = { ...credentials, refresh_token: refreshToken }
      // oauth2Client.setCredentials(token1)
  
      const drive = google.drive({
        version: 'v3',
        auth:oauth2Client
      });
      
      return res.status(200).json({message: "hilo"})
    } catch (error) {
      console.error('An error occurred: ', error)
      return res.status(500).json({ error: 'Internal Error' })
    }
  }