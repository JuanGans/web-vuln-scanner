import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	res.status(501).json({
		message: 'Login API is not implemented yet.',
		method: req.method,
	})
}
