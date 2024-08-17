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
  
      const oauth2Client = new google.auth.OAuth2({})
  
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      //@ts-ignore
      // const { credentials } = await oauth2Client.refreshAccessToken()
      // const token1 = { ...credentials, refresh_token: refreshToken }
      // oauth2Client.setCredentials(token1)
      const passkey = "4fefer3r4rf4f4f43fedf" as string
      const drive = google.drive({
        version: 'v3',
        auth:oauth2Client
      });

      const filename = 'passkeyforsmartwallet.txt'

      // Step 1: Create a file on Google Drive with the passkey
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
    } catch (error) {
      console.error('An error occurred: ', error)
      return res.status(500).json({ error: 'Internal Error' })
    }
  }