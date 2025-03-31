import type { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;

    const query = req.query.q ? `users?q=${encodeURIComponent(JSON.stringify(req.query.q))}` : 'users';
    const response = await axios.get(`https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/${query}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;
    const userId = req.params.id;

    const response = await axios.get(
      `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;
    const userId = req.params.id;

    await axios.delete(`https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.json({
      success: true,
      message: `User ${userId} deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

export const updateUserName = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Request an access token from Auth0
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. Extract user ID and new name from the request
    const userId = req.params.id; // User ID should be passed in the request URL
    const { name } = req.body; // New name should be sent in the request body

    if (!name) {
      res.status(400).json({ success: false, message: 'Name is required.' });
      return;
    }

    // 3. Send request to Auth0 Management API to update the user's profile
    const updateResponse = await axios.patch(
      `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
      {
        user_metadata: { displayName: name },
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    // 4. Return success response
    res.json({ success: true, data: updateResponse.data });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error updating name:', {
      message: error.message,
      response: error.response?.data || 'No response data',
      status: error.response?.status || 'No status',
      headers: error.response?.headers || 'No headers',
    });

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
