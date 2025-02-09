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

    const query = req.query.q || '';
    const response = await axios.get(
      `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/users?q=${encodeURIComponent(JSON.stringify(query))}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

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
