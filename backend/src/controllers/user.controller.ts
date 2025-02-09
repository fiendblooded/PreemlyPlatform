import type { Request, Response } from 'express';
import axios from 'axios';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the Auth0 Management API access token
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;

    // Fetch users from Auth0 Management API
    const query = req.query.q || ''; // Optional query parameter for searching
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
    // Get the Auth0 Management API access token
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;
    const userId = req.params.id; // User ID (sub) from the URL params

    // Fetch the specific user from Auth0 Management API
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
    // Get the Auth0 Management API access token
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;
    const userId = req.params.id; // User ID (sub) from the URL params

    // Delete the user from Auth0 Management API
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

