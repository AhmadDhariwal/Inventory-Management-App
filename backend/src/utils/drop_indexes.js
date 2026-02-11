const mongoose = require('mongoose');
require('dotenv').config();

const dropIndexes = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/inventorymanagement');
        console.log('Connected to MongoDB');

        const collections = [
            'notificationsettings',
            'securitysettings',
            'inventorysettings'
        ];

        for (const colName of collections) {
            try {
                const collection = mongoose.connection.collection(colName);
                const indexes = await collection.indexes();

                const userIndex = indexes.find(idx => idx.key.user === 1 && Object.keys(idx.key).length === 1);

                if (userIndex) {
                    console.log(`Dropping index ${userIndex.name} from ${colName}...`);
                    await collection.dropIndex(userIndex.name);
                    console.log(`Dropped index ${userIndex.name} from ${colName}`);
                } else {
                    console.log(`No usage of 'user_1' index found in ${colName}`);
                }
            } catch (err) {
                // Ignore if collection doesn't exist
                if (err.code !== 26) {
                    console.error(`Error processing ${colName}:`, err.message);
                }
            }
        }

        console.log('Index cleanup complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

dropIndexes();
