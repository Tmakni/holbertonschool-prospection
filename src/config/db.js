import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://prospectionapp.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'prospection';

let client;

export async function connectDB() {
    try {
        client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db(dbName);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

export function getDB() {
    if (!client) {
        throw new Error('Database not connected. Call connectDB() first.');
    }
    return client.db(dbName);
}

export function closeDB() {
    if (client) {
        client.close();
        console.log('MongoDB connection closed');
    }
}
