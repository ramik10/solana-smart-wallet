import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { getToken } from "next-auth/jwt"
import { NextApiRequest, NextApiResponse } from "next"
import {authOptions} from "./auth/[...nextauth]"

export default async function GET(
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
        access_token:accessToken,
        refresh_token: refreshToken
      })

      const drive = google.drive({
        version: 'v3',
        auth:oauth2Client
      });

      const filename = 'passkeyforsmartwallet.txt'

      const listResponse = await drive.files.list({
        q: `name='${filename}' and trashed=false`,
        fields: 'files(id, name)',
      })

      if (listResponse.data.files?.length === 0) {
        return res.status(404).json({ error: 'File not found' })
      }
      //@ts-ignore
      const retrievedFileId = listResponse.data.files[0].id
      const getFileResponse = drive.files.get({
        fileId: retrievedFileId as string,
        alt: 'media',
      })
  
      const retrievedPasskey = (await getFileResponse).data
  
      return res.status(200).json({ message: "success", retrievedPasskey })
    } catch (error:any) {
      console.error('An error occurred: ', error)
      console.log(error.status)
      return res.status(500).json({ error: 'Internal Error' })
    }
  }