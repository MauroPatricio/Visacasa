import request from 'supertest';
import express from 'express';

// Mock simple app for testing environment setup
const app = express();
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

describe('Basic API Health Check', () => {
    it('should return 200 and status ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });
});
