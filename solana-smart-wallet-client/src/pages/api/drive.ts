import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"
import { NextApiRequest, NextApiResponse } from "next"
import {authOptions} from "./auth/[...nextauth]"

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse
) {
    try {
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
      if (!accessToken) {
        return res.status(401).json({ error: 'No Access Token' })
      }
  
      const oauth2Client = new google.auth.OAuth2({
        clientId: process.env.GOOGLE_OAUTH_ID,
        clientSecret:process.env.GOOGLE_OAUTH_SECRET
      })
  
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      //@ts-ignore
      const {passkey} = req.body as string
      const drive = google.drive({
        version: 'v3',
        auth:oauth2Client
      });

      const filename = 'passkeyforsmartwallet.txt'

      // Step 1: Create a file on Google Drive with the passkey
      const fileMetadata = {
        name: filename,
        mimeType: 'text/plain',
      }
      const media = {
        mimeType: 'text/plain',
        body: passkey,
      }
      const fileResponse = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      })
  
      const fileId = fileResponse.data.id
      if(fileId){
        return res.status(200).json({message: "successful"})
      } else{
        return res.status(400).json({message:"unsuccessful"})
      }
      
      
    } catch (error) {
      console.error('An error occurred: ', error)
      return res.status(500).json({ error: 'Internal Error' })
    }
  }